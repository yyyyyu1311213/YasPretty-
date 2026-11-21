import {
  ChevronRight,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { useEffect, useRef } from 'react'
import AssistantMessages from './AssistantMessages'
import ProfileSummary from './ProfileSummary'
import { useAssistant } from '../hooks/useAssistant'
import MakeupWorkbench from '../../makeup-plan/components/MakeupWorkbench'
import PlanResult from '../../makeup-plan/components/PlanResult'
import { useMakeupPlan } from '../../makeup-plan/hooks/useMakeupPlan'
import '../assistant.css'

const quickPrompts = [
  '我是混油皮，想要柔雾通勤底妆',
  '请介绍一个美妆库里没有的护肤成分问题',
  '预算 400 元以内，想要高遮瑕',
  '帮我比较 NARS 超方瓶和雅诗兰黛持妆粉底液',
]

export default function XiaoYAssistant({ onOpenProduct }) {
  const { messages, profile, input, setInput, busy, mode, activeModel, activity, messageEndRef, profileTags, sendMessage, resetConversation } = useAssistant()
  const { form, plan, status: planStatus, error: planError, update, togglePriority, createPlan } = useMakeupPlan(profile)
  const planSectionRef = useRef(null)

  useEffect(() => {
    if (plan && planStatus === 'success') {
      planSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [plan, planStatus])

  return (
    <section className="xiaoy-page content-section">
      <div className="xiaoy-heading">
        <div>
          <p className="eyebrow"><Sparkles size={14} /> YASPRETTY AI BEAUTY ADVISOR</p>
          <h1>和小Y一起，找到适合你的底妆。</h1>
          <p>直接用一句话告诉小Y 你的肤质、妆效、场景和预算，识别到的条件会自动同步到条件卡；也可以随时手动调整。</p>
        </div>
        <div className="xiaoy-heading-actions">
          <span className={`xiaoy-mode ${mode}`}>{mode === 'weather' ? '天气数据' : mode === 'web' ? '联网思考' : mode === 'knowledge' ? activeModel ? `${activeModel} · 知识库` : '知识库参考' : mode === 'ai' ? activeModel || 'AI 对话' : mode === 'local' ? '资料库推荐' : mode === 'tool' ? '实时工具' : mode === 'error' ? '连接异常' : '已就绪'}</span>
          <button onClick={resetConversation} aria-label="重新开始" title="重新开始"><RefreshCw size={18} /></button>
        </div>
      </div>

      <div className="xiaoy-layout">
        <aside className="xiaoy-sidebar">
          <div className="xiaoy-avatar"><span>Y</span><div><b>小Y</b><small>YasPretty Beauty Advisor</small></div></div>
          <div className="xiaoy-profile-group">
            <ProfileSummary profile={profile} />
            <p className="xiaoy-profile-count">已记录 {profileTags} 项偏好</p>
          </div>
          <div className="xiaoy-privacy"><ShieldCheck size={17} /><p><b>你的偏好由你掌控</b><span>当前记录仅保存在本机浏览器，可通过“重新开始”清除。</span></p></div>
        </aside>

        <MakeupWorkbench form={form} status={planStatus} error={planError} update={update} togglePriority={togglePriority} createPlan={createPlan} />

        <div className="xiaoy-main">
          <div className="xiaoy-chat">
            <AssistantMessages messages={messages} profile={profile} busy={busy} activity={activity} messageEndRef={messageEndRef} onOpenProduct={onOpenProduct} />

            {messages.length === 1 && <div className="xiaoy-prompts">{quickPrompts.map((prompt) => <button key={prompt} onClick={() => sendMessage(prompt)}>{prompt}<ChevronRight size={15} /></button>)}</div>}

            <form className="xiaoy-composer" onSubmit={(event) => { event.preventDefault(); sendMessage(input) }}>
              <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="例如：我是混油皮，想找 500 元内的通勤底妆" aria-label="向小Y描述你的需求" disabled={busy} />
              <button type="submit" disabled={busy || !input.trim()} aria-label="发送" title="发送"><Send size={18} /></button>
            </form>
            <p className="xiaoy-disclaimer">推荐用于缩小选择范围，不替代线下试色或专业皮肤诊断。</p>
          </div>

          {plan && (
            <section className="xiaoy-plan-section" ref={planSectionRef} aria-label="生成的妆容方案">
              <PlanResult plan={plan} onOpenProduct={onOpenProduct} />
            </section>
          )}
        </div>
      </div>
    </section>
  )
}
