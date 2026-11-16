import {
  Bot,
  ChevronRight,
  LoaderCircle,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react'
import { useAssistant } from '../features/assistant/hooks/useAssistant'
import { products } from '../data/products'
import { pickShade } from '../features/assistant/assistantUtils'
import MakeupWorkbench from '../features/makeup-plan/components/MakeupWorkbench'

const quickPrompts = [
  '我是混油皮，想要柔雾通勤底妆',
  '请介绍一个美妆库里没有的护肤成分问题',
  '预算 400 元以内，想要高遮瑕',
  '帮我比较 NARS 超方瓶和雅诗兰黛持妆粉底液',
]

function ProfileSummary({ profile }) {
  const items = [
    ['肤质', profile.skin],
    ['妆效', profile.finish],
    ['场景', profile.scene],
    ['预算', profile.budget ? `${profile.budget} 元内` : ''],
    ['常用城市', profile.city],
  ].filter(([, value]) => value)

  return (
    <div className="xiaoy-profile">
      <div className="xiaoy-profile-title"><UserRound size={16} /><span>当前偏好</span></div>
      {items.length ? (
        <dl>{items.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      ) : <p>对话中提到的肤质、妆效、场景和预算会显示在这里。</p>}
    </div>
  )
}

function AssistantProduct({ product, profile, onOpenProduct }) {
  const shade = pickShade(product, profile)
  return (
    <button className="xiaoy-product" onClick={() => onOpenProduct(product)}>
      <img src={product.image} alt={`${product.brand} ${product.name}`} />
      <span className="xiaoy-product-copy">
        <small>{product.brand}</small>
        <b>{product.name}</b>
        <i>{shade.name} · {product.finish} · {product.priceLabel}</i>
      </span>
      <ChevronRight size={17} />
    </button>
  )
}

function SourceList({ sources }) {
  if (!sources?.length) return null
  return (
    <div className="xiaoy-sources">
      <span>参考来源</span>
      {sources.map((source, index) => (
        <a key={`${source.url}-${index}`} href={source.url} target="_blank" rel="noreferrer">
          <b>[{index + 1}]</b>{source.title}<ChevronRight size={14} />
        </a>
      ))}
    </div>
  )
}

export default function XiaoYAssistant({ onOpenProduct }) {
  const { messages, profile, input, setInput, busy, mode, activeModel, activity, messageEndRef, profileTags, sendMessage, resetConversation } = useAssistant()

  return (
    <section className="xiaoy-page content-section">
      <div className="xiaoy-heading">
        <div>
          <p className="eyebrow"><Sparkles size={14} /> YASPRETTY AI BEAUTY ADVISOR</p>
          <h1>和小Y一起，找到适合你的底妆。</h1>
          <p>从肤质、妆效、场景和预算出发，只推荐资料库中能够说明依据的产品。</p>
        </div>
        <div className="xiaoy-heading-actions">
          <span className={`xiaoy-mode ${mode}`}>{mode === 'weather' ? '天气数据' : mode === 'web' ? '联网思考' : mode === 'knowledge' ? activeModel ? `${activeModel} · 知识库` : '知识库参考' : mode === 'ai' ? activeModel || 'AI 对话' : mode === 'local' ? '资料库推荐' : mode === 'tool' ? '实时工具' : mode === 'error' ? '连接异常' : '已就绪'}</span>
          <button onClick={resetConversation} aria-label="重新开始" title="重新开始"><RefreshCw size={18} /></button>
        </div>
      </div>

      <MakeupWorkbench profile={profile} onOpenProduct={onOpenProduct} />

      <div className="xiaoy-layout">
        <aside className="xiaoy-sidebar">
          <div className="xiaoy-avatar"><span>Y</span><div><b>小Y</b><small>YasPretty Beauty Advisor</small></div></div>
          <ProfileSummary profile={profile} />
          <div className="xiaoy-privacy"><ShieldCheck size={17} /><p><b>你的偏好由你掌控</b><span>当前记录仅保存在本机浏览器，可通过“重新开始”清除。</span></p></div>
          <p className="xiaoy-profile-count">已记录 {profileTags} 项偏好</p>
        </aside>

        <div className="xiaoy-chat">
          <div className="xiaoy-messages" aria-live="polite">
            {messages.map((message) => (
              <article key={message.id} className={`xiaoy-message ${message.role}`}>
                <span className="xiaoy-message-icon">{message.role === 'assistant' ? <Bot size={17} /> : <UserRound size={17} />}</span>
                <div className="xiaoy-message-body">
                  <p>{message.content}</p>
                  {message.productIds?.length > 0 && (
                    <div className="xiaoy-products">
                      {message.productIds.map((id) => {
                        const product = products.find((item) => item.id === id)
                        return product ? <AssistantProduct key={id} product={product} profile={profile} onOpenProduct={onOpenProduct} /> : null
                      })}
                    </div>
                  )}
                  <SourceList sources={message.sources} />
                </div>
              </article>
            ))}
            {busy && <article className="xiaoy-message assistant loading"><span className="xiaoy-message-icon"><Bot size={17} /></span><div className="xiaoy-message-body"><p><LoaderCircle size={16} />{activity}</p></div></article>}
            <div ref={messageEndRef} />
          </div>

          {messages.length === 1 && <div className="xiaoy-prompts">{quickPrompts.map((prompt) => <button key={prompt} onClick={() => sendMessage(prompt)}>{prompt}<ChevronRight size={15} /></button>)}</div>}

          <form className="xiaoy-composer" onSubmit={(event) => { event.preventDefault(); sendMessage(input) }}>
            <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="例如：我是混油皮，想找 500 元内的通勤底妆" aria-label="向小Y描述你的需求" disabled={busy} />
            <button type="submit" disabled={busy || !input.trim()} aria-label="发送" title="发送"><Send size={18} /></button>
          </form>
          <p className="xiaoy-disclaimer">推荐用于缩小选择范围，不替代线下试色或专业皮肤诊断。</p>
        </div>
      </div>
    </section>
  )
}
