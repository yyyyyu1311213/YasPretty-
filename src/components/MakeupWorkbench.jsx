import { useEffect, useMemo, useState } from 'react'
import { Check, ChevronRight, CircleAlert, LoaderCircle, Sparkles } from 'lucide-react'
import { finishOptions, products, skinOptions } from '../data/products'

const PLAN_ENDPOINT = '/api/makeup-plans'
const SCENES = ['日常', '通勤', '约会', '拍照', '夏季', '秋冬', '长时间带妆', '答辩']
const STYLES = ['自然', '清透', '柔雾', '氛围', '精致']
const PRIORITIES = ['轻薄', '持妆', '遮瑕', '控油', '保湿', '快速完成']

const DEFAULT_FORM = {
  skinType: 'unknown',
  undertone: 'unknown',
  finish: '自然光泽',
  budgetTotal: '',
  skillLevel: '新手',
  scene: '日常',
  style: '自然',
  wearHours: 8,
  timeOfDay: '白天',
  weatherEnabled: false,
  priorities: ['轻薄'],
}

function legacyToForm(profile = {}) {
  return {
    ...DEFAULT_FORM,
    skinType: skinOptions.includes(profile.skin) ? profile.skin : DEFAULT_FORM.skinType,
    finish: finishOptions.includes(profile.finish) ? profile.finish : DEFAULT_FORM.finish,
    budgetTotal: profile.budget ? String(profile.budget) : '',
  }
}

function toPlanPayload(form) {
  return {
    userProfile: {
      skinType: form.skinType || 'unknown',
      skinTypeSource: form.skinType && form.skinType !== 'unknown' ? 'self_reported' : 'unknown',
      undertone: form.undertone || 'unknown',
      finishPreferences: form.finish ? [form.finish] : [],
      concerns: [],
      budgetTotal: form.budgetTotal ? Number(form.budgetTotal) : 0,
      skillLevel: form.skillLevel || 'unknown',
      excludedBrands: [],
      sensitivities: [],
      city: '',
    },
    makeupRequest: {
      scene: form.scene,
      style: form.style,
      wearHours: Number(form.wearHours),
      timeOfDay: form.timeOfDay,
      weatherEnabled: form.weatherEnabled,
      photoEnabled: false,
      priorities: form.priorities,
    },
  }
}

function PlanProduct({ id, onOpenProduct }) {
  const product = products.find((item) => item.id === id)
  if (!product) return null
  return (
    <button type="button" className="makeup-plan-product" onClick={() => onOpenProduct(product)}>
      <span><b>{product.brand}</b>{product.name}</span>
      <small>{product.category} · {product.finish} · {product.price == null ? '价格待核验' : product.priceVerifiedAt ? `参考价 ${product.price} 元（核验于 ${product.priceVerifiedAt}）` : `参考价 ${product.price} 元（价格待核验）`}</small>
      <ChevronRight size={15} />
    </button>
  )
}

