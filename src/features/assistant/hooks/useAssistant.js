import { useEffect, useMemo, useRef, useState } from 'react'
import { clearLegacyCredentials } from '../../../lib/storage/clearUserData'
import { readVersioned } from '../../../lib/storage/migrations'
import { writeVersioned } from '../../../lib/storage/storageClient'
import { LEGACY_MESSAGES_KEY, LEGACY_PROFILE_KEY, MESSAGES_KEY, PROFILE_KEY } from '../../../lib/storage/storageKeys'
import { requestAssistant } from '../assistantApi'
import { cleanErrorMessage, extractProfile, localMakeupReply, localReply } from '../assistantUtils'
import { canRecommendOffline, detectIntent, needsOnlineResearch } from '../intentUtils'
import { assessSkin, readSkinObservation, observationFromChoice, skinConditions, skinConversationContext,
  skinObservationFromQuestion, isSkinQuestion, isSkinUncertain, isSkinSkip, asksSkinGuidance, skinChoiceFromReply, leavesSkinGuidance, advanceSkinObservation } from '../skinObservation'

const welcomeMessage = {
  id: 'welcome',
  role: 'assistant',
  content: '嗨，我是小Y。先用一句话告诉我你想解决什么；我会结合你的需求继续提问或给出建议。',
  productIds: [],
}

function createMessage(role, content, productIds = [], sources = [], question = undefined, skinGuidance = false) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    productIds,
    sources,
    ...(question ? { question } : {}),
    ...(skinGuidance ? { skinGuidance: true } : {}),
  }
}

function readConversation() {
  const saved = readVersioned(MESSAGES_KEY, LEGACY_MESSAGES_KEY, [welcomeMessage])
  if (!Array.isArray(saved) || !saved.length) return [welcomeMessage]
  return saved.map((message) => {
    if (message?.id === 'welcome') return welcomeMessage
    return message
  })
}

export function useAssistant() {
  const [messages, setMessages] = useState(readConversation)
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

  async function sendMessage(value, selectedValue = '') {
    const text = value.trim()
    if (!text || busy) return
    const context = skinConversationContext(messages)
    const choice = selectedValue || skinChoiceFromReply(text, context?.question)
    const hasObservation = Object.keys(readSkinObservation(text)).length > 0
    const skinTurn = context && !leavesSkinGuidance(text) && ((choice && (isSkinQuestion(context.question) || context.baseSelection)) || isSkinUncertain(text) || isSkinSkip(text) || asksSkinGuidance(text) || hasObservation)
    const nextProfile = selectedValue || skinTurn ? profile : extractProfile(text, profile)
    setInput('')
    if (!selectedValue && !skinTurn) setProfile(nextProfile)
    setMessages((current) => [...current, createMessage('user', text)])
    setBusy(true)
    setActivity('小Y正在组织回答...')
    try {
      if (globalThis.navigator?.onLine === false) throw new TypeError('浏览器已断网')
      const result = await requestAssistant({ text: selectedValue || text, messages, profile: nextProfile })
      setMessages((current) => [...current, createMessage('assistant', result.text, result.productIds, result.sources, result.question,
        result.knowledgeEvidence?.some(({ id }) => id === 'self-reported-skin-type'))])
      setMode(result.answerMode === 'local' ? result.intent && result.intent !== 'catalog_recommendation' ? 'ready' : 'local'
        : result.answerMode === 'weather' || result.sources.some((source) => source.kind === 'weather') ? 'weather'
          : result.sources.some((source) => source.kind === 'web') ? 'web'
            : result.answerMode === 'clarification' ? 'ready' : result.sources.length ? 'knowledge' : 'ai')
      setActiveModel(result.model)
    } catch (error) {
      // These rules run only after transport/service failure; online intent belongs to the server.
      const observation = choice ? observationFromChoice(choice, skinObservationFromQuestion(context?.question))
        : readSkinObservation(text, skinObservationFromQuestion(context?.question))
      const progress = skinTurn ? advanceSkinObservation(context.question, choice || text) : null
      const assessment = progress?.assessment || (skinTurn ? assessSkin(observation, isSkinSkip(text) || choice === 'route-direct') : null)
      const skinChoice = assessment ? { ...skinConditions(assessment), sensitive: assessment.sensitive || profile.skin === '敏感肌' } : null
      const fallbackQuery = progress?.initialQuery || (skinTurn ? context.initialQuery : text)
      const intent = detectIntent(fallbackQuery)
      const errorMessage = cleanErrorMessage(error.message)
      const offline = globalThis.navigator?.onLine === false || error instanceof TypeError
      const reason = offline ? '网络不可用' : '智能服务当前不可用'
      if (/红肿|刺痛|破损|皮肤破|明显不适/.test(text)) {
        setMessages((current) => [...current, createMessage('assistant', '先停止使用让你不适的产品，并咨询合格专业人员。现在有明显不适，先暂停上妆和产品推荐。')])
        setMode('ready')
      } else if (progress?.question) {
        setMessages((current) => [...current, createMessage('assistant', `${reason}，可以继续本地观察。\n\n${progress.answer}`, [], [], progress.question, true)])
        setMode('local')
      } else if (skinTurn && !context.baseSelection) {
        setMessages((current) => [...current, createMessage('assistant', `${reason}。${assessment.summary}`, [], [], undefined, true)])
        setMode('local')
      } else if ((intent === 'catalog_recommendation' && canRecommendOffline(fallbackQuery)) || skinTurn && context.baseSelection || intent === 'greeting_help' || intent === 'makeup_plan') {
        const result = intent === 'makeup_plan' ? localMakeupReply(fallbackQuery, nextProfile) : localReply(fallbackQuery, nextProfile, skinChoice || {})
        setMessages((current) => [...current, createMessage('assistant', `${reason}，已降级为浏览器本地基础建议。\n\n${assessment ? `${assessment.summary}\n\n` : ''}${result.text}`, result.products.map((p) => p.id), [], undefined, Boolean(assessment))])
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
