import { readJsonValue, writeJson } from '../../lib/storage/storageClient'

// The historical key and raw object are the current format. No other legacy key exists.
export const COLLECTION_KEY = 'base-archive-collection'

export function getStoredCollection() {
  try {
    return readJsonValue(COLLECTION_KEY, {})
  } catch {
    return {}
  }
}

export function saveCollection(collection) {
  writeJson(COLLECTION_KEY, collection)
}
