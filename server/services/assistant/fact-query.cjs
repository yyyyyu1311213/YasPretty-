const { productNameVariants } = require('./product-resolver.cjs')

const fieldPatterns = {
  specification: /规格|容量|多少(?:克|毫升)|\d+\s*(?:g|ml|克|毫升)/i,
  netContent: /净含量|多少(?:克|毫升)/,
  packagingContents: /包装|里面|内含|含不含|包含|有没有|带替换/,
  fullSize: /正装|小样|中样|试用装/,
  saleUnit: /销售单元/,
  refill: /替换芯|替换装|补充装/,
  setContents: /套装|组合|几件|几盒|几只/,
  usageDuration: /能用多久|可以用多久|大概用多久|用多长时间|用几天|用多少天|多久.*用完|用完.*多久/,
  price: /价格|多少钱|售价|现价|到手价/,
  ingredients: /成分|配方/,
  promotion: /促销|优惠|折扣|活动/,
  launch: /上市|发售|新品/,
  reviews: /口碑|测评|销量|排行/,
  purchaseLink: /哪里买|购买链接|商品链接|官网/,
  shelfLife: /保质期|有效期/,
  efficacy: /功效/,
  shades: /色号|颜色/,
  wear: /持妆|带妆/,
  coverage: /遮瑕/,
  finish: /妆效|(?:哑光|水光|光泽)(?:吗|么|[？?])/,
  origin: /产地|哪国生产/,
  skins: /适合|卡粉|脱妆|暗沉/,
}
function factQuery(query, products) {
  let question = String(query).normalize('NFKC')
  for (const name of products.flatMap(productNameVariants).sort((a, b) => b.length - a.length)) {
    question = question.replaceAll(name.normalize('NFKC'), '')
  }
  const fields = Object.entries(fieldPatterns).filter(([, pattern]) => pattern.test(question)).map(([field]) => field)
  if (fields.includes('netContent') && !fields.includes('specification')) fields.unshift('specification')
  const overview = fields.length === 0
  return { fields: overview ? ['category', 'skins', 'finish', 'coverage', 'cautions'] : fields,
    overview, online: fields.some((field) => ['price', 'ingredients', 'promotion', 'launch', 'reviews', 'purchaseLink'].includes(field)) || /最新|最近|目前|今年|20\d{2}/.test(question),
    sku: question.match(/(?:SKU|货号|商品编号)\s*[:：]?\s*([a-z0-9-]+)/i)?.[1] || null,
    quantity: question.match(/\d+(?:\.\d+)?\s*(?:g|ml|克|毫升)/i)?.[0] || null,
    advice: /便携|方便携带|放包|补妆/.test(question) }
}

module.exports = { factQuery }
