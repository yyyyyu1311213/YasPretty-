import { useEffect, useMemo, useRef, useState } from 'react'
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
import { products } from '../data/products'
import { detectIntent, needsOnlineResearch } from '../features/assistant/intentUtils'
import {
  cleanErrorMessage,
  extractProfile,
  formatPlanReply,
  localMakeupReply,
  localReply,
  parseAssistantResult,
  pickShade,
  planPayloadFromConversation,
} from '../features/assistant/assistantUtils'
import { clearLegacyCredentials } from '../lib/storage/clearUserData'
import { readVersioned } from '../lib/storage/migrations'
import { writeVersioned } from '../lib/storage/storageClient'
import { LEGACY_MESSAGES_KEY, LEGACY_PROFILE_KEY, MESSAGES_KEY, PROFILE_KEY } from '../lib/storage/storageKeys'
import { requestMakeupPlan as requestPlan } from '../features/makeup-plan/makeupPlanApi'
import MakeupWorkbench from '../features/makeup-plan/components/MakeupWorkbench'

const ASSISTANT_ENDPOINT = '/api/assistant'

const welcomeMessage = {
  id: 'welcome',
  role: 'assistant',
  content: '嗨，我是小Y。告诉我你的肤质、喜欢的妆效和使用场景，我会从 YasPretty 产品库里给出有依据的选择。',
  productIds: [],
}

const quickPrompts = [
  '我是混油皮，想要柔雾通勤底妆',
  '请介绍一个美妆库里没有的护肤成分问题',
  '预算 400 元以内，想要高遮瑕',
  '帮我比较 NARS 超方瓶和雅诗兰黛持妆粉底液',
]

function createMessage(role, content, productIds = [], sources = []) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    productIds,
    sources,
  }
}

async function requestAssistant({ text, messages, profile }) {
  const response = await fetch(ASSISTANT_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: text,
      profile,
      messages: messages.slice(-8).map((message) => ({ role: message.role, content: message.content })),
    }),
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    const error = new Error(data?.error?.message || `请求失败（${response.status}）`)
    error.code = data?.error?.code || 'REQUEST_FAILED'
    throw error
  }
  if (!data?.answer) throw new Error('智能服务没有返回内容')
  return {
    ...parseAssistantResult(data.answer),
    sources: data.sources || [],
    answerMode: data.answerMode || 'model',
    model: data.model || '',
  }
}

async function requestMakeupPlan({ text, profile }) {
  const plan = await requestPlan(planPayloadFromConversation(text, profile))
  return formatPlanReply(plan)
}

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
  const [messages, setMessages] = useState(() => readVersioned(MESSAGES_KEY, LEGACY_MESSAGES_KEY, [welcomeMessage]))
  const [profile, setProfile] = useState(() => readVersioned(PROFILE_KEY, LEGACY_PROFILE_KEY, {}))
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [mode, setMode] = useState('ready')
  const [activeModel, setActiveModel] = useState('')
  const [activity, setActivity] = useState('小Y正在识别需求并查询...')
  const messageEndRef = useRef(null)

  useEffect(() => {
    clearLegacyCredentials()
  }, [])

  useEffect(() => {
    writeVersioned(PROFILE_KEY, profile)
  }, [profile])

  useEffect(() => {
    writeVersioned(MESSAGES_KEY, messages.slice(-20))
  }, [messages])

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [messages, busy])

  const profileTags = useMemo(() => Object.values(profile).filter(Boolean).length, [profile])

  async function sendMessage(value) {
    const text = value.trim()
    if (!text || busy) return
    const intent = detectIntent(text, profile)
    const onlineResearch = needsOnlineResearch(text, intent)
    let nextProfile = extractProfile(text, profile)
    const userMessage = createMessage('user', text)
    setInput('')
    setProfile(nextProfile)
    setMessages((current) => [...current, userMessage])
    setBusy(true)

    try {
      if (intent === 'makeup_plan' && !onlineResearch) {
        setActivity('正在生成可调整的妆容方案...')
        const result = await requestMakeupPlan({ text, profile: nextProfile })
        setMessages((current) => [...current, createMessage('assistant', result.text, result.productIds)])
        setMode(result.sourceMode === 'model' ? 'ai' : 'local')
        setActiveModel(result.sourceMode === 'model' ? 'glm-5.3-flash' : '')
        return
      }

      if (intent === 'catalog_recommendation' || intent === 'product_comparison' || intent === 'greeting_help') {
        if (onlineResearch) {
          setActivity('正在联网检索相关资料...')
          const result = await requestAssistant({ text, messages, profile: nextProfile })
          setMessages((current) => [...current, createMessage('assistant', result.text, result.productIds, result.sources)])
          setMode('web')
          setActiveModel(result.model)
          return
        }
        const result = localReply(text, nextProfile)
        setMessages((current) => [...current, createMessage('assistant', result.text, result.products.map((product) => product.id))])
        setMode('local')
        setActiveModel('')
        return
      }

      setActivity(onlineResearch ? '正在联网检索相关资料...' : '小Y正在组织回答...')
      const result = await requestAssistant({ text, messages, profile: nextProfile })
      setMessages((current) => [...current, createMessage('assistant', result.text, result.productIds, result.sources)])
      setMode(result.answerMode === 'weather' || result.sources.some((source) => source.kind === 'weather')
        ? 'weather'
        : result.sources.some((source) => source.kind === 'web') ? 'web' : result.answerMode === 'clarification' ? 'ready' : result.sources.length ? 'knowledge' : 'ai')
      setActiveModel(result.model)
    } catch (error) {
      const errorMessage = cleanErrorMessage(error.message)
      if (intent === 'external_question') {
        const message = error.code === 'WEATHER_PROVIDER_UNAVAILABLE'
          ? `天气数据暂时不可用：${errorMessage}。我不会用猜测或旧资料代替实时天气；站内产品浏览和本地推荐仍可正常使用。`
          : `智能服务当前不可用：${errorMessage}。站内产品浏览和本地推荐仍可正常使用。`
        setMessages((current) => [...current, createMessage('assistant', message)])
        setMode('error')
        setActiveModel('')
        return
      }
      if (onlineResearch) {
        setMessages((current) => [...current, createMessage('assistant', `联网检索当前不可用：${errorMessage}。我不会用未经检索的信息冒充实时结果；你仍可询问不依赖实时信息的站内产品推荐。`)])
        setMode('error')
        setActiveModel('')
        return
      }
      if (intent === 'makeup_plan') {
        const result = localMakeupReply(text, nextProfile)
        setMessages((current) => [...current, createMessage('assistant', result.text, result.products.map((product) => product.id))])
        setMode('local')
        setActiveModel('')
        return
      }
      const result = localReply(text, nextProfile)
      setMessages((current) => [...current, createMessage('assistant', result.text, result.products.map((product) => product.id))])
      setMode('local')
      setActiveModel('')
    } finally {
      setBusy(false)
    }
  }

  function resetConversation() {
    setMessages([welcomeMessage])
    setProfile({})
    setMode('ready')
    setActiveModel('')
  }

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
