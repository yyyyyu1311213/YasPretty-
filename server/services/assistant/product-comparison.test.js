import { describe, expect, it, vi } from 'vitest'
import { products } from '../../../src/data/products.js'
import resolver from './product-resolver.cjs'
import queries from './fact-query.cjs'
import response from './response.cjs'
import service from '../assistant-service.cjs'
import zhipu from '../../providers/zhipu-provider.cjs'
import comparison from './comparison-answer.cjs'

const query = '兰蔻持妆粉底液和迪奥锁妆柔雾哑光粉底液有什么区别？我是油皮，主要用于通勤。'
const selectedIds = ['lancome-teint-idole', 'dior-forever-matte']
const selected = selectedIds.map((id) => products.find((p) => p.id === id))
const ids = (result) => result.products.map((p) => p.id)

describe('Chinese brand comparison regression', () => {
  it.each([
    [query, selectedIds],
    ['迪奥锁妆柔雾哑光粉底液与兰蔻持妆粉底液对比', [...selectedIds].reverse()],
    ['Lancome持妆粉底液和Dior锁妆柔雾哑光粉底液哪个好', selectedIds],
    ['雅诗兰黛持妆粉底液和兰蔻持妆粉底液对比', ['estee-lauder-double-wear', 'lancome-teint-idole']],
    ['兰蔻持妆粉底液和雅诗兰黛持妆粉底液对比', ['lancome-teint-idole', 'estee-lauder-double-wear']],
    ['兰蔻持妆粉底液怎么样', ['lancome-teint-idole']],
    ['雅诗兰黛持妆粉底液怎么样', ['estee-lauder-double-wear']],
    ['兰蔻粉底液怎么样', ['lancome-teint-idole']],
  ])('resolves each brand-qualified item in mention order: %s', (text, expected) => {
    expect(ids(resolver.resolveProducts(text, products))).toEqual(expected)
  })

  it('asks for identity instead of replacing an unknown named version with another brand', async () => {
    const provider = { configured: false, chat: vi.fn() }
    const api = service.createAssistantService({ products, zhipuProvider: provider })
    const result = await api.answer({ query: '兰蔻不存在的气垫和迪奥锁妆柔雾哑光粉底液比较' })
    expect(result.answerMode).toBe('clarification')
    expect(provider.chat).not.toHaveBeenCalled()
    const ambiguous = await api.answer({ query: '持妆粉底液怎么样' })
    expect(ambiguous.answerMode).toBe('clarification')
  })

  it('does not turn the wear word in a bilingual product name into a duration-only question', () => {
    expect(queries.factQuery(query, selected)).toMatchObject({ overview: true, online: false })
    expect(queries.factQuery('兰蔻持妆粉底液持妆多久', [selected[0]])).toMatchObject({ overview: false, fields: ['wear'] })
  })

  it('renders only catalog values from model-selected comparison dimensions', async () => {
    const provider = { configured: true, modelName: 'synthetic', chat: vi.fn(async () => '{"fields":["skins","finish","coverage"]}') }
    const result = await service.createAssistantService({ products, zhipuProvider: provider }).answer({ query })
    expect(result.answerMode).toBe('model')
    expect(result.coverage[0].productIds).toEqual(selectedIds)
    expect(result.answer).toContain('共同点')
    expect(result.answer).toContain('妆前兼容性')
    expect(result.answer).toContain('少量分区上妆')
    expect(result.answer).toContain('不能据此判断哪款更控油或更持妆')
    expect(result.answer).not.toContain('Estée Lauder')
  })

  it.each(['{"fields":["invented"]}', '{"fields":["skins","skins"]}', '{"fields":["wear"]}',
    '{"fields":["skins"],"answer":"兰蔻更持妆"}', '兰蔻更持妆'])('rejects unsupported comparison output: %s', (raw) => {
    expect(() => comparison.comparisonAnswer(raw, selected, [{ productId: selectedIds[0], fields: [{ field: 'skins', value: '油皮', status: 'pending' }] }], [])).toThrow()
  })

  it.each([false, true])('retains the requested products and sources with provider configured=%s', async (configured) => {
    const provider = { configured, modelName: 'synthetic', chat: vi.fn(async () => { throw new Error('synthetic failure') }) }
    const result = await service.createAssistantService({ products, zhipuProvider: provider }).answer({ query,
      profile: { skin: '干皮', budget: 1 }, messages: [{ role: 'assistant', content: '旧推荐', productIds: ['estee-lauder-double-wear'] }] })
    expect(result.intent).toBe('product_comparison')
    expect(result.coverage[0].productIds).toEqual(selectedIds)
    expect(result.sources.map((source) => source.productId)).toEqual(selectedIds)
    expect(result.answer).not.toContain('Estée Lauder')
    expect(result.answerMode).toBe('local')
  })

  it('accepts a valid real-provider response arriving after the previous eight-second cutoff', async () => {
    vi.useFakeTimers()
    try {
      const raw = '{"fields":["skins"]}'
      const fetchImpl = vi.fn((_url, { signal }) => new Promise((resolve, reject) => {
        const timer = setTimeout(() => resolve({ ok: true, json: async () => ({ choices: [{ message: { content: raw } }] }) }), 12000)
        signal.addEventListener('abort', () => { clearTimeout(timer); const error = new Error('aborted'); error.name = 'AbortError'; reject(error) }, { once: true })
      }))
      const provider = zhipu.createZhipuProvider({ apiKey: 'synthetic-test-only', model: 'synthetic', timeoutMs: 20000, fetchImpl })
      const pending = response.organizeCatalogAnswer({ provider, products: selected, intent: 'product_comparison', query, messages: [],
        factContext: selected.map(({ id }) => ({ productId: id, fields: [{ field: 'skins', value: '油皮', status: 'pending' }] })),
        fallback: '站内对比资料', sources: [{ title: '兰蔻资料' }, { title: '迪奥资料' }] })
      await vi.advanceTimersByTimeAsync(12000)
      expect(await pending).toMatchObject({ answerMode: 'model', model: 'synthetic' })
      expect(fetchImpl).toHaveBeenCalledOnce()
    } finally { vi.useRealTimers() }
  })

  it.each([
    ['[[PRODUCT:invented]]', '校验'],
    ['未经提供的价格99999元', '校验'],
    ['资料[99]', '校验'],
    ['PROVIDER_TIMEOUT', '响应超时'],
    ['PROVIDER_AUTH_ERROR', '配置无效'],
    ['PROVIDER_QUOTA_EXHAUSTED', '没有可用额度'],
  ])('keeps truthful bounded fallback for %s', async (raw, explanation) => {
    const provider = { configured: true, chat: async () => {
      if (raw.startsWith('PROVIDER_')) { const error = new Error('private-upstream-detail'); error.code = raw; throw error }
      return raw
    } }
    const result = await response.organizeCatalogAnswer({ provider, products: selected, intent: 'product_comparison', query,
      messages: [], fallback: '已核对的站内资料', sources: [] })
    expect(result.answerMode).toBe('local')
    expect(result.answer).toContain(explanation)
    expect(result.answer).toContain('已核对的站内资料')
    expect(result.answer).not.toMatch(/private-upstream-detail|99999|invented|\[99\]/)
  })
})
