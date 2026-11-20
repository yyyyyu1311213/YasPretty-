import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import { products } from '../../../data/products'
import { getProductVerification } from '../../../data/product-verification'
import origins from '../data/productDetailOrigins.json'
import { detailReasons } from '../data/productDetailCopy'
import { getProductDetailPresentation, hasDetailValue } from '../productDetailPresentation'
import ProductDetailDrawer from './ProductDetailDrawer'
import ProductProfile from './ProductProfile'
import ProductDetailSources from './ProductDetailSources'

const views = product => [
  renderToStaticMarkup(<ProductDetailDrawer product={product} onClose={() => {}} onOpenProduct={() => {}} onOpenFullProfile={() => {}} />),
  renderToStaticMarkup(<ProductProfile product={product} onBack={() => {}} />),
]

describe('product detail refinement — YAS-2026-0057', () => {
  it('keeps all 76 origin records tied to stable products, source rows and the unchanged workbook', () => {
    expect(origins.records).toHaveLength(76)
    expect(new Set(origins.records.map(record => record.id)).size).toBe(76)
    expect(createHash('sha256').update(fs.readFileSync(origins.source.path)).digest('hex')).toBe(origins.source.sha256)
    expect(origins.source.externalSourceUrlsProvided).toBe(false)
    for (const [index, record] of origins.records.entries()) {
      expect(record.id).toBe(`catalog-${String(index + 36).padStart(3, '0')}`)
      expect(record.workbookRow).toBe(index + 2)
      expect(record.productName).toBe(products.find(product => product.id === record.id).name)
      expect(record.transcriptionStatus).toBe('source_recorded')
      for (const value of [record.brandRegion, record.origin, record.basis, record.note]) expect(hasDetailValue(value)).toBe(true)
      if (record.originEvidence) expect(fs.existsSync(record.originEvidence.path)).toBe(true)
    }
  })

  it('preserves confirmed screenshot precedence and does not narrow a multi-country workbook claim', () => {
    const byId = id => getProductDetailPresentation(products.find(product => product.id === id))
    expect(byId('catalog-056')).toMatchObject({ brandRegion: '韩国', origin: '中国', originRecord: { workbookOrigin: '韩国', resolution: { decision: 'owner_confirmed_product_screenshot' } } })
    expect(byId('catalog-092')).toMatchObject({ brandRegion: '美国', origin: '比利时', originRecord: { workbookOrigin: '意大利' } })
    expect(byId('catalog-041')).toMatchObject({ brandRegion: '法国', origin: '中国' })
    expect(byId('catalog-045').origin).toBe('美国／加拿大／意大利')
    expect(byId('catalog-045').originNote).toContain('具体批次')
    expect(byId('catalog-063').origin).toBe('加拿大')
  })

  it('hides absent finishes entirely in both views and retains a known finish', () => {
    const product = products.find(product => product.id === 'catalog-036')
    for (const finish of [null, undefined, '', '  ', '待核验', 'unknown', '商品页未标注']) {
      for (const markup of views({ ...product, finish })) expect(markup).not.toContain('<dt>妆效方向</dt>')
    }
    for (const markup of views({ ...product, finish: '哑光' })) expect(markup).toContain('<dt>妆效方向</dt><dd>哑光</dd>')
  })

  it('removes detail ratings and shade suitability for all 111 products without mutating shared data', () => {
    const before = JSON.stringify(products)
    expect(Object.keys(detailReasons).sort()).toEqual(products.map(product => product.id).sort())
    for (const product of products) {
      const detail = getProductDetailPresentation(product, getProductVerification(product.id)?.reviewedFacts)
      expect(detail.pros.length).toBeGreaterThan(0)
      expect(detail.cautions.length).toBeGreaterThan(0)
      for (const markup of views(product)) {
        expect(markup).not.toMatch(/编辑示例|class="(?:detail-rating|metric-grid|assessment-grid|shade-description)"/)
        expect(markup).toContain('喜欢它的理由')
        expect(markup).toContain('使用时注意')
        expect(markup).toContain('图片与版权')
        expect(markup).toContain('权利人联系删除')
        expect(markup).not.toContain('<dt>采集日期</dt>')
        expect(markup).not.toContain('<dt>授权状态</dt>')
        expect(markup).not.toContain('href="null"')
        expect(markup).toContain(detail.brandRegion)
        expect(markup).toContain(detail.origin)
      }
    }
    expect(JSON.stringify(products)).toBe(before)
  })

  it('retains specific sensitive-skin, waterproof, sunscreen and version cautions as readable advice', () => {
    const cautions = id => getProductDetailPresentation(products.find(product => product.id === id)).cautions.join(' ')
    expect(cautions('catalog-056')).toContain('不建议敏感肌')
    expect(cautions('catalog-066')).toContain('防水也不代表不会晕染')
    expect(cautions('catalog-039')).toContain('足量防晒')
    expect(cautions('catalog-037')).toContain('核对版本和规格')
  })

  it('uses one image disclosure structure and keeps missing original URLs explicit', () => {
    for (const id of ['make-up-for-ever-hd', 'catalog-036', 'catalog-056', 'fenty-pro-filtr']) {
      const product = products.find(product => product.id === id)
      const markup = renderToStaticMarkup(<ProductDetailSources product={product} />)
      expect((markup.match(/<dt>/g) || []).length).toBe(2)
      expect(markup).toContain('版权归原权利人所有')
      expect(markup).toContain('权利人 / 发布方')
      expect(markup).not.toContain('<dt>采集日期</dt>')
      expect(markup).not.toContain('<dt>授权状态</dt>')
      if (product.imageSource.sourcePageUrl) expect(markup).toContain('查看产品图片来源页')
      else { expect(markup).toContain('原始来源页暂缺'); expect(markup).not.toContain('查看产品图片来源页') }
    }
  })
})
