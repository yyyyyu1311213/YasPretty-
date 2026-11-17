import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import CollectionView from './CollectionView'
import CollectionStatusControl from './CollectionStatusControl'

function* nodes(value) {
  if (Array.isArray(value)) { for (const item of value) yield* nodes(item); return }
  if (!value || typeof value !== 'object') return
  yield value
  yield* nodes(value.props?.children)
}
function find(tree, predicate) {
  const result = [...nodes(tree)].find(predicate)
  expect(result).toBeDefined()
  return result
}
const product = (id) => ({ id, name: `产品${id}`, brand: '测试品牌', image: `/products/${id}/cover.webp`, shades: [{ name: '候选色' }], skins: ['干皮'], finish: '自然光泽' })

describe('collection controls and view', () => {
  it('adds the default status and retains the exact empty/saved labels and select options', () => {
    const onFavorite = vi.fn(), onRemoveFavorite = vi.fn()
    const empty = CollectionStatusControl({ productId: 'first', onFavorite, onRemoveFavorite })
    find(empty, (n) => n.type === 'button').props.onClick()
    expect(onFavorite).toHaveBeenCalledExactlyOnceWith('first', '想买')
    expect(renderToStaticMarkup(empty)).toContain('收藏这款')
    expect(renderToStaticMarkup(empty)).not.toContain('<select')
    const saved = CollectionStatusControl({ productId: 'first', status: '正在用', onFavorite, onRemoveFavorite })
    const select = find(saved, (n) => n.type === 'select')
    expect(select.props.value).toBe('正在用')
    expect(select.props['aria-label']).toBe('收藏状态')
    expect([...nodes(select)].filter((n) => n.type === 'option').map((n) => n.props.children)).toEqual(['想买', '正在用', '会回购'])
    select.props.onChange({ target: { value: '会回购' } })
    expect(onFavorite).toHaveBeenLastCalledWith('first', '会回购')
    find(saved, (n) => n.type === 'button').props.onClick()
    expect(onRemoveFavorite).toHaveBeenCalledExactlyOnceWith('first')
    expect(renderToStaticMarkup(saved)).toContain('已标记：正在用')
  })

  it('opens the same product from all three existing entries, keeping catalog order and shared callbacks', () => {
    const first = product('first'), second = product('second')
    const onOpenProduct = vi.fn(), onFavorite = vi.fn(), onRemoveFavorite = vi.fn()
    const tree = CollectionView({ products: [first, second], collection: { second: '会回购', first: '正在用', unknown: '想买' }, onOpenProduct, onFavorite, onRemoveFavorite })
    const articles = [...nodes(tree)].filter((n) => n.type === 'article')
    expect(articles.map((n) => n.key)).toEqual(['first', 'second'])
    for (const className of ['favorite-image', 'favorite-name', 'open-link']) find(articles[0], (n) => n.props?.className === className).props.onClick()
    expect(onOpenProduct).toHaveBeenCalledTimes(3)
    for (const [opened] of onOpenProduct.mock.calls) expect(opened).toBe(first)
    const control = find(articles[0], (n) => n.type === CollectionStatusControl)
    expect(control.props).toEqual({ productId: 'first', status: '正在用', onFavorite, onRemoveFavorite })
    const markup = renderToStaticMarkup(tree)
    expect(markup).toContain('2 款')
    expect(markup).toContain('MY BEAUTY LIST')
    expect(markup.indexOf('产品first')).toBeLessThan(markup.indexOf('产品second'))
  })

  it('shows the original empty state for falsy/unknown-only records and navigates to the library', () => {
    const onNavigate = vi.fn()
    const tree = CollectionView({ products: [product('first')], collection: { first: '', unknown: '想买' }, onNavigate })
    expect(renderToStaticMarkup(tree)).toContain('收藏清单还是空的')
    expect(renderToStaticMarkup(tree)).toContain('0 款')
    find(tree, (n) => n.props?.className === 'primary-action').props.onClick()
    expect(onNavigate).toHaveBeenCalledExactlyOnceWith('library')
  })
})
