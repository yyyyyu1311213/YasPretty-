import { ChevronRight } from 'lucide-react'
import { formatAssistantProductMeta } from '../assistantUtils'

export default function AssistantProduct({ product, profile, onOpenProduct }) {
  return (
    <button className="xiaoy-product" onClick={() => onOpenProduct(product)}>
      <img src={product.image} alt={`${product.brand} ${product.name}`} />
      <span className="xiaoy-product-copy">
        <small>{product.brand}</small>
        <b>{product.name}</b>
        <i>{formatAssistantProductMeta(product, profile)}</i>
      </span>
      <ChevronRight size={17} />
    </button>
  )
}
