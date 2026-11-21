const { referenceSites } = require('./reference-sites.cjs')
const entries = require('./beauty-entries.cjs')
const { topicsForIntent, normalizeKnowledgeText, matchesQuestion } = require('./knowledge-topics.cjs')
const referenceById = new Map(referenceSites.map((site) => [site.id, site]))
const knowledgeEntries = Object.freeze(entries)

function grams(value) {
  const text = normalizeKnowledgeText(value).replace(/[^\p{L}\p{N}]/gu, '')
  return new Set(Array.from({ length: Math.max(0, text.length - 1) }, (_, i) => text.slice(i, i + 2)))
}
const documents = new Map(entries.map((entry) => [entry.id, grams([entry.title, ...entry.keywords].join(' '))]))
const frequency = new Map()
for (const tokens of documents.values()) for (const token of tokens) frequency.set(token, (frequency.get(token) || 0) + 1)

function scoreEntry(entry, query, intent) {
  const text = normalizeKnowledgeText(query)
  const exact = entry.keywords.filter((word) => normalizeKnowledgeText(word).length >= 4 && text.includes(normalizeKnowledgeText(word))).length
  // Topic affinity and two-character overlap alone cannot create a hit.
  if (!exact && !matchesQuestion(entry.id, query)) return 0
  const queryTokens = grams(query)
  let lexical = 0
  for (const token of queryTokens) if (documents.get(entry.id).has(token)) lexical += Math.log(1 + entries.length / (frequency.get(token) || 1))
  const topic = entry.topics.some((name) => topicsForIntent(intent).includes(name)) ? 2 : 0
  return exact * 5 + lexical + topic
}

function entryContext(entry) {
  return `[${entry.id}] ${entry.title}\n适用条件：${entry.conditions.join('；')}\n一般手法：${entry.techniques.join('')}\n限制：${entry.limitations.join('')}\n必要安全边界：${entry.safetyBoundaries.join('')}\n版本：${entry.version}；内容复核：${entry.reviewedAt}\n来源支持范围：${entry.referenceIds.map((id) => {
    const site = referenceById.get(id)
    return `${site.publisher}｜${site.url}｜访问日期 ${site.reviewedAt}｜${site.scope}`
  }).join('；')}`
}

function retrieveKnowledge(query, intent = '', { maxChars = 3200, maxEntries = 6 } = {}) {
  const ranked = entries.map((entry) => ({ entry, score: scoreEntry(entry, query, intent) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || b.entry.priority - a.entry.priority)
  const selected = []
  let remaining = Math.min(7200, Math.max(0, maxChars))
  const limit = Math.min(8, Math.max(0, maxEntries))
  for (const { entry } of ranked) {
    const size = entryContext(entry).length + 2
    if (size > remaining || selected.length >= limit) continue
    selected.push(entry)
    remaining -= size
  }
  return selected
}

function knowledgeSources(selected) {
  const seen = new Set()
  return selected.flatMap((entry) => entry.referenceIds.map((id) => {
    const site = referenceById.get(id)
    if (!site || seen.has(id)) return null
    seen.add(id)
    return { kind: 'knowledge', title: site.title, url: site.url, publisher: site.publisher, accessedAt: site.reviewedAt }
  }).filter(Boolean))
}

function knowledgeEvidence(selected) {
  return selected.map((entry) => ({ id: entry.id, title: entry.title, version: entry.version,
    reviewedAt: entry.reviewedAt, conditions: entry.conditions, limitations: entry.limitations, safetyBoundaries: entry.safetyBoundaries,
    sources: entry.referenceIds.map((id) => {
      const site = referenceById.get(id)
      return { title: site.title, url: site.url, publisher: site.publisher, accessedAt: site.reviewedAt, supports: [site.scope] }
    }),
  }))
}

function formatKnowledgeContext(selected) {
  return selected.length ? `\n\n受控知识库资料开始（仅一般手法，不支持具体商品事实或实时结论）：\n${selected.map(entryContext).join('\n\n')}\n受控知识库资料结束。` : ''
}

function localKnowledgeAnswer(selected) {
  // Complete curated units fit the retrieval budget. Never truncate a safety sentence.
  return selected.map((entry) => `小提示｜${entry.title}\n适用条件：${entry.conditions.join('；')}\n${[...new Set([...entry.safetyBoundaries, ...entry.techniques, ...entry.limitations])].join('')}`).join('\n\n')
}

module.exports = { formatKnowledgeContext, knowledgeEntries, knowledgeSources, knowledgeEvidence, localKnowledgeAnswer, retrieveKnowledge, referenceSites, scoreEntry, entryContext }
