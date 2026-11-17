import { describe, expect, it } from 'vitest'
import { detectIntent, needsOnlineResearch } from './intentUtils'

describe('小Y前端流程意图', () => {
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
    expect(detectIntent('NARS')).toBe('catalog_recommendation')
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
