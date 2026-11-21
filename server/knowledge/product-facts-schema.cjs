const { z } = require('zod')

const fieldLabels = {
  specification: '规格记录', netContent: '净含量', packagingContents: '包装内容', saleUnit: '正装/销售单元',
  fullSize: '收录规格', refill: '替换芯', setContents: '组合套装', usageDuration: '可用天数', price: '历史参考价',
  ingredients: '成分', promotion: '促销', launch: '上市信息', reviews: '口碑', purchaseLink: '官方旗舰店商品链接', shelfLife: '保质期', efficacy: '功效证据',
  category: '品类', skins: '适用肤质记录', finish: '妆效记录', coverage: '遮瑕记录',
  wear: '参考持妆记录', shades: '色号记录', origin: '产地记录', cautions: '注意事项',
}
const factFieldSchema = z.enum(Object.keys(fieldLabels))
const statusSchema = z.enum(['recorded', 'pending', 'unknown', 'conflict'])
const dateSchema = z.union([z.string().date(), z.string().datetime()]).nullable()
const evidenceSchema = z.object({
  id: z.string().min(1), title: z.string().min(1).max(300), publisher: z.string().max(200),
  accessedAt: dateSchema, status: statusSchema, url: z.string().url().nullable(),
  location: z.string().max(2000), label: z.string().max(300), limitations: z.array(z.string().max(500)).max(8),
}).strict()
const factRecordSchema = z.object({
  productId: z.string().min(1).max(120), version: z.string().min(1).max(400), sku: z.string().max(120).nullable(),
  field: factFieldSchema, value: z.string().max(2000).nullable(), status: statusSchema,
  verifiedAt: dateSchema, evidence: z.array(evidenceSchema).max(4), limitations: z.array(z.string().max(500)).max(8),
}).strict().superRefine((record, context) => {
  if (record.status === 'recorded' && record.value !== null && (!record.verifiedAt || !record.evidence.length || record.evidence.some((evidence) => evidence.status !== 'recorded'))) {
    context.addIssue({ code: 'custom', message: 'Recorded facts require dated supporting evidence' })
  }
})
// This is an assistant-only citation. Internal archive locations never become URLs.
const assistantProductSourceSchema = z.object({
  kind: z.literal('product'), id: z.string().min(1).max(240), productId: z.string().min(1).max(120),
  version: z.string().min(1).max(400), sku: z.string().max(120).nullable(),
  title: z.string().min(1).max(300), publisher: z.string().max(200), url: z.string().url().nullable().refine((value) => value === null || Boolean(officialItemUrl(value))),
  accessedAt: dateSchema, status: statusSchema, evidenceLabel: z.string().max(300),
  supports: z.array(z.string().max(60)).max(24), limitations: z.array(z.string().max(500)).max(8),
}).strict()

function officialItemUrl(value) {
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return null
    if (!['detail.tmall.com', 'item.taobao.com'].includes(url.hostname) || url.pathname !== '/item.htm' || !/^\d+$/.test(url.searchParams.get('id') || '')) return null
    return 'https://' + url.hostname + '/item.htm?id=' + url.searchParams.get('id')
  } catch { return null }
}

module.exports = { fieldLabels, factFieldSchema, factRecordSchema, assistantProductSourceSchema, officialItemUrl }
