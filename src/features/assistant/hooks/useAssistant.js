import { useEffect, useMemo, useRef, useState } from 'react'
import { clearLegacyCredentials } from '../../../lib/storage/clearUserData'
import { readVersioned } from '../../../lib/storage/migrations'
import { writeVersioned } from '../../../lib/storage/storageClient'
import { LEGACY_MESSAGES_KEY, LEGACY_PROFILE_KEY, MESSAGES_KEY, PROFILE_KEY } from '../../../lib/storage/storageKeys'
import { requestAssistant, requestMakeupPlan } from '../assistantApi'
import { cleanErrorMessage, extractProfile, localMakeupReply, localReply } from '../assistantUtils'
import { detectIntent, needsOnlineResearch } from '../intentUtils'

const welcomeMessage = {
  id: 'welcome',
  role: 'assistant',
  content: '嗨，我是小Y。告诉我你的肤质、喜欢的妆效和使用场景，我会从 YasPretty 产品库里给出有依据的选择。',
  productIds: [],
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

export function useAssistant() {
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

  return { messages, profile, input, setInput, busy, mode, activeModel, activity, messageEndRef, profileTags, sendMessage, resetConversation }
}
