import { useEffect, useMemo, useRef, useState } from 'react'
import { clearLegacyCredentials } from '../../../lib/storage/clearUserData'
import { readVersioned } from '../../../lib/storage/migrations'
import { writeVersioned } from '../../../lib/storage/storageClient'
import { LEGACY_MESSAGES_KEY, LEGACY_PROFILE_KEY, MESSAGES_KEY, PROFILE_KEY } from '../../../lib/storage/storageKeys'
import { requestAssistant } from '../assistantApi'
import { cleanErrorMessage, extractProfile, localMakeupReply, localReply } from '../assistantUtils'
import { canRecommendOffline, detectIntent, needsOnlineResearch } from '../intentUtils'
import { beginnerFollowup, readBeginnerContext } from '../beginnerContext'
import { assessSkin, readSkinObservation, observationFromChoice, skinConditions, skinConversationContext,
  skinObservationFromQuestion, skinQuestionSpec, needsBaseSkinGuidance, isSkinQuestion, isSkinUncertain, isSkinSkip,
  asksSkinGuidance, skinChoiceFromReply, leavesSkinGuidance, advanceSkinObservation } from '../skinObservation'

const welcomeMessage = {
  id: 'welcome',
  role: 'assistant',
  content: '嗨，我是小Y。先用一句话告诉我你想解决什么；我会结合你的需求继续提问或给出建议。',
  productIds: [],
}

function createMessage(role, content, productIds = [], sources = [], question = undefined, skinGuidance = false, beginnerContext = undefined) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    productIds,
    sources,
    ...(question ? { question } : {}),
    ...(skinGuidance ? { skinGuidance: true } : {}),
    ...(beginnerContext ? { beginnerContext } : {}),
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
  const sendLockRef = useRef(false)
  const messagesRef = useRef(messages)
  messagesRef.current = messages
  const completedQuestionsRef = useRef(new Set())

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

  async function sendMessage(value, selectedValue = '', questionId = '', retry = null) {
    const text = value.trim()
    if (!text || sendLockRef.current) return
    const visibleMessages = messagesRef.current
    const history = retry?.messages || (visibleMessages.at(-1)?.retry ? visibleMessages.slice(0, -2) : visibleMessages)
    const activeQuestion = history.at(-1)
    if (selectedValue && !retry && visibleMessages.at(-1)?.id !== activeQuestion?.id) return
    if (selectedValue && (activeQuestion?.role !== 'assistant' || !activeQuestion.question
      || questionId && activeQuestion.id !== questionId || completedQuestionsRef.current.has(activeQuestion.id)
      || !activeQuestion.question.options.some(({ value }) => value === selectedValue))) return
    sendLockRef.current = true
    const context = skinConversationContext(history)
    const choice = selectedValue || skinChoiceFromReply(text, context?.question)
    const hasObservation = Object.keys(readSkinObservation(text)).length > 0
    const skinTurn = context && !leavesSkinGuidance(text) && (isSkinQuestion(context.question)
      || (choice && context.baseSelection) || isSkinUncertain(text) || isSkinSkip(text) || asksSkinGuidance(text) || hasObservation)
    const guidedTurn = activeQuestion?.question?.flowId === 'xiaoy-guided-intake-v1' && !leavesSkinGuidance(text)
    const beginnerTurn = Boolean(beginnerFollowup(text) && readBeginnerContext(history))
    const nextProfile = selectedValue || skinTurn || guidedTurn || beginnerTurn ? profile : extractProfile(text, profile)
    setInput('')
    if (!selectedValue && !skinTurn && !guidedTurn && !beginnerTurn) setProfile(nextProfile)
    setMessages((current) => retry ? current.filter(({ id }) => id !== retry.id) : [...current, createMessage('user', text)])
    setBusy(true)
    setActivity('小Y正在组织回答...')
    try {
      if (globalThis.navigator?.onLine === false) throw new TypeError('浏览器已断网')
      const result = await requestAssistant({ text: selectedValue || text, messages: history, profile: nextProfile })
      if (activeQuestion?.question) completedQuestionsRef.current.add(activeQuestion.id)
      setMessages((current) => [...current, createMessage('assistant', result.text, result.productIds, result.sources, result.question,
        result.knowledgeEvidence?.some(({ id }) => id === 'self-reported-skin-type'), result.beginnerContext)])
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
      const needsInitialSkin = !context && needsBaseSkinGuidance(text, nextProfile)
      const intent = detectIntent(fallbackQuery)
      const errorMessage = cleanErrorMessage(error.message)
      const offline = globalThis.navigator?.onLine === false || error instanceof TypeError
      const reason = offline ? '网络不可用' : '智能服务当前不可用'
      if (/红肿|刺痛|破损|皮肤破|明显不适/.test(text)) {
        setMessages((current) => [...current, createMessage('assistant', '先停止使用让你不适的产品，并咨询合格专业人员。现在有明显不适，先暂停上妆和产品推荐。')])
        setMode('ready')
      } else if (needsInitialSkin) {
        const spec = skinQuestionSpec('oil')
        const question = { flowId: 'xiaoy-guided-intake-v1', step: 1, route: 'general', selections: [], initialQuery: text, options: spec.options }
        setMessages((current) => [...current, createMessage('assistant', `${reason}，已降级为本地肤质引导，暂未推荐产品。${spec.answer}`, [], [], question, true)])
        setMode('local')
      } else if (intent === 'clarification') {
        setMessages((current) => [...current, createMessage('assistant', '只知道性别还无法判断你想解决什么问题，我也不会按性别直接挑产品。你可以告诉我想了解的品类或遇到的具体问题。')])
        setMode('local')
      } else if (beginnerTurn || guidedTurn && !isSkinQuestion(activeQuestion.question)) {
        const failed = createMessage('assistant', `${reason}，这次${beginnerTurn ? '追问' : '选择'}尚未处理完成。已保留原问题和“${text}”，可以重试，也可以直接输入新的要求。`)
        failed.retry = { text, selectedValue, questionId: activeQuestion.id, ...(beginnerTurn ? { kind: 'followup' } : {}) }
        setMessages((current) => [...current, failed])
        setMode('error')
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
      sendLockRef.current = false
      setBusy(false)
    }
  }

  function retryMessage(id) {
    const current = messagesRef.current
    const failed = current.at(-1)
    if (failed?.id !== id || !failed.retry || sendLockRef.current) return
    const { text, selectedValue, questionId } = failed.retry
    return sendMessage(text, selectedValue, questionId, { id, messages: current.slice(0, -2) })
  }

  function resetConversation() {
    if (sendLockRef.current) return
    completedQuestionsRef.current.clear()
    setMessages([welcomeMessage])
    setProfile({})
    setMode('ready')
    setActiveModel('')
  }

  return { messages, profile, input, setInput, busy, mode, activeModel, activity, messageEndRef, profileTags, sendMessage, retryMessage, resetConversation }
}
