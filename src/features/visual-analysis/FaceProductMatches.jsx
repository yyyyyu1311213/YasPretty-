import { ChevronRight } from 'lucide-react'
import { getCatalogProducts } from '../catalog/catalogService'
import { matchFaceProducts } from './faceProducts'

export function FaceProductMatches({ step, entry, onOpenProduct }) {
  const matches = matchFaceProducts(step, entry, getCatalogProducts())
  if (!matches.length) return entry.limited ? null : <p className="face-product-reason">该用途暂无可推荐的站内产品，可先参考手法。</p>
  return <div className="face-product-matches"><h4>{entry.limited ? '基础手法用妆参考' : '搭配产品'} · 同类可任选</h4><div className="face-product-list">{matches.map(({ product, reason }) => <div key={product.id}>
    <button className="face-product" type="button" onClick={() => onOpenProduct(product)} aria-label={`查看${product.brand} ${product.name}`}>
      <span><small>{product.brand} · {product.category}</small><b>{product.name}</b></span><ChevronRight size={16} />
    </button><p className="face-product-reason">{reason}</p>
  </div>)}</div></div>
}
