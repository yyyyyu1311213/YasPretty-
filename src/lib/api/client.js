/**
 * 两个业务 API 共用的 POST/JSON/HTTP 检查；错误消息及响应适配由 feature 提供。
 * 保持先读取 JSON、解析失败置 null、再检查 HTTP 的原顺序。
 * 基线没有主动超时、取消或重试：fetch 拒绝原样抛出，JSON 读取拒绝仍置 null。
 * @param {string} endpoint
 * @param {unknown} payload
 * @param {(response: Response, data: any) => Error} createHttpError
 */
export async function postJson(endpoint, payload, createHttpError) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) throw createHttpError(response, data)
  return { response, data }
}
