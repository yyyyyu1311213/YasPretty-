/**
 * 保留既有错误边界：HTTP/业务消息与 code 由 feature 选择。
 * 无 code 的业务错误仍是普通 Error；网络、超时和取消错误由 client 原样传播，
 * 不包装、不合并原生类型或服务端业务 code。
 * @param {string} message
 * @param {string} [code]
 */
export function createApiError(message, code) {
  const error = new Error(message)
  if (code !== undefined) error.code = code
  return error
}
