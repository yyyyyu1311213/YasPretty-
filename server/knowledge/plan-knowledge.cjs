const { retrieveKnowledge, knowledgeEvidence, entryContext } = require('./beauty-knowledge.cjs')

function selectPlanKnowledge(profile, request, budget) {
  const queries = [
    ['底妆怎么涂', ['base']],
    ['先遮瑕还是先粉底', ['conceal']],
    [/油/.test(profile.skinType) ? '油皮怎么定妆' : '粉底色号怎么选', /油/.test(profile.skinType) ? ['set'] : ['base']],
    [/水光|清透|光泽/.test(request.style) ? '清透水光妆' : /浓|氛围/.test(request.style) ? '柔和浓妆' : '快速日常妆', ['eyes-brows', 'cheeks', 'lips']],
  ]
  const selected = []
  let remaining = Math.min(4200, budget?.knowledgeChars ?? 4200)
  const maxEntries = Math.min(4, budget?.knowledgeEntries ?? 4)
  for (const [query, stepIds] of queries) {
    if (selected.length >= maxEntries) break
    const [entry] = retrieveKnowledge(query, 'makeup_plan', { maxChars: remaining, maxEntries: 1 })
    if (!entry || selected.some((item) => item.entry.id === entry.id)) continue
    selected.push({ entry, stepIds })
    remaining -= entryContext(entry).length + 2
  }
  if (budget) {
    budget.knowledgeChars -= selected.reduce((sum, { entry }) => sum + entryContext(entry).length + 2, 0)
    budget.knowledgeEntries -= selected.length
  }
  return selected
}

function applyPlanKnowledge(plan, selected) {
  const overflowCautions = new Set()
  const steps = plan.steps.map((step) => {
    const applicable = selected.filter(({ stepIds }) => stepIds.includes(step.id))
    if (!applicable.length) return step
    const methods = applicable.flatMap(({ entry }) => entry.techniques).join('')
    const cautions = [...new Set([...step.cautions, ...applicable.flatMap(({ entry }) => [...entry.safetyBoundaries, ...entry.limitations])])]
    cautions.slice(6).forEach((caution) => overflowCautions.add(caution))
    // Only technique/evidence fields change. Candidate IDs, ranks and hard conditions stay untouched.
    return { ...step, technique: ['base', 'conceal', 'set'].includes(step.id) && methods ? methods : step.technique,
      reasons: [...step.reasons, `一般手法依据：${applicable.map(({ entry }) => `${entry.title}（${entry.version}）`).join('；')}`].slice(0, 6),
      cautions: cautions.slice(0, 6),
    }
  })
  // Keep overflow boundaries complete at plan level; schema overflow triggers the existing local fallback.
  return { ...plan, steps, limitations: [...new Set([...plan.limitations, ...overflowCautions])],
    knowledgeEvidence: selected.map(({ entry, stepIds }) => ({ ...knowledgeEvidence([entry])[0], stepIds })) }
}

module.exports = { selectPlanKnowledge, applyPlanKnowledge }
