import { useState } from 'react'
import { ChevronDown, CircleAlert, Sparkles } from 'lucide-react'
import MakeupPlanForm from './MakeupPlanForm'
import './MakeupWorkbench.css'

const STATE_TEXT = { loading: '生成中', success: '已生成' }

export default function MakeupWorkbench({ form, status, error, update, togglePriority, createPlan }) {
  const [open, setOpen] = useState(false)
  const summary = [
    form.skinType !== 'unknown' ? form.skinType : '肤质待定',
    form.scene,
    form.budgetTotal ? `¥${form.budgetTotal} 内` : '不限预算',
  ].join(' · ')

  return (
    <section className={`makeup-workbench${open ? ' is-open' : ''}`} aria-labelledby="makeup-workbench-title">
      <button className="makeup-panel-toggle" type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <span>妆容条件</span>
        <small>{summary}</small>
        <ChevronDown size={16} />
      </button>
      <div className="makeup-workbench-body">
        <div className="makeup-panel-heading">
          <h2 id="makeup-workbench-title">妆容条件</h2>
          <span className="makeup-workbench-state">{STATE_TEXT[status] || '可调整'}</span>
        </div>
        <p className="makeup-panel-hint"><Sparkles size={12} />对话中提到的肤质、妆效和预算会自动填入，也可以直接点卡片调整。</p>
        <MakeupPlanForm form={form} status={status} update={update} togglePriority={togglePriority} createPlan={createPlan} />
        {status === 'error' && <div className="makeup-plan-error" role="alert"><CircleAlert size={16} />{error}</div>}
      </div>
    </section>
  )
}
