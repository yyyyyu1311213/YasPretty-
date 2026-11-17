import { ArrowLeft, Check, ChevronRight, ExternalLink, Store } from 'lucide-react'
import { imageRightsContactUrl, productImageNotice } from '../../../data/product-image-sources'
import { buildProductAssessment, getProductVerification } from '../../../data/product-verification'

export default function ProductProfile({ product, statusControl, onBack }) {
  const verification = getProductVerification(product.id)
  const reviewed = verification?.reviewedFacts
  const assessment = buildProductAssessment(product)

  return (
    <article className="product-profile-page">
      <div className="product-profile-toolbar">
        <button className="profile-back-button" onClick={onBack}><ArrowLeft size={17} /> 返回</button>
        <span>产品指南</span>
      </div>

      <header className="product-profile-hero">
        <div className="product-profile-media"><img src={product.image} alt={`${product.brand} ${product.name} 产品图`} /></div>
        <div className="product-profile-heading">
          <p className="eyebrow">{product.category} / PRODUCT GUIDE</p>
          <p className="product-brand">{product.brand}</p>
          <h1>{product.name}</h1>
          <p className="profile-summary">{assessment.summary}</p>
          {statusControl}
        </div>
      </header>

      <div className="product-profile-content">
        <section className="profile-section commerce-section">
          <div className="profile-section-heading"><div><p className="eyebrow">OFFICIAL CHANNEL</p><h2>官方购买渠道</h2></div><Store size={22} /></div>
          {verification?.commerce.status === 'verified' && verification.commerce.productUrl ? (
            <div className="commerce-ready"><div><strong>{verification.commerce.officialStoreName}</strong><p>{reviewed?.marketplaceTitle || '官方店商品'}</p></div><a className="official-product-link" href={verification.commerce.productUrl} target="_blank" rel="noopener noreferrer">打开官方商品链接 <ExternalLink size={16} /></a></div>
          ) : (
            <div className="commerce-pending"><div><strong>暂未提供官方购买链接</strong><p>可稍后再回来查看该产品的购买渠道。</p></div></div>
          )}
        </section>

        <section className="profile-section">
          <div className="profile-section-heading"><div><p className="eyebrow">PRODUCT INFORMATION</p><h2>产品信息</h2></div></div>
          <p className="profile-section-note">这里汇总品牌、规格、价格与使用方向，方便你快速比较。价格和妆效会因渠道、批次、光线与个人使用方式而变化。</p>
          <dl className="parameter-table">
            <ParameterRow label="产品名称" value={reviewed?.productName || product.name} />
            <ParameterRow label="产品类别" value={product.category} />
            <ParameterRow label="商品规格" value={reviewed?.specification || '暂无信息'} />
            <ParameterRow label="参考价格" value={reviewed ? `${reviewed.listPrice} 元` : product.priceLabel} />
            <ParameterRow label="实际生产地" value={reviewed?.origin || '暂无信息'} />
            <ParameterRow label="妆效方向" value={product.finish || '暂无信息'} />
            <ParameterRow label="遮瑕方向" value={product.coverage ? `${product.coverage}遮瑕` : '暂无信息'} />
            <ParameterRow label="适用方向" value={product.skins.join(' / ') || '暂无信息'} />
            <ParameterRow label="颜色/色号" value={product.shades.map((shade) => shade.name).join(' / ') || '暂无信息'} />
          </dl>
        </section>

        <section className="profile-section">
          <div className="profile-section-heading"><div><p className="eyebrow">USAGE NOTES</p><h2>使用参考</h2></div></div>
          <p className="profile-section-note">以下内容用于选购初筛，不构成功效保证或独立实测。</p>
          <div className="assessment-grid">
            {assessment.dimensions.map((dimension) => <div key={dimension.label}><span>{dimension.label}</span><strong>{dimension.value}</strong></div>)}
          </div>
          <div className="assessment-columns">
            <div><h3>可参考的方向</h3><ul>{assessment.strengths.map((item) => <li key={item}><Check size={15} />{item}</li>)}</ul></div>
            <div><h3>使用与判断边界</h3><ul>{[...assessment.cautions, ...assessment.limitations].map((item) => <li key={item}><span>•</span>{item}</li>)}</ul></div>
          </div>
        </section>

        <section className="profile-section provenance-section">
          <div className="profile-section-heading"><div><p className="eyebrow">SOURCES</p><h2>资料来源</h2></div></div>
          {product.informationSources?.length > 0 && <ul className="auxiliary-sources">{product.informationSources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title} <ExternalLink size={13} /></a><span>{source.publisher} · 访问于 {source.accessedAt}</span></li>)}</ul>}
          <p className="profile-source-notice">{productImageNotice}</p>
          <a className="source-contact-link" href={imageRightsContactUrl} target="_blank" rel="noopener noreferrer">权利人联系删除 <ChevronRight size={15} /></a>
        </section>
      </div>
    </article>
  )
}

function ParameterRow({ label, value }) {
  return <div><dt>{label}</dt><dd>{value}</dd></div>
}
