import { ChevronRight } from 'lucide-react'
import { products } from '../../../data/products'

export default function PlanProduct({ id, onOpenProduct }) {
  const product = products.find((item) => item.id === id)
  if (!product) return null
  return (
    <button type="button" className="makeup-plan-product" onClick={() => onOpenProduct(product)}>
      <span><b>{product.brand}</b>{product.name}</span>
      <small>{product.category} · {product.finish} · {product.price == null ? '价格暂无' : `参考价 ${product.price} 元`}</small>
      <ChevronRight size={15} />
    </button>
  )
}
