import { describe, expect, it } from 'vitest'
import knowledgeModule from './beauty-knowledge.cjs'

const {
  knowledgeEntries,
  knowledgeSources,
  retrieveKnowledge,
  referenceSites,
} = knowledgeModule

describe('受控美妆知识库', () => {
  it('contains traceable entries for tutorials, knowledge, tips, and styles', () => {
    for (const topic of ['makeup_tutorial', 'makeup_knowledge', 'makeup_tip', 'makeup_style']) {
      expect(knowledgeEntries.some((entry) => entry.topics.includes(topic))).toBe(true)
    }
    expect(knowledgeEntries.every((entry) => entry.referenceIds.length > 0)).toBe(true)
    expect(knowledgeEntries.every((entry) => entry.referenceIds.every((id) => referenceSites.some((site) => site.id === id)))).toBe(true)
  })

  it('retrieves relevant entries and limits context size for fallback safety', () => {
    expect(retrieveKnowledge('我想看底妆教程，粉底应该怎么涂', 'makeup_tutorial').map((entry) => entry.id)).toContain('foundation-application-basics')
    expect(retrieveKnowledge('我想要一个清透水光妆', 'makeup_style').map((entry) => entry.id)).toContain('glowy-makeup-style-language')
    expect(retrieveKnowledge('油皮怎么定妆', 'makeup_tip').map((entry) => entry.id)).toContain('oily-skin-base-and-setting')
    expect(retrieveKnowledge('我想了解美妆专业知识', 'makeup_knowledge').map((entry) => entry.id)).toContain('makeup-basics-framework')
    expect(retrieveKnowledge('有哪些美妆小技巧', 'makeup_tip').length).toBeGreaterThan(0)
    expect(retrieveKnowledge('美妆风格有哪些', 'makeup_style').map((entry) => entry.id)).toEqual(expect.arrayContaining(['glowy-makeup-style-language']))
    expect(retrieveKnowledge('今天想聊旅行路线', '')).toHaveLength(0)
    expect(retrieveKnowledge('粉底怎么涂，怎么选色号，遮瑕应该先还是后，油皮怎么定妆', 'makeup_tutorial')).toHaveLength(2)
  })

  it('returns deduplicated reviewed source citations', () => {
    const entries = retrieveKnowledge('如何判断肤质和新产品刺痛怎么办', 'skin_safety')
    const sources = knowledgeSources(entries)
    expect(sources.length).toBeGreaterThan(0)
    expect(new Set(sources.map((source) => source.url)).size).toBe(sources.length)
    expect(sources.every((source) => source.kind === 'knowledge' && source.accessedAt.endsWith('Z'))).toBe(true)
  })

  it('keeps local fallback friendly and concise while retaining safety boundaries', () => {
    const safety = knowledgeEntries.filter((entry) => entry.id === 'skin-reaction-safety')
    const answer = knowledgeModule.localKnowledgeAnswer(safety)
    expect(answer).toContain('小提示｜')
    expect(answer).toContain('停止使用')
    expect(answer.length).toBeLessThan(320)
  })
})
