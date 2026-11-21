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
  if (!sources?.length) return null
  const products = sources.map((source, index) => ({ source, index })).filter(({ source }) => source.kind === 'product')
  return (
    <div className="xiaoy-sources">
      {sources.length > products.length && <span>参考来源</span>}
      {sources.map((source, index) => {
        if (source.kind === 'product') return null
        const url = sourceUrl(source)
        const title = url ? <a key={`${source.url}-${index}`} href={url} target="_blank" rel="noreferrer">
          <b>[{index + 1}]</b>{source.title}<ChevronRight size={14} />
        </a> : <span><b>[{index + 1}]</b> {source.title}（内部记录，无公开链接）</span>
        return url ? title : <div key={index}>{title}</div>
      })}
      {products.length > 0 && <details>
        <summary>查看产品依据</summary>
        {products.map(({ source, index }) => {
          const url = sourceUrl(source)
          const policy = source.supports?.includes('收录规格')
          const label = policy ? 'YasPretty 产品收录说明' : source.version || '站内产品资料'
          return <div key={index} className="xiaoy-source-note">
            <div><b>[{index + 1}]</b> {label}</div>
            <div>{[source.supports?.join('、'), source.accessedAt?.slice(0, 10), source.sku && '货号：' + source.sku,
              source.status === 'conflict' ? '资料不一致' : source.status === 'pending' ? '仅作站内参考' : null].filter(Boolean).join(' · ')}</div>
            {policy && <div>正装指站内收录规格；套装、赠品及替换芯以所选商品清单为准。</div>}
            {source.status === 'pending' && <div>肤质与使用表现仅供参考，实际体验因人而异。</div>}
            {url ? <a href={url} target="_blank" rel="noreferrer">官方旗舰店商品页<ChevronRight size={14} /></a>
              : !policy && <div>来源：站内产品资料，暂无公开商品链接。</div>}
          </div>
        })}
      </details>}
    </div>
  )
}
