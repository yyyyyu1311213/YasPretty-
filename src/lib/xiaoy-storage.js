const STORAGE_VERSION = 1
const PROFILE_KEY = 'yaspretty-xiaoy-profile-v1'
const MESSAGES_KEY = 'yaspretty-xiaoy-messages-v1'
const LEGACY_PROFILE_KEY = 'yaspretty-xiaoy-profile'
const LEGACY_MESSAGES_KEY = 'yaspretty-xiaoy-messages'
const LEGACY_CONFIG_KEYS = ['yaspretty-xiaoy-config', 'yaspretty-assistant-config']

function parse(value, fallback) {
  try {
    return JSON.parse(value || 'null') ?? fallback
  } catch {
    return fallback
  }
}

function readVersioned(key, legacyKey, fallback) {
  const current = parse(localStorage.getItem(key), null)
  if (current?.version === STORAGE_VERSION && current.value !== undefined) return current.value

  const legacy = parse(localStorage.getItem(legacyKey), null)
  if (legacy !== null) {
    writeVersioned(key, legacy)
    localStorage.removeItem(legacyKey)
    return legacy
  }
  return fallback
}

function writeVersioned(key, value) {
  localStorage.setItem(key, JSON.stringify({ version: STORAGE_VERSION, value }))
}

export const xiaoyStorage = {
  readProfile: () => readVersioned(PROFILE_KEY, LEGACY_PROFILE_KEY, {}),
  writeProfile: (profile) => writeVersioned(PROFILE_KEY, profile),
  readMessages: (fallback) => readVersioned(MESSAGES_KEY, LEGACY_MESSAGES_KEY, fallback),
  writeMessages: (messages) => writeVersioned(MESSAGES_KEY, messages),
  clearLegacyCredentials() {
    LEGACY_CONFIG_KEYS.forEach((key) => localStorage.removeItem(key))
  },
}
