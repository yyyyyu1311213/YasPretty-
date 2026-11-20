import { ArrowLeft, Check, ChevronRight, ExternalLink, Store } from 'lucide-react'
import { imageRightsContactUrl, productImageNotice } from '../../../data/product-image-sources'
import { buildProductAssessment, getProductVerification } from '../../../data/product-verification'

function displayText(value) {
  if (!value || value === '待核验') return '商品页未列示'
  return value
}

export default function ProductProfile({ product, statusControl, onBack }) {
  const verification = getProductVerification(product.id)
  const reviewed = verification?.reviewedFacts
  const editorial = product.editorialProfile
  const assessment = buildProductAssessment(product)
  const hasReviewedCommerceFacts = product.id.startsWith('catalog-')
  const showAssessment = !hasReviewedCommerceFacts
  const verifiedShades = product.shades.filter((shade) => shade.verificationStatus === 'verified_parameter_screenshot')
  const profileScenes = editorial?.scenes || (hasReviewedCommerceFacts ? product.detailScenes || [] : product.scenes)
  const profilePros = editorial?.pros || product.pros
  const profileCautions = editorial?.cautions || (hasReviewedCommerceFacts ? product.detailCautions || product.cautions : [...product.cautions, ...assessment.limitations])
  const profileSummary = editorial?.summary || (hasReviewedCommerceFacts
    ? reviewed?.reviewStatus === 'identity_conflict'
      ? '资料中保留了不同版本或规格的记录，购买前请核对具体版本。'
      : product.cardNote
    : assessment.summary)
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
            {hasReviewedCommerceFacts && <ParameterRow label="品牌所属地区" value={editorial?.region || displayText(product.brandRegion)} />}
            <ParameterRow label="商品规格" value={reviewed?.specification || product.specification || '暂无信息'} />
            <ParameterRow label="参考价格" value={editorial ? `${reviewed?.listPrice ?? product.price} 元 · 最终价格以结算页为准` : reviewed ? hasReviewedCommerceFacts ? `${reviewed.listPrice} 元 · 最终价格以结算页为准` : `${reviewed.listPrice} 元` : product.priceLabel} />
            <ParameterRow label="实际生产地" value={hasReviewedCommerceFacts ? displayText(reviewed?.origin || product.madeIn) : reviewed?.origin || '暂无信息'} />
            {editorial ? <><ParameterRow label="质感方向" value={editorial.texture} /><ParameterRow label="色彩方向" value={editorial.colorStory} /><ParameterRow label="适合人群" value={editorial.suitableFor} /></> : <><ParameterRow label="妆效方向" value={hasReviewedCommerceFacts ? product.finish && product.finish !== '待核验' ? product.finish : '商品页未标注' : product.finish || '暂无信息'} /><ParameterRow label="遮瑕方向" value={hasReviewedCommerceFacts ? product.coverage && product.coverage !== '待核验' ? `${product.coverage}遮瑕` : '商品页未标注' : product.coverage ? `${product.coverage}遮瑕` : '暂无信息'} /><ParameterRow label="适用方向" value={product.skins.length > 0 ? product.skins.join(' / ') : hasReviewedCommerceFacts ? product.cardTags ? product.cardTags.slice(0, 2).join(' / ') : '按品类用途使用' : '暂无信息'} /></>}
            <ParameterRow label="颜色/色号" value={verifiedShades.map((shade) => shade.name).join(' / ') || editorial?.shadeText || product.shades.map((shade) => shade.name).join(' / ') || '暂无信息'} />
          </dl>
        </section>

        <section className="profile-section">
          <div className="profile-section-heading"><div><p className="eyebrow">USAGE NOTES</p><h2>{showAssessment ? '使用参考' : '喜欢它的理由'}</h2></div></div>
          <p className="profile-section-note">{editorial ? '从质地、色彩和使用场景出发，帮你快速判断是否适合自己。' : hasReviewedCommerceFacts ? '以下理由按商品页参数整理，不构成功效保证或独立实测。' : '以下内容用于选购初筛，不构成功效保证或独立实测。'}</p>
          {showAssessment ? <div className="assessment-grid">
            {assessment.dimensions.map((dimension) => <div key={dimension.label}><span>{dimension.label}</span><strong>{dimension.value}</strong></div>)}
          </div> : null}
          <div className="assessment-columns">
            <div><h3>{hasReviewedCommerceFacts ? '喜欢它的理由' : '可参考的方向'}</h3><ul>{(hasReviewedCommerceFacts ? profilePros : assessment.strengths).map((item) => <li key={item}><Check size={15} />{item}</li>)}</ul></div>
            <div><h3>{hasReviewedCommerceFacts ? '使用时注意' : '使用与判断边界'}</h3><ul>{(hasReviewedCommerceFacts ? profileCautions : [...assessment.cautions, ...assessment.limitations]).map((item, index) => <li key={`${item}-${index}`}><span>•</span>{item}</li>)}</ul></div>
          </div>
        </section>

        {hasReviewedCommerceFacts && <section className="profile-section">
          <div className="profile-section-heading"><div><p className="eyebrow">SCENES</p><h2>适合场景</h2></div></div>
          {profileScenes.length > 0 ? <div className="scene-row">{profileScenes.map((scene) => <span key={scene}>{scene}</span>)}</div> : <p className="profile-section-note">暂无场景标签，请结合个人需求选择。</p>}
        </section>}

        <section className="profile-section provenance-section">
          <div className="profile-section-heading"><div><p className="eyebrow">{hasReviewedCommerceFacts ? 'IMAGE RIGHTS & SOURCES' : 'SOURCES'}</p><h2>{hasReviewedCommerceFacts ? '图片与版权' : '资料来源'}</h2></div></div>
          {!editorial && product.informationSources?.length > 0 && <ul className="auxiliary-sources">{product.informationSources.map((source) => <li key={`${source.title}-${source.accessedAt}`}>{source.url ? <a href={source.url} target="_blank" rel="noopener noreferrer">{source.title} <ExternalLink size={13} /></a> : <strong>{source.title}</strong>}<span>{source.publisher} · 核验于 {source.accessedAt}</span></li>)}</ul>}
          {product.imageSource?.sourcePageUrl && <ul className="auxiliary-sources"><li><a href={product.imageSource.sourcePageUrl} target="_blank" rel="noopener noreferrer">查看产品图片来源页 <ExternalLink size={13} /></a><span>{product.imageSource.rightsholder || '发布方待核验'} · 采集于 {product.imageSource.acquiredAt || '日期待核验'} · 来源已披露、授权待核验</span></li></ul>}
          {product.imageSource?.note && <p className="profile-section-note">图片来源记录：{product.imageSource.note}</p>}
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
