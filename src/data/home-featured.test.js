import { describe, expect, it } from 'vitest'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { products } from './products'

describe('首页精选轮播受控数据', () => {
  it('从产品库选取 12 个唯一产品并保留本地图片', () => {
    const featured = [...products].sort((a, b) => b.rating - a.rating).slice(0, 12)
    expect(featured).toHaveLength(12)
    expect(new Set(featured.map((product) => product.id)).size).toBe(12)
    featured.forEach((product) => {
      expect(product.image.startsWith('/')).toBe(true)
      expect(existsSync(resolve(process.cwd(), 'public', product.image.slice(1)))).toBe(true)
    })
  })
})
