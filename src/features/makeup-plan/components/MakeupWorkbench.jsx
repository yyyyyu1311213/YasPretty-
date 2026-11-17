import { CircleAlert, Sparkles } from 'lucide-react'
import MakeupPlanForm from './MakeupPlanForm'
import PlanResult from './PlanResult'
import { useMakeupPlan } from '../hooks/useMakeupPlan'
import './MakeupWorkbench.css'

export default function MakeupWorkbench({ profile, onOpenProduct }) {
  const { form, plan, status, error, update, togglePriority, createPlan } = useMakeupPlan(profile)

  return (
    <section className="makeup-workbench" aria-labelledby="makeup-workbench-title">
      <div className="makeup-workbench-heading"><div><p className="eyebrow"><Sparkles size={14} /> MAKEUP PLAN WORKBENCH</p><h2 id="makeup-workbench-title">先建立你的妆容条件</h2><p>不上传照片也可以完成方案。照片辅助和视觉分析不在本阶段。</p></div><span className="makeup-workbench-state">{status === 'success' ? '已生成' : status === 'loading' ? '生成中' : '结构化采集'}</span></div>
      <MakeupPlanForm form={form} status={status} update={update} togglePriority={togglePriority} createPlan={createPlan} />
      {status === 'error' && <div className="makeup-plan-error" role="alert"><CircleAlert size={16} />{error}</div>}
      {plan && <PlanResult plan={plan} onOpenProduct={onOpenProduct} />}
    </section>
  )
}
