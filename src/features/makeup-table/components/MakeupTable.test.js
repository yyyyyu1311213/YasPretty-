import { describe, expect, it } from 'vitest'
import { getCategoryGroups, getCategorySummary, MAX_BLOOM_ITEMS } from './MakeupTable'
import { products } from '../../../data/products'

describe('化妆桌品类数据', () => {
  it('保留 dev 的八类布局，新品类由产品库展示', () => {
    expect(getCategoryGroups(products).map((group) => group.id)).toEqual(['粉底液', '气垫', '遮瑕', '散粉', '眼影', '睫毛膏', '腮红', '唇妆'])
    expect(products.some((product) => product.category === '眉妆')).toBe(true)
    expect(getCategoryGroups([{ id: 'brow', category: '眉妆' }])).toEqual([])
  })
  it('只显示受控产品数据中真实存在的品类', () => {
    const groups = getCategoryGroups(products)
    expect(groups.length).toBeGreaterThan(0)
    groups.forEach((group) => {
      expect(group.products.length).toBeGreaterThan(0)
      expect(products.filter((product) => product.category === group.id)).toHaveLength(group.products.length)
    })
  })

  it('品类摘要使用确定性数据并包含实时数量', () => {
    const group = getCategoryGroups([{ id: 'demo', category: '腮红', brand: 'Demo', name: 'Demo' }])[0]
    expect(getCategorySummary(group)).toContain('当前收录 1 款')
    expect(getCategorySummary(group)).toContain('腮红用于')
  })

  it('展开产品数量最多为五款', () => {
    expect(MAX_BLOOM_ITEMS).toBe(5)
  })
})
