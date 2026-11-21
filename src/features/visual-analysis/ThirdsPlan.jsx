
import { describeThirds } from './faceThirds'
import { FaceProductMatches } from './FaceProductMatches'

export default function ThirdsPlan({ data, status, omit, onToggle, onOpenProduct }) {

  const analysis = describeThirds(data)
  return <article className="face-feature-row" data-feature="thirds">
    <div className="face-feature-observation">
      <span className="face-feature-status">比例参考</span><h3>三庭比例</h3>
      {analysis && !omit ? <><div className="face-thirds-values">{['上庭','中庭','下庭'].map((s,i) => <span key={s}>{s}<b>{Math.round(analysis.shares[i]*1000)/10}%</b></span>)}</div>
        <p>按可见发际线、眉间、鼻底到下巴的纵向距离估算。</p></>
        : <p>{status.detail}</p>}
      {analysis && <button type="button" className="face-button face-button--quiet" onClick={onToggle}>{omit ? '恢复比例参考' : '发际线不贴合，跳过此项'}</button>}
    </div>
    <div className="face-feature-plan"><h3>面部纵向布局</h3>
      {analysis && !omit ? <>{analysis.notes.map(([label, technique]) => <section key={label}><strong>{label}</strong><p>{technique}</p></section>)}
        <FaceProductMatches step={{ id: 'thirds', title: '纵向布局', categories: [...new Set(analysis.notes.map(n => n[2]))] }} entry={{ source: 'geometry' }} onOpenProduct={onOpenProduct} /></>
        : <p>本次不按三庭分配明暗和腮红位置。</p>}
    </div>
  </article>
}
