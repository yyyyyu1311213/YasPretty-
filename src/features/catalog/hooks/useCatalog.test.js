import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useCatalog } from './useCatalog'
import { emptyFilters } from '../catalogUtils'
import { products } from '../../../data/products'

// State boundary harness; the browser suite separately drives real React and DOM.
const lifecycle = vi.hoisted(() => ({ states: [], cursor: 0 }))
vi.mock('react', async (original) => ({
  ...await original(),
  useState(initial) {
    const index = lifecycle.cursor++
    if (!(index in lifecycle.states)) lifecycle.states[index] = initial
    return [lifecycle.states[index], (next) => { lifecycle.states[index] = typeof next === 'function' ? next(lifecycle.states[index]) : next }]
  },
  useMemo(factory) { return factory() },
}))
function render() { lifecycle.cursor = 0; return useCatalog() }
beforeEach(() => { lifecycle.states = []; lifecycle.cursor = 0 })

describe('catalog state', () => {
  it('starts with the accepted filters, recommended order and closed panel', () => {
    expect(render()).toMatchObject({ filters: emptyFilters, sort: 'recommended', filterPanelOpen: false })
    expect(render().filteredProducts).toHaveLength(products.length)
    expect(render().filteredProducts[0].id).toBe('estee-lauder-double-wear')
  })

  it('toggles multi-select choices and updates scalar inputs without losing other conditions', () => {
    render().updateFilter('skins', '油皮')
    render().updateFilter('skins', '干皮')
    render().updateFilter('keyword', 'NARS', false)
    expect(render().filters).toMatchObject({ skins: ['油皮', '干皮'], keyword: 'NARS' })
    expect(render().filteredProducts.every((p) => p.brand === 'NARS' && p.skins.some((s) => ['油皮', '干皮'].includes(s)))).toBe(true)
    render().updateFilter('skins', '油皮')
    expect(render().filters.skins).toEqual(['干皮'])
  })

  it('search retains existing constraints and sort; quick filters replace constraints but retain sort', () => {
    render().setSort('price-desc')
    render().updateFilter('skins', '油皮')
    render().searchCatalog('nars')
    expect(render()).toMatchObject({ sort: 'price-desc', filters: { skins: ['油皮'], keyword: 'nars' } })
    render().applyQuickFilter({ scene: '通勤', maxPrice: 200 })
    expect(render().filters).toEqual({ ...emptyFilters, scene: '通勤', maxPrice: 200 })
    expect(render().sort).toBe('price-desc')
  })

  it('clears filters and sort without implicitly closing the panel', () => {
    render().setFilterPanelOpen((open) => !open)
    render().setSort('rating')
    render().searchCatalog('missing')
    expect(render().filteredProducts).toEqual([])
    render().clearFilters()
    expect(render()).toMatchObject({ filters: emptyFilters, sort: 'recommended', filterPanelOpen: true })
    render().setFilterPanelOpen(false)
    expect(render().filterPanelOpen).toBe(false)
  })
})
