const normalize = (text) => String(text || '').normalize('NFKC').toLowerCase().replace(/[\s（）()「」·'’\-]/g, '')
const withoutCategory = (text) => text.replace(/粉底液|遮瑕液|遮瑕蜜|气垫|散粉/g, '')
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
  if (!collective && !referencePattern.test(query) && !categoryOnly && !implicitQuestion.test(query)) return { products: [], ambiguous: false, referenced: false }
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
  const text = normalize(query)
  const compact = withoutCategory(text)
  const brands = products.filter((p) => text.includes(normalize(p.brand)))
  const hits = products.flatMap((product) => {
    const name = normalize(product.name)
    const stem = withoutCategory(name)
    const branded = text.includes(normalize(product.brand))
    const version = String(product.name).match(/[（(]([^）)]+)[）)]/)?.[1]
    const base = withoutCategory(normalize(String(product.name).replace(/[（(][^）)]+[）)]/g, '')))
    // Short names are derived from the controlled name, never from generated aliases.
    const aliases = version ? [base, base.replace(/[a-z0-9]+/g, '')].filter((alias) => alias.length >= 2 && !/^(?:哑光|水光|柔雾|亮泽|持妆|柔光|透明)$/.test(alias)) : []
    const statedVersion = query.match(/哑光|水光|柔雾|亮泽/)?.[0]
    const shortIndex = version && (!statedVersion || normalize(version).includes(normalize(statedVersion)))
      ? aliases.map((alias) => compact.indexOf(alias)).find((index) => index >= 0) ?? -1 : -1
    const index = name && text.includes(name) ? text.indexOf(name) : stem.length > 2 && compact.includes(stem) ? compact.indexOf(stem) : shortIndex
    if (index < 0 || (!branded && genericName.test(name))) return []
    if (brands.length && !branded && brands.some((p) => normalize(p.name) === name)) return []
    return [{ product, index, length: name.length }]
  })
  // A short name embedded in a longer version name is not a second product.
  return hits.filter((hit) => !hits.some((other) => other !== hit
    && normalize(other.product.name).includes(normalize(hit.product.name))
    && other.length > hit.length))
    .sort((a, b) => a.index - b.index)
    .map(({ product }) => product)
}

function productContext(query, products) {
  return namedProducts(query, products).length > 0
    || products.some((p) => normalize(query).includes(normalize(p.brand)))
    || /粉底|底妆|气垫|遮瑕|散粉|口红|唇釉|眼影|腮红|眉笔|睫毛膏/.test(query)
}

function resolveProducts(query, products, messages = []) {
  const named = namedProducts(query, products)
  if (named.length) return { products: named, ambiguous: false, referenced: false }
  const brands = products.filter((p) => normalize(query).includes(normalize(p.brand)))
  if (brands.length) {
    const categories = requestedCategories(query, products)
    const candidates = categories.length ? brands.filter((p) => categories.includes(p.category)) : brands
    return { products: candidates, ambiguous: candidates.length !== 1, referenced: false }
  }
  return resolveRecentChoice(String(query).trim(), products, messages)
}

module.exports = { namedProducts, productContext, resolveProducts, referencePattern, questionForSelection }
