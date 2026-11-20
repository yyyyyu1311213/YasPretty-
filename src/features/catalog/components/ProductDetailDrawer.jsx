import { useEffect, useState } from 'react'
import { ArrowLeft, Check, ChevronRight, X } from 'lucide-react'
import { getProductVerification } from '../../../data/product-verification'
import { getCatalogProducts } from '../catalogService'
import { getProductDetailPresentation } from '../productDetailPresentation'
import ProductDetailSources from './ProductDetailSources'
import './ProductDetail.css'

const products = getCatalogProducts()

export default function ProductDetailDrawer({ product, statusControl, onClose, onOpenProduct, onOpenFullProfile }) {
  const verification = getProductVerification(product.id)
  const reviewed = verification?.reviewedFacts
  const hasReviewedCommerceFacts = product.id.startsWith('catalog-')
  const editorial = product.editorialProfile
  const detail = getProductDetailPresentation(product, reviewed)
  const [shade, setShade] = useState(product.shades[0])
  useEffect(() => setShade(product.shades[0]), [product])
  const showShadeSwatch = !['粉底液', '气垫', '遮瑕'].includes(product.category)
  const listedShades = hasReviewedCommerceFacts ? product.shades.filter((item) => item.verificationStatus === 'verified_parameter_screenshot') : product.shades
  const recommendations = products.filter((item) => item.id !== product.id && (item.category === product.category || item.finish === product.finish)).slice(0, 3)
  const shadeImage = product.image
  return (
    <div className="dialog-backdrop" onMouseDown={onClose}>
      <aside className="detail-drawer" role="dialog" aria-modal="true" aria-label={`${product.brand} ${product.name} 产品详情`} onMouseDown={(event) => event.stopPropagation()}>
        <button className="drawer-back-button" aria-label="返回上一级" onClick={onClose}><ArrowLeft size={18} /> 返回</button>
        <button className="dialog-close" aria-label="关闭详情" title="关闭详情" onClick={onClose}><X size={20} /></button>
        <div className="detail-hero"><img src={shadeImage} alt={`${product.brand} ${product.name} 产品图`} /><div className="detail-hero-info"><p className="eyebrow">{product.category} / YASPRETTY GUIDE</p><p className="product-brand">{product.brand}</p><h2>{product.name}</h2><p>{editorial?.summary || product.cardNote || product.note}</p>{statusControl}</div></div>
        <div className="detail-body">
          <section className="detail-section">
            <h3>基础信息</h3>
            <dl className="facts-grid">
              <div><dt>品牌所属地区</dt><dd>{detail.brandRegion}</dd></div>
              <div><dt>实际生产地</dt><dd>{detail.origin}{detail.originNote && <small className="detail-origin-note">{detail.originNote}</small>}</dd></div>
              <div><dt>参考价格</dt><dd>{reviewed ? `${reviewed.listPrice} 元` : product.priceLabel}</dd></div>
              <div><dt>商品规格</dt><dd>{reviewed?.specification || product.specification || '暂无信息'}</dd></div>
              {editorial ? <><div><dt>质感方向</dt><dd>{editorial.dimensions.find((item) => item.label === '质感' || item.label === '质地')?.value}</dd></div><div><dt>适合人群</dt><dd>{editorial.suitableFor}</dd></div></> : <>
                {hasReviewedCommerceFacts && <div><dt>品类用途</dt><dd>{product.cardTags?.slice(0, 2).join(' · ') || '按品类用途使用'}</dd></div>}
                {detail.finish && <div><dt>妆效方向</dt><dd>{detail.finish}</dd></div>}
              </>}
            </dl>
          </section>
          <section className="detail-section shade-section">
            <h3>颜色/色号</h3>
            {editorial && <p className="detail-editorial-copy">{editorial.colorStory}</p>}
            {listedShades.length > 0 ? <div className="shade-list">{listedShades.map((item, index) => <button key={item.name} aria-pressed={shade?.name === item.name} className={shade?.name === item.name ? 'shade-choice selected' : 'shade-choice'} onClick={() => setShade(item)}>{showShadeSwatch && <span className={`shade-swatch shade-${index}`} style={item.swatchColor ? { backgroundColor: item.swatchColor } : { backgroundColor: 'transparent' }} />}<b>{item.name}</b></button>)}</div>
              : (!editorial && <p className="detail-editorial-copy">{product.shades[0]?.name === '单一规格' ? '该商品为单一规格，未区分色号。' : '该商品提供多个色号，具体色号以商品页展示为准。'}</p>)}
          </section>
          <section className="detail-section two-columns"><div><h3>喜欢它的理由</h3><ul className="detail-list">{detail.pros.map((item) => <li key={item}><Check size={15} />{item}</li>)}</ul></div><div><h3>使用时注意</h3><ul className="detail-list caution-list">{detail.cautions.map((item) => <li key={item}><span>•</span>{item}</li>)}</ul></div></section>
          <section className="detail-section detail-scenes">
            <h3>适合场景</h3>
            {detail.scenes.length > 0 ? <><div className="scene-row">{detail.scenes.map((scene) => <span key={scene}>{scene}</span>)}</div>{!editorial && hasReviewedCommerceFacts && <p className="detail-scenes-note">这些是该品类的常见用法，可按自己的妆容习惯选择。</p>}</> : <p className="detail-scenes-note">暂无场景标签，请结合个人需求选择。</p>}
          </section>
          <section className="detail-section">
            <h3>图片与版权</h3>
            <ProductDetailSources product={product} />
            <button className="full-profile-action" onClick={() => onOpenFullProfile(product)}>查看完整产品资料 <ChevronRight size={16} /></button>
          </section>
          <section className="detail-section recommendations"><div className="detail-section-title"><h3>相似产品</h3>{recommendations.length > 0 && <span>继续对比</span>}</div>{recommendations.length > 0 ? <div className="recommendation-list">{recommendations.map((item) => <button key={item.id} onClick={() => onOpenProduct(item)}><img src={item.image} alt="" /><span><b>{item.brand}</b>{item.name}<small>{item.finish} · {item.coverage}遮瑕</small></span><ChevronRight size={16} /></button>)}</div> : <p className="data-verification-note">暂无可对比的相似产品。</p>}</section>
        </div>
      </aside>
    </div>
  )
}
