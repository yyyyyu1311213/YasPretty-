import { useEffect, useState } from 'react'
import { ArrowLeft, Check, ChevronRight, X } from 'lucide-react'
import { imageRightsContactUrl, productImageNotice } from '../../../data/product-image-sources'
import { getProductVerification } from '../../../data/product-verification'
import { getCatalogProducts } from '../catalogService'

const products = getCatalogProducts()

export default function ProductDetailDrawer({ product, statusControl, onClose, onOpenProduct, onOpenFullProfile }) {
  const verification = getProductVerification(product.id)
  const reviewed = verification?.reviewedFacts
  const editorial = product.editorialProfile
  const detailPros = editorial?.pros || product.pros
  const detailCautions = editorial?.cautions || product.detailCautions || product.cautions
  const detailScenes = editorial?.scenes || product.detailScenes || product.scenes
  const [shade, setShade] = useState(product.shades[0])
  useEffect(() => setShade(product.shades[0]), [product])
  const showShadeSwatch = !['粉底液', '气垫', '遮瑕'].includes(product.category)
  const listedShades = product.shades.filter((item) => item.verificationStatus === 'verified_parameter_screenshot')
  const hasShadeProfile = Boolean(shade?.tone && shade.tone !== '待核验' && shade.lightness && shade.lightness !== '待核验')
  const recommendations = products.filter((item) => item.id !== product.id && item.recommendationReady !== false && (item.category === product.category || item.finish === product.finish)).slice(0, 3)
  const shadeImage = product.image
  const hasReviewedCommerceFacts = product.id.startsWith('catalog-')
  const hasAssessmentMetrics = Object.keys(product.metrics || {}).length > 0
  return (
    <div className="dialog-backdrop" onMouseDown={onClose}>
      <aside className="detail-drawer" role="dialog" aria-modal="true" aria-label={`${product.brand} ${product.name} 产品详情`} onMouseDown={(event) => event.stopPropagation()}>
        <button className="drawer-back-button" aria-label="返回上一级" onClick={onClose}><ArrowLeft size={18} /> 返回</button>
        <button className="dialog-close" aria-label="关闭详情" title="关闭详情" onClick={onClose}><X size={20} /></button>
        <div className="detail-hero"><img src={shadeImage} alt={`${product.brand} ${product.name} 产品图`} /><div className="detail-hero-info"><p className="eyebrow">{product.category} / YASPRETTY GUIDE</p><p className="product-brand">{product.brand}</p><h2>{product.name}</h2><div className="detail-rating">{editorial ? <span>{editorial.footer}</span> : <span>{reviewed || hasReviewedCommerceFacts ? '品牌官方旗舰店资料 · 人工核对' : '官网资料，非用户统计'}</span>}</div><p>{editorial?.summary || product.cardNote || product.note}</p>{statusControl}</div></div>
        <div className="detail-body">
          <section className="detail-section"><h3>基础信息</h3><dl className="facts-grid"><div><dt>品牌所属地区</dt><dd>{hasReviewedCommerceFacts ? displayText(editorial?.region || product.brandRegion) : editorial?.region || product.brandRegion || '暂无信息'}</dd></div><div><dt>实际生产地</dt><dd>{hasReviewedCommerceFacts ? displayText(reviewed?.origin || product.madeIn) : reviewed?.origin || product.madeIn || '暂无信息'}</dd></div><div><dt>参考价格</dt><dd>{reviewed ? `${reviewed.listPrice} 元` : product.priceLabel}</dd></div><div><dt>商品规格</dt><dd>{reviewed?.specification || product.specification || '暂无信息'}</dd></div>{editorial ? <><div><dt>质感方向</dt><dd>{editorial.dimensions.find((item) => item.label === '质感' || item.label === '质地')?.value}</dd></div><div><dt>适合人群</dt><dd>{editorial.suitableFor}</dd></div></> : hasReviewedCommerceFacts ? <><div><dt>品类用途</dt><dd>{product.cardTags ? product.cardTags.slice(0, 2).join(' · ') : '按品类用途使用'}</dd></div><div><dt>妆效方向</dt><dd>{product.finish && product.finish !== '待核验' ? product.finish : '商品页未标注'}</dd></div></> : <div><dt>妆效方向</dt><dd>{product.finish || '暂无信息'}</dd></div>}</dl></section>
          <section className="detail-section shade-section"><h3>颜色/色号</h3>{editorial && <p className="detail-editorial-copy">{editorial.colorStory}</p>}{listedShades.length > 0 ? <><div className="shade-list">{listedShades.map((item, index) => <button key={item.name} className={shade?.name === item.name ? 'shade-choice selected' : 'shade-choice'} onClick={() => setShade(item)}>{showShadeSwatch && <span className={`shade-swatch shade-${index}`} style={item.swatchColor ? { backgroundColor: item.swatchColor } : { backgroundColor: 'transparent' }} />}<b>{item.name}</b></button>)}</div>{hasShadeProfile && <div className="shade-description"><span>{shade.tone}</span><span>{shade.lightness}</span><span>{shade.suitable === '适配方向待核验' ? shade.suitable : `适合 ${shade.suitable}`}</span></div>}</> : (!editorial && <p className="detail-editorial-copy">{product.shades[0]?.name === '单一规格' ? '该商品为单一规格，未区分色号。' : '该商品提供多个色号，具体色号以商品页展示为准。'}</p>)}</section>
          {!editorial && !hasReviewedCommerceFacts && hasAssessmentMetrics && <section className="detail-section"><h3>分项评价</h3><div className="metric-grid">{Object.entries(product.metrics).map(([label, value]) => <Metric key={label} label={label} value={value} />)}</div></section>}
          <section className="detail-section two-columns"><div><h3>喜欢它的理由</h3><ul className="detail-list">{detailPros.map((item) => <li key={item}><Check size={15} />{item}</li>)}</ul></div><div><h3>使用时注意</h3><ul className="detail-list caution-list">{detailCautions.map((item) => <li key={item}><span>•</span>{item}</li>)}</ul></div></section>
          <section className="detail-section"><h3>适合场景</h3>{detailScenes.length > 0 ? <><div className="scene-row">{detailScenes.map((scene) => <span key={scene}>{scene}</span>)}</div>{!editorial && hasReviewedCommerceFacts && <p className="data-verification-note">常见使用场景按品类整理，供选择时参考。</p>}</> : <p className="data-verification-note">暂无场景标签，请结合个人需求选择。</p>}</section>
          <section className="detail-section"><h3>图片与版权</h3><p className="data-verification-note">{productImageNotice}</p>{product.imageSource?.sourcePageUrl && <ul className="detail-list source-list"><li><Check size={15} /><a href={product.imageSource.sourcePageUrl} target="_blank" rel="noreferrer">查看产品图片来源页</a><small>{product.imageSource.rightsholder} · 采集于 {product.imageSource.acquiredAt} · 来源已披露、授权待核验</small></li></ul>}{product.imageSource?.note && <p className="data-verification-note">{product.imageSource.note}</p>}{!editorial && product.informationSources?.length ? <ul className="detail-list source-list">{product.informationSources.map((source) => <li key={`${source.title}-${source.accessedAt}`}><Check size={15} />{source.url ? <a href={source.url} target="_blank" rel="noreferrer">{source.title}</a> : <span>{source.title}</span>}<small>{source.publisher} · 核验于 {source.accessedAt}</small></li>)}</ul> : null}<button className="full-profile-action" onClick={() => onOpenFullProfile(product)}>查看完整产品资料 <ChevronRight size={16} /></button><a className="source-contact-link" href={imageRightsContactUrl} target="_blank" rel="noreferrer">权利人联系删除 <ChevronRight size={15} /></a></section>
          <section className="detail-section recommendations"><div className="detail-section-title"><h3>相似产品</h3>{recommendations.length > 0 && <span>继续对比</span>}</div>{recommendations.length > 0 ? <div className="recommendation-list">{recommendations.map((item) => <button key={item.id} onClick={() => onOpenProduct(item)}><img src={item.image} alt="" /><span><b>{item.brand}</b>{item.name}<small>{item.finish} · {item.coverage}遮瑕</small></span><ChevronRight size={16} /></button>)}</div> : <p className="data-verification-note">暂无可对比的相似产品。</p>}</section>
        </div>
      </aside>
    </div>
  )
}

function Metric({ label, value }) {
  const inverse = ['氧化程度', '卡粉风险'].includes(label)
  const visualValue = inverse ? 6 - value : value
  return <div className="metric"><div><span>{label}</span><b>{inverse ? ['很低', '低', '中', '高', '很高'][value - 1] : `${value}/5`}</b></div><div className="metric-track">{[1, 2, 3, 4, 5].map((step) => <i key={step} className={step <= visualValue ? 'filled' : ''} />)}</div></div>
}

function displayText(value) {
  if (!value || value === '待核验') return '商品页未列示'
  return value
}
