const { productFactRecords } = require('./product-facts-adapter.cjs')
const { factRecordSchema, fieldLabels, assistantProductSourceSchema } = require('./product-facts-schema.cjs')

function createProductFactsIndex(products, verificationRecords = {}, supplementalRecords = []) {
  const catalog = new Map(products.map((product) => [product.id, product]))
  const records = new Map(products.map((product) => [product.id, productFactRecords(product, verificationRecords[product.id])]))
  for (const raw of supplementalRecords) {
    const record = factRecordSchema.parse(raw)
    if (!catalog.has(record.productId)) throw new Error('Supplement references an unknown product')
    records.get(record.productId).push(record)
  }
  return {
    read(productId, fields, selector = {}) {
      const product = catalog.get(productId)
      if (!product) return null
      const all = records.get(productId)
      const version = selector.version || product.officialProductName || product.name
      const sku = selector.sku ?? all[0].sku
      const scoped = all.filter((record) => record.version === version && record.sku === sku)
      const mismatch = scoped.length === 0
      const selected = fields.map((field) => {
        const candidates = scoped.filter((r) => r.field === field)
        const valued = candidates.filter((r) => r.value !== null && r.status !== 'unknown')
        const different = new Set(valued.map((r) => r.value)).size > 1
        const record = valued[0] || candidates[0] || all.find((r) => r.field === field)
        if (!record) throw new Error('Unknown fact field')
        if (!candidates.length) return { ...record, version, sku, value: null, status: 'unknown', evidence: [], verifiedAt: null,
          limitations: ['所问版本或 SKU 的该字段未覆盖，无法确认；不能借用默认版本记录。'] }
        return { ...record, status: mismatch ? 'unknown' : different || valued.some((r) => r.status === 'conflict') ? 'conflict' : record.status,
          value: mismatch || different || record.status === 'conflict' ? null : record.value,
          limitations: mismatch ? ['所问版本或 SKU 未覆盖，无法确认该版本事实；不能套用另一版本记录。'] : different ? ['同一版本的字段证据冲突，无法确认。'] : record.limitations }
      })
      const sources = new Map()
      for (const record of selected) for (const source of record.evidence) {
        if (mismatch || record.value === null && record.status !== 'conflict') continue
        const current = sources.get(source.id)
        if (current) { current.supports.push(fieldLabels[record.field]); continue }
        sources.set(source.id, assistantProductSourceSchema.parse({ kind: 'product', id: source.id, productId, version, sku,
          title: source.title, publisher: source.publisher, url: source.url, accessedAt: source.accessedAt,
          status: record.status === 'conflict' ? 'conflict' : source.status, evidenceLabel: source.label,
          supports: [fieldLabels[record.field]], limitations: source.limitations }))
      }
      return { productId, brand: product.brand, name: product.name, version, sku, mismatch: Boolean(mismatch), fields: selected, sources: [...sources.values()] }
    },
    // Audit/debug callers can inspect mappings without modifying original product files.
    records: () => structuredClone([...records.values()].flat()),
  }
}

module.exports = { createProductFactsIndex }
