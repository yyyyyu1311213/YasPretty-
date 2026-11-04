import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUpRight, ChevronRight, Info, Palette, X } from 'lucide-react'
import { categoryOptions, products } from '../data/products'
import './MakeupTable.css'

export const MAX_BLOOM_ITEMS = 5

const CATEGORY_META = {
  粉底液: {
    role: '均匀肤色并建立底妆质感',
    focus: '肤质倾向、妆效、遮瑕方向和预算',
    note: '适配结论包含编辑判断，请结合核验状态和线下试色决定。',
    className: 'foundation',
  },
  眼影: {
    role: '为眼部增加色彩层次和光影',
    focus: '色调、质地、显色方向和眼周耐受',
    note: '眼周出现刺痛、红肿或不适时应立即停止使用。',
    className: 'eyeshadow',
  },
  气垫: {
    role: '快速完成均匀、可补妆的底妆',
    focus: '便携性、妆效、肤质倾向和补妆场景',
    note: '色号与妆效会受光线、用量和上妆方式影响。',
    className: 'cushion',
  },
  睫毛膏: {
    role: '整理睫毛线条并增加眼神存在感',
    focus: '刷头、质地、眼周耐受和使用场景',
    note: '不把名称或页面文案转译为绝对功效承诺。',
    className: 'mascara',
  },
  遮瑕: {
    role: '局部修饰色差和可见瑕疵',
    focus: '遮瑕方向、质地、眼下保湿和叠加方式',
    note: '眼下和破损部位应减少叠加，出现不适时暂停使用。',
    className: 'concealer',
  },
  腮红: {
    role: '补充面部气色和妆容层次',
    focus: '色调、质地、显色强度和叠加方式',
    note: '颜色呈现会受底妆、用量和光线影响。',
    className: 'blush',
  },
  散粉: {
    role: '局部整理油光并帮助底妆定型',
    focus: '粉质、控油方向、肤质和定妆区域',
    note: '干皮不建议为了追求哑光而全脸过量定妆。',
    className: 'powder',
  },
  唇妆: {
    role: '确定妆容的颜色重点和收尾质感',
    focus: '色调、质地、唇部状态和使用场景',
    note: '唇部干燥、破损或不适时应先暂停使用。',
    className: 'lip',
  },
}
const DESKTOP_SLOTS = {
  粉底液: { x: 30, y: 49, rotate: -8 },
  气垫: { x: 46, y: 35, rotate: 3 },
  眼影: { x: 62, y: 40, rotate: 8 },
  睫毛膏: { x: 78, y: 47, rotate: 13 },
  遮瑕: { x: 21, y: 66, rotate: -14 },
  腮红: { x: 38, y: 67, rotate: -4 },
  散粉: { x: 57, y: 67, rotate: 5 },
  唇妆: { x: 75, y: 66, rotate: 12 },
}
const BLOOM_TARGETS = [
  { x: 20, y: 71, rotate: -9 },
  { x: 35, y: 78, rotate: -4 },
  { x: 50, y: 82, rotate: 0 },
  { x: 65, y: 78, rotate: 4 },
  { x: 80, y: 71, rotate: 9 },
]

function getCategoryMeta(category) {
  return CATEGORY_META[category] || {
    role: '作为妆容步骤的一部分提供辅助效果',
    focus: '品类、质地、场景和预算',
    note: '当前资料仍需结合产品档案中的核验状态阅读。',
    className: 'other',
  }
}

export function getCategoryGroups(productList = products) {
  return categoryOptions
    .map((category) => ({
      id: category,
      label: category,
      products: productList.filter((product) => product.category === category),
      meta: getCategoryMeta(category),
    }))
    .filter((group) => group.products.length > 0)
}

export function getCategorySummary(group) {
  const { meta, products: groupProducts, label } = group
  return `${label}用于${meta.role}。选择时可重点关注${meta.focus}。YasPretty 当前收录 ${groupProducts.length} 款，${meta.note}`
}

function verificationLabel(product) {
  return product.factVerificationStatus === 'verified' ? '事实已核验' : '资料待核验'
}

function imageStatusLabel(product) {
  return product.imageAuthorizationStatus === 'pending' ? '图片授权待核验' : '图片来源已记录'
}

function ProductImage({ product, className = '', loading = 'lazy' }) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return <span className={`makeup-table-image-fallback ${className}`} aria-label="产品图片暂不可用"><Palette size={22} /></span>
  }
  return <img className={className} src={product.image} alt={`${product.brand} ${product.name}`} loading={loading} onError={() => setFailed(true)} />
}

