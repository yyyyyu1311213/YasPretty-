import { STORAGE_VERSION } from './storageKeys'

export function readJson(key, fallback) {
  // Storage access errors still propagate; only invalid JSON falls back.
  const value = localStorage.getItem(key)
  try {
    return JSON.parse(value || 'null') ?? fallback
  } catch {
    return fallback
  }
}

export function writeVersioned(key, value) {
  localStorage.setItem(key, JSON.stringify({ version: STORAGE_VERSION, value }))
}
