import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { products } from '../../../data/products'
import AssistantMessages from './AssistantMessages'

const props = { messages: [], profile: {}, busy: false, activity: '合成加载状态', messageEndRef: { current: null }, onOpenProduct: vi.fn() }

describe('小Y消息展示边界', () => {
  it('keeps user/assistant roles, message order and text without treating message text as HTML', () => {
    const markup = renderToStaticMarkup(<AssistantMessages {...props} messages={[
      { id: 'user', role: 'user', content: '<b>合成问题</b>' },
      { id: 'assistant', role: 'assistant', content: '合成回答' },
    ]} />)
    expect(markup).toContain('aria-live="polite"')
    expect(markup).toContain('class="xiaoy-message user"')
    expect(markup).toContain('class="xiaoy-message assistant"')
    expect(markup).toContain('&lt;b&gt;合成问题&lt;/b&gt;')
    expect(markup.indexOf('合成问题')).toBeLessThan(markup.indexOf('合成回答'))
    expect(markup).not.toContain('class="xiaoy-message assistant loading"')
  })

  it('renders only real catalog product IDs and keeps the attached sources', () => {
    const product = products[0]
    const markup = renderToStaticMarkup(<AssistantMessages {...props} messages={[{
      id: 'answer', role: 'assistant', content: '合成回答', productIds: ['not-a-real-id', product.id],
      sources: [{ title: '合成证据', url: 'https://example.test/source' }],
    }]} />)
    expect(markup.match(/class="xiaoy-product"/g)).toHaveLength(1)
    expect(markup).toContain(product.name)
    expect(markup).not.toContain('not-a-real-id')
    expect(markup).toContain('href="https://example.test/source"')
    expect(markup).toContain('合成证据')
  })

  it('keeps the complete busy indicator and places the original end ref after messages and loading', () => {
    const tree = AssistantMessages({ ...props, busy: true })
    expect(tree.props.className).toBe('xiaoy-messages')
    expect(tree.props.children[1].props.className).toBe('xiaoy-message assistant loading')
    expect(tree.props.children.at(-1).type).toBe('div')
    expect(tree.props.children.at(-1).props.ref).toBe(props.messageEndRef)
    const markup = renderToStaticMarkup(tree)
    expect(markup).toContain('合成加载状态')
    expect(markup).toContain('class="xiaoy-message assistant loading"')
  })

  it('keeps unknown-only message products empty without hiding the message text', () => {
    const markup = renderToStaticMarkup(<AssistantMessages {...props} messages={[
      { id: 'stored', role: 'assistant', content: '保留的合成消息', productIds: ['not-a-real-id'] },
    ]} />)
    expect(markup).toContain('保留的合成消息')
    expect(markup).toContain('class="xiaoy-products"')
    expect(markup).not.toContain('class="xiaoy-product"')
    expect(markup).not.toContain('class="xiaoy-sources"')
  })
})
