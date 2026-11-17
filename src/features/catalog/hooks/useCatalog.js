import { useMemo, useState } from 'react'
import { getCatalogProducts } from '../catalogService'
import { emptyFilters, productMatches, sortCatalogProducts, toggleArrayValue } from '../catalogUtils'

export function useCatalog() {
  const [filters, setFilters] = useState(emptyFilters)
  const [sort, setSort] = useState('recommended')
  const [filterPanelOpen, setFilterPanelOpen] = useState(false)
  const filteredProducts = useMemo(() => {
    const list = getCatalogProducts().filter((product) => productMatches(product, filters))
    return sortCatalogProducts(list, sort)
  }, [filters, sort])

  function updateFilter(key, value, multiple = true) {
    setFilters((current) => ({ ...current, [key]: multiple ? toggleArrayValue(current[key], value) : value }))
  }

  function clearFilters() {
    setFilters(emptyFilters)
    setSort('recommended')
  }

  function searchCatalog(keyword) {
    setFilters((current) => ({ ...current, keyword }))
  }

  function applyQuickFilter(query) {
    setFilters({ ...emptyFilters, ...query })
  }

  return { filters, sort, filterPanelOpen, filteredProducts, setSort, setFilterPanelOpen, updateFilter, clearFilters, searchCatalog, applyQuickFilter }
}
