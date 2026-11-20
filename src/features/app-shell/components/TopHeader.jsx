import { Menu, X } from 'lucide-react'
import MobileNavigation from './MobileNavigation'

export default function TopHeader({ activeView, favoriteCount, mobileMenuOpen, onNavigate, onMobileMenu }) {
  const navItems = [
    { id: 'home', label: '首页' },
    { id: 'assistant', label: '小Y智能选妆' },
    { id: 'library', label: '产品库' },
    { id: 'culture', label: '品牌文化' },
    { id: 'favorites', label: '我的收藏' },
  ]
  return (
    <header className="site-header">
      <div className="header-inner">
        <button className="brand" onClick={() => onNavigate('home')} aria-label="回到首页">
          <img className="brand-wordmark-image" src="/assets/logo/yaspretty-wordmark-dark.svg" alt="" />
          <span className="brand-library">BEAUTY LIBRARY</span>
        </button>
        <nav className="desktop-nav" aria-label="主导航">
          {navItems.map((item) => (
            <button key={item.id} className={activeView === item.id ? 'nav-link active' : 'nav-link'} onClick={() => onNavigate(item.id)}>
              {item.label}
              {item.id === 'favorites' && favoriteCount > 0 && <span className="nav-count">{favoriteCount}</span>}
            </button>
          ))}
        </nav>
        <button className="mobile-menu-button" aria-label="打开导航" title="打开导航" onClick={onMobileMenu}>
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {mobileMenuOpen && (
        <MobileNavigation navItems={navItems} activeView={activeView} favoriteCount={favoriteCount} onNavigate={onNavigate} />
      )}
    </header>
  )
}
