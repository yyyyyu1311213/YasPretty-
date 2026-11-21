import { useEffect, useRef } from 'react'
import { LoaderCircle, Sparkles } from 'lucide-react'
import { finishOptions, skinOptions } from '../../../data/products'

const SCENES = ['日常', '通勤', '约会', '拍照', '夏季', '秋冬', '长时间带妆', '答辩']
const STYLES = ['自然', '清透', '柔雾', '氛围', '精致']
const PRIORITIES = ['轻薄', '持妆', '遮瑕', '控油', '保湿', '快速完成']

function ConditionCard({ label, value, children }) {
  const ref = useRef(null)
  const previous = useRef(value)

  useEffect(() => {
    if (previous.current !== value && ref.current) {
      const card = ref.current
      card.classList.remove('condition-card--flash')
      void card.offsetWidth
      card.classList.add('condition-card--flash')
    }
    previous.current = value
  }, [value])

  return <label className="condition-card" ref={ref}><span className="condition-card-label">{label}</span>{children}</label>
}

export default function MakeupPlanForm({ form, status, update, togglePriority, createPlan }) {
  return (
    <form className="makeup-panel-form" onSubmit={createPlan}>
      <div className="makeup-condition-grid">
        <ConditionCard label="肤质" value={form.skinType}><select value={form.skinType} onChange={(event) => update('skinType', event.target.value)}><option value="unknown">暂不确定</option>{skinOptions.map((item) => <option key={item}>{item}</option>)}</select></ConditionCard>
        <ConditionCard label="色调倾向" value={form.undertone}><select value={form.undertone} onChange={(event) => update('undertone', event.target.value)}><option value="unknown">暂不确定</option><option>冷调</option><option>中性调</option><option>暖调</option></select></ConditionCard>
        <ConditionCard label="妆效" value={form.finish}><select value={form.finish} onChange={(event) => update('finish', event.target.value)}>{finishOptions.map((item) => <option key={item}>{item}</option>)}</select></ConditionCard>
        <ConditionCard label="场景" value={form.scene}><select value={form.scene} onChange={(event) => update('scene', event.target.value)}>{SCENES.map((item) => <option key={item}>{item}</option>)}</select></ConditionCard>
        <ConditionCard label="风格" value={form.style}><select value={form.style} onChange={(event) => update('style', event.target.value)}>{STYLES.map((item) => <option key={item}>{item}</option>)}</select></ConditionCard>
        <ConditionCard label="预算上限（元）" value={form.budgetTotal}><input type="number" min="0" max="100000" step="1" placeholder="不设上限" value={form.budgetTotal} onChange={(event) => update('budgetTotal', event.target.value)} /></ConditionCard>
        <ConditionCard label="预计带妆" value={form.wearHours}><select value={form.wearHours} onChange={(event) => update('wearHours', event.target.value)}>{[4, 6, 8, 10, 12].map((item) => <option key={item} value={item}>{item} 小时</option>)}</select></ConditionCard>
        <ConditionCard label="熟练度" value={form.skillLevel}><select value={form.skillLevel} onChange={(event) => update('skillLevel', event.target.value)}><option>新手</option><option>熟练</option><option>进阶</option></select></ConditionCard>
      </div>
      <div className="makeup-priority-group">
        <span className="condition-card-label">优先目标（最多 4 项）</span>
        <div className="makeup-priority-list" role="group" aria-label="优先目标">
          {PRIORITIES.map((item) => {
            const active = form.priorities.includes(item)
            return <button type="button" key={item} className={`makeup-chip${active ? ' is-active' : ''}`} aria-pressed={active} onClick={() => togglePriority(item)}>{item}</button>
          })}
        </div>
      </div>
      <button className="makeup-plan-submit" type="submit" disabled={status === 'loading'}>{status === 'loading' ? <LoaderCircle size={17} /> : <Sparkles size={17} />}创建我的妆容方案</button>
    </form>
  )
}
