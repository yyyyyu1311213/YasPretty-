import originData from './data/productDetailOrigins.json'
import { detailReasons, getDetailCautions } from './data/productDetailCopy'
import { productExpansionRecords } from '../../data/product-expansion'

const origins = new Map(originData.records.map(record => [record.id, record]))
const expansionRecords = new Map(productExpansionRecords.map(record => [record.id, record]))

/** Empty/unknown values are absence, never a product claim. */
export function hasDetailValue(value) {
  return typeof value === 'string' && Boolean(value.trim()) && !/^(待核验|unknown|未标注|商品页未标注|暂无信息)$/i.test(value.trim())
}

/**
 * Detail-only view model. Does not mutate shared product/recommendation data.
 * Origin source status is a transcription record, not new online verification.
 * @returns {{ brandRegion: string, origin: string, originNote: string, finish: string|null,
 *   pros: string[], cautions: string[], scenes: string[], originRecord: object|null }}
 */
export function getProductDetailPresentation(product, reviewed) {
  const originRecord = origins.get(product.id)
  return {
    brandRegion: originRecord?.brandRegion || product.editorialProfile?.region || product.brandRegion || '暂无信息',
    origin: originRecord?.origin || reviewed?.origin || product.madeIn || '暂无信息',
    originNote: originRecord?.originNote || '',
    finish: hasDetailValue(product.finish) ? product.finish : null,
    pros: detailReasons[product.id] || product.pros || [],
    cautions: getDetailCautions(product, expansionRecords.get(product.id)),
    scenes: product.editorialProfile?.scenes || product.detailScenes || product.scenes || [],
    originRecord: originRecord || null,
  }
}
