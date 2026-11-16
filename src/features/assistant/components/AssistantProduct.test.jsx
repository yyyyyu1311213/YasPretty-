import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { products } from '../../../data/products'
import AssistantProduct from './AssistantProduct'

describe('小Y推荐产品', () => {
  it('opens the original catalog object and retains the image, label and product facts', () => {
    const product = products[0]
    const onOpenProduct = vi.fn()
    const button = AssistantProduct({ product, profile: {}, onOpenProduct })
    expect(button.type).toBe('button')
    expect(button.props.className).toBe('xiaoy-product')
    button.props.onClick()
    expect(onOpenProduct).toHaveBeenCalledExactlyOnceWith(product)
    const markup = renderToStaticMarkup(button)
    expect(markup).toContain(`alt="${product.brand} ${product.name}"`)
    expect(markup).toContain(product.image)
    expect(markup).toContain(product.priceLabel)
    expect(markup).toContain(product.finish)
  })

  it('keeps the original pending shade label when shade recommendations are not ready', () => {
    const product = products.find((item) => !item.shadeRecommendationReady)
    expect(product).toBeDefined()
    const markup = renderToStaticMarkup(<AssistantProduct product={product} profile={{ tone: '冷调' }} onOpenProduct={vi.fn()} />)
    expect(markup).toContain(`参数色号待确认 · ${product.finish} · ${product.priceLabel}`)
  })
})
