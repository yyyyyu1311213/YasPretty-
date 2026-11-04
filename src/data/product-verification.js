import { evidenceSync, generatedProductEvidence } from './product-verification.generated.js'
import { reviewedProductShades } from './product-shade-verification.js'
import { reviewedProductFacts } from './product-verification.reviewed.js'

const knownIssues = {
  'suqqu-the-liquid': ['现有企业资质文件名指向 SHISEIDO 产品，与本产品不一致，不能作为通过证据。'],
  'fenty-pro-filtr': ['人工核验表记录品牌为 FENTY BEAUTY、店铺为 FANBEAUTY官方旗舰店；网页按表内已完成状态展示，拼写原样保留。新封面由项目负责人提供，但附件只显示 Fan\'s Red Carpet，原始网页来源和品牌归属仍待补证。'],
}

export const productVerificationRecords = Object.fromEntries(
  Object.entries(generatedProductEvidence).map(([productId, evidence]) => [productId, {
    productId,
    nameReviewStatus: reviewedProductFacts[productId]?.reviewStatus || 'pending_owner_confirmation',
    commerce: {
      platform: reviewedProductFacts[productId] ? 'taobao' : null,
      officialStoreName: reviewedProductFacts[productId]?.officialStoreName || evidence.storeDisplayName,
      officialStoreFlag: reviewedProductFacts[productId]?.officialStoreFlag || null,
      officialMarkerType: reviewedProductFacts[productId]?.officialMarkerType || null,
      storeUrl: null,
      productUrl: reviewedProductFacts[productId]?.productUrl || null,
      status: reviewedProductFacts[productId]?.reviewStatus || 'pending',
      verifiedAt: reviewedProductFacts[productId]?.verifiedAt || null,
      note: reviewedProductFacts[productId] ? '链接、店铺身份和对应商品已在人工核验表中标记为已完成；价格以实际结算页为准。' : '尚未取得可复核的淘宝或天猫品牌官方旗舰店商品链接。',
    },
    reviewedFacts: reviewedProductFacts[productId] || null,
    reviewedShades: reviewedProductShades[productId] ? {
      ...reviewedProductShades[productId],
      evidence: evidence.publicEvidence.filter((item) => item.kind === 'parameters'),
    } : null,
    evidence,
    issues: [...(knownIssues[productId] || []), ...(reviewedProductShades[productId]?.issues || [])],
  }]),
)

export function getProductVerification(productId) {
  return productVerificationRecords[productId] || null
}

export function isAllowedOfficialProductUrl(value) {
  if (!value) return false
  try {
    const url = new URL(value)
    const isTmallProduct = url.hostname === 'detail.tmall.com' || url.hostname.endsWith('.detail.tmall.com')
    const isTaobaoProduct = url.hostname === 'item.taobao.com'
    const isTaobaoShortLink = url.hostname === 'e.tb.cn' && /^\/h\.[A-Za-z0-9]+$/.test(url.pathname) && url.searchParams.has('tk')
    return url.protocol === 'https:' && (((isTmallProduct || isTaobaoProduct) && url.searchParams.has('id')) || isTaobaoShortLink)
  } catch {
    return false
  }
}

export function buildProductAssessment(product) {
  const factVerified = product.factVerificationStatus === 'verified'
  const parameterBasis = factVerified ? 'reviewed_commerce_parameters_and_editorial_interpretation' : 'editorial_record_pending_verification'
  const sourceLabel = factVerified ? '人工核验表与参数截图已记录商品事实，以下妆效和适配方向为编辑解读' : '站内编辑记录，参数仍待逐项核验'
  const finish = product.finish || '妆效待核验'
  const coverage = product.coverage ? `${product.coverage}遮瑕方向` : '遮瑕方向待核验'
  const skinTypes = product.skins?.length ? product.skins.join('、') : '适用肤质待核验'

  return {
    parameterBasis,
    sourceLabel,
    summary: `当前档案将这款产品记录为${finish}、${coverage}，适用方向包括${skinTypes}。这是基于现有参数和编辑字段的选购解读，不是独立人体实测结论。`,
    dimensions: [
      { label: '妆效方向', value: finish, status: 'editorial_interpretation' },
      { label: '遮瑕方向', value: coverage, status: 'editorial_interpretation' },
      { label: '适用方向', value: skinTypes, status: 'editorial_interpretation' },
      { label: '持妆与氧化', value: '缺少统一样本、环境与测试方法时不作确定结论', status: 'pending' },
    ],
    strengths: product.pros || [],
    cautions: product.cautions || [],
    limitations: [
      '品牌参数和商品页宣称不能替代真实使用测试。',
      '肤质适配、持妆、氧化和卡粉会受到环境、妆前与上妆方式影响。',
      '色号仅用于初筛，购买前仍建议在自然光下试色。',
    ],
  }
}

export { evidenceSync }
