import { postJson } from '../../lib/api/client'
import { PLAN_ENDPOINT } from '../../lib/api/endpoints'
import { createApiError } from '../../lib/api/errors'

function planResponseError(response, data) {
  return createApiError(data?.error?.message || `方案生成失败（${response.status}）`)
}

/**
 * @param {import('../../contracts/index.js').MakeupPlanRequest} payload
 * @returns {Promise<import('../../contracts/index.js').MakeupPlan>}
 */
export async function requestMakeupPlan(payload) {
  const { response, data } = await postJson(PLAN_ENDPOINT, payload, planResponseError)
  if (!data?.plan) throw planResponseError(response, data)
  return data.plan
}
