import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import './GuideView.css'

const guides = [
  { title: '油皮 / 混油皮', text: '优先看成膜速度、控油度和 8 小时以上持妆表现。', tags: ['柔雾', '哑光', '8h+'], filter: { skins: ['油皮'], minWear: 8 }, image: '/assets/skin-guide/oily-skin.jpg' },
  { title: '干皮 / 混干皮', text: '在遮瑕度之外，留意保湿度与卡粉风险的评分。', tags: ['奶油肌', '自然光泽', '低卡粉'], filter: { skins: ['干皮'] }, image: '/assets/skin-guide/dry-skin.jpg' },
  { title: '想要镜头感', text: '选毛孔修饰优秀的柔雾底妆，拍照时层次会更干净。', tags: ['高遮瑕', '毛孔修饰', '拍照'], filter: { scene: '拍照' }, image: '/assets/skin-guide/camera-ready-skin.jpg' },
]

export default function GuideView({ onApplyFilter }) {
  const introRef = useRef(null)
  const listRef = useRef(null)
  const [introEntered, setIntroEntered] = useState(false)
  const [cardsEntered, setCardsEntered] = useState(false)

  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      setIntroEntered(true)
      setCardsEntered(true)
      return undefined
    }
    const introObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIntroEntered(true)
        introObserver.disconnect()
      }
    }, { threshold: 0.25 })
    const cardsObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setCardsEntered(true)
        cardsObserver.disconnect()
      }
    }, { threshold: 0.3 })
    introObserver.observe(introRef.current)
    cardsObserver.observe(listRef.current)
    return () => {
      introObserver.disconnect()
      cardsObserver.disconnect()
    }
  }, [])

  function moveReveal(event) {
    if (event.pointerType !== 'mouse') return
    const card = event.currentTarget
    const bounds = card.getBoundingClientRect()
    card.style.setProperty('--reveal-x', `${event.clientX - bounds.left}px`)
    card.style.setProperty('--reveal-y', `${event.clientY - bounds.top}px`)
  }

  return (
    <section className="skin-guide" data-intro-entered={introEntered} data-cards-entered={cardsEntered} aria-labelledby="skin-guide-title">
      <div className="skin-guide__inner">
        <header ref={introRef} className="skin-guide__intro">
          <div className="skin-guide__intro-heading">
            <p className="skin-guide__eyebrow">YASPRETTY / SKIN GUIDE</p>
            <h2 id="skin-guide-title">先读懂皮肤，<br />再挑底妆。</h2>
          </div>
          <p className="skin-guide__intro-copy">这里的建议只帮助你建立筛选方向。上妆习惯、气候与妆前产品，也会改变最后的表现。</p>
        </header>
        <div ref={listRef} className="skin-guide__list">
          {guides.map((guide, index) => (
            <article key={guide.title} className="skin-guide__card" style={{ '--card-index': index }} onPointerMove={moveReveal}>
              <img className="skin-guide__image" src={guide.image} alt="" loading="lazy" aria-hidden="true" />
              <span className="skin-guide__number">0{index + 1}</span>
              <div className="skin-guide__content">
                <h3>{guide.title}</h3>
                <p>{guide.text}</p>
                <div className="skin-guide__tags">{guide.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                <button type="button" onClick={() => onApplyFilter(guide.filter)}>按此筛选 <ArrowUpRight size={17} /></button>
              </div>
            </article>
          ))}
        </div>
        <p className="skin-guide__credits">图片仅作视觉示意。<a href="https://commons.wikimedia.org/wiki/File:Beautiful_Woman_is_Asian_Looking.jpg" target="_blank" rel="noreferrer">《Beautiful Woman is Asian Looking》· epSos.de</a>、<a href="https://commons.wikimedia.org/wiki/File:Woman_applying_serum_on_her_face_closeup.jpg" target="_blank" rel="noreferrer">《Woman applying serum on her face closeup》· Shixart1985</a>、<a href="https://commons.wikimedia.org/wiki/File:Woman_applying_makeup_with_a_brush_closeup.jpg" target="_blank" rel="noreferrer">《Woman applying makeup with a brush closeup》· Shixart1985</a>，均为 <a href="https://creativecommons.org/licenses/by/2.0/" target="_blank" rel="noreferrer">CC BY 2.0</a>；首张照片已裁切。</p>
      </div>
    </section>
  )
}