function CategoryButton({ group, active, disabled, onClick, buttonRef, index }) {
  const slot = DESKTOP_SLOTS[group.id] || { x: 50, y: 50, rotate: 0 }
  const representative = group.products[0]
  return (
    <button
      ref={buttonRef}
      type="button"
      className={`makeup-table-category makeup-table-category-${group.meta.className}${active ? ' is-active' : ''}`}
      style={{ '--table-x': `${slot.x}%`, '--table-y': `${slot.y}%`, '--table-rotate': `${slot.rotate}deg`, '--table-delay': `${220 + Math.abs(index - 3) * 48}ms` }}
      aria-label={`展开${group.label}，当前收录 ${group.products.length} 款`}
      aria-expanded={active}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation()
        onClick(group.id)
      }}
    >
      <span className="makeup-table-category-well">
        <ProductImage product={representative} className="makeup-table-category-image" loading="eager" />
      </span>
      <span className="makeup-table-category-label">{group.label}</span>
      <span className="makeup-table-category-count">{group.products.length} 款</span>
    </button>
  )
}
function BloomProduct({ product, index, total, onOpenProduct }) {
  const target = BLOOM_TARGETS[index] || BLOOM_TARGETS[BLOOM_TARGETS.length - 1]
  return (
    <button
      type="button"
      className="makeup-table-bloom-product"
      style={{ '--bloom-x': `${target.x}%`, '--bloom-y': `${target.y}%`, '--bloom-rotate': `${target.rotate}deg`, '--bloom-delay': `${index * 48}ms`, '--bloom-index': index, '--bloom-total': total }}
      aria-label={`查看 ${product.brand} ${product.name} 档案`}
      onClick={(event) => {
        event.stopPropagation()
        onOpenProduct(product)
      }}
    >
      <span className="makeup-table-bloom-image"><ProductImage product={product} /></span>
      <span className="makeup-table-bloom-copy">
        <strong>{product.brand}</strong>
        <span>{product.name}</span>
        <small>{verificationLabel(product)} · {imageStatusLabel(product)}</small>
      </span>
      <ArrowUpRight size={15} aria-hidden="true" />
    </button>
  )
}
export default function MakeupTable({ openingReady = false, onOpenProduct, onViewCategory }) {
  const groups = useMemo(() => getCategoryGroups(), [])
  const [reducedMotion, setReducedMotion] = useState(false)
  const [stageReady, setStageReady] = useState(false)
  const [interactive, setInteractive] = useState(false)
  const [activeCategory, setActiveCategory] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const triggerRefs = useRef(new Map())
  const touchStartY = useRef(null)

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!media) return undefined
    const sync = () => setReducedMotion(media.matches)
    sync()
    media.addEventListener?.('change', sync)
    return () => media.removeEventListener?.('change', sync)
  }, [])

  useEffect(() => {
    if (!openingReady) return undefined
    setStageReady(true)
    const timer = window.setTimeout(() => setInteractive(true), reducedMotion ? 0 : 1180)
    return () => window.clearTimeout(timer)
  }, [openingReady, reducedMotion])

  useEffect(() => {
    const onEscape = (event) => {
      if (event.key === 'Escape' && activeCategory) closeCategory()
    }
    window.addEventListener('keydown', onEscape)
    return () => window.removeEventListener('keydown', onEscape)
  }, [activeCategory])

  const activeGroup = groups.find((group) => group.id === activeCategory) || null
  const visibleProducts = activeGroup?.products.slice(0, MAX_BLOOM_ITEMS) || []

  function openCategory(category) {
    if (!interactive) return
    setActiveCategory(category)
    setMobileOpen(true)
  }

  function closeCategory() {
    const previous = activeCategory
    setActiveCategory(null)
    setMobileOpen(false)
    window.requestAnimationFrame(() => triggerRefs.current.get(previous)?.focus())
  }

  function handleStageClick(event) {
    if (activeCategory && !event.target.closest('button')) closeCategory()
  }

  return (
    <section className={`makeup-table-section content-section${stageReady ? ' is-ready' : ''}${activeGroup ? ' has-active-category' : ''}`} aria-labelledby="makeup-table-title">
      <div className="makeup-table-heading">
        <div>
          <p className="eyebrow"><Palette size={14} aria-hidden="true" /> 化妆桌 / 按品类浏览</p>
          <h2 id="makeup-table-title">化妆桌</h2>
        </div>
        <p className="makeup-table-heading-note">从桌面品类进入真实产品资料。后续的产品展示和品牌文案会在这里展开。</p>
      </div>

      <div className="makeup-table-stage" onClick={handleStageClick}>
        <div className="makeup-table-mirror" aria-hidden="true"><span>YASPRETTY</span><i>beauty decision library</i></div>
        <div className="makeup-table-surface" aria-hidden="true">
          <span className="makeup-table-tray" />
          <span className="makeup-table-line makeup-table-line-one" />
          <span className="makeup-table-line makeup-table-line-two" />
          <span className="makeup-table-spark makeup-table-spark-one">✦</span>
          <span className="makeup-table-spark makeup-table-spark-two">✦</span>
        </div>
        <div className="makeup-table-categories" aria-label="化妆品类导航">
          {groups.map((group, index) => (
            <CategoryButton
              key={group.id}
              group={group}
              index={index}
              active={activeCategory === group.id}
              disabled={!interactive}
              buttonRef={(node) => {
                if (node) triggerRefs.current.set(group.id, node)
                else triggerRefs.current.delete(group.id)
              }}
              onClick={openCategory}
            />
          ))}
        </div>
        {activeGroup && (
          <div className="makeup-table-bloom" id="makeup-table-products" aria-label={`${activeGroup.label}产品`}>
            <div className="makeup-table-bloom-anchor" aria-hidden="true" />
            {visibleProducts.map((product, index) => <BloomProduct key={product.id} product={product} index={index} total={visibleProducts.length} onOpenProduct={onOpenProduct} />)}
          </div>
        )}
        <div className="makeup-table-intro" aria-hidden={Boolean(activeGroup)}>
          <span>01</span><strong>选择一件桌面物品</strong><small>查看品类内的真实产品档案</small>
        </div>
      </div>

      {activeGroup && (
        <div className={`makeup-table-info${mobileOpen ? ' is-open' : ''}`} role="region" aria-label={`${activeGroup.label}品类摘要`}>
          <div className="makeup-table-info-copy"><p className="eyebrow">{activeGroup.label} / {activeGroup.products.length} 款收录</p><p>{getCategorySummary(activeGroup)}</p></div>
          <div className="makeup-table-info-actions"><button type="button" className="makeup-table-all" onClick={() => onViewCategory(activeGroup.id)}>查看全部 {activeGroup.products.length} 款 <ChevronRight size={15} /></button><button type="button" className="makeup-table-close" aria-label="收起品类" title="收起品类" onClick={closeCategory}><X size={18} /></button></div>
        </div>
      )}

      <div className="makeup-table-mobile-panel" aria-hidden={!activeGroup || !mobileOpen}>
        {activeGroup && mobileOpen && (
          <div className="makeup-table-mobile-sheet" role="dialog" aria-modal="false" aria-labelledby="makeup-table-mobile-title" onTouchStart={(event) => { touchStartY.current = event.touches[0]?.clientY ?? null }} onTouchEnd={(event) => { const start = touchStartY.current; const end = event.changedTouches[0]?.clientY; if (start !== null && typeof end === 'number' && end - start > 48) closeCategory(); touchStartY.current = null }}>
            <div className="makeup-table-sheet-handle" aria-hidden="true" />
            <div className="makeup-table-sheet-header"><div><p className="eyebrow">{activeGroup.label} / {activeGroup.products.length} 款</p><h3 id="makeup-table-mobile-title">从桌上继续挑选</h3></div><button type="button" className="makeup-table-close" aria-label="关闭产品面板" title="关闭产品面板" onClick={closeCategory}><X size={18} /></button></div>
            <p className="makeup-table-sheet-summary">{getCategorySummary(activeGroup)}</p>
            <div className="makeup-table-mobile-products">{visibleProducts.map((product, index) => <BloomProduct key={product.id} product={product} index={index} total={visibleProducts.length} onOpenProduct={onOpenProduct} />)}</div>
            <button type="button" className="makeup-table-all makeup-table-mobile-all" onClick={() => onViewCategory(activeGroup.id)}>查看全部 {activeGroup.products.length} 款 <ChevronRight size={15} /></button>
          </div>
        )}
      </div>
      <p className="makeup-table-footnote"><Info size={14} aria-hidden="true" /> 产品事实和图片来源状态以产品档案为准；图片授权待核验时，页面会明确标注。</p>
    </section>
  )
}

