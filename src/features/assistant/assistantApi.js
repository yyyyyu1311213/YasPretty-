import { requestMakeupPlan as requestPlan } from '../makeup-plan/makeupPlanApi'
import { formatPlanReply, parseAssistantResult, planPayloadFromConversation } from './assistantUtils'

const ASSISTANT_ENDPOINT = '/api/assistant'

/**
 * @param {{text: string, messages: import('../../contracts/index.js').AssistantMessage[], profile: import('../../contracts/index.js').AssistantProfile}} request
 */
export async function requestAssistant({ text, messages, profile }) {
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

/**
 * 会话输入/输出适配；方案 HTTP 请求复用 makeup-plan 的唯一实现。
 * @param {{text: string, profile: import('../../contracts/index.js').AssistantProfile}} request
 */
export async function requestMakeupPlan({ text, profile }) {
  const plan = await requestPlan(planPayloadFromConversation(text, profile))
  return formatPlanReply(plan)
}
