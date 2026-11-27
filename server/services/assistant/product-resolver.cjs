const normalize = (text) => String(text || '').normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/[\s（）()「」·'’\-]/g, '')
const withoutCategory = (text) => text.replace(/粉底液|遮瑕液|遮瑕蜜|气垫|散粉/g, '')
// Search vocabulary only: these names do not change catalog identities or facts.
const brandNames = [['lancome', '兰蔻'], ['dior', '迪奥'], ['esteelauder', '雅诗兰黛']]
function brandAliases(brand) {
  const name = normalize(brand)
  const aliases = brandNames.find((group) => group.includes(name) || normalize(group.join('')) === name)
  return [...new Set([name, ...(aliases || [])])].filter(Boolean)
}
const mentionsBrand = (text, product) => brandAliases(product.brand).some((alias) => normalize(text).includes(alias))

function productNameVariants(product) {
  const name = String(product.name || '')
  // Permit the Chinese portion of a bilingual controlled name, preserving version text.
  const chinese = name.replace(/[a-zA-Z\s]+/g, '')
  return [...new Set([name, ...(chinese && chinese !== name && /\p{Script=Han}/u.test(chinese) ? [chinese] : [])])]
}
const referencePattern = /后一款|前一款|第[一二三123]款|上一款|这款|那款|这个|它/
const genericName = /^(?:粉底液?|气垫|遮瑕液?|散粉|眉粉|腮红|睫毛膏|眼影|口红|唇膏)$/
const categoryNames = {
  粉底液: ['粉底液', '粉底'], 气垫: ['气垫'], 遮瑕: ['遮瑕'], 散粉: ['散粉', '蜜粉'],
  眼影: ['眼影'], 腮红: ['腮红'], 唇妆: ['唇妆', '口红', '唇膏', '唇釉'],
  眉妆: ['眉妆', '眉笔', '眉粉'], 睫毛膏: ['睫毛膏'],
}
const collectiveChoice = /^(?:两款|两种|两个|这两款|这两种|这两个|三款|这三款)?都(?:可以|行|看看|看一下|介绍一下|想了解)(?:吧|啊|呢)?[。！!？?\s]*$/
const implicitQuestion = /^(?:那|那么|请问|大概|现在)?(?:多少钱|价格(?:多少|呢)|(?:净含量|规格|容量)(?:是多少|多少|呢)|(?:有|含|带)(?:没有|不含)?替换芯|能用多久|适合(?:混油皮|混干皮|干皮|油皮|敏感肌)|有(?:哪些|几个|什么)色号|持妆(?:多久|几小时)|会不会(?:卡粉|脱妆|暗沉)|怎么(?:用|涂|上妆))[吗呢啊吧？?。！!\s]*$/

function questionForSelection(query, products, messages) {
  const text = String(query).trim()
  const choices = requestedCategories(text, products)
  const selectionOnly = collectiveChoice.test(text) || /^(?:第[一二三123]款|前一款|后一款|这款|那款)[吧。！!\s]*$/.test(text)
    || choices.some((category) => (categoryNames[category] || [category]).some((name) => text === name || text === `${name}那款`))
  if (!selectionOnly) return query
  const recent = messages.slice(-8)
  const index = recent.findLastIndex((message) => message.role === 'assistant')
  if (!/^还不能唯一确定你指的是哪款。请补充完整名称或版本：/.test(recent[index]?.content || '')) return query
  return recent[index - 1]?.role === 'user' ? recent[index - 1].content : query
}

function requestedCategories(query, products) {
  const categories = new Set([...Object.keys(categoryNames), ...products.map((p) => p.category)])
  return [...categories].filter((category) => category
    && (categoryNames[category] || [category]).some((name) => query.includes(name)))
}

function recentProducts(messages, products) {
  // Only the immediately preceding assistant answer can establish a reference.
  const last = messages.slice(-8).findLast((message) => message.role === 'assistant')
  const ids = last?.productIds || []
  if (ids.length) return [...new Set(ids)].map((id) => products.find((p) => p.id === id)).filter(Boolean)
  // Compatibility with our earlier bounded clarification, which had names but no IDs.
  // Arbitrary model prose and truncated candidate lists do not establish references.
  if (!/^还不能唯一确定你指的是哪款。请补充完整名称或版本：/.test(last?.content || '')
    || /还有其他候选/.test(last.content)) return []
  const named = namedProducts(last.content, products)
  return named.length <= 3 ? named : []
}

function resolveRecentChoice(query, products, messages) {
  const categories = requestedCategories(query, products)
  const categoryOnly = categories.some((category) => (categoryNames[category] || [category]).includes(query))
  const collective = collectiveChoice.test(query)
  const sizeFollowup = /^(?:那|请问)?(?:是(?:不是)?)?(?:正装|小样|中样|试用装)(?:规格)?(?:吗|么|呢)?[？?。\s]*$/.test(query)
  if (!collective && !referencePattern.test(query) && !categoryOnly && !implicitQuestion.test(query) && !sizeFollowup) return { products: [], ambiguous: false, referenced: false }
  const recent = recentProducts(messages, products)
  const version = query.match(/哑光|水光|亮泽/)?.[0]
  const candidates = recent.filter((p) => (!categories.length || categories.includes(p.category))
    && (!version || normalize(p.name).includes(version)))
  const result = (selection, ambiguous = false, allSelected = false) => ({ products: selection, ambiguous, referenced: true, allSelected })
  if (!candidates.length || recent.length > 3) return result([], true)
  if (collective) return result(candidates, false, true)
  const ordinal = query.match(/第([一二三123])款/)?.[1]
  if (ordinal) {
    const index = ({ 一: 0, 二: 1, 三: 2, 1: 0, 2: 1, 3: 2 })[ordinal]
    const product = recent[index]
    return product && candidates.includes(product) ? result([product]) : result(candidates, true)
  }
  if (/后一款|前一款/.test(query)) {
    const product = recent.length === 2 ? recent[/后一款/.test(query) ? 1 : 0] : null
    return product && candidates.includes(product) ? result([product]) : result(candidates, true)
  }
  return result(candidates, candidates.length !== 1)
}

function namedProducts(query, products) {
  // A brand qualifies its own noun phrase, never a different item in a comparison.
  const clauses = String(query || '').split(/和|与|以及|对比|比较|[、，,；;。？！?!\n]|\bvs\.?\b/i)
  let offset = 0
  const hits = clauses.flatMap((clause) => {
    const text = normalize(clause)
    const compact = withoutCategory(text)
    const brands = products.filter((p) => mentionsBrand(text, p))
    const clauseOffset = offset
    offset += text.length + 1
    return products.flatMap((product) => {
      const name = normalize(product.name)
      const branded = mentionsBrand(text, product)
      if (brands.length && !branded) return []
      const variants = productNameVariants(product).map(normalize)
      const version = String(product.name).match(/[（(]([^）)]+)[）)]/)?.[1]
      const base = withoutCategory(normalize(String(product.name).replace(/[（(][^）)]+[）)]/g, '')))
      // Short names are derived from the controlled name, never from generated aliases.
      const aliases = version ? [base, base.replace(/[a-z0-9]+/g, '')].filter((alias) => alias.length >= 2 && !/^(?:哑光|水光|柔雾|亮泽|持妆|柔光|透明)$/.test(alias)) : []
      const statedVersion = clause.match(/哑光|水光|柔雾|亮泽/)?.[0]
      const shortAlias = version && (!statedVersion || normalize(version).includes(normalize(statedVersion)))
        ? aliases.find((alias) => compact.includes(alias)) : null
      const variant = variants.find((value) => value && text.includes(value))
      const stem = variants.map(withoutCategory).find((value) => value.length > 2 && compact.includes(value))
      const index = variant ? withoutCategory(text.slice(0, text.indexOf(variant))).length
        : stem ? compact.indexOf(stem) : shortAlias ? compact.indexOf(shortAlias) : -1
      if (index < 0 || (!branded && genericName.test(name))) return []
      return [{ product, index: clauseOffset + index, clauseOffset, matched: variant || stem || shortAlias }]
    })
  })
  // A short name embedded in a longer version name is not a second product.
  return hits.filter((hit) => !hits.some((other) => other !== hit
    && other.clauseOffset === hit.clauseOffset && other.index <= hit.index
    && other.matched?.includes(hit.matched)
    && other.matched.length > hit.matched.length))
    .sort((a, b) => a.index - b.index)
    .map(({ product }) => product)
    .filter((product, index, selected) => selected.findIndex((item) => item.id === product.id) === index)
}

function productContext(query, products) {
  return namedProducts(query, products).length > 0
    || products.some((p) => mentionsBrand(query, p))
    || /粉底|底妆|气垫|遮瑕|散粉|口红|唇釉|眼影|腮红|眉笔|睫毛膏/.test(query)
}

function resolveProducts(query, products, messages = []) {
  const named = namedProducts(query, products)
  if (named.length) return { products: named, ambiguous: false, referenced: false }
  const brands = products.filter((p) => mentionsBrand(query, p))
  if (brands.length) {
    const categories = requestedCategories(query, products)
    const candidates = categories.length ? brands.filter((p) => categories.includes(p.category)) : brands
    return { products: candidates, ambiguous: candidates.length !== 1, referenced: false }
  }
  return resolveRecentChoice(String(query).trim(), products, messages)
}

module.exports = { namedProducts, productNameVariants, productContext, resolveProducts, referencePattern, questionForSelection }
