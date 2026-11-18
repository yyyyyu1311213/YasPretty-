import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import { products } from './products.js'
import { expansionEvidenceSync, expansionVerificationRecords, productExpansionRecords } from './product-expansion.js'
import { reviewedProductShades } from './product-shade-verification.js'
import {
  buildProductAssessment,
  evidenceSync,
  isAllowedOfficialProductUrl,
  productVerificationRecords,
} from './product-verification.js'

describe('product verification records', () => {
  it('maps every catalog product to one traceable evidence record', () => {
    expect(Object.keys(productVerificationRecords)).toHaveLength(products.length)
    const legacyProducts = products.filter((product) => !product.id.startsWith('catalog-'))
    const expansionProducts = products.filter((product) => product.id.startsWith('catalog-'))
    legacyProducts.forEach((product) => {
      const record = productVerificationRecords[product.id]
      expect(record).toBeTruthy()
      expect(record.evidence.sequence).toMatch(/^\d{2}$/)
      expect(record.evidence.publicEvidence.length).toBeGreaterThan(0)
      expect(record.evidence.publicEvidence.some((item) => item.kind === 'parameters')).toBe(true)
      expect(record.evidence.businessQualification.status).toBe('archived_internal')
      expect(record.reviewedFacts.source.sheet).toBe('淘宝人工核验')
      expect(record.reviewedFacts.reviewStatus).toBe('verified')
      expect(record.commerce.status).toBe('verified')
    })
    expansionProducts.forEach((product) => {
      const record = productVerificationRecords[product.id]
      expect(record.evidence.sequence).toMatch(/^\d{2,3}$/)
      expect(record.evidence.publicEvidence.map((item) => item.kind)).toEqual(['store', 'detail', 'qualification'])
      expect(record.reviewedFacts.reviewStatus).toBe('partial')
      expect(record.commerce.status).toBe('verified')
      expect(record.issues.join('')).toContain('pending')
      expect(product.recommendationReady).toBe(false)
    })
    expect(evidenceSync.productCount).toBe(35)
    expect(evidenceSync.sourceRange).toBe('A6:S40')
    expect(expansionEvidenceSync.productCount).toBe(66)
    expect(expansionEvidenceSync.sequenceRange).toBe('46-111')
  })

  it('keeps generated evidence files present and hash-verifiable', () => {
    Object.values(productVerificationRecords).filter((record) => !record.productId.startsWith('catalog-')).forEach((record) => {
      record.evidence.publicEvidence.forEach((evidence) => {
        const localPath = resolve('public', evidence.publicPath.replace(/^\/verification\//, 'verification/'))
        expect(existsSync(localPath), localPath).toBe(true)
        const hash = createHash('sha256').update(readFileSync(localPath)).digest('hex')
        expect(hash).toBe(evidence.sha256)
      })
    })

    const workbookPath = resolve(evidenceSync.sourceWorkbook.originalSourcePath)
    if (existsSync(workbookPath)) {
      const workbookHash = createHash('sha256').update(readFileSync(workbookPath)).digest('hex')
      expect(workbookHash).toBe(evidenceSync.sourceWorkbook.sha256)
    }

    productExpansionRecords.forEach((record) => {
      expect(existsSync(resolve(record.storeEvidencePath)), record.storeEvidencePath).toBe(true)
      expect(existsSync(resolve(record.detailEvidencePath)), record.detailEvidencePath).toBe(true)
      expect(existsSync(resolve(record.qualificationEvidencePath)), record.qualificationEvidencePath).toBe(true)
      const imagePath = resolve(record.image.localPath)
      expect(existsSync(imagePath), imagePath).toBe(true)
      expect(readFileSync(imagePath).byteLength).toBe(record.image.bytes)
    })
    const expansionWorkbookPath = resolve('产品核验信息/YasPretty-111款产品淘宝人工核验表.xlsx')
    expect(existsSync(expansionWorkbookPath)).toBe(true)
    const expansionWorkbookHash = createHash('sha256').update(readFileSync(expansionWorkbookPath)).digest('hex')
    expect(expansionWorkbookHash.toLowerCase()).toBe(expansionEvidenceSync.sourceWorkbook.sha256.toLowerCase())
  })

  it('only permits verified-shape HTTPS product or share links from Tmall or Taobao', () => {
    expect(isAllowedOfficialProductUrl('https://detail.tmall.com/item.htm?id=123')).toBe(true)
    expect(isAllowedOfficialProductUrl('https://item.taobao.com/item.htm?id=123')).toBe(true)
    expect(isAllowedOfficialProductUrl('https://e.tb.cn/h.example123?tk=abc123')).toBe(true)
    expect(isAllowedOfficialProductUrl('https://e.tb.cn/h.example123')).toBe(false)
    expect(isAllowedOfficialProductUrl('https://e.tb.cn/')).toBe(false)
    expect(isAllowedOfficialProductUrl('https://example.com/item.htm?id=123')).toBe(false)
    expect(isAllowedOfficialProductUrl('https://tmall.com/')).toBe(false)
    expect(isAllowedOfficialProductUrl('http://detail.tmall.com/item.htm?id=123')).toBe(false)

    Object.values(productVerificationRecords).forEach((record) => {
      if (record.commerce.status === 'verified') {
        expect(isAllowedOfficialProductUrl(record.commerce.productUrl)).toBe(true)
        expect(record.commerce.officialStoreName).toBeTruthy()
        expect(record.commerce.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      } else {
        expect(record.commerce.productUrl).toBeNull()
      }
    })
    expect(Object.values(productVerificationRecords).filter((record) => record.commerce.status === 'verified')).toHaveLength(101)
  })

  it('uses reviewed prices and parameter origins without inventing missing origin evidence', () => {
    products.filter((product) => !product.id.startsWith('catalog-')).forEach((product) => {
      const reviewed = productVerificationRecords[product.id].reviewedFacts
      expect(product.name).toBe(reviewed.productName)
      expect(product.price).toBe(reviewed.listPrice)
      expect(product.priceVerifiedAt).toBe(reviewed.verifiedAt)
      expect(product.factVerificationStatus).toBe('verified')
      if (reviewed.origin) expect(product.madeIn).toBe(reviewed.origin)
    })
    products.filter((product) => product.id.startsWith('catalog-')).forEach((product) => {
      const reviewed = productVerificationRecords[product.id].reviewedFacts
      expect(product.name).toBe(reviewed.productName)
      expect(product.price).toBe(reviewed.listPrice)
      expect(product.priceVerifiedAt).toBe(reviewed.verifiedAt)
      expect(product.factVerificationStatus).toBe('pending')
      expect(reviewed.reviewStatus).toBe('partial')
    })
    expect(productVerificationRecords['suqqu-the-liquid'].reviewedFacts.origin).toBeNull()
    expect(productVerificationRecords['suqqu-the-liquid'].reviewedFacts.originStatus).toBe('not_listed_in_parameter_screenshot')
  })

  it('uses normalized parameter-screenshot shades only when product identity is not conflicted', () => {
    expect(Object.keys(reviewedProductShades)).toHaveLength(35)

    products.filter((product) => !product.id.startsWith('catalog-')).forEach((product) => {
      const reviewed = reviewedProductShades[product.id]
      expect(reviewed).toBeTruthy()
      expect(reviewed.sequence).toMatch(/^\d{2}$/)
      expect(reviewed.reviewedAt).toBe('2026-11-03')
      expect(reviewed.source.workbookSheet).toBe('淘宝人工核验')
      expect(reviewed.source.workbookNameCell).toMatch(/^C(?:[6-9]|[1-3]\d|40)$/)
      expect(reviewed.shades.length).toBeGreaterThan(0)
      expect(new Set(reviewed.shades.map((shade) => shade.name)).size).toBe(reviewed.shades.length)
      expect(product.shadeRecommendationReady).toBe(reviewed.status === 'verified_parameter_screenshot')
      expect(productVerificationRecords[product.id].reviewedShades.evidence.length).toBeGreaterThan(0)

      if (reviewed.applyToCatalog) {
        expect(product.shades).toEqual(reviewed.shades)
      } else {
        expect(reviewed.status).toBe('product_identity_conflict')
        expect(reviewed.issues.length).toBeGreaterThan(0)
      }
    })

    expect(Object.values(reviewedProductShades).filter((item) => item.status === 'product_identity_conflict')).toHaveLength(0)
    expect(Object.values(reviewedProductShades).filter((item) => item.status === 'verified_parameter_screenshot')).toHaveLength(32)
    expect(Object.values(reviewedProductShades).filter((item) => item.status === 'marketplace_variant_only')).toHaveLength(3)
    expect(Object.values(reviewedProductShades).every((item) => item.applyToCatalog)).toBe(true)
    expect(reviewedProductShades['loreal-paris-anti-gravity-mascara'].shades[0].verificationStatus).toBe('not_listed_in_parameter_screenshot')
    expect(reviewedProductShades['loreal-paris-anti-gravity-mascara'].status).toBe('marketplace_variant_only')
    expect(reviewedProductShades['laura-mercier-translucent'].status).toBe('marketplace_variant_only')
    expect(reviewedProductShades['make-up-for-ever-hd'].status).toBe('marketplace_variant_only')
  })

  it('keeps expansion facts traceable without treating image or product fields as verified', () => {
    expect(Object.keys(expansionVerificationRecords)).toHaveLength(66)
    expect(productExpansionRecords.map((record) => record.sequence)).toEqual(Array.from({ length: 66 }, (_, index) => String(index + 46)))
    expect(productExpansionRecords.every((record) => record.productUrl.startsWith('https://detail.tmall.com/') || record.productUrl.startsWith('https://item.taobao.com/'))).toBe(true)
    expect(productExpansionRecords.every((record) => record.image.authorizationStatus === 'pending' && record.image.allowedUse === 'internal_only')).toBe(true)
    expect(products.filter((product) => product.id.startsWith('catalog-')).every((product) => product.shadeRecommendationReady === false && product.image.includes('/products/catalog-'))).toBe(true)
  })

  it('assigns swatch colors to Chinese-labeled shades only', () => {
    const allShades = Object.values(reviewedProductShades).flatMap((item) => item.shades)
    const chineseShades = allShades.filter((shade) => /[\u3400-\u9fff]/.test(shade.name) && shade.verificationStatus === 'verified_parameter_screenshot')
    const nonChineseShades = allShades.filter((shade) => !/[\u3400-\u9fff]/.test(shade.name))

    expect(chineseShades.length).toBeGreaterThan(0)
    expect(chineseShades.every((shade) => shade.swatchColor)).toBe(true)
    expect(nonChineseShades.every((shade) => !shade.swatchColor)).toBe(true)
  })

  it('labels parameter-based assessments as editorial rather than independent tests', () => {
    products.forEach((product) => {
      const assessment = buildProductAssessment(product)
      expect(assessment.summary).toContain('不是独立人体实测结论')
      expect(assessment.limitations.length).toBeGreaterThan(0)
      expect(assessment.dimensions.find((item) => item.label === '妆效方向')?.status).toBe('editorial_interpretation')
      expect(assessment.dimensions.find((item) => item.label === '持妆与氧化')?.status).toBe('pending')
    })
  })
})
