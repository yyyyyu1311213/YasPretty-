// The existing header dropdown; this app has no bottom navigation or sidebar.
export default function MobileNavigation({ navItems, activeView, favoriteCount, onNavigate }) {
  return (
    <nav className="mobile-nav" aria-label="移动端主导航">
      {navItems.map((item) => (
        <button key={item.id} className={activeView === item.id ? 'active' : ''} onClick={() => onNavigate(item.id)}>
          {item.label}{item.id === 'favorites' && favoriteCount > 0 ? ` (${favoriteCount})` : ''}
        </button>
      ))}
    </nav>
  )
}
