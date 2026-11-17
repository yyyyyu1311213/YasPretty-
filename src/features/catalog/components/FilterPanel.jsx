import { SlidersHorizontal, X } from 'lucide-react'
import { categoryOptions, finishOptions, skinOptions } from '../../../data/products'

export default function FilterPanel({ filters, isOpen, onChange, onClear, onClose }) {
  const panel = (
    <aside className={isOpen ? 'filter-panel open' : 'filter-panel'}>
      <div className="filter-title"><div><SlidersHorizontal size={17} /><strong>筛选条件</strong></div><button className="clear-button" onClick={onClear}>清空</button><button className="filter-close" aria-label="关闭筛选" title="关闭筛选" onClick={onClose}><X size={18} /></button></div>
      <FilterGroup label="产品类别" values={categoryOptions} selected={filters.categories} onClick={(value) => onChange('categories', value)} />
      <FilterGroup label="适合肤质" values={skinOptions} selected={filters.skins} onClick={(value) => onChange('skins', value)} />
      <FilterGroup label="妆效" values={finishOptions} selected={filters.finishes} onClick={(value) => onChange('finishes', value)} />
      <FilterGroup label="遮瑕度" values={['低', '中', '高']} selected={filters.coverages} onClick={(value) => onChange('coverages', value)} />
      <div className="filter-group"><p>持妆时长</p><div className="segmented-control">{['', '6', '8', '10'].map((value) => <button key={value || 'all'} className={filters.minWear === value ? 'selected' : ''} onClick={() => onChange('minWear', value, false)}>{value ? `${value}h+` : '不限'}</button>)}</div></div>
      <FilterGroup label="氧化程度" values={['低', '中']} selected={filters.oxidations} onClick={(value) => onChange('oxidations', value)} />
      <FilterGroup label="品牌地区" values={['中国', '法国', '美国', '意大利', '韩国']} selected={filters.regions} onClick={(value) => onChange('regions', value)} />
      <div className="filter-group"><p>价格区间</p><div className="price-options">{[['', '不限'], ['0-200', '200 元以下'], ['200-400', '200 - 400'], ['400-800', '400 元以上']].map(([value, label]) => <button key={label} className={filters.price === value ? 'selected' : ''} onClick={() => onChange('price', value, false)}>{label}</button>)}</div></div>
    </aside>
  )
  return <>{panel}{isOpen && <div className="filter-backdrop" onClick={onClose} aria-hidden="true" />}</>
}

function FilterGroup({ label, values, selected, onClick }) {
  return <div className="filter-group"><p>{label}</p><div className="filter-chips">{values.map((value) => <button key={value} className={selected.includes(value) ? 'selected' : ''} onClick={() => onClick(value)}>{value}</button>)}</div></div>
}
