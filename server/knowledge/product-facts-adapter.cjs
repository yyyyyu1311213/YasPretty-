const { factRecordSchema, officialItemUrl } = require('./product-facts-schema.cjs')

const text = (value) => value === null || value === undefined ? null : Array.isArray(value) ? value.filter(Boolean).join('、') || null : String(value).trim() || null
const date = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value || '') ? value : null
const known = (value) => value && !/^(?:待核验|未知|unknown|以包装批次为准)$/.test(value)

// Values are derived on startup from the existing catalog and verification exports.
// This adapter adds field/source mappings, not a second manually maintained catalog.
function productFactRecords(product, verification = {}) {
  const reviewed = verification.reviewedFacts || {}
  const commerce = verification.commerce || {}
  const identityMatches = (!verification.productId || verification.productId === product.id)
    && (!reviewed.productId || reviewed.productId === product.id)
    && (!reviewed.productName || reviewed.productName === product.name)
  const identityConflict = !identityMatches || (verification.issues || []).some((issue) => /品牌.*(?:拼写|不一致|归属)|店铺.*拼写/.test(issue))
  const recorded = identityMatches && reviewed.reviewStatus === 'verified' && reviewed.productMatch !== false
  const version = product.officialProductName || product.name
  const sku = reviewed.sku || null
  const verifiedAt = date(reviewed.verifiedAt)
  const row = reviewed.source?.row ? '第' + reviewed.source.row + '行' : reviewed.source?.rowSequence ? '序号' + reviewed.source.rowSequence : ''
  const directUrl = recorded && commerce.status === 'verified' && commerce.officialStoreFlag === '是' && !identityConflict
    ? officialItemUrl(commerce.productUrl) : null
  const manualSource = {
    id: product.id + ':manual', title: product.name + ' · 既有人工核验记录', publisher: commerce.officialStoreName || reviewed.officialStoreName || 'YasPretty 资料档案',
    accessedAt: verifiedAt, status: recorded ? 'recorded' : 'pending', url: directUrl,
    location: [reviewed.source?.workbookPath, reviewed.source?.sheet, row].filter(Boolean).join('#'),
    label: ['内部归档：人工核验表', row].filter(Boolean).join(' · '),
    limitations: ['继承已有记录；未在本次重新核验，不证明当前在售 SKU。', ...(!directUrl ? ['未取得符合规则的官方旗舰店直接商品链接；内部归档不是公开网页。'] : []), ...(product.onlineVerification?.status === 'unverified' ? ['既有在线复核未取得可读的商品证据，保留人工记录与在线缺口的区别。'] : [])],
  }
  const catalogSource = { id: product.id + ':catalog', title: product.name + ' · 站内资料', publisher: 'YasPretty', accessedAt: null,
    status: 'pending', url: null, location: 'src/data/products.js#' + product.id, label: '内部记录：产品库', limitations: ['编辑标签与使用表现不是独立实测，不保证个人效果。'] }
  const make = (field, value, status, evidence, limitations = []) => factRecordSchema.parse({
    productId: product.id, version, sku, field, value: known(text(value)) ? text(value) : null,
    status: identityConflict ? 'conflict' : known(text(value)) ? status : 'unknown', verifiedAt: evidence?.accessedAt || null,
    evidence: evidence ? [evidence] : [], limitations: identityConflict ? ['商品身份或版本记录存在冲突，不能合并事实。'] : limitations,
  })
  const records = []
  const catalogSpec = text(product.specification)
  const reviewedSpec = recorded ? text(reviewed.specification) : null
  const specConflict = catalogSpec && reviewedSpec && catalogSpec !== reviewedSpec
  const spec = reviewedSpec || catalogSpec
  const specSource = reviewedSpec ? manualSource : catalogSource
  records.push(make('specification', spec, specConflict ? 'conflict' : reviewedSpec ? 'recorded' : 'pending', specSource,
    specConflict ? ['产品库规格与核验记录冲突，不能选择其中一个当作确定事实。'] : ['规格原文不证明正装、替换芯或套装内容。']))
  // Only an explicit single quantity can be read as net content; do not sum sets.
  const netContent = /^\d+(?:\.\d+)?\s*(?:g|ml|克|毫升)$/i.test(spec || '') ? spec : null
  records.push(make('netContent', netContent, specConflict ? 'conflict' : reviewedSpec ? 'recorded' : 'pending', netContent ? specSource : null, ['仅是净含量记录，不说明包装内件数或是否含替换芯。']))
  for (const field of ['packagingContents', 'saleUnit', 'refill', 'setContents', 'usageDuration', 'ingredients', 'promotion', 'launch', 'reviews', 'shelfLife', 'efficacy']) records.push(make(field, null, 'unknown', null,
    [field === 'usageDuration' ? '缺少每次用量与使用频率证据，无法估算可用天数。' : '现有记录没有支持该字段及对应 SKU 的明确证据。']))
  records.push(make('purchaseLink', directUrl, recorded ? 'recorded' : 'pending', directUrl ? manualSource : null, ['仅展示已有官方旗舰店直接链接；未确认当前在售状态。']))
  const priceConflict = recorded && Number.isFinite(reviewed.listPrice) && Number.isFinite(product.price) && reviewed.listPrice !== product.price
  records.push(make('price', product.price === null || product.price === undefined ? null : product.price + '元', priceConflict ? 'conflict' : recorded ? 'recorded' : 'pending', recorded ? manualSource : catalogSource, [priceConflict ? '产品库与核验记录的价格冲突，无法确认。' : '历史参考价不能冒充实时价格；价格问题需要先检索。']))
  records.push(make('origin', recorded ? reviewed.origin : product.madeIn, recorded && reviewed.originStatus === 'verified_parameter_screenshot' ? 'recorded' : 'pending', recorded ? manualSource : catalogSource))
  for (const [field, value] of Object.entries({ category: product.category, skins: product.skins, finish: product.finish, coverage: product.coverage,
    wear: Number.isFinite(product.wear) ? product.wear + '小时' : null, cautions: product.cautions,
    shades: product.shadeRecommendationReady !== false ? (product.shades || []).map((shade) => shade.name) : null })) {
    records.push(make(field, value, 'pending', catalogSource, ['站内资料记录，适用性与使用表现未做独立实测。']))
  }
  return records
}

async function loadVerificationRecords() {
  return (await import('../../src/data/product-verification.js')).productVerificationRecords
}

module.exports = { productFactRecords, loadVerificationRecords }
