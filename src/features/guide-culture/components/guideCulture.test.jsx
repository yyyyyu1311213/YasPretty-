import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import GuideView from './GuideView'
import CultureView from './CultureView'

vi.mock('react', async (original) => ({
  ...await original(),
  useEffect: vi.fn(),
  useRef: () => ({ current: null }),
  useState: () => [false, vi.fn()],
}))

// Element/callback and SSR checks; real navigation, focus and scroll run in Playwright.
function* nodes(value) {
  if (Array.isArray(value)) { for (const child of value) yield* nodes(child); return }
  if (!value || typeof value !== 'object') return
  yield value
  yield* nodes(value.props?.children)
}

describe('guide and culture pages', () => {
  it('renders the three home guide cards, tags, image credits and limits', () => {
    const tree = GuideView({ onApplyFilter: vi.fn() })
    expect(tree.type).toBe('section')
    expect(tree.props.className).toBe('skin-guide')
    const markup = renderToStaticMarkup(tree)
    for (const text of ['先读懂皮肤，', '再挑底妆。', '这里的建议只帮助你建立筛选方向。', '油皮 / 混油皮', '干皮 / 混干皮', '想要镜头感', '低卡粉', '拍照']) expect(markup).toContain(text)
    expect([...nodes(tree)].filter((n) => n.type === 'article')).toHaveLength(3)
    expect([...nodes(tree)].filter((n) => n.type === 'button')).toHaveLength(3)
    expect(markup).toContain('CC BY 2.0')
    expect(markup).toContain('/assets/skin-guide/oily-skin.jpg')
    expect(markup).not.toContain('role="dialog"')
  })

  it.each([
    [0, { skins: ['油皮'], minWear: 8 }],
    [1, { skins: ['干皮'] }],
    [2, { scene: '拍照' }],
  ])('passes guide card %i conditions to the existing catalog callback', (index, filter) => {
    const onApplyFilter = vi.fn()
    const buttons = [...nodes(GuideView({ onApplyFilter }))].filter((n) => n.type === 'button')
    expect(onApplyFilter).not.toHaveBeenCalled()
    buttons[index].props.onClick()
    expect(onApplyFilter).toHaveBeenCalledExactlyOnceWith(filter)
  })

  it('renders the existing culture content and original brand asset as a page', () => {
    const tree = CultureView({ onNavigate: vi.fn() })
    expect(tree.type).toBe('section')
    expect(tree.props.className).toBe('culture-page content-section')
    const markup = renderToStaticMarkup(tree)
    for (const text of ['ABOUT YASPRETTY', 'YasPretty / YOU ARE PRETTY', '让美妆选择，', '变得更简单。', '真实记录', '适配推荐', '做自己的编辑', '你的样子，不需要被改写。']) expect(markup).toContain(text)
    expect(markup).toContain('aria-label="YasPretty 品牌标识"')
    expect([...nodes(tree)].find((n) => n.type === 'img').props).toMatchObject({ src: '/assets/logo/yaspretty-monogram.svg?v=20261104-y-seal-lines', alt: '' })
    expect([...nodes(tree)].filter((n) => n.type === 'article')).toHaveLength(3)
    expect(markup).not.toContain('role="dialog"')
  })

  it('keeps the culture page library action and exact navigation argument', () => {
    const onNavigate = vi.fn()
    const buttons = [...nodes(CultureView({ onNavigate }))].filter((n) => n.type === 'button')
    expect(buttons).toHaveLength(1)
    expect(buttons[0].props.className).toBe('primary-action')
    expect(onNavigate).not.toHaveBeenCalled()
    buttons[0].props.onClick()
    expect(onNavigate).toHaveBeenCalledExactlyOnceWith('library')
  })
})
