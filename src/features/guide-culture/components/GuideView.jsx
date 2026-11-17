import { ChevronRight } from 'lucide-react'

export default function GuideView({ onApplyFilter }) {
  const guides = [
    { title: '油皮 / 混油皮', text: '优先看成膜速度、控油度和 8 小时以上持妆表现。', tags: ['柔雾', '哑光', '8h+'], filter: { skins: ['油皮'], minWear: 8 } },
    { title: '干皮 / 混干皮', text: '在遮瑕度之外，留意保湿度与卡粉风险的评分。', tags: ['奶油肌', '自然光泽', '低卡粉'], filter: { skins: ['干皮'] } },
    { title: '想要镜头感', text: '选毛孔修饰优秀的柔雾底妆，拍照时层次会更干净。', tags: ['高遮瑕', '毛孔修饰', '拍照'], filter: { scene: '拍照' } },
  ]
  return <section className="guide-page content-section"><div className="guide-intro"><p className="eyebrow">肤质指南</p><h1>先读懂皮肤，再挑底妆。</h1><p>这里的建议只帮助你建立筛选方向。上妆习惯、气候与妆前产品，也会改变最后的表现。</p></div><div className="guide-list">{guides.map((guide, index) => <article key={guide.title} className="guide-card"><span>0{index + 1}</span><h2>{guide.title}</h2><p>{guide.text}</p><div>{guide.tags.map((tag) => <i key={tag}>{tag}</i>)}</div><button onClick={() => onApplyFilter(guide.filter)}>按此筛选 <ChevronRight size={16} /></button></article>)}</div></section>
}
