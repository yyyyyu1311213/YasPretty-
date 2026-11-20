import { useEffect, useRef } from 'react'
import { ChevronRight } from 'lucide-react'
import CultureSealCanvas from './CultureSealCanvas'
import './CultureView.css'

export default function CultureView({ onNavigate }) {
  const principlesRef = useRef(null)

  useEffect(() => {
    const cards = [...principlesRef.current.querySelectorAll('.culture-card-slot')]
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (motion.matches || !('IntersectionObserver' in window)) return undefined
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.dataset.entered = 'true'
        observer.unobserve(entry.target)
      })
    }, { threshold: 0.15 })
    cards.forEach((card) => {
      card.dataset.motion = 'true'
      observer.observe(card)
    })
    return () => observer.disconnect()
  }, [])

  return <section className="culture-page content-section">
    <div className="culture-lead">
      <div>
        <p className="eyebrow">ABOUT YASPRETTY</p>
        <p className="culture-name">YasPretty / YOU ARE PRETTY</p>
        <h1>让美妆选择，<br />变得更简单。</h1>
        <p>YasPretty 的初衷，是让美妆选择变得更简单。我们希望用清晰的产品信息、真实的使用体验和理性的测评视角，帮你在繁杂的美妆世界里找到真正适合自己的那一款。</p>
      </div>
      <div className="culture-mark-panel" aria-label="YasPretty 品牌标识">
        <div className="culture-seal" aria-hidden="true">
          <img src="/assets/logo/yaspretty-monogram.svg?v=20261104-y-seal-lines" alt="" />
          <CultureSealCanvas />
        </div>
        <span>YASPRETTY / BEAUTY ARCHIVE</span>
      </div>
    </div>
    <div className="culture-statement">
      <span>01</span>
      <p>清晰的信息、真实的体验、理性的视角，让每一次选择都更接近你自己。</p>
    </div>
    <div className="culture-principles" ref={principlesRef}>
      <div className="culture-card-slot" style={{ '--card-order': 0 }}><div className="culture-card-window"><article><h2>真实记录</h2><p>同一款彩妆在不同肤质、气候与上妆方法下都有不同表现。资料保留优点，也写下需要留意的部分。</p></article></div></div>
      <div className="culture-card-slot" style={{ '--card-order': 1 }}><div className="culture-card-window"><article><h2>适配推荐</h2><p>油光、毛孔、干纹和肤色都不是需要被纠正的缺点，而是帮助我们找到合适产品的线索。</p></article></div></div>
      <div className="culture-card-slot" style={{ '--card-order': 2 }}><div className="culture-card-window"><article><h2>做自己的编辑</h2><p>不必被热度和标准答案推着走。翻阅、比较、收藏，建立一份属于自己的彩妆清单。</p></article></div></div>
    </div>
    <div className="culture-closing"><div><p className="eyebrow">YASPRETTY BEAUTY ARCHIVE</p><h2>你的样子，不需要被改写。</h2><p>它值得被认真看见，也值得拥有适合它的彩妆。</p></div><button className="primary-action" onClick={() => onNavigate('library')}>浏览产品库 <ChevronRight size={16} /></button></div>
  </section>
}
