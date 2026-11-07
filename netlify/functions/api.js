import appModule from '../../server/app.cjs'
import configModule from '../../server/config.cjs'

const { buildApp } = appModule
const { loadConfig } = configModule

let appPromise

async function loadProductsForBundle() {
  // Keep this import explicit so Netlify's bundler includes the controlled catalog.
  const module = await import('../../src/data/products.js')
  return module.products
}

function requestPath(event) {
  const rawPath = event.path || '/api/health'
  const functionPrefix = '/.netlify/functions/api'
  const redirectedPath = rawPath.startsWith(functionPrefix)
    ? rawPath.slice(functionPrefix.length)
    : rawPath
  const pathPart = redirectedPath.startsWith('/api/') || redirectedPath === '/api'
    ? redirectedPath
    : `/api${redirectedPath.startsWith('/') ? redirectedPath : `/${redirectedPath}`}`
  const query = event.rawQuery || event.queryStringParameters
  if (!query || typeof query === 'string' && !query) return pathPart
  if (typeof query === 'string') return `${pathPart}?${query}`
  const search = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) search.set(key, String(value))
  })
  const suffix = search.toString()
  return suffix ? `${pathPart}?${suffix}` : pathPart
}

async function getApp() {
  if (!appPromise) {
    appPromise = loadProductsForBundle().then((products) => buildApp({
      config: loadConfig({ TRUST_PROXY: true }),
      products,
      serveStatic: false,
    }))
  }
  return appPromise
}

function responseFromInject(response) {
  const headers = {}
  Object.entries(response.headers || {}).forEach(([key, value]) => {
    if (value !== undefined) headers[key] = String(value)
  })
  return {
    statusCode: response.statusCode,
    headers,
    body: response.payload || '',
  }
}

export async function handler(event) {
  try {
    const app = await getApp()
    const body = event.body
      ? (event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body)
      : undefined
    const response = await app.inject({
      method: event.httpMethod || 'GET',
      url: requestPath(event),
      headers: event.headers || {},
      payload: body,
    })
    return responseFromInject(response)
  } catch (error) {
    console.error('Netlify API handler failed', error?.code || 'unknown error')
    return {
      statusCode: 500,
      headers: { 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        ok: false,
        error: { code: 'FUNCTION_ERROR', message: '服务暂时不可用，请稍后再试。' },
      }),
    }
  }
}

export { requestPath }
