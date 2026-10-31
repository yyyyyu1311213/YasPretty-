import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import { products } from './products.js'
import {
  buildProductAssessment,
  evidenceSync,
  isAllowedOfficialProductUrl,
  productVerificationRecords,
} from './product-verification.js'

describe('product verification records', () => {
  it('maps every catalog product to one traceable evidence record', () => {
    expect(Object.keys(productVerificationRecords)).toHaveLength(products.length)
    products.forEach((product) => {
      const record = productVerificationRecords[product.id]
      expect(record).toBeTruthy()
      expect(record.evidence.sequence).toMatch(/^\d{2}$/)
      expect(record.evidence.publicEvidence.length).toBeGreaterThan(0)
      expect(record.evidence.businessQualification.status).toBe('archived_internal')
    })
    expect(evidenceSync.productCount).toBe(products.length)
  })

  it('keeps generated evidence files present and hash-verifiable', () => {
    Object.values(productVerificationRecords).forEach((record) => {
      record.evidence.publicEvidence.forEach((evidence) => {
        const localPath = resolve('public', evidence.publicPath.replace(/^\/verification\//, 'verification/'))
        expect(existsSync(localPath), localPath).toBe(true)
        const hash = createHash('sha256').update(readFileSync(localPath)).digest('hex')
        expect(hash).toBe(evidence.sha256)
      })
    })
  })

  it('only permits direct HTTPS product links from Tmall or Taobao', () => {
    expect(isAllowedOfficialProductUrl('https://detail.tmall.com/item.htm?id=123')).toBe(true)
    expect(isAllowedOfficialProductUrl('https://item.taobao.com/item.htm?id=123')).toBe(true)
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
  })

  it('labels parameter-based assessments as editorial rather than independent tests', () => {
    products.forEach((product) => {
      const assessment = buildProductAssessment(product)
      expect(assessment.summary).toContain('不是独立人体实测结论')
      expect(assessment.limitations.length).toBeGreaterThan(0)
      expect(assessment.dimensions.find((item) => item.label === '持妆与氧化')?.status).toBe('pending')
    })
  })
})
