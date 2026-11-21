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
    expect(markup).toContain('查看产品资料')
  })

  it('keeps a factual lookup card focused on its product and details action', () => {
    const product = products[0]
    const markup = renderToStaticMarkup(<AssistantProduct product={product} profile={{}} onOpenProduct={vi.fn()} factOnly />)
    expect(markup).toContain(product.name)
    expect(markup).toContain('查看产品资料')
    expect(markup).not.toContain(product.priceLabel)
  })

  it('hides internal shade and finish placeholders when product facts are incomplete', () => {
    const product = products.find((item) => !item.shadeRecommendationReady)
    expect(product).toBeDefined()
    const markup = renderToStaticMarkup(<AssistantProduct product={product} profile={{ tone: '冷调' }} onOpenProduct={vi.fn()} />)
    expect(markup).toContain(product.priceLabel)
    expect(markup).not.toMatch(/待核验|已核验|未核验|待确认/)
  })
})
