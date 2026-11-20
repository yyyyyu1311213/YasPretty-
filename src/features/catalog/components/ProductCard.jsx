import { useState } from 'react'
import { ChevronRight, Heart, Star } from 'lucide-react'
import { getProductVerification } from '../../../data/product-verification'

export default function ProductCard({ product, collection, onOpen, onFavorite, onRemoveFavorite }) {
  const status = collection[product.id]
  const verification = getProductVerification(product.id)
  const reviewed = verification?.reviewedFacts
  const editorial = product.editorialProfile
  const cardTags = editorial ? editorial.tags : product.cardTags
  const cardNote = editorial ? editorial.note : product.cardNote || product.note
  const cardFooter = editorial ? editorial.footer : product.cardFooter
  const listedShades = product.shades.filter((shade) => shade.verificationStatus === 'verified_parameter_screenshot')
  const shadeLineItems = listedShades.length ? listedShades : product.shades
  const hasReviewedCommerceFacts = product.id.startsWith('catalog-')
  const [imageFailed, setImageFailed] = useState(false)
  const showShadeSwatch = !['粉底液', '气垫', '遮瑕'].includes(product.category)
  return (
    <article className="product-card" data-product-id={product.id} data-editorial={editorial ? 'true' : undefined}>
      <button className="product-photo" onClick={() => onOpen(product)} aria-label={`查看 ${product.brand} ${product.name} 详情`}>{imageFailed ? <span className="product-photo-fallback">图片暂不可用</span> : <img src={product.image} alt={`${product.brand} ${product.name} 产品图`} onError={() => setImageFailed(true)} loading="lazy" />}<span className="category-stamp">{product.category}</span></button>
      <div className="product-card-body">
        <div className="product-card-top"><p className="product-brand">{product.brand}</p><button className={status ? 'favorite-button saved' : 'favorite-button'} aria-label={status ? '取消收藏' : '收藏'} title={status ? '取消收藏' : '收藏'} onClick={() => status ? onRemoveFavorite(product.id) : onFavorite(product.id, '想买')}><Heart size={18} fill={status ? 'currentColor' : 'none'} /></button></div>
        <button className="product-name" onClick={() => onOpen(product)}>{product.name}</button>
        <p className="shade-line">{!listedShades.length && editorial ? editorial.shadeText : <>{showShadeSwatch && <span className="shade-dot" style={product.shades[0]?.swatchColor ? { backgroundColor: product.shades[0].swatchColor } : { backgroundColor: 'transparent' }} />} 颜色/色号 {shadeLineItems.slice(0, 2).map((shade) => shade.name).join(' / ')}</>}</p>
        {cardTags ? <div className="tag-row">{cardTags.map((tag) => <span key={tag}>{tag}</span>)}</div> : <div className="tag-row"><span>{product.skins[0] || '适用方向待核验'}</span><span>{product.finish && product.finish !== '待核验' ? product.finish : '妆效待核验'}</span>{product.coverage && <span>{product.coverage === '待核验' ? '遮瑕方向待核验' : `${product.coverage}遮瑕`}</span>}{product.wear ? <span>{product.wear}h+</span> : <span>{hasReviewedCommerceFacts ? '资料待逐项核验' : '官网资料'}</span>}</div>}
        <p className="product-note">“{cardNote}”</p>
        <div className="rating-row"><span>{hasReviewedCommerceFacts ? cardFooter || (reviewed?.reviewStatus === 'identity_conflict' ? '身份或版本待核验' : '人工核验参考资料 · 非独立实测') : product.rating ? <><Star size={15} fill="currentColor" /> 编辑示例 {product.rating}</> : '官网资料，非用户统计'}</span><button onClick={() => onOpen(product)}>查看详情 <ChevronRight size={15} /></button></div>
      </div>
    </article>
  )
}
