import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { products } from '../../../data/products'
import PlanProduct from './PlanProduct'

describe('方案产品的真实 ID 边界', () => {
  it('renders nothing for an unknown product', () => {
    expect(renderToStaticMarkup(<PlanProduct id="not-a-real-product" onOpenProduct={vi.fn()} />)).toBe('')
  })

  it('opens the original catalog object and retains product text, button type and class', () => {
    const product = products[0]
    const onOpenProduct = vi.fn()
    const element = PlanProduct({ id: product.id, onOpenProduct })
    expect(element.type).toBe('button')
    expect(element.props.type).toBe('button')
    expect(element.props.className).toBe('makeup-plan-product')
    element.props.onClick()
    expect(onOpenProduct).toHaveBeenCalledExactlyOnceWith(product)
    const markup = renderToStaticMarkup(element)
    expect(markup).toContain(product.brand)
    expect(markup).toContain(product.name)
    expect(markup).toContain(product.price == null ? '价格暂无' : `参考价 ${product.price} 元`)
  })
})
