import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import { products } from './products.js'
import {
  expansionEvidenceSync,
  expansionOnlineVerificationRecords,
  expansionRecommendationReviewRecords,
  expansionVerificationRecords,
  productExpansionRecords,
} from './product-expansion.js'
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
      expect(['verified', 'identity_conflict']).toContain(record.reviewedFacts.reviewStatus)
      expect(['verified', 'pending']).toContain(record.commerce.status)
      expect(record.issues.join('')).toContain('pending')
      expect(product.recommendationReady).toBe(true)
    })
    expect(evidenceSync.productCount).toBe(35)
    expect(evidenceSync.sourceRange).toBe('A6:S40')
    expect(products).toHaveLength(111)
    expect(expansionEvidenceSync.productCount).toBe(76)
    expect(expansionEvidenceSync.sequenceRange).toBe('36-111')
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

  })

  it('uses reviewed prices and parameter origins without inventing missing origin evidence', () => {
    products.filter((product) => !product.id.startsWith('catalog-')).forEach((product) => {
      const reviewed = productVerificationRecords[product.id].reviewedFacts
      expect(product.name).toBe(reviewed.productName)
      expect(product.price).toBe(reviewed.reviewStatus === 'identity_conflict' ? null : reviewed.listPrice)
      expect(product.priceVerifiedAt).toBe(reviewed.verifiedAt)
      expect(product.factVerificationStatus).toBe('verified')
      if (reviewed.origin) expect(product.madeIn).toBe(reviewed.origin)
    })
    products.filter((product) => product.id.startsWith('catalog-')).forEach((product) => {
      const reviewed = productVerificationRecords[product.id].reviewedFacts
      expect(product.name).toBe(reviewed.productName)
      expect(product.price).toBe(reviewed.listPrice)
      expect(product.priceVerifiedAt).toBe(reviewed.verifiedAt)
      expect(product.factVerificationStatus).toBe('verified')
      expect(['verified', 'identity_conflict']).toContain(reviewed.reviewStatus)
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

  it('keeps expansion facts traceable and uses the human-reviewed table status for commerce fields', () => {
    expect(Object.keys(expansionVerificationRecords)).toHaveLength(76)
    expect(productExpansionRecords.map((record) => record.sequence)).toEqual(Array.from({ length: 76 }, (_, index) => String(index + 36)))
    expect(productExpansionRecords.every((record) => record.image.authorizationStatus === 'pending' && record.image.allowedUse === 'public_with_source_notice')).toBe(true)
    expect(products.filter((product) => product.id.startsWith('catalog-')).every((product) => product.shadeRecommendationReady === false && product.image.includes('/products/catalog-'))).toBe(true)
    expect(productExpansionRecords.filter((record) => record.dataIssues?.length).map((record) => record.id)).toEqual(expect.arrayContaining([
      'catalog-037', 'catalog-041', 'catalog-086', 'catalog-093', 'catalog-096', 'catalog-104', 'catalog-109',
    ]))
    expect(products.filter((product) => product.id.startsWith('catalog-')).every((product) => product.recommendationReady === true && product.rating === null && Object.keys(product.metrics).length === 0)).toBe(true)
    expect(expansionVerificationRecords['catalog-042'].commerce.status).toBe('verified')
    expect(expansionVerificationRecords['catalog-042'].reviewedFacts.reviewStatus).toBe('verified')
    expect(expansionVerificationRecords['catalog-042'].reviewedFacts.listPrice).toBe(61)
    expect(expansionVerificationRecords['catalog-037'].commerce.status).toBe('verified')
    expect(expansionVerificationRecords['catalog-041'].commerce.status).toBe('verified')
  })

  it('archives all 76 online attempts without generating ratings or opening evidence-poor products', () => {
    const expectedIds = Array.from({ length: 76 }, (_, index) => `catalog-${String(index + 36).padStart(3, '0')}`)
    expect(Object.keys(expansionOnlineVerificationRecords)).toEqual(expectedIds)
    expect(Object.keys(expansionRecommendationReviewRecords)).toEqual(expectedIds)

    expectedIds.forEach((productId) => {
      const product = products.find((item) => item.id === productId)
      const verification = productVerificationRecords[productId]
      const online = expansionOnlineVerificationRecords[productId]
      const review = expansionRecommendationReviewRecords[productId]

      expect(online).toMatchObject({
        productId,
        status: 'unverified',
        accessedAt: '2026-11-20',
        supportedFields: [],
      })
      expect(online.sourceRecords.length).toBeGreaterThan(0)
      online.sourceRecords.forEach((source) => {
        expect(source.url).toMatch(/^https?:\/\//)
        expect(source.title).toBeTruthy()
        expect(source.publisher).toBeTruthy()
        expect(source.accessedAt).toBe('2026-11-20')
        expect(source.evidence).toBeTruthy()
      })
      expect(review).toMatchObject({
        productId,
        decision: 'verified_manual',
        reviewedAt: '2026-11-20',
        rating: null,
        ratingStatus: 'not_generated',
        recommendationReady: true,
        shadeRecommendationReady: false,
        imageAuthorizationStatus: 'pending',
      })
      expect(review.blockingReasons.length).toBeGreaterThan(0)
      expect(product.onlineVerification).toEqual(online)
      expect(product.recommendationReview).toEqual(review)
      expect(verification.onlineVerification).toEqual(online)
      expect(verification.recommendationReview).toEqual(review)
      expect(verification.evidence.publicEvidence.map((item) => item.kind)).toEqual(['store', 'detail', 'qualification'])
      expect(product).toMatchObject({
        rating: null,
        metrics: {},
        recommendationReady: true,
        shadeRecommendationReady: false,
        imageAuthorizationStatus: 'pending',
        factVerificationStatus: 'verified',
      })
    })

    expect(expansionOnlineVerificationRecords['catalog-037'].conflicts.join(' ')).toContain('规格不一致')
    expect(expansionOnlineVerificationRecords['catalog-045'].conflicts.join(' ')).toContain('50ml')
    expect(expansionOnlineVerificationRecords['catalog-065'].conflicts.join(' ')).toContain('1.5g')
    expect(expansionOnlineVerificationRecords['catalog-099'].conflicts.join(' ')).toContain('商品ID与规格')
    expect(expansionOnlineVerificationRecords['catalog-109'].conflicts.join(' ')).toContain('目标SKU')
  })

  it('shows the extracted parameter-screenshot shades without inferred suitability', () => {
    const byId = Object.fromEntries(products.map((product) => [product.id, product]))
    expect(byId['catalog-051'].shades.map((shade) => shade.name)).toEqual(['MF05 螺黛栗', 'MF01 螺黛灰', 'MF03 螺黛褐'])
    expect(byId['catalog-052'].shades.map((shade) => shade.name)).toEqual(['01自然灰', '02深棕色', '03浅棕色', '04棕色', '05咖啡色'])
    expect(byId['catalog-056'].shades[0].name).toBe('#SMOOTHER 深棕哑光盘')
    expect(byId['catalog-056'].shades.length).toBeGreaterThan(10)
    expect(byId['catalog-056'].colorDisplay).toContain('#OVERTAKE 橘棕盘')
    expect(byId['catalog-080'].colorDisplay).toContain('烟木粉')
    expect(byId['catalog-080'].colorDisplay).toContain('梦核紫')
    expect(byId['catalog-096'].colorDisplay).toContain('L501')
    expect(byId['catalog-110'].colorDisplay).toContain('冷白')
    expect(byId['catalog-109'].shades.map((shade) => shade.name)).toEqual([
      '#01经典色号（适合自然肤色）',
      '#02白皙色号（适合白皙肤色）',
      '#03膨胀色（适合多种肤色）',
      '#01日炙白（单色高光膏）',
    ])
    expect(byId['catalog-036'].shades.map((shade) => shade.name)).toEqual(['单一规格'])
    expect(byId['catalog-084'].shades.map((shade) => shade.name)).toEqual([
      '05 美人绯 气血玫瑰',
      '06 亚麻裸 收缩奶咖',
      '02 水波粉 奶油白桃',
      '07 冷波粉 baby粉紫色',
      '01 潮汐杏 裸米奶杏',
      '04 春汐柚 蜜瓜甜柚',
      '08 热浪橘 亚裔橘棕',
      '03 涟漪紫 粉紫丁香',
    ])
    products.filter((product) => product.id.startsWith('catalog-')).forEach((product) => {
      expect(product.shades.length).toBeGreaterThan(0)
      expect(new Set(product.shades.map((shade) => shade.name)).size).toBe(product.shades.length)
      expect(expansionVerificationRecords[product.id].reviewedShades.shades).toEqual(product.shades)
      product.shades.forEach((shade) => {
        expect(shade.tone).toBe('待核验')
        expect(shade.lightness).toBe('待核验')
        expect(shade.suitable).toBe('适配方向待核验')
        expect(shade.swatchColor).toBeUndefined()
      })
    })
    expect(byId['catalog-095'].finish).toBe('缎光')
    expect(byId['catalog-096'].finish).toBe('哑光')
    expect(byId['catalog-078'].finish).toBe('待核验')
    expect(byId['catalog-062'].madeIn).toBe('待核验')
    expect(byId['catalog-065'].madeIn).toContain('其他/other')
  })

  it('inherits known brand regions from matching products in the first 35 records and keeps table prices', () => {
    const byId = Object.fromEntries(products.map((product) => [product.id, product]))
    expect(byId['catalog-063'].brandRegion).toBe('美国')
    expect(byId['catalog-097'].brandRegion).toBe('美国')
    expect(byId['catalog-087'].brandRegion).toBe('中国')
    expect(byId['catalog-107'].brandRegion).toBe('中国')
    expect(byId['catalog-037'].price).toBe(89)
    expect(byId['catalog-041'].price).toBe(169)
  })

  it('keeps source-table specifications when screenshots show alternate variants', () => {
    const specifications = {
      'catalog-086': '13g',
      'catalog-093': '4.6g',
      'catalog-096': '3.2g',
      'catalog-104': '17g',
      'catalog-109': '3g+5g',
      'catalog-110': '0.9g',
      'catalog-111': '9.5g',
    }

    Object.entries(specifications).forEach(([productId, specification]) => {
      expect(productExpansionRecords.find((record) => record.id === productId)?.specification).toBe(specification)
      expect(expansionVerificationRecords[productId].reviewedFacts.specification).toBe(specification)
    })

    for (const [sequence, expectedFacts] of Object.entries({
      '40': ['JNJE养肤持妆素颜霜', '中国'],
      '43': ['PULJIM宝玑米沁透防晒素颜霜', '100g、20g、5g'],
      '44': ['卡姿兰明星素颜霜01、02', '50g'],
    })) {
      const record = productExpansionRecords.find((item) => item.sequence === sequence)
      expect(record?.parameterFacts?.length).toBeGreaterThan(0)
      expect(record?.parameterFacts?.map((fact) => fact.value).join(' ')).toContain(expectedFacts[0])
      expect(record?.parameterFacts?.map((fact) => fact.value).join(' ')).toContain(expectedFacts[1])
      record.parameterFacts.forEach((fact) => expect(existsSync(resolve(fact.evidencePath)), fact.evidencePath).toBe(true))
      expect(products.find((product) => product.id === record.id)?.recommendationReady).toBe(true)
    }
    expect(productExpansionRecords.find((record) => record.sequence === '44')?.dataIssues?.join(' ')).toContain('版本对应关系待复核')

    productExpansionRecords.forEach((record) => {
      record.parameterFacts?.forEach((fact) => {
        expect(existsSync(resolve(fact.evidencePath)), fact.evidencePath).toBe(true)
      })
    })

    expect(productExpansionRecords.filter((record) => Number(record.sequence) >= 36).every((record) => record.image.authorizationStatus === 'pending')).toBe(true)
    expect(products.filter((product) => product.id.startsWith('catalog-')).every((product) => product.recommendationReady === true && product.shadeRecommendationReady === false)).toBe(true)
  })

  it('keeps all sequences unique and all 76 covers as actual WebP files', () => {
    expect(products).toHaveLength(111)
    expect(new Set(products.map((product) => product.id)).size).toBe(111)
    expect(products.slice(0, 35).every((product) => !product.id.startsWith('catalog-'))).toBe(true)
    expect(productExpansionRecords.map((record) => record.id)).toEqual(Array.from({ length: 76 }, (_, index) => `catalog-${String(index + 36).padStart(3, '0')}`))

    for (const record of productExpansionRecords) {
      const cover = resolve('public', 'products', record.id, 'cover.webp')
      expect(existsSync(cover), cover).toBe(true)
      const bytes = readFileSync(cover)
      expect(bytes.subarray(0, 4).toString()).toBe('RIFF')
      expect(bytes.subarray(8, 12).toString()).toBe('WEBP')
      expect(bytes.byteLength).toBeGreaterThan(1000)
      expect(record.image.authorizationStatus).toBe('pending')
      expect(record.image.allowedUse).toBe('public_with_source_notice')
      expect(record.image.sourcePageUrl).toMatch(/^https?:\/\//)
      expect(record.image.originalImageUrl).toMatch(/^https?:\/\//)
      expect(record.image.rightsholder).toBeTruthy()
      expect(record.image.acquiredAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(record.image.width).toBeGreaterThan(0)
      expect(record.image.height).toBeGreaterThan(0)
      expect(record.image.bytes).toBeGreaterThan(0)
    }
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
