import { describe, expect, it } from 'vitest'
import knowledgeModule from './beauty-knowledge.cjs'
import planKnowledge from './plan-knowledge.cjs'

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
    expect(retrieveKnowledge('粉底怎么涂，怎么选色号，遮瑕应该先还是后，油皮怎么定妆', 'beauty_knowledge')).toHaveLength(4)
  })

  it('answers colloquial dirty-looking makeup questions from reviewed local knowledge', () => {
    const entries = retrieveKnowledge('我最近总觉得妆很脏，可能是什么原因？', 'beauty_knowledge')
    expect(entries.map((entry) => entry.id)).toContain('patchy-base-adjustment')
    const answer = knowledgeModule.localKnowledgeAnswer(entries)
    expect(answer).toContain('少量')
    expect(answer).toContain('停止使用')
    expect(knowledgeSources(entries).every((source) => source.kind === 'knowledge')).toBe(true)
  })

  it('retrieves the reviewed base-makeup guidance for colloquial patchiness questions', () => {
    const entries = retrieveKnowledge('我想问的是，妆总是卡粉应该怎么办？', 'beauty_knowledge')
    expect(entries.map((entry) => entry.id)).toContain('patchy-base-adjustment')
    expect(knowledgeModule.localKnowledgeAnswer(entries)).toContain('少量开始')
  })

  it('retrieves skin-type self-check and acne care without medical treatment claims', () => {
    const skin = retrieveKnowledge('我不清楚自己是油皮还是干皮', 'beauty_knowledge')
    expect(skin.map((entry) => entry.id)).toContain('self-reported-skin-type')
    expect(retrieveKnowledge('全脸都起皮', 'beauty_knowledge').map((entry) => entry.id)).toContain('self-reported-skin-type')
    const skinAnswer = knowledgeModule.localKnowledgeAnswer(skin)
    expect(skinAnswer).toContain('全脸起皮')
    expect(skinAnswer).toContain('全脸出油')
    expect(skinAnswer).toContain('我是干皮')

    const acne = retrieveKnowledge('我的脸上有痘痘怎么办', 'beauty_knowledge')
    expect(acne.map((entry) => entry.id)).toContain('acne-prone-makeup-and-referral')
    const entry = acne.find((item) => item.id === 'acne-prone-makeup-and-referral')
    expect(entry.limitations.join('')).toContain('不能治疗痘痘')
    expect(entry.safetyBoundaries.join('')).toContain('皮肤科医生')
    expect(knowledgeModule.localKnowledgeAnswer([entry])).toContain('先别急')
  })

  it('retrieves eyebrow and contour research without expanding it into product facts or face-shape promises', () => {
    const brow = retrieveKnowledge('男生眉毛怎么画，眉形对眉眼观感有什么影响', 'beauty_knowledge')
    expect(brow.map((entry) => entry.id)).toContain('eyebrow-eye-face-perception')
    expect(brow.find((entry) => entry.id === 'eyebrow-eye-face-perception').limitations.join('')).toContain('不构成完整的画眉步骤教程')
    const contour = retrieveKnowledge('修容阴影会不会让脸型看起来更立体', 'beauty_knowledge')
    expect(contour.map((entry) => entry.id)).toContain('contour-contrast-visual-perception')
    const contourEntry = contour.find((entry) => entry.id === 'contour-contrast-visual-perception')
    expect([...contourEntry.techniques, ...contourEntry.limitations].join('')).toContain('可保证的脸宽、脸长改变量')
    expect(retrieveKnowledge('男生素颜霜的实际遮瑕功效怎么样', 'beauty_knowledge').map((entry) => entry.id))
      .not.toContain('eyebrow-eye-face-perception')
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
    expect(answer).toContain('专业人员')
    expect(answer.length).toBeLessThan(320)
  })

  it('uses the route vocabulary for topic affinity without forcing irrelevant evidence', () => {
    const entry = knowledgeEntries.find((item) => item.id === 'foundation-application-basics')
    expect(knowledgeModule.scoreEntry(entry, '粉底怎么涂', 'beauty_knowledge')).toBe(knowledgeModule.scoreEntry(entry, '粉底怎么涂', '') + 2)
    expect(retrieveKnowledge('银河尘埃眼影的粒子共振原理是什么', 'beauty_knowledge')).toEqual([])
    expect(retrieveKnowledge('无关旅行问题', 'makeup_plan')).toEqual([])
  })

  it('budgets whole evidence units rather than truncating safety or forcing two results', () => {
    const query = '粉底怎么涂，怎么选色号，遮瑕应该先还是后，油皮怎么定妆'
    const selected = retrieveKnowledge(query, 'beauty_knowledge', { maxChars: 1500 })
    expect(selected.reduce((size, entry) => size + knowledgeModule.entryContext(entry).length + 2, 0)).toBeLessThanOrEqual(1500)
    expect(retrieveKnowledge(query, 'beauty_knowledge', { maxChars: 10 })).toEqual([])
    for (const entry of knowledgeEntries) {
      expect(entry.conditions.length).toBeGreaterThan(0)
      expect(entry.techniques.length).toBeGreaterThan(0)
      expect(entry.limitations.length).toBeGreaterThan(0)
      expect(entry.reviewedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(entry.version).toMatch(/^knowledge\.(?:v2|research\.v1)$/)
      const answer = knowledgeModule.localKnowledgeAnswer([entry])
      for (const boundary of entry.safetyBoundaries) expect(answer).toContain(boundary)
    }
  })

  it('preserves existing plan cautions and moves full knowledge boundaries into limitations on overflow', () => {
    const entry = knowledgeEntries.find((item) => item.id === 'patchy-base-adjustment')
    const cautions = Array.from({ length: 6 }, (_, i) => `原有商品注意事项${i + 1}`)
    const plan = planKnowledge.applyPlanKnowledge({ steps: [{ id: 'base', reasons: [], cautions }], limitations: [] }, [{ entry, stepIds: ['base'] }])
    expect(plan.steps[0].cautions).toEqual(cautions)
    expect(plan.limitations).toEqual(expect.arrayContaining([...entry.safetyBoundaries, ...entry.limitations]))
    expect(plan.knowledgeEvidence[0].safetyBoundaries).toEqual(entry.safetyBoundaries)
  })
})
