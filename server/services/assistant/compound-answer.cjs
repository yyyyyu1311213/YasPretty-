const { assistantResponseSchema } = require('../../schemas.cjs')

function requestBudget(reserveSafety = false) { return { knowledgeChars: reserveSafety ? 6200 : 7200, knowledgeEntries: reserveSafety ? 7 : 8 } }

function boundedProvider(provider, counts = { chat: 0, search: 0 }) {
  return {
    configured: Boolean(provider?.configured), modelName: provider?.modelName,
    async chat(...args) {
      if (counts.chat >= 4) throw new Error('Request model budget exhausted')
      counts.chat += 1
      return provider.chat(...args)
    },
    async search(...args) {
      if (counts.search >= 3) throw new Error('Request search budget exhausted')
      counts.search += 1
      return provider.search(...args)
    },
  }
}

function combineAnswers(results, deferred = []) {
  const sources = [], keys = new Map(), evidence = new Map()
  const sectionLimit = Math.floor(14000 / results.length)
  // Reject a whole oversized section; never cut a sentence or silently mark it completed.
  results = results.map((result) => result.answer.length <= sectionLimit ? result : {
    ...result,
    answer: `这一项的结果超过本轮回答预算，请单独提问；该项尚未完成。${(result.knowledgeEvidence || []).flatMap((entry) => entry.safetyBoundaries || []).join('')}`,
    coverage: result.coverage.map((item) => ({ ...item, status: 'unavailable', missing: [...item.missing.slice(0, 23), '结果超过本轮回答预算，请单独提问。'] })),
  })
  const sections = results.map((result, i) => {
    const referenceNumbers = result.sources.map((source) => {
      const key = source.kind === 'product' ? source.id : `${source.kind}:${source.url}:${source.accessedAt}`
      if (!keys.has(key)) { keys.set(key, sources.length + 1); sources.push(source) }
      return keys.get(key)
    })
    for (const item of result.knowledgeEvidence || []) evidence.set(item.id, item)
    const body = result.answer.replace(/\[(\d+)\]/g, (match, number) => referenceNumbers[Number(number) - 1] ? `[${referenceNumbers[Number(number) - 1]}]` : match)
    return `${i + 1}. ${result.coverage[0].question}\n${body}`
  })
  const coverage = results.flatMap((result) => result.coverage)
  if (deferred.length) {
    const question = deferred.join('；')
    coverage.push({ question, intent: 'clarification', status: 'unavailable', knowledgeIds: [], productIds: [], missing: ['单次最多处理6个子问题；这些问题尚未处理，请分开发送。'] })
    sections.push(`尚未处理的问题：${question}\n单次最多处理6个子问题，请分开发送。`)
  }
  const incomplete = coverage.filter((item) => item.status !== 'answered')
  if (incomplete.length) sections.push(`仍缺少的信息：\n${incomplete.map((item) => `“${item.question}”：${item.missing.join('；')}`).join('\n')}`)
  return assistantResponseSchema.parse({
    answer: sections.join('\n\n'), intent: 'compound', answerMode: results.every((r) => r.answerMode === 'knowledge') ? 'knowledge' : 'local',
    sources, usedWebSearch: results.some((r) => r.usedWebSearch), model: null, coverage, knowledgeEvidence: [...evidence.values()],
  })
}

module.exports = { requestBudget, boundedProvider, combineAnswers }
