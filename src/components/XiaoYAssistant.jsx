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
import { categoryOptions, finishOptions, products, skinOptions } from '../data/products'
import { xiaoyStorage } from '../lib/xiaoy-storage'
import MakeupWorkbench from './MakeupWorkbench'

const SCENE_OPTIONS = ['通勤', '约会', '拍照', '夏季', '秋冬', '长时间带妆', '答辩']
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

function detectIntent(text, profile = {}) {
  const mentioned = findMentionedProducts(text)
  if (mentioned.length && /(对比|区别|哪个好|哪个更)/.test(text)) return 'product_comparison'
  if (/(妆容方案|完整妆容|化妆步骤|怎么化|妆面规划|设计(?:一个)?妆|(?:约会|通勤|日常|晚宴)妆)/.test(text)) return 'makeup_plan'
  if (mentioned.length || /(推荐|选什么|怎么选|哪个好|粉底|底妆|气垫|遮瑕|散粉|肤质|油皮|干皮|妆效|持妆|色号|卡粉|脱妆|预算)/.test(text)) return 'catalog_recommendation'
  if (/^(你好|嗨|hello|hi|在吗)[！!。？?\s]*$/i.test(text)) return 'greeting_help'
  return 'external_question'
}

function needsOnlineResearch(text, intent) {
  if (intent === 'external_question' || intent === 'external_research' || intent === 'product_fact') return true
  if (/(最新|最近|现在|目前|今年|2026|新品|上市|发售|价格|多少钱|促销|成分|官网|新闻|测评|口碑|销量|排行|真假|哪里买)/.test(text)) return true
  if (/(口红|唇釉|眼影|腮红|高光|修容|睫毛膏|眉笔|香水|护肤|面霜|精华|防晒)/.test(text)) return true
  return false
}

function extractProfile(text, current = {}) {
  const next = { ...current }
  const skin = [...skinOptions].sort((a, b) => b.length - a.length).find((item) => text.includes(item))
  const finish = finishOptions.find((item) => text.includes(item))
  const scene = SCENE_OPTIONS.find((item) => text.includes(item))
  const category = categoryOptions.find((item) => text.includes(item))
  const budgetMatch = text.match(/(?:预算|不超过|以内|最多)?\s*(\d{2,4})\s*元?/)

  if (skin) next.skin = skin
  if (/大油皮/.test(text)) next.skin = '油皮'
  if (/大干皮/.test(text)) next.skin = '干皮'
  if (finish) next.finish = finish
  if (/水光|亮泽/.test(text)) next.finish = '自然光泽'
  if (/雾面/.test(text)) next.finish = '柔雾'
  if (scene) next.scene = scene
  if (category) next.category = category
  if (!category && /粉底/.test(text)) next.category = '粉底液'
  if (budgetMatch) next.budget = Number(budgetMatch[1])
  if (/高遮瑕|遮瑕强|瑕疵多/.test(text)) next.coverage = '高'
  if (/轻薄|低遮瑕/.test(text)) next.coverage = '低'
  if (/冷白|冷调/.test(text)) next.tone = '冷调'
  if (/黄皮|暖调/.test(text)) next.tone = '暖调'
  if (/中性调/.test(text)) next.tone = '中性调'
  return next
}

function pickShade(product, profile) {
  if (!product.shadeRecommendationReady) return { name: '参数色号待确认' }
  return product.shades.find((shade) => profile.tone && shade.tone === profile.tone)
    || product.shades.find((shade) => /白皙|一白/.test(shade.lightness || shade.suitable || ''))
    || product.shades[0]
}

function scoreProduct(product, profile) {
  let score = product.rating * 2 + Math.min(product.wear, 12) / 3
  if (profile.skin) score += product.skins.includes(profile.skin) ? 30 : -24
  if (profile.finish) score += product.finish === profile.finish ? 20 : 0
  if (profile.scene) score += product.scenes.includes(profile.scene) ? 15 : 0
  if (profile.budget) score += product.price <= profile.budget ? 12 : -Math.min(18, (product.price - profile.budget) / 20)
  if (profile.coverage) score += product.coverage === profile.coverage ? 10 : 0
  if (profile.category) score += product.category === profile.category ? 18 : -10
  return score
}

function findMentionedProducts(text) {
  const lower = text.toLowerCase()
  return products.filter((product) => {
    const brand = product.brand.toLowerCase()
    const name = product.name.toLowerCase()
    const compactName = name.replace(/粉底液|遮瑕液|遮瑕蜜|散粉|气垫|\s/g, '')
    return lower.includes(brand) || lower.includes(name) || (compactName.length > 2 && lower.includes(compactName))
  })
}

function recommendProducts(profile, text) {
  const mentioned = findMentionedProducts(text)
  if (mentioned.length) return mentioned.slice(0, 3)

  const pool = products.filter((product) => {
    if (profile.category && product.category !== profile.category) return false
    if (!profile.category && /底妆|粉底/.test(text) && product.category !== '粉底液') return false
    if (profile.skin && !product.skins.includes(profile.skin)) return false
    if (profile.budget && product.price > profile.budget) return false
    return true
  })
  return [...pool].sort((a, b) => scoreProduct(b, profile) - scoreProduct(a, profile)).slice(0, 3)
}

