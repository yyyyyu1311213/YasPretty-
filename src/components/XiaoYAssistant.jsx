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
const WEATHER_ENDPOINT = '/api/weather'

const welcomeMessage = {
  id: 'welcome',
  role: 'assistant',
  content: '嗨，我是小Y。告诉我你的肤质、喜欢的妆效和使用场景，我会从 YasPretty 产品库里给出有依据的选择。',
  productIds: [],
}

const quickPrompts = [
  '我是混油皮，想要柔雾通勤底妆',
  '今天石家庄天气怎么样',
  '预算 400 元以内，想要高遮瑕',
  '帮我比较 NARS 超方瓶和雅诗兰黛持妆粉底液',
]

const WEATHER_LABELS = {
  0: '晴', 1: '大部晴朗', 2: '多云', 3: '阴', 45: '有雾', 48: '雾凇',
  51: '小毛毛雨', 53: '毛毛雨', 55: '较强毛毛雨', 56: '轻微冻雨', 57: '冻雨',
  61: '小雨', 63: '中雨', 65: '大雨', 66: '轻微冻雨', 67: '强冻雨',
  71: '小雪', 73: '中雪', 75: '大雪', 77: '米雪',
  80: '小阵雨', 81: '阵雨', 82: '强阵雨', 85: '小阵雪', 86: '强阵雪',
  95: '雷暴', 96: '雷暴伴小冰雹', 99: '雷暴伴冰雹',
}

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
  if (/(天气|气温|温度|下雨|降雨|下雪|刮风|湿度|冷不冷|热不热)/.test(text) || (profile.city && /(今天|明天|后天).*(呢|怎么样|如何)?/.test(text))) return 'weather'
  if (findMentionedProducts(text).length || /(推荐|选什么|怎么选|哪个好|对比|区别|粉底|底妆|气垫|遮瑕|散粉|肤质|油皮|干皮|妆效|持妆|色号|卡粉|脱妆|预算)/.test(text)) return 'catalog'
  if (/^(你好|嗨|hello|hi|在吗)[！!。？?\s]*$/i.test(text)) return 'greeting'
  return 'general'
}

function needsOnlineResearch(text, intent) {
  if (intent === 'general') return true
  if (/(最新|最近|现在|目前|今年|2026|新品|上市|发售|价格|多少钱|促销|成分|官网|新闻|测评|口碑|销量|排行|真假|哪里买)/.test(text)) return true
  if (/(口红|唇釉|眼影|腮红|高光|修容|睫毛膏|眉笔|香水|护肤|面霜|精华|防晒)/.test(text)) return true
  return false
}

function extractWeatherCity(text) {
  const cleaned = text
    .replace(/今天|明天|后天|现在|当前|实时|最近|当地/g, ' ')
    .replace(/天气预报|天气|气温|温度|湿度|下雨|降雨|下雪|刮风|冷不冷|热不热/g, ' ')
    .replace(/帮我|麻烦|请问|查询|查一下|看一下|看看|怎么样|怎样|如何|多少度|会不会|有没有|情况/g, ' ')
    .replace(/[，。！？、,.!?：:；;的呢吗呀啊哦]/g, ' ')
  const candidates = cleaned.match(/[\u4e00-\u9fa5]{2,12}/g) || []
  return candidates.sort((a, b) => b.length - a.length)[0]?.replace(/(市|县)$/g, '') || ''
}

function weatherDayOffset(text) {
  if (text.includes('后天')) return 2
  if (text.includes('明天')) return 1
  return 0
}

function weatherTip(maxTemperature, humidity, rainChance) {
  if (rainChance >= 50 || maxTemperature >= 28) return '如果今天需要带妆，建议优先轻薄、耐汗的底妆，并加强 T 区定妆。'
  if (humidity < 40 || maxTemperature <= 12) return '空气偏干或温度较低，上妆前可以加强保湿，底妆少量分区叠加。'
  return '天气条件相对温和，按日常肤质和妆效偏好选择底妆即可。'
}

async function requestWeather(city, offset) {
  const response = await fetch(`${WEATHER_ENDPOINT}?city=${encodeURIComponent(city)}`)
  const data = await response.json()
  if (!response.ok || !data.ok) throw new Error(data.error || `天气查询失败（${response.status}）`)
  const index = Math.min(offset, Math.max(0, (data.daily?.time?.length || 1) - 1))
  const dayName = index === 0 ? '今天' : index === 1 ? '明天' : '后天'
  const max = Math.round(data.daily.temperature_2m_max[index])
  const min = Math.round(data.daily.temperature_2m_min[index])
  const rainChance = Math.round(data.daily.precipitation_probability_max[index] || 0)
  const code = data.daily.weather_code[index]
  const place = [data.location.name, data.location.admin1].filter(Boolean).join('，')
  const details = index === 0
    ? `当前 ${Math.round(data.current.temperature_2m)}℃，体感 ${Math.round(data.current.apparent_temperature)}℃，湿度 ${Math.round(data.current.relative_humidity_2m)}%，风速 ${Math.round(data.current.wind_speed_10m)} km/h。`
    : ''
  const humidity = index === 0 ? Number(data.current.relative_humidity_2m || 50) : 50
  return `${place}${dayName}${WEATHER_LABELS[code] || '天气有变化'}，预计 ${min}～${max}℃，最高降水概率 ${rainChance}%。${details}\n\n${weatherTip(max, humidity, rainChance)}\n\n数据来源：${data.source}，更新时间 ${data.current.time || data.daily.time[index]}（${data.location.timezone}）。`
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
        <i>{shade.name} · {product.finish} · {product.priceLabel}（价格待核验）</i>
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
      if (intent === 'weather') {
        setActivity('正在连接实时天气服务...')
        const city = extractWeatherCity(text) || nextProfile.city
        if (!city) {
          setMessages((current) => [...current, createMessage('assistant', '你想查询哪个城市？例如可以直接问“今天石家庄天气怎么样”。')])
          setMode('tool')
          return
        }
        nextProfile = { ...nextProfile, city }
        setProfile(nextProfile)
        const result = await requestWeather(city, weatherDayOffset(text))
        setMessages((current) => [...current, createMessage('assistant', result)])
        setMode('tool')
        return
      }

      if (intent === 'catalog' || intent === 'greeting') {
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
      if (intent === 'general') {
        setMessages((current) => [...current, createMessage('assistant', `智能服务当前不可用：${error.message}。实时天气和站内产品推荐仍可正常使用。`)])
        setMode('error')
        return
      }
      if (intent === 'weather') {
        setMessages((current) => [...current, createMessage('assistant', `天气查询暂时失败：${error.message}。请稍后重试，或换成完整城市名。`)])
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
