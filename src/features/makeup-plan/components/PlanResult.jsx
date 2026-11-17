import { useMemo } from 'react'
import { Check, CircleAlert } from 'lucide-react'
import { products } from '../../../data/products'
import PlanProduct from './PlanProduct'

export default function PlanResult({ plan, onOpenProduct }) {
  const evidenceProducts = useMemo(() => plan.candidateEvidence
    .map((evidence) => ({ evidence, product: products.find((item) => item.id === evidence.productId) }))
    .filter(({ product }) => product), [plan])

  return (
    <div className="makeup-plan-result" data-testid="makeup-plan-result">
      <div className="makeup-plan-result-heading">
        <div><p className="eyebrow"><Check size={14} /> PLAN READY</p><h2>{plan.title}</h2><p>{plan.summary}</p></div>
        <span className={`makeup-plan-source ${plan.sourceMode}`}>{plan.sourceMode === 'model' ? '结构化模型' : '本地规则降级'}</span>
      </div>
      <div className="makeup-plan-meta"><span>方案置信度 {Math.round(plan.confidence * 100)}%</span><span>{plan.inputsSnapshot.makeupRequest.scene} · {plan.inputsSnapshot.makeupRequest.wearHours} 小时带妆</span><span>{plan.externalContextSummary}</span></div>
      <div className="makeup-plan-steps">
        {plan.steps.map((step, index) => (
          <article className="makeup-plan-step" key={step.id}>
            <div className="makeup-plan-step-index">0{index + 1}</div>
            <div className="makeup-plan-step-content">
              <div className="makeup-plan-step-title"><div><span>{step.category}</span><h3>{step.goal}</h3></div><small>{step.texture}</small></div>
              <p>{step.technique}</p>
              <div className="makeup-plan-detail"><span>颜色方向</span><b>{step.colorDirection}</b></div>
              {step.primaryProductId && <div className="makeup-plan-products"><PlanProduct id={step.primaryProductId} onOpenProduct={onOpenProduct} />{step.alternativeProductIds.map((id) => <PlanProduct key={id} id={id} onOpenProduct={onOpenProduct} />)}</div>}
              <div className="makeup-plan-reasons"><span>依据</span>{step.reasons.map((reason) => <i key={reason}>{reason}</i>)}</div>
              {step.cautions.length > 0 && <div className="makeup-plan-cautions"><CircleAlert size={14} />{step.cautions.join('；')}</div>}
            </div>
          </article>
        ))}
      </div>
      {evidenceProducts.length > 0 && <details className="makeup-plan-evidence"><summary>查看候选筛选依据（{evidenceProducts.length}）</summary><div>{evidenceProducts.map(({ evidence, product }) => <article key={evidence.productId}><b>{product.brand} {product.name}</b><span>{Math.round(evidence.score)} 分</span><p>{evidence.matchedConditions.join('；') || '通过基础条件'}{evidence.tradeoffs.length ? `。取舍：${evidence.tradeoffs.join('；')}` : ''}</p></article>)}</div></details>}
      <div className="makeup-plan-limitations"><strong>边界与限制</strong>{plan.limitations.map((item) => <p key={item}>{item}</p>)}</div>
    </div>
  )
}
