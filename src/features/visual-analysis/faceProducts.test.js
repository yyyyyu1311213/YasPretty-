import { describe, it, expect } from 'vitest'
import { getCatalogProducts } from '../catalog/catalogService'
import { matchFaceProducts } from './faceProducts'

describe('face technique product matching', () => {
  const feature = { source: 'geometry', limited: false, code: 'round' }
  const step = { id: 'eyes', title: '眼妆' }
  it('reuses real catalog objects and changes tools with the technique', () => {
    const products = getCatalogProducts()
    const round = matchFaceProducts(step, feature, products)
    expect(round.map(x => x.product.category)).toEqual(['眼线', '眼影', '睫毛膏'])
    const elongated = matchFaceProducts(step, { ...feature, code: 'elongated' }, products)
    expect(elongated.map(x => x.product.category)).toEqual(['睫毛膏', '眼影', '眼线'])
    expect(round.every(x => products.includes(x.product) && x.reason)).toBe(true)
    for (const id of ['brow','nose','cheeks','contour','thirds']) {
      const picks = matchFaceProducts({ id, categories: ['修容','腮红'] }, feature, products)
      expect(new Set(picks.map(m => m.product.id)).size).toBe(3)
    }
  })
  it('does not recommend for uncertain/occluded observations or unsuitable data', () => {
    const base = { id: 'test', category: '眼影', recommendationReady: true, factVerificationStatus: 'verified', publicStatus: 'public_with_source_notice_authorization_pending', informationSources: [{}] }
    expect(matchFaceProducts(step, { ...feature, source: 'user', limited: true }, [base])).toEqual([])
    expect(matchFaceProducts(step, { source: 'unknown', limited: true }, [base])).toHaveLength(1)
    for (const bad of [{ recommendationReady: false }, { factVerificationStatus: 'pending' }, { publicStatus: 'blocked_pending_product_evidence' }, { informationSources: [] }]) {
      expect(matchFaceProducts(step, feature, [{ ...base, ...bad }])).toEqual([])
    }
    expect(matchFaceProducts(step, feature, [])).toEqual([])
  })
})
