import { LEGACY_CONFIG_KEYS } from './storageKeys'

// Keep the existing scope: only the two obsolete browser credential records.
export function clearLegacyCredentials() {
  LEGACY_CONFIG_KEYS.forEach((key) => localStorage.removeItem(key))
}
