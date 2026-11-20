import { ArrowDownUp, ArrowLeft, ChevronDown, Search, SlidersHorizontal } from 'lucide-react'
import { getCatalogProducts } from '../catalogService'
import FilterPanel from './FilterPanel'
import ProductCard from './ProductCard'

const products = getCatalogProducts()

export default function LibraryView({ filters, results, sort, isFilterOpen, collection, onChangeFilter, onClear, onChangeSort, onToggleFilterPanel, onOpenProduct, onFavorite, onRemoveFavorite, showMakeupTableBack = false, onBackToMakeupTable }) {
  return (
    <section className="library-page content-section">
      <div className="library-heading">
        <div>
          {showMakeupTableBack && <button className="library-back-button" type="button" onClick={onBackToMakeupTable}><ArrowLeft size={15} />返回妆台</button>}
          <p className="eyebrow">产品库 / 目前收录彩妆 / {products.length} 条资料</p><h1>找到匹配的彩妆</h1>
        </div>
        <label className="library-search"><Search size={17} /><input value={filters.keyword} onChange={(event) => onChangeFilter('keyword', event.target.value, false)} placeholder="搜索品牌、产品名、色号" /></label>
      </div>
      <div className="library-controls-mobile">
        <button className="filter-button" onClick={onToggleFilterPanel}><SlidersHorizontal size={17} /> 筛选条件</button>
        <SortSelect sort={sort} onChange={onChangeSort} />
      </div>
      <div className="library-layout">
        <FilterPanel filters={filters} isOpen={isFilterOpen} onChange={onChangeFilter} onClear={onClear} onClose={onToggleFilterPanel} />
        <div className="library-results">
          <div className="results-toolbar">
            <p>共 <strong>{results.length}</strong> 款符合当前条件</p>
            <div className="desktop-sort"><SortSelect sort={sort} onChange={onChangeSort} /></div>
          </div>
          {results.length > 0 ? <div className="product-grid">{results.map((product) => <ProductCard key={product.id} product={product} collection={collection} onOpen={onOpenProduct} onFavorite={onFavorite} onRemoveFavorite={onRemoveFavorite} />)}</div> : <EmptyResults onClear={onClear} />}
        </div>
      </div>
    </section>
  )
}

function SortSelect({ sort, onChange }) {
  return <label className="sort-select"><ArrowDownUp size={16} /><select value={sort} onChange={(event) => onChange(event.target.value)} aria-label="排序方式"><option value="recommended">综合推荐</option><option value="rating">评分从高到低</option><option value="price-asc">价格从低到高</option><option value="price-desc">价格从高到低</option></select><ChevronDown size={15} /></label>
}

function EmptyResults({ onClear }) {
  return <div className="empty-results"><Search size={26} /><h2>没有找到对应档案</h2><p>试着减少一个筛选条件，或用更短的关键词搜索。</p><button className="primary-action" onClick={onClear}>清空筛选</button></div>
}
