import { ChevronRight } from 'lucide-react'
import { imageRightsContactUrl, productImageNotice } from '../../../data/product-image-sources'
import TopHeader from './TopHeader'
import SiteBackdrop from './SiteBackdrop'

// App supplies the page, opening and domain overlay without adding DOM wrappers.
export default function AppShell({ opening, activeView, favoriteCount, mobileMenuOpen, onNavigate, onMobileMenu, children, overlay }) {
  return (
    <div className="app-shell">
      <SiteBackdrop />
      {opening}
      <TopHeader
        activeView={activeView}
        favoriteCount={favoriteCount}
        mobileMenuOpen={mobileMenuOpen}
        onNavigate={onNavigate}
        onMobileMenu={onMobileMenu}
      />

      <main>{children}</main>

      <Footer isHome={activeView === 'home'} />
      {overlay}
    </div>
  )
}

function Footer({ isHome }) {
  return <footer className={`site-footer${isHome ? ' site-footer--home' : ''}`}><div><img className="footer-wordmark-image" src={`/assets/logo/yaspretty-wordmark-${isHome ? 'light' : 'dark'}.svg`} alt="YasPretty" /></div><p>{productImageNotice} 产品信息与编辑评价仍需结合详情页来源状态判断。</p><a className="source-contact-link" href={imageRightsContactUrl} target="_blank" rel="noreferrer">权利人联系删除 <ChevronRight size={15} /></a></footer>
}
