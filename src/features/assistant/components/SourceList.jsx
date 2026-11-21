import { ChevronRight } from 'lucide-react'

function sourceUrl(source) {
  try {
    const url = new URL(source.url)
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return null
    if (source.kind === 'product' && (url.protocol !== 'https:' || url.port || !['detail.tmall.com', 'item.taobao.com'].includes(url.hostname) || url.pathname !== '/item.htm' || !/^\d+$/.test(url.searchParams.get('id') || ''))) return null
    return url.href
  } catch { return null }
}

export default function SourceList({ sources }) {
  const visibleSources = sources?.map((source, index) => ({ source, index })).filter(({ source }) => source.kind !== 'product')
  if (!visibleSources?.length) return null
  return (
    <div className="xiaoy-sources">
      <span>参考来源</span>
      {visibleSources.map(({ source, index }) => {
        const url = sourceUrl(source)
        const title = url ? <a key={`${source.url}-${index}`} href={url} target="_blank" rel="noreferrer">
          <b>[{index + 1}]</b>{source.title}<ChevronRight size={14} />
        </a> : <span><b>[{index + 1}]</b> {source.title}（内部记录，无公开链接）</span>
        return url ? title : <div key={index}>{title}</div>
      })}
    </div>
  )
}
