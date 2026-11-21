import { describe, expect, it } from 'vitest'
import { detectIntent, findMentionedProducts, needsOnlineResearch } from './intentUtils'
import { products } from '../../data/products'
import assistantService from '../../../server/services/assistant-service.cjs'

describe('小Y前端流程意图', () => {
  it.each(['给我推荐电脑', '我想买手机', '推荐一款打印机'])('audit: cannot turn external requests into offline beauty recommendations: %s', (text) => {
    expect(detectIntent(text)).toBe('external_question')
  })
  it.each(['气垫怎么用', '口红怎么涂', '我用粉底总起皮'])('audit: preserves technique intent offline: %s', (text) => {
    expect(detectIntent(text)).toBe('beauty_knowledge')
  })
  it.each(['粉底和气垫有什么区别', '气垫和粉底液有什么差别'])('keeps category knowledge out of recommendation fallback: %s', (text) => {
    expect(detectIntent(text)).toBe('beauty_knowledge')
  })
  it.each([
    '这个兰芝NEO小方块哑光气垫，15g是正装还是带替换芯？一个大概能用多久？平时放包里补妆方便吗？',
    'NEO小方块气垫(哑光)是正装吗？',
    '这款气垫含替换芯吗？',
    '这瓶30ml粉底能用多久？',
    '这个气垫放包里补妆方便吗？',
    '这款气垫的规格是多少？',
  ])('routes product details consistently to research instead of local recommendations: %s', (text) => {
    expect(detectIntent(text)).toBe('product_fact')
    expect(assistantService.intentRouter(text, products)).toBe('product_fact')
    expect(needsOnlineResearch(text, 'product_fact')).toBe(true)
    expect(assistantService.needsOnlineResearch(text, 'product_fact')).toBe(true)
  })

  it('matches the catalog name despite whitespace, parentheses and category position', () => {
    const matched = findMentionedProducts('兰芝NEO小方块哑光气垫')
    expect(matched.map(({ id }) => id)).toEqual(['laneige-neo-matte'])
    expect(findMentionedProducts('NEO 小方块气垫（哑光）')).toEqual(matched)
  })

  it('does not treat an unrelated object as a catalog product just because it says this one', () => {
    for (const text of ['这个手机容量是多少？', '这款打印机用多长时间需要换墨盒？']) {
      expect(detectIntent(text)).toBe('external_question')
      expect(assistantService.intentRouter(text, products)).toBe('external_question')
    }
  })

  it.each(['推荐15g的气垫', '预算300元推荐气垫', '推荐正装气垫'])('retains the recommendation flow: %s', (text) => {
    expect(detectIntent(text)).toBe('catalog_recommendation')
    expect(assistantService.intentRouter(text, products)).toBe('catalog_recommendation')
  })

  it('keeps suitability of this product out of recommendation fallback', () => {
    expect(detectIntent('这个气垫适合油皮吗')).toBe('product_fact')
    expect(assistantService.intentRouter('这个气垫适合油皮吗', products)).toBe('product_fact')
  })

  it('routes external questions, catalog, and greeting intents', () => {
    expect(detectIntent('今天上海天气怎么样')).toBe('external_question')
    expect(detectIntent('推荐一款通勤粉底')).toBe('catalog_recommendation')
    expect(detectIntent('我明天要约会，帮我设计一个妆容')).toBe('makeup_plan')
    expect(detectIntent('我想要一个韩女水光妆容的妆教')).toBe('makeup_plan')
    expect(detectIntent('教我如何画一个适合拍照的妆容，场景是秋日落叶阳光')).toBe('makeup_plan')
    expect(detectIntent('我怎么判断我的肤质')).toBe('external_question')
    expect(detectIntent('你好')).toBe('greeting_help')
    expect(detectIntent('给我介绍一下巴黎时装周')).toBe('external_question')
  })

  it('requires online research for timely or out-of-catalog facts', () => {
    expect(needsOnlineResearch('这款现在官网多少钱', 'catalog_recommendation')).toBe(true)
    expect(needsOnlineResearch('推荐一款油皮粉底', 'catalog_recommendation')).toBe(false)
    expect(needsOnlineResearch('推荐一支口红', 'catalog_recommendation')).toBe(true)
    expect(needsOnlineResearch('给我介绍一下巴黎时装周', 'external_question')).toBe(false)
    expect(needsOnlineResearch('明天上海天气怎么样', 'external_question')).toBe(true)
  })

  it('preserves comparison, plan, and skin-question priority over broader catalog words', () => {
    expect(detectIntent('帮我对比 NARS 和雅诗兰黛，再给我完整妆容')).toBe('product_comparison')
    expect(detectIntent('推荐粉底并给我完整妆容')).toBe('makeup_plan')
    expect(detectIntent('怎么判断肤质并推荐粉底')).toBe('external_question')
    expect(detectIntent('哪个好')).toBe('catalog_recommendation')
    expect(detectIntent('对比两种化妆工具')).toBe('external_question')
  })

  it('keeps case-insensitive brand and compact-name matching for comparisons', () => {
    expect(detectIntent('nars 和其他产品哪个更适合我')).toBe('product_comparison')
    expect(detectIntent('超方瓶和其他产品有什么区别')).toBe('product_comparison')
    expect(detectIntent('NARS')).toBe('product_fact')
  })

  it('retains explicit research flags without making ordinary questions online', () => {
    expect(needsOnlineResearch('站内资料', 'product_fact')).toBe(true)
    expect(needsOnlineResearch('站内资料', 'external_research')).toBe(true)
    expect(needsOnlineResearch('如何画清透妆容', 'makeup_plan')).toBe(false)
    expect(needsOnlineResearch('完整妆容，参考最新趋势', 'makeup_plan')).toBe(true)
  })

  it('keeps greeting matching and does not use or mutate the stored profile to route a question', () => {
    const profile = Object.freeze({ skin: '油皮', budget: 400 })
    expect(detectIntent('HI！', profile)).toBe('greeting_help')
    expect(detectIntent('在吗？', profile)).toBe('greeting_help')
    expect(detectIntent('解释一下光的折射', profile)).toBe('external_question')
    expect(profile).toEqual({ skin: '油皮', budget: 400 })
  })
})
