class AppError extends Error {
  constructor(code, message, statusCode = 500, options = {}) {
    super(message, options)
    this.name = 'AppError'
    this.code = code
    this.statusCode = statusCode
    this.details = options.details
  }
}

function publicError(statusCode, code, message, requestId, details) {
  const error = { code, message, requestId }
  if (details) error.details = details
  return { ok: false, error }
}

module.exports = { AppError, publicError }
