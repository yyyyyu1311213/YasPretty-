const { z } = require('zod')
const { retrieveKnowledge, knowledgeSources, knowledgeEvidence, localKnowledgeAnswer, formatKnowledgeContext, entryContext } = require('../../knowledge/beauty-knowledge.cjs')
const { guidedBeautyPrompt } = require('./guided-beauty-prompt.cjs')

const organizationSchema = z.object({ sections: z.array(z.object({
  id: z.string(), techniques: z.array(z.string()).min(1).max(8),
}).strict()).min(1).max(8) }).strict()

async function answerKnowledge({ query, intent, provider, budget, products = [] }) {
  const entries = retrieveKnowledge(query, intent, { maxChars: Math.min(3200, budget?.knowledgeChars ?? 3200), maxEntries: budget?.knowledgeEntries ?? 6 })
  if (budget) {
    budget.knowledgeChars -= entries.reduce((sum, entry) => sum + entryContext(entry).length + 2, 0)
    budget.knowledgeEntries -= entries.length
  }
  if (!entries.length) return {
    answer: '这是美妆知识问题。现有资料没有足够相关的已整理内容，暂时无法可靠解答；请补充具体手法或问题。',
    answerMode: 'clarification', sources: [], knowledgeEvidence: [], knowledgeIds: [], status: 'unavailable', missing: ['缺少足够相关的受控知识，或本轮知识上下文预算已用完。'],
  }
  let ordered = entries
  let answerMode = 'knowledge'
  if (provider?.configured) {
    try {
      // Extractive organization: the model may reorder supported methods, never author facts.
      const raw = await provider.chat([
        { role: 'system', content: `按问题组织受控手法。只返回JSON {"sections":[{"id":"知识ID","techniques":["资料中完整的一般手法原句"]}]}。必须覆盖全部提供的知识ID和手法原句，每条一次；可调整顺序，不得增删、改写或创造商品与事实。适用条件、限制和安全边界由服务端完整附回。${guidedBeautyPrompt}${formatKnowledgeContext(entries)}` },
        { role: 'user', content: query },
      ], { timeoutMs: 8000, maxAttempts: 1 })
      const parsed = organizationSchema.parse(JSON.parse(String(raw).replace(/^```(?:json)?\s*|\s*```$/g, '')))
      if (parsed.sections.length !== entries.length || new Set(parsed.sections.map((s) => s.id)).size !== entries.length) throw new Error('Missing knowledge section')
      ordered = parsed.sections.map((section) => {
        const entry = entries.find((item) => item.id === section.id)
        if (!entry || section.techniques.length !== entry.techniques.length
          || new Set(section.techniques).size !== entry.techniques.length
          || section.techniques.some((text) => !entry.techniques.includes(text))) throw new Error('Unsupported method')
        return { ...entry, techniques: section.techniques }
      })
      answerMode = 'model'
    } catch { ordered = entries }
  }
  const relatedProducts = [...new Set(entries.flatMap((entry) => entry.suggestedProductIds || []))]
    .map((id) => products.find((product) => product.id === id))
    .filter(Boolean)
  const productNote = relatedProducts.length
    ? `\n\n站内可查看的局部遮瑕（真实产品资料，可点开详情；彩妆只能修饰，不治疗痘痘）：\n${relatedProducts.map((product) => `${product.brand} ${product.name} [[PRODUCT:${product.id}]]`).join('\n')}`
    : ''
  return {
    answer: `${localKnowledgeAnswer(ordered)}${productNote}${answerMode === 'knowledge' ? '\n\n本次回答不构成医疗诊断。' : ''}`,
    answerMode, model: answerMode === 'model' ? provider.modelName || null : null,
    sources: knowledgeSources(entries), knowledgeEvidence: knowledgeEvidence(entries), knowledgeIds: entries.map((entry) => entry.id), status: 'answered', missing: [],
  }
}

module.exports = { answerKnowledge }
