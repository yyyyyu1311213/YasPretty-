import { LoaderCircle, Sparkles } from 'lucide-react'
import { finishOptions, skinOptions } from '../../../data/products'

const SCENES = ['日常', '通勤', '约会', '拍照', '夏季', '秋冬', '长时间带妆', '答辩']
const STYLES = ['自然', '清透', '柔雾', '氛围', '精致']
const PRIORITIES = ['轻薄', '持妆', '遮瑕', '控油', '保湿', '快速完成']

export default function MakeupPlanForm({ form, status, update, togglePriority, createPlan }) {
  return (
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
      <button className="makeup-plan-submit" type="submit" disabled={status === 'loading'}>{status === 'loading' ? <LoaderCircle size={17} /> : <Sparkles size={17} />}创建我的妆容方案</button>
    </form>
  )
}
