const { intentRouter, isCatalogSizeQuestion } = require('./intent-router.cjs')
const { namedProducts } = require('./product-resolver.cjs')
const { factQuery } = require('./fact-query.cjs')

function isQuestion(text) {
  return /怎么|如何|什么|是否|能否|能不能|有(?:没有|几个|哪些)|多少|多大|多久|哪里|哪款|哪个|吗|么|呢|区别|差别|不同|顺序|先.*还是|教程|步骤|技巧|原理|怎么办|推荐|比较|对比|解释|介绍|教我|方案|完整妆容|起皮|卡粉|刺痛|红肿|破损|瘙痒/.test(text)
}

function decomposeQuestions(query, products = [], messages = []) {
  const chunks = String(query).trim()
    .replace(/(?:另外|此外|还有|并且|同时|顺便|以及|还想知道|再问)(?:说说|问一下)?/g, '；')
    .replace(/(?:和|并)(?=怎么|如何|是否|能否|为什么|什么是)/g, '；')
    .split(/[？?；;。\n]+/).map((text) => text.trim()).filter(Boolean)
  const questions = []
  for (const chunk of chunks) {
    let pending = ''
    for (const piece of chunk.split(/[，,]/).map((text) => text.trim()).filter(Boolean)) {
      if (pending && isQuestion(pending) && isQuestion(piece)) {
        questions.push(pending)
        pending = piece
      } else pending = pending ? `${pending}，${piece}` : piece
    }
    if (pending) questions.push(pending)
  }
  // Attach descriptive conditions to their question; do not turn every comma into a task.
  const merged = []
  for (const question of questions) {
    if (merged.length && !isQuestion(merged.at(-1))) merged[merged.length - 1] += `；${question}`
    else merged.push(question)
  }
  if (merged.length > 1 && !isQuestion(merged.at(-1))) merged[merged.length - 2] += `；${merged.pop()}`
  // Multiple clauses asking about the same evidence field are already handled by factQuery.
  const grouped = []
  for (const question of merged) {
    const previous = grouped.at(-1)
    const fact = factQuery(question, products)
    const factualFollowup = intentRouter(question, products, messages) === 'product_fact'
      || !/怎么|如何|教程|手法|技巧/.test(question) && (fact.advice || fact.fields.some((field) => ['specification', 'netContent', 'packagingContents', 'fullSize', 'saleUnit', 'refill', 'setContents', 'usageDuration', 'price', 'ingredients'].includes(field)))
    if (previous && !isCatalogSizeQuestion(previous) && !isCatalogSizeQuestion(question) && intentRouter(previous, products, messages) === 'product_fact'
      && factualFollowup && !namedProducts(question, products).length) grouped[grouped.length - 1] += `，${question}`
    else grouped.push(question)
  }
  return { questions: grouped.slice(0, 6), deferred: grouped.slice(6) }
}

module.exports = { decomposeQuestions }
