import { STORAGE_VERSION } from './storageKeys'

export function readJson(key, fallback) {
  return readJsonValue(key, null) ?? fallback
}

// Raw JSON consumers can preserve a stored null, unlike readJson's nullish fallback.
export function readJsonValue(key, fallback) {
  // Storage access errors still propagate; only invalid JSON falls back.
  const value = localStorage.getItem(key)
  try {
    return JSON.parse(value || JSON.stringify(fallback))
  } catch {
    return fallback
  }
}

export function writeVersioned(key, value) {
  writeJson(key, { version: STORAGE_VERSION, value })
}

export function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}