function localReply(text, profile) {
  if (/^(你好|嗨|hello|hi)[！!。\s]*$/i.test(text)) {
    return { text: '你好，我是小Y。先告诉我你的肤质吧，例如油皮、混油皮、干皮或混干皮。', products: [] }
  }

  const mentioned = findMentionedProducts(text)
  if (!profile.skin && !mentioned.length && /推荐|怎么选|底妆|粉底|适合/.test(text)) {
    return { text: '为了避免只凭热度推荐，我需要先确认你的肤质。你是油皮、混油皮、干皮、混干皮，还是敏感肌？', products: [] }
  }

  const matches = recommendProducts(profile, text)
  if (!matches.length) {
    return {
      text: '资料库中暂时没有同时满足这些硬条件的产品。你可以提高预算、放宽品类，或保留最重要的一项条件后再试。',
      products: [],
    }
  }
  const lines = matches.map((product, index) => {
    const shade = pickShade(product, profile)
    const reasons = []
    if (profile.skin && product.skins.includes(profile.skin)) reasons.push(`适合${profile.skin}`)
    if (profile.finish && product.finish === profile.finish) reasons.push(`符合${profile.finish}偏好`)
    if (profile.scene && product.scenes.includes(profile.scene)) reasons.push(`适合${profile.scene}`)
    if (profile.budget && product.price <= profile.budget) reasons.push('在预算内')
    if (!reasons.length) reasons.push(product.note)
    return `${index + 1}. ${product.brand} ${product.name}：建议先试 ${shade.name}，${reasons.join('、')}。`
  })

  const lead = mentioned.length > 1
    ? `我按资料库信息比较你提到的产品：\n\n${mentioned.map((product) => `${product.brand} ${product.name}：${product.finish}妆效，${product.coverage}遮瑕，参考持妆 ${product.wear} 小时，适合${product.skins.join('、')}，参考价 ${product.priceLabel}。`).join('\n\n')}\n\n结合你的已知偏好，再看具体选择：`
    : `根据目前记录的需求${profile.skin ? `（${profile.skin}${profile.finish ? `、${profile.finish}` : ''}${profile.scene ? `、${profile.scene}` : ''}）` : ''}，优先看这几款：`
  return {
    text: `${lead}\n\n${lines.join('\n\n')}\n\n色号仅作为初筛建议，实际结果还会受光线、肤色明度和氧化情况影响。`,
    products: matches,
  }
}

function parseAssistantResult(raw) {
  const ids = [...raw.matchAll(/\[\[PRODUCT:([^\]]+)\]\]/g)]
    .map((match) => match[1].trim())
    .filter((id) => products.some((product) => product.id === id))
  return {
    text: raw.replace(/\n?\[\[PRODUCT:[^\]]+\]\]/g, '').trim(),
    productIds: [...new Set(ids)].slice(0, 3),
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
  if (!response.ok) throw new Error(data?.error?.message || `请求失败（${response.status}）`)
  if (!data?.answer) throw new Error('智能服务没有返回内容')
  return { ...parseAssistantResult(data.answer), sources: data.sources || [] }
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
      <span>联网来源</span>
      {sources.map((source, index) => (
        <a key={`${source.url}-${index}`} href={source.url} target="_blank" rel="noreferrer">
          <b>[{index + 1}]</b>{source.title}<ChevronRight size={14} />
        </a>
      ))}
    </div>
  )
}

export default function XiaoYAssistant({ onOpenProduct }) {
  const [messages, setMessages] = useState(() => xiaoyStorage.readMessages([welcomeMessage]))
  const [profile, setProfile] = useState(() => xiaoyStorage.readProfile())
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [mode, setMode] = useState('ready')
  const [activity, setActivity] = useState('小Y正在识别需求并查询...')
  const messageEndRef = useRef(null)

  useEffect(() => {
    xiaoyStorage.clearLegacyCredentials()
  }, [])

  useEffect(() => {
    xiaoyStorage.writeProfile(profile)
  }, [profile])

  useEffect(() => {
    xiaoyStorage.writeMessages(messages.slice(-20))
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
      if (intent === 'catalog_recommendation' || intent === 'product_comparison' || intent === 'greeting_help') {
        if (onlineResearch) {
          setActivity('正在联网检索相关资料...')
          const result = await requestAssistant({ text, messages, profile: nextProfile })
          setMessages((current) => [...current, createMessage('assistant', result.text, result.productIds, result.sources)])
          setMode('web')
          return
        }
        const result = localReply(text, nextProfile)
        setMessages((current) => [...current, createMessage('assistant', result.text, result.products.map((product) => product.id))])
        setMode('local')
        return
      }

      setActivity('正在联网检索相关资料...')
      const result = await requestAssistant({ text, messages, profile: nextProfile })
      setMessages((current) => [...current, createMessage('assistant', result.text, result.productIds, result.sources)])
      setMode(result.sources.length ? 'web' : 'ai')
    } catch (error) {
      if (intent === 'external_question') {
        setMessages((current) => [...current, createMessage('assistant', `智能服务当前不可用：${error.message}。站内产品浏览和本地推荐仍可正常使用。`)])
        setMode('error')
        return
      }
      if (onlineResearch) {
        setMessages((current) => [...current, createMessage('assistant', `联网检索当前不可用：${error.message}。我不会用未经检索的信息冒充实时结果；你仍可询问不依赖实时信息的站内产品推荐。`)])
        setMode('error')
        return
      }
      const result = localReply(text, nextProfile)
      setMessages((current) => [...current, createMessage('assistant', result.text, result.products.map((product) => product.id))])
      setMode('local')
    } finally {
      setBusy(false)
    }
  }

  function resetConversation() {
    setMessages([welcomeMessage])
    setProfile({})
    setMode('ready')
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
          <span className={`xiaoy-mode ${mode}`}>{mode === 'web' ? '联网思考' : mode === 'ai' ? 'AI 对话' : mode === 'local' ? '资料库推荐' : mode === 'tool' ? '实时工具' : mode === 'error' ? '连接异常' : '已就绪'}</span>
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

export {
  detectIntent,
  extractProfile,
  localReply,
  needsOnlineResearch,
  parseAssistantResult,
  recommendProducts,
}
