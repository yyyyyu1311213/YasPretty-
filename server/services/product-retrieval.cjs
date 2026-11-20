const CATEGORY_SYNONYMS = {
  粉底液: ['粉底', '粉底液', '底妆', 'foundation'],
  气垫: ['气垫', 'cushion'],
  遮瑕: ['遮瑕', '遮瑕液', '遮瑕蜜', 'concealer'],
  散粉: ['散粉', '蜜粉', '定妆粉', 'powder'],
  素颜霜: ['素颜霜', '素颜'],
  隔离: ['隔离', '隔离霜', '妆前', 'primer'],
  有色面霜: ['有色面霜', '润色面霜', '润色霜', 'tintedmoisturizer'],
  眉妆: ['眉笔', '眉粉', '染眉膏', '眉妆', '眉毛'],
  眼影: ['眼影', '眼影盘', '眼影棒'],
  眼线: ['眼线', '眼线笔', '眼线液'],
  睫毛膏: ['睫毛膏', '睫毛'],
  腮红: ['腮红', '胭脂', 'blush'],
  唇妆: ['口红', '唇釉', '唇膏', '唇泥', '唇彩', '唇妆'],
  修容: ['修容', '修容盘', '阴影', '鼻影', '高光'],
}

const MAX_MATCHED_PRODUCTS = 3

const BRAND_ALIASES = {
  'estéelauder': ['雅诗兰黛'],
  esteelauder: ['雅诗兰黛'],
  'giorgioarmani': ['阿玛尼'],
  laneige: ['兰芝'],
  clio: ['珂莱欧'],
  ysl: ['圣罗兰', '杨树林'],
  thesaem: ['得鲜'],
  'lauramercier': ['罗拉玛希'],
  'makeupforever': ['玫珂菲'],
  dior: ['迪奥'],
  dior迪奥: ['迪奥'],
  chanel: ['香奈儿'],
  pradabeauty: ['普拉达'],
  givenchy: ['纪梵希'],
  lancôme: ['兰蔻'],
  loréalparis: ['欧莱雅', '巴黎欧莱雅'],
  lorealparis: ['欧莱雅', '巴黎欧莱雅'],
  mac魅可: ['魅可'],
  cpb: ['肌肤之钥'],
  'clédepeaubeauté': ['肌肤之钥'],
  shiseido: ['资生堂'],
  suqqu: ['斯珂'],
  'charlottetilbury': ['夏洛特蒂铂丽'],
  'fentybeauty': ['芬缇'],
  hourglass: ['沙漏'],
  wlab: ['大福留'],
  'toocoolforschool涂酷': ['涂酷'],
}

function brandAliases(product) {
  return (BRAND_ALIASES[normalize(product.brand)] || []).map(normalize)
}

function normalize(value) {
  return String(value || '').toLowerCase().replace(/[\s\p{P}\p{S}]/gu, '')
}

function bigrams(value) {
  const grams = new Set()
  for (let index = 0; index < value.length - 1; index += 1) {
    grams.add(value.slice(index, index + 2))
  }
  return grams
}

function detectCategories(compactQuery) {
  return Object.keys(CATEGORY_SYNONYMS).filter((category) => (
    CATEGORY_SYNONYMS[category].some((term) => compactQuery.includes(normalize(term)))
  ))
}

function scoreProduct(product, compactQuery, categories) {
  const brand = normalize(product.brand)
  const name = normalize(product.name)
  const shortName = normalize(product.shortName || `${product.brand || ''} ${product.name || ''}`)
  const aliasHit = brandAliases(product).some((alias) => compactQuery.includes(alias))
  const brandHit = (brand.length > 1 && compactQuery.includes(brand)) || aliasHit
  const nameHit = name.length > 1 && compactQuery.includes(name)
  const shortHit = shortName.length > 1 && compactQuery.includes(shortName)
  const categoryHit = categories.includes(product.category)
  const overlap = [...bigrams(name)].filter((gram) => compactQuery.includes(gram)).length
  return {
    product,
    brandHit,
    nameHit,
    shortHit,
    categoryHit,
    score: (shortHit ? 120 : 0) + (nameHit ? 100 : 0) + (brandHit ? 40 : 0) + (categoryHit ? 30 : 0) + overlap * 5,
  }
}

function matchProducts(text, products = []) {
  const compactQuery = normalize(text)
  if (!compactQuery) return []

  const categories = detectCategories(compactQuery)
  const scored = products
    .map((product) => scoreProduct(product, compactQuery, categories))
    .filter((entry) => entry.brandHit || entry.nameHit || entry.shortHit)
  if (!scored.length) return []

  const exact = scored
    .filter((entry) => entry.nameHit || entry.shortHit)
    .sort((left, right) => right.score - left.score)
  if (exact.length) return exact.slice(0, MAX_MATCHED_PRODUCTS).map((entry) => entry.product)

  const brandMatched = scored.filter((entry) => entry.brandHit)
  if (!brandMatched.length) return []

  const categoryMatched = brandMatched.filter((entry) => entry.categoryHit)
  const pool = categoryMatched.length ? categoryMatched : brandMatched
  return pool
    .sort((left, right) => right.score - left.score)
    .slice(0, MAX_MATCHED_PRODUCTS)
    .map((entry) => entry.product)
}

module.exports = {
  CATEGORY_SYNONYMS,
  matchProducts,
  normalize,
}