function PlanResult({ plan, onOpenProduct }) {
  const evidenceProducts = useMemo(() => plan.candidateEvidence
    .map((evidence) => ({ evidence, product: products.find((item) => item.id === evidence.productId) }))
    .filter(({ product }) => product), [plan])

  return (
    <div className="makeup-plan-result" data-testid="makeup-plan-result">
      <div className="makeup-plan-result-heading">
        <div><p className="eyebrow"><Check size={14} /> PLAN READY</p><h2>{plan.title}</h2><p>{plan.summary}</p></div>
        <span className={`makeup-plan-source ${plan.sourceMode}`}>{plan.sourceMode === 'model' ? '结构化模型' : '本地规则降级'}</span>
      </div>
      <div className="makeup-plan-meta"><span>方案置信度 {Math.round(plan.confidence * 100)}%</span><span>{plan.inputsSnapshot.makeupRequest.scene} · {plan.inputsSnapshot.makeupRequest.wearHours} 小时带妆</span><span>{plan.weatherAdjustment}</span></div>
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

export default function MakeupWorkbench({ profile, onOpenProduct }) {
  const [form, setForm] = useState(() => legacyToForm(profile))
  const [plan, setPlan] = useState(null)
  const [status, setStatus] = useState('ready')
  const [error, setError] = useState('')

  useEffect(() => {
    setForm((current) => ({ ...current, ...legacyToForm(profile) }))
  }, [profile?.skin, profile?.finish, profile?.budget])

  function update(name, value) {
    setForm((current) => ({ ...current, [name]: value }))
  }

  function togglePriority(value) {
    setForm((current) => ({
      ...current,
      priorities: current.priorities.includes(value)
        ? current.priorities.filter((item) => item !== value)
        : [...current.priorities, value].slice(0, 4),
    }))
  }

  async function createPlan(event) {
    event.preventDefault()
    setStatus('loading')
    setError('')
    try {
      const response = await fetch(PLAN_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toPlanPayload(form)),
      })
      const data = await response.json().catch(() => null)
      if (!response.ok || !data?.plan) throw new Error(data?.error?.message || `方案生成失败（${response.status}）`)
      setPlan(data.plan)
      setStatus('success')
    } catch (requestError) {
      setStatus('error')
      setError(requestError.message || '方案服务暂时不可用。')
    }
  }

  return (
    <section className="makeup-workbench" aria-labelledby="makeup-workbench-title">
      <div className="makeup-workbench-heading"><div><p className="eyebrow"><Sparkles size={14} /> MAKEUP PLAN WORKBENCH</p><h2 id="makeup-workbench-title">先建立你的妆容条件</h2><p>不上传照片也可以完成方案。照片辅助和视觉分析不在本阶段。</p></div><span className="makeup-workbench-state">{status === 'success' ? '已生成' : status === 'loading' ? '生成中' : '结构化采集'}</span></div>
      <form className="makeup-workbench-form" onSubmit={createPlan}>
        <label>肤质<select value={form.skinType} onChange={(event) => update('skinType', event.target.value)}><option value="unknown">暂不确定</option>{skinOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>色调倾向<select value={form.undertone} onChange={(event) => update('undertone', event.target.value)}><option value="unknown">暂不确定</option><option>冷调</option><option>中性调</option><option>暖调</option></select></label>
        <label>妆效<select value={form.finish} onChange={(event) => update('finish', event.target.value)}>{finishOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>场景<select value={form.scene} onChange={(event) => update('scene', event.target.value)}>{SCENES.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>风格<select value={form.style} onChange={(event) => update('style', event.target.value)}>{STYLES.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>预算上限（元）<input type="number" min="0" max="100000" step="1" placeholder="不设上限" value={form.budgetTotal} onChange={(event) => update('budgetTotal', event.target.value)} /></label>
        <label>预计带妆<select value={form.wearHours} onChange={(event) => update('wearHours', event.target.value)}>{[4, 6, 8, 10, 12].map((item) => <option key={item} value={item}>{item} 小时</option>)}</select></label>
        <label>熟练度<select value={form.skillLevel} onChange={(event) => update('skillLevel', event.target.value)}><option>新手</option><option>熟练</option><option>进阶</option></select></label>
        <fieldset><legend>优先目标</legend><div className="makeup-priority-list">{PRIORITIES.map((item) => <label key={item}><input type="checkbox" checked={form.priorities.includes(item)} onChange={() => togglePriority(item)} />{item}</label>)}</div></fieldset>
        <label className="makeup-weather-toggle"><input type="checkbox" checked={form.weatherEnabled} onChange={(event) => update('weatherEnabled', event.target.checked)} />生成时保留天气调整位</label>
        <button className="makeup-plan-submit" type="submit" disabled={status === 'loading'}>{status === 'loading' ? <LoaderCircle size={17} /> : <Sparkles size={17} />}创建我的妆容方案</button>
      </form>
      {status === 'error' && <div className="makeup-plan-error" role="alert"><CircleAlert size={16} />{error}</div>}
      {plan && <PlanResult plan={plan} onOpenProduct={onOpenProduct} />}
    </section>
  )
}

export { DEFAULT_FORM, legacyToForm, toPlanPayload }
