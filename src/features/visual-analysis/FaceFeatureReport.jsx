import ThirdsPlan from './ThirdsPlan'
import { FaceProductMatches } from './FaceProductMatches'
import { FEATURE_OPTIONS } from './faceFeatures'
import { buildFaceMakeupReport } from './faceMakeupReport'

export default function FaceFeatureReport({ features, thirds, thirdsStatus, overrides, onCorrect, onOpenProduct }) {
  const report = buildFaceMakeupReport(features)
  return <section className="face-feature-report" aria-labelledby="face-features-title">
    <header className="face-report-heading"><p className="eyebrow">YOUR MAKEUP NOTES</p><h2 id="face-features-title">从五官到妆容</h2><p>每个部位都有对应的手法与产品参考，调整选择，方案随之更新。</p></header>
    <div className="face-advice">
      {features.map((entry) => <article className="face-feature-row" key={entry.id} data-feature={entry.id}>
        <div className="face-feature-observation">
          <span className="face-feature-status">{String(entry.number).padStart(2, '0')} · {entry.status}</span>
          <h3>{entry.title}</h3><strong className="face-feature-value">{entry.value}</strong>
          <p>{entry.reason}</p>{entry.reference && <p className="face-feature-reference">参考：{entry.reference}</p>}
          <label className="face-feature-choice"><span>{entry.id === 'contour' ? '选择脸型' : `修正${entry.title}`}</span><select aria-label={entry.id === 'contour' ? '选择脸型' : `修正${entry.title}`} value={overrides[entry.id] ?? 'auto'} onChange={(e) => onCorrect(entry.id, e.target.value)}>
            <option value="auto">{entry.id === 'contour' ? '请选择（可跳过）' : '采用本次分析'}</option>
            {Object.entries(FEATURE_OPTIONS[entry.id]).map(([code, label]) => <option key={code} value={code}>{label}</option>)}
            {entry.id !== 'contour' && <><option value="unknown">暂不判断</option><option value="occluded">看不清或有遮挡</option></>}
          </select></label>
        </div>
        <div className="face-feature-plan" aria-label={`${entry.title}的妆容方案`}>
          {report.filter((step) => step.featureId === entry.id).map((step) => {
            return <section key={step.id} data-report-step={step.id}>
              <div className="face-makeup-step-title"><h3>{step.title}</h3><span>{step.source}</span></div>
              {step.style && <p className="face-look"><strong>推荐妆造</strong> {step.style}</p>}
              <p className="face-makeup-reason"><strong>适配理由</strong> {step.reason}</p>
              <p><strong>上妆手法</strong> {step.technique}</p>{step.finish && <p><strong>收尾检查</strong> {step.finish}</p>}
              <FaceProductMatches step={step} entry={entry} onOpenProduct={onOpenProduct} />
            </section>
          })}
        </div>
      </article>)}
      <ThirdsPlan data={thirds} status={thirdsStatus} omit={overrides.thirds === 'skip'} onToggle={() => onCorrect('thirds', overrides.thirds === 'skip' ? 'auto' : 'skip')} onOpenProduct={onOpenProduct} />
    </div>
    <p className="face-feature-note">形态名称来自照片上的几何估算，可随时修正；受遮挡或画质影响时仅提供基础手法。产品按方案用途从站内资料库匹配，尚未结合你的肤质、肤色、预算及个人偏好，色号需自行试色。点击产品可查看资料与注意事项。</p>
  </section>
}
