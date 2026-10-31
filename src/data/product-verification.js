import { evidenceSync, generatedProductEvidence } from './product-verification.generated.js'

const knownIssues = {
  'suqqu-the-liquid': ['现有企业资质文件名指向 SHISEIDO 产品，与本产品不一致，不能作为通过证据。'],
  'fenty-pro-filtr': ['店铺截图品牌拼写与产品品牌不一致，且现有旧来源曾指向其他产品，需重新核验。'],
  'nars-light-reflecting': ['当前资料中存在“超方瓶粉底液”和“光透亮泽粉底液”两种名称，等待项目负责人确认标准名称。'],
  'nars-radiant-creamy': ['当前资料中存在“亮采柔滑遮瑕蜜”和“光泽焕采遮瑕蜜”两种名称，等待项目负责人确认标准名称。'],
}

export const productVerificationRecords = Object.fromEntries(
  Object.entries(generatedProductEvidence).map(([productId, evidence]) => [productId, {
    productId,
    nameReviewStatus: 'pending_owner_confirmation',
    commerce: {
      platform: null,
      officialStoreName: evidence.storeDisplayName,
      storeUrl: null,
      productUrl: null,
      status: 'pending',
      verifiedAt: null,
      note: '尚未取得可复核的淘宝或天猫品牌官方旗舰店商品直达链接。',
    },
    evidence,
    issues: knownIssues[productId] || [],
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
    return url.protocol === 'https:' && (isTmallProduct || isTaobaoProduct) && url.searchParams.has('id')
  } catch {
    return false
  }
}

export function buildProductAssessment(product) {
  const factVerified = product.factVerificationStatus === 'verified'
  const parameterBasis = factVerified ? 'official_fact_and_editorial_interpretation' : 'editorial_record_pending_verification'
  const sourceLabel = factVerified ? '来源已记录，以下包含编辑解读' : '站内编辑记录，参数仍待逐项核验'
  const finish = product.finish || '妆效待核验'
  const coverage = product.coverage ? `${product.coverage}遮瑕方向` : '遮瑕方向待核验'
  const skinTypes = product.skins?.length ? product.skins.join('、') : '适用肤质待核验'

  return {
    parameterBasis,
    sourceLabel,
    summary: `当前档案将这款产品记录为${finish}、${coverage}，适用方向包括${skinTypes}。这是基于现有参数和编辑字段的选购解读，不是独立人体实测结论。`,
    dimensions: [
      { label: '妆效方向', value: finish, status: factVerified ? 'source_recorded' : 'pending' },
      { label: '遮瑕方向', value: coverage, status: factVerified ? 'source_recorded' : 'pending' },
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
