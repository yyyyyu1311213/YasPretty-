const PLAN_ENDPOINT = '/api/makeup-plans'

/**
 * @param {import('../../contracts/index.js').MakeupPlanRequest} payload
 * @returns {Promise<import('../../contracts/index.js').MakeupPlan>}
 */
export async function requestMakeupPlan(payload) {
  const response = await fetch(PLAN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await response.json().catch(() => null)
  if (!response.ok || !data?.plan) throw new Error(data?.error?.message || `方案生成失败（${response.status}）`)
  return data.plan
}
