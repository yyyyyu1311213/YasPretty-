import { ChevronRight } from 'lucide-react'
import { formatAssistantProductMeta } from '../assistantUtils'

export default function AssistantProduct({ product, profile, onOpenProduct, factOnly = false }) {
  return (
    <button className="xiaoy-product" onClick={() => onOpenProduct(product)}>
      <img src={product.image} alt={`${product.brand} ${product.name}`} />
      <span className="xiaoy-product-copy">
        <small>{product.brand}</small>
        <b>{product.name}</b>
        {!factOnly && <i>{formatAssistantProductMeta(product, profile)}</i>}
        <span className="xiaoy-product-action">查看产品资料</span>
      </span>
      <ChevronRight size={17} />
    </button>
  )
}
