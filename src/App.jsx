import { Component, useState } from 'react'
import AppShell from './features/app-shell/components/AppShell'
import { currentNavigationEntry, useAppNavigation } from './features/app-shell/hooks/useAppNavigation'
import BrandOpening from './features/app-shell/components/BrandOpening'
import XiaoYAssistant from './features/assistant/components/XiaoYAssistant'
import HomeView from './features/home/components/HomeView'
import CultureView from './features/guide-culture/components/CultureView'

import { getCatalogProducts } from './features/catalog/catalogService'
import { useCatalog } from './features/catalog/hooks/useCatalog'
import LibraryView from './features/catalog/components/LibraryView'
import ProductProfile from './features/catalog/components/ProductProfile'
import ProductDetailDrawer from './features/catalog/components/ProductDetailDrawer'
import { useCollection } from './features/collection/hooks/useCollection'
import CollectionView from './features/collection/components/CollectionView'
import CollectionStatusControl from './features/collection/components/CollectionStatusControl'

const products = getCatalogProducts()

class EnhancementBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

function App() {
  const [initialEntry] = useState(currentNavigationEntry)
  const [openingActive, setOpeningActive] = useState(() => initialEntry.view === 'home')
  const [view, setView] = useState(initialEntry.view)
  const { filters, sort, filterPanelOpen, filteredProducts, setSort, setFilterPanelOpen, updateFilter, clearFilters, searchCatalog, applyQuickFilter } = useCatalog()
  const { collection, favoriteCount, setStatus, removeFavorite } = useCollection()
  const { selectedProduct, profileProduct, returnTo, mobileMenuOpen, setMobileMenuOpen, completeOpening, navigate, openProductDrawer, openProductProfile, closeProductProfile, closeProductDrawer, backToMakeupTable } = useAppNavigation({ initialEntry, openingActive, setOpeningActive, view, setView, setFilterPanelOpen })

  function runSearch(keyword) {
    searchCatalog(keyword)
    navigate('library')
  }

  function chooseQuickFilter(query) {
    applyQuickFilter(query)
    navigate('library')
  }

  function openCategory(category) {
    applyQuickFilter({ categories: [category] })
    navigate('library', { returnTo: 'makeup-table' })
  }

  return (
    <AppShell
      opening={openingActive && <BrandOpening onComplete={completeOpening} />}
      activeView={view === 'product' ? 'library' : view}
      favoriteCount={favoriteCount}
      mobileMenuOpen={mobileMenuOpen}
      onNavigate={navigate}
      onMobileMenu={() => setMobileMenuOpen((open) => !open)}
      overlay={selectedProduct && (
        <ProductDetailDrawer
          product={selectedProduct}
          statusControl={<CollectionStatusControl productId={selectedProduct.id} status={collection[selectedProduct.id]} onFavorite={setStatus} onRemoveFavorite={removeFavorite} />}
          onClose={closeProductDrawer}
          onOpenProduct={openProductDrawer}
          onOpenFullProfile={openProductProfile}
        />
      )}
    >
      {(view === 'home' || (view === 'library' && returnTo === 'makeup-table')) && (
        <HomeView
          hidden={view !== 'home'}
          EnhancementBoundary={EnhancementBoundary}
          openingReady={!openingActive}
          onSearch={runSearch}
          onQuickFilter={chooseQuickFilter}
          onViewCategory={openCategory}
          onApplyGuideFilter={chooseQuickFilter}
          onNavigate={navigate}
          onOpenProduct={openProductDrawer}
          collection={collection}
          onFavorite={setStatus}
          onRemoveFavorite={removeFavorite}
        />
      )}
      {view === 'library' && (
        <LibraryView
          filters={filters}
          results={filteredProducts}
          sort={sort}
          isFilterOpen={filterPanelOpen}
          collection={collection}
          onChangeFilter={updateFilter}
          onClear={clearFilters}
          onChangeSort={setSort}
          onToggleFilterPanel={() => setFilterPanelOpen((open) => !open)}
          showMakeupTableBack={returnTo === 'makeup-table'}
          onBackToMakeupTable={backToMakeupTable}
          onOpenProduct={openProductDrawer}
          onFavorite={setStatus}
          onRemoveFavorite={removeFavorite}
        />
      )}
      {view === 'assistant' && <XiaoYAssistant onOpenProduct={openProductDrawer} />}
      {view === 'culture' && <CultureView onNavigate={navigate} />}
      {view === 'favorites' && (
        <CollectionView
          products={products}
          collection={collection}
          onOpenProduct={openProductDrawer}
          onFavorite={setStatus}
          onRemoveFavorite={removeFavorite}
          onNavigate={navigate}
        />
      )}
      {view === 'product' && profileProduct && (
        <ProductProfile
          product={profileProduct}
          statusControl={<CollectionStatusControl productId={profileProduct.id} status={collection[profileProduct.id]} onFavorite={setStatus} onRemoveFavorite={removeFavorite} />}
          onBack={closeProductProfile}
        />
      )}
    </AppShell>
  )
}

export default App
