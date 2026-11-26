import { describe, expect, it, vi } from 'vitest'
import research from './research-request.cjs'
import service from '../assistant-service.cjs'
import extracts from './research-answer.cjs'

const now = new Date('2026-11-25T16:30:00.000Z')
const source = { title: '合成资料', url: 'https://example.test/reference', content: '合成外部资料，仅用于回归。', publisher: '合成来源', accessedAt: now.toISOString(), publishDate: '2026-11-26' }
const provider = () => ({ configured: true, modelName: 'synthetic', search: vi.fn(async () => [source]), chat: vi.fn(async () => JSON.stringify({ excerpts: [{ source: 1, quote: source.content }] })) })

describe('external research requests', () => {
  it('removes search instructions and anchors today to the Shanghai date', () => {
    expect(research.buildResearchRequest('请联网搜索今天的科技新闻，并给出来源', now)).toEqual({
      query: '2026年11月26日 科技新闻', options: { recency: 'oneDay' }, date: { iso: '2026-11-26', label: '2026年11月26日' },
    })
  })
  it.each([
    ['帮我上网查一下人工智能的定义，附上链接', '人工智能的定义', {}],
    ['请搜索最近的航天新闻', '最近的航天新闻', { recency: 'oneWeek' }],
    ['2024年科技新闻', '2024年科技新闻', {}],
    ['最新航天新闻', '最新航天新闻', { recency: 'oneMonth' }],
  ])('preserves topic and date constraints: %s', (query, expected, options) => {
    expect(research.buildResearchRequest(query, now)).toMatchObject({ query: expected, options, date: null })
  })
  it('rejects stale and undated results for today even if retrieval succeeded', () => {
    const request = research.buildResearchRequest('今日科技新闻', now)
    expect(research.filterResearchResults([
      source,
      { ...source, publishDate: '2024-11-26' },
      { ...source, publishDate: '', title: '今日科技新闻' },
      { ...source, publishDate: '', title: '科技新闻 2026.11.26' },
      { ...source, publishDate: '2024-11-26', title: '科技新闻 2026.11.26' },
    ], request)).toHaveLength(2)
  })
  it('routes explicit research without a classifier or beginner intake', async () => {
    const zhipuProvider = provider()
    const api = service.createAssistantService({ products: [], zhipuProvider, clock: () => now })
    const result = await api.answer({ query: '帮我联网搜索人工智能的定义，并给出来源', messages: [{ role: 'assistant', content: '先用一句话告诉我你想解决什么' }] })
    expect(result).toMatchObject({ intent: 'external_research', usedWebSearch: true, answerMode: 'search' })
    expect(zhipuProvider.search).toHaveBeenCalledExactlyOnceWith('人工智能的定义', {})
    expect(zhipuProvider.chat).toHaveBeenCalledOnce()
    expect(zhipuProvider.search.mock.invocationCallOrder[0]).toBeLessThan(zhipuProvider.chat.mock.invocationCallOrder[0])
    expect(result.sources[0].url).toBe(source.url)
  })
  it('sends date-constrained evidence and keeps the original question for generation', async () => {
    const zhipuProvider = provider()
    const query = '请联网搜索今天的科技新闻，并给出来源'
    await service.createAssistantService({ products: [], zhipuProvider, clock: () => now }).answer({ query })
    expect(zhipuProvider.search).toHaveBeenCalledExactlyOnceWith('2026年11月26日 科技新闻', { recency: 'oneDay' })
    expect(JSON.parse(zhipuProvider.chat.mock.calls[0][0].at(-1).content)).toMatchObject({ question: query, sources: [{ publishDate: '2026-11-26' }] })
    expect(zhipuProvider.chat.mock.calls[0][0][0].content).toContain('不要自行联网')
  })
  it('does not generate current facts when only stale sources return', async () => {
    const zhipuProvider = provider()
    zhipuProvider.search.mockResolvedValue([{ ...source, publishDate: '2024-11-26' }])
    await expect(service.createAssistantService({ products: [], zhipuProvider, clock: () => now }).answer({ query: '今天的科技新闻' }))
      .rejects.toMatchObject({ code: 'SEARCH_NO_CURRENT_SOURCES' })
    expect(zhipuProvider.chat).not.toHaveBeenCalled()
  })
  it('retains sources when model organization fails and does not invent sources on empty search', async () => {
    const zhipuProvider = provider()
    zhipuProvider.chat.mockRejectedValue(new Error('synthetic timeout'))
    const api = service.createAssistantService({ products: [], zhipuProvider, clock: () => now })
    expect(await api.answer({ query: '联网搜索人工智能的定义' })).toMatchObject({ answerMode: 'search', usedWebSearch: true, sources: [{ url: source.url }] })
    zhipuProvider.search.mockResolvedValue([])
    await expect(api.answer({ query: '联网搜索人工智能的定义' })).rejects.toMatchObject({ code: 'SEARCH_EMPTY' })
  })
  it('asks for a search topic without calling providers', async () => {
    const zhipuProvider = provider()
    const result = await service.createAssistantService({ products: [], zhipuProvider }).answer({ query: '请联网搜索' })
    expect(result.answerMode).toBe('clarification')
    expect(zhipuProvider.search).not.toHaveBeenCalled()
    expect(zhipuProvider.chat).not.toHaveBeenCalled()
  })
  it.each(['作为AI，我无法直接联网搜索实时信息。[1]', '我没有能力访问互联网。[1]', '请自己搜索科技新闻。', '根据来源回答。[99]'])('falls back to actual sources for an unusable model answer: %s', async (answer) => {
    const zhipuProvider = provider()
    zhipuProvider.chat.mockResolvedValue(answer)
    const result = await service.createAssistantService({ products: [], zhipuProvider, clock: () => now }).answer({ query: '请联网搜索今天的科技新闻，并给出来源' })
    expect(result.answerMode).toBe('search')
    expect(result.answer).toContain(source.content)
    expect(result.answer).not.toContain(answer)
    expect(result.coverage[0].status).toBe('partial')
    expect(result.sources[0].url).toBe(source.url)
  })
  it('keeps sensitive requests ahead of explicit search', () => {
    expect(service.intentRouter('请联网搜索治疗皮肤红肿的药')).toBe('unsupported_sensitive')
    expect(research.requestsWebSearch('不要联网搜索，解释折射原理')).toBe(false)
  })
  it.each([
    { excerpts: [{ source: 1, quote: '编造的新闻事件及链接 https://fake.test' }] },
    { excerpts: [{ source: 99, quote: source.content }] },
    { excerpts: [{ source: 1, quote: source.content, url: 'https://fake.test' }] },
    { excerpts: [{ source: 1, quote: source.content }, { source: 1, quote: source.content }] },
    { excerpts: [] },
  ])('rejects invented, unreferenced or empty excerpts: %j', (value) => {
    expect(() => extracts.researchAnswer(JSON.stringify(value), [source])).toThrow()
  })
  it('renders only original titles and verbatim excerpts with matching reference numbers', () => {
    const result = extracts.researchAnswer(JSON.stringify({ excerpts: [{ source: 1, quote: source.content }] }), [source])
    expect(result).toContain(`${source.title}\n${source.content} [1]`)
    expect(result).toContain('原文摘录')
  })
})
