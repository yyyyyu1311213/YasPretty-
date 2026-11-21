import { useEffect, useMemo, useRef, useState } from 'react'
import { clearLegacyCredentials } from '../../../lib/storage/clearUserData'
import { readVersioned } from '../../../lib/storage/migrations'
import { writeVersioned } from '../../../lib/storage/storageClient'
import { LEGACY_MESSAGES_KEY, LEGACY_PROFILE_KEY, MESSAGES_KEY, PROFILE_KEY } from '../../../lib/storage/storageKeys'
import { requestAssistant } from '../assistantApi'
import { cleanErrorMessage, extractProfile, localMakeupReply, localReply } from '../assistantUtils'
import { canRecommendOffline, detectIntent, needsOnlineResearch } from '../intentUtils'

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
    const nextProfile = extractProfile(text, profile)
    setInput('')
    setProfile(nextProfile)
    setMessages((current) => [...current, createMessage('user', text)])
    setBusy(true)
    setActivity('小Y正在组织回答...')
    try {
      if (globalThis.navigator?.onLine === false) throw new TypeError('浏览器已断网')
      const result = await requestAssistant({ text, messages, profile: nextProfile })
      setMessages((current) => [...current, createMessage('assistant', result.text, result.productIds, result.sources)])
      setMode(result.answerMode === 'local' ? result.intent && result.intent !== 'catalog_recommendation' ? 'ready' : 'local'
        : result.answerMode === 'weather' || result.sources.some((source) => source.kind === 'weather') ? 'weather'
          : result.sources.some((source) => source.kind === 'web') ? 'web'
            : result.answerMode === 'clarification' ? 'ready' : result.sources.length ? 'knowledge' : 'ai')
      setActiveModel(result.model)
    } catch (error) {
      // These rules run only after transport/service failure; online intent belongs to the server.
      const intent = detectIntent(text)
      const errorMessage = cleanErrorMessage(error.message)
      const offline = globalThis.navigator?.onLine === false || error instanceof TypeError
      const reason = offline ? '网络不可用' : '智能服务当前不可用'
      if ((intent === 'catalog_recommendation' && canRecommendOffline(text)) || intent === 'greeting_help' || intent === 'makeup_plan') {
        const result = intent === 'makeup_plan' ? localMakeupReply(text, nextProfile) : localReply(text, nextProfile)
        setMessages((current) => [...current, createMessage('assistant', `${reason}，已降级为浏览器本地基础建议。\n\n${result.text}`, result.products.map((p) => p.id))])
        setMode('local')
      } else {
        const message = error.code === 'WEATHER_PROVIDER_UNAVAILABLE'
          ? `天气数据暂时不可用：${errorMessage}。我不会用猜测或旧资料代替实时天气；站内产品浏览和本地推荐仍可正常使用。`
          : needsOnlineResearch(text, intent)
            ? `联网检索当前不可用：${errorMessage}。我不会用未经检索的信息冒充实时结果；你仍可询问不依赖实时信息的站内产品推荐。`
            : `智能服务当前不可用：${errorMessage}。站内产品浏览和本地推荐仍可正常使用。`
        setMessages((current) => [...current, createMessage('assistant', message)])
        setMode('error')
      }
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
