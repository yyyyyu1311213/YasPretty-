import { describe, expect, it } from 'vitest'
const { selectRecommendations } = require('./tools.cjs')

const products = [
  { id: 'dry', brand: '合成', name: '干皮底妆', category: '粉底液', skins: ['干皮'], price: 100, recommendationReady: true },
  { id: 'mixed-dry', brand: '合成', name: '混干底妆', category: '粉底液', skins: ['混干皮'], price: 100, recommendationReady: true },
  { id: 'oily', brand: '合成', name: '油皮底妆', category: '粉底液', skins: ['油皮'], price: 100, recommendationReady: true },
  { id: 'mixed-oily', brand: '合成', name: '混油底妆', category: '粉底液', skins: ['混油皮'], price: 100, recommendationReady: true },
  { id: 'sensitive', brand: '合成', name: '敏感肌底妆', category: '粉底液', skins: ['敏感肌'], price: 100, recommendationReady: true },
]

describe('确定性商品肤质筛选', () => {
  it.each([
    [['干皮', '混干皮'], ['dry', 'mixed-dry']],
    [['油皮', '混油皮'], ['oily', 'mixed-oily']],
    [['混油皮', '混干皮'], ['mixed-oily', 'mixed-dry']],
  ])('filters against any catalog skin label in the current request: %j', (skinValues, expected) => {
    const selection = selectRecommendations(products, { category: '粉底液', skinValues, skinLabel: '测试日常感受' })
    expect(selection.map(({ product }) => product.id).sort()).toEqual([...expected].sort())
    expect(selection.every(({ evidence }) => evidence.some((item) => item.includes('资料库适用肤质记录')))).toBe(true)
  })

  it('does not widen the filter when no candidate metadata matches', () => {
    const selection = selectRecommendations(products, { category: '粉底液', skinValues: ['不存在'], skinLabel: '合成倾向' })
    expect(selection).toEqual([])
  })

  it('leaves skin unfiltered when the request has no skin condition', () => {
    expect(selectRecommendations(products, { category: '粉底液' }).map(({ product }) => product.id)).toEqual(products.map(({ id }) => id).slice(0, 3))
  })
})
