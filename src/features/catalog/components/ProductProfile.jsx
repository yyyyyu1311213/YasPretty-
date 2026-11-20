import { ArrowLeft, Check, ExternalLink, Store } from 'lucide-react'
import { getProductVerification } from '../../../data/product-verification'
import { getProductDetailPresentation } from '../productDetailPresentation'
import ProductDetailSources from './ProductDetailSources'
import './ProductDetail.css'

export default function ProductProfile({ product, statusControl, onBack }) {
  const verification = getProductVerification(product.id)
  const reviewed = verification?.reviewedFacts
  const editorial = product.editorialProfile
  const detail = getProductDetailPresentation(product, reviewed)
  const hasReviewedCommerceFacts = product.id.startsWith('catalog-')
  const verifiedShades = product.shades.filter((shade) => shade.verificationStatus === 'verified_parameter_screenshot')
  const profileSummary = editorial?.summary || (hasReviewedCommerceFacts
    ? reviewed?.reviewStatus === 'identity_conflict'
      ? '资料中保留了不同版本或规格的记录，购买前请核对具体版本。'
      : product.cardNote
    : product.note)
  const commerceReady = verification?.commerce.status === 'verified' && Boolean(verification.commerce.productUrl)

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
          <p className="profile-summary">{profileSummary}</p>
          {statusControl}
        </div>
      </header>

      <div className="product-profile-content">
        <section className="profile-section commerce-section">
          <div className="profile-section-heading"><div><p className="eyebrow">OFFICIAL CHANNEL</p><h2>官方购买渠道</h2></div><Store size={22} /></div>
          {commerceReady ? (
            <div className="commerce-ready"><div><strong>{verification.commerce.officialStoreName}</strong><p>{reviewed?.marketplaceTitle || '官方店商品'}</p></div><a className="official-product-link" href={verification.commerce.productUrl} target="_blank" rel="noopener noreferrer">打开官方商品链接 <ExternalLink size={16} /></a></div>
          ) : (
            <div className="commerce-pending"><div><strong>暂未提供官方购买链接</strong><p>如需购买，请在品牌官方旗舰店核对商品名称与版本。</p></div></div>
          )}
        </section>

        <section className="profile-section">
          <div className="profile-section-heading"><div><p className="eyebrow">PRODUCT INFORMATION</p><h2>产品信息</h2></div></div>
          <p className="profile-section-note">这里汇总品牌、规格、价格与使用方向，方便你快速比较。价格和妆效会因渠道、批次、光线与个人使用方式而变化。</p>
          <dl className="parameter-table">
            <ParameterRow label="产品名称" value={reviewed?.productName || product.name} />
            <ParameterRow label="产品类别" value={product.category} />
            <ParameterRow label="品牌所属地区" value={detail.brandRegion} />
            <ParameterRow label="商品规格" value={reviewed?.specification || product.specification || '暂无信息'} />
            <ParameterRow label="参考价格" value={editorial ? `${reviewed?.listPrice ?? product.price} 元 · 最终价格以结算页为准` : reviewed ? hasReviewedCommerceFacts ? `${reviewed.listPrice} 元 · 最终价格以结算页为准` : `${reviewed.listPrice} 元` : product.priceLabel} />
            <ParameterRow label="实际生产地" value={<>{detail.origin}{detail.originNote && <small className="detail-origin-note">{detail.originNote}</small>}</>} />
            {editorial ? <><ParameterRow label="质感方向" value={editorial.texture} /><ParameterRow label="色彩方向" value={editorial.colorStory} /><ParameterRow label="适合人群" value={editorial.suitableFor} /></> : <>{detail.finish && <ParameterRow label="妆效方向" value={detail.finish} />}<ParameterRow label="遮瑕方向" value={hasReviewedCommerceFacts ? product.coverage && product.coverage !== '待核验' ? `${product.coverage}遮瑕` : '商品页未标注' : product.coverage ? `${product.coverage}遮瑕` : '暂无信息'} /><ParameterRow label="适用方向" value={product.skins.length > 0 ? product.skins.join(' / ') : hasReviewedCommerceFacts ? product.cardTags ? product.cardTags.slice(0, 2).join(' / ') : '按品类用途使用' : '暂无信息'} /></>}
            <ParameterRow label="颜色/色号" value={verifiedShades.map((shade) => shade.name).join(' / ') || editorial?.shadeText || product.shades.map((shade) => shade.name).join(' / ') || '暂无信息'} />
          </dl>
        </section>

        <section className="profile-section">
          <div className="profile-section-heading"><div><p className="eyebrow">USAGE NOTES</p><h2>使用参考</h2></div></div>
          <p className="profile-section-note">供选购和上妆时参考，不构成功效保证或独立实测。</p>
          <div className="assessment-columns">
            <div><h3>喜欢它的理由</h3><ul>{detail.pros.map((item) => <li key={item}><Check size={15} />{item}</li>)}</ul></div>
            <div><h3>使用时注意</h3><ul>{detail.cautions.map((item) => <li key={item}><span>•</span>{item}</li>)}</ul></div>
          </div>
        </section>

        {hasReviewedCommerceFacts && <section className="profile-section detail-scenes">
          <div className="profile-section-heading"><div><p className="eyebrow">SCENES</p><h2>适合场景</h2></div></div>
          {detail.scenes.length > 0 ? <div className="scene-row">{detail.scenes.map((scene) => <span key={scene}>{scene}</span>)}</div> : <p className="detail-scenes-note">暂无场景标签，请结合个人需求选择。</p>}
        </section>}

        <section className="profile-section provenance-section">
          <div className="profile-section-heading"><div><p className="eyebrow">IMAGE RIGHTS & SOURCES</p><h2>图片与版权</h2></div></div>
          <ProductDetailSources product={product} />
        </section>
      </div>
    </article>
  )
}

function ParameterRow({ label, value }) {
  return <div><dt>{label}</dt><dd>{value}</dd></div>
}
