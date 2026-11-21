import { ChevronRight } from 'lucide-react'

function sourceUrl(source) {
  try {
    const url = new URL(source.url)
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return null
    if (source.kind === 'product' && (url.protocol !== 'https:' || !['detail.tmall.com', 'item.taobao.com'].includes(url.hostname) || url.pathname !== '/item.htm' || !/^\d+$/.test(url.searchParams.get('id') || ''))) return null
    return url.href
  } catch { return null }
}

export default function SourceList({ sources }) {
  if (!sources?.length) return null
  return (
    <div className="xiaoy-sources">
      <span>参考来源</span>
      {sources.map((source, index) => {
        const url = sourceUrl(source)
        const title = url ? <a key={`${source.url}-${index}`} href={url} target="_blank" rel="noreferrer">
          <b>[{index + 1}]</b>{source.title}<ChevronRight size={14} />
        </a> : <span><b>[{index + 1}]</b> {source.title}（内部记录，无公开链接）</span>
        if (source.kind !== 'product') return url ? title : <div key={index}>{title}</div>
        return <div key={`${source.id}-${index}`} style={{ overflowWrap: 'anywhere', fontSize: 11, lineHeight: 1.6 }}>
          {title}
          <div>记录日期：{source.accessedAt?.slice(0, 10) || '未记录'} · {source.status === 'recorded' ? '已有核验记录' : source.status === 'conflict' ? '证据冲突' : '待核验'}</div>
          <div>版本：{source.version} · SKU：{source.sku || '未明确记录'}</div>
          <div>{source.evidenceLabel}；支持：{source.supports?.join('、') || '待确认'}</div>
          {source.limitations?.map((limitation, i) => <div key={i}>{limitation}</div>)}
        </div>
      })}
    </div>
  )
}
