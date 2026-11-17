import { postJson } from '../../lib/api/client'
import { ASSISTANT_ENDPOINT } from '../../lib/api/endpoints'
import { createApiError } from '../../lib/api/errors'
import { requestMakeupPlan as requestPlan } from '../makeup-plan/makeupPlanApi'
import { formatPlanReply, parseAssistantResult, planPayloadFromConversation } from './assistantUtils'

/**
 * @param {{text: string, messages: import('../../contracts/index.js').AssistantMessage[], profile: import('../../contracts/index.js').AssistantProfile}} request
 */
export async function requestAssistant({ text, messages, profile }) {
  const { data } = await postJson(ASSISTANT_ENDPOINT, {
    query: text,
    profile,
    messages: messages.slice(-8).map((message) => ({ role: message.role, content: message.content })),
  }, (response, data) => createApiError(
    data?.error?.message || `请求失败（${response.status}）`,
    data?.error?.code || 'REQUEST_FAILED',
  ))
  if (!data?.answer) throw createApiError('智能服务没有返回内容')
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
