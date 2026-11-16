import { readJson, writeVersioned } from './storageClient'
import { STORAGE_VERSION } from './storageKeys'

export function readVersioned(key, legacyKey, fallback) {
  const current = readJson(key, null)
  if (current?.version === STORAGE_VERSION && current.value !== undefined) return current.value

  const legacy = readJson(legacyKey, null)
  if (legacy !== null) {
    writeVersioned(key, legacy)
    localStorage.removeItem(legacyKey)
    return legacy
  }
  return fallback
}
