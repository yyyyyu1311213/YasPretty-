import { ChevronRight, ExternalLink } from 'lucide-react'
import { imageRightsContactUrl, productImageNotice } from '../../../data/product-image-sources'

/** Shared disclosure for both detail views and all product cohorts. */
export default function ProductDetailSources({ product }) {
  const source = product.imageSource
  const sources = product.informationSources || []
  return (
    <div className="product-detail-sources">
      <dl className="detail-source-facts">
        <div><dt>图片来源</dt><dd>{source?.sourcePageUrl
          ? <a href={source.sourcePageUrl} target="_blank" rel="noopener noreferrer">查看产品图片来源页 <ExternalLink size={13} /></a>
          : '原始来源页暂缺'}</dd></div>
        <div><dt>权利人 / 发布方</dt><dd>{source?.rightsholder || '暂未记录'}</dd></div>
      </dl>
      <p className="detail-source-notice">{productImageNotice}</p>
      <a className="source-contact-link" href={imageRightsContactUrl} target="_blank" rel="noopener noreferrer">权利人联系删除 <ChevronRight size={15} /></a>
      {(sources.length > 0 || source?.note) && <details className="detail-source-records">
        <summary>资料来源与图片备注</summary>
        {source?.note && <p>{source.note}</p>}
        {sources.length > 0 && <ul>{sources.map((item, index) => <li key={`${item.title}-${index}`}>
          {item.url ? <a href={item.url} target="_blank" rel="noopener noreferrer">{item.title} <ExternalLink size={13} /></a> : <span>{item.title}</span>}
          <small>{[item.publisher, item.accessedAt && `记录日期：${item.accessedAt}`].filter(Boolean).join(' · ')}</small>
        </li>)}</ul>}
      </details>}
    </div>
  )
}
