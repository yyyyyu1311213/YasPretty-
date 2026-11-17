import { useEffect, useState } from 'react'
import { getStoredCollection, saveCollection } from '../collectionStorage'
import { getCollectionCount, removeCollectionProduct, setCollectionStatus } from '../collectionUtils'

// App owns one instance and shares these values/actions across the existing pages.
export function useCollection() {
  const [collection, setCollection] = useState(getStoredCollection)

  useEffect(() => {
    saveCollection(collection)
  }, [collection])

  function setStatus(productId, status) {
    setCollection((current) => setCollectionStatus(current, productId, status))
  }

  function removeFavorite(productId) {
    setCollection((current) => removeCollectionProduct(current, productId))
  }

  return { collection, favoriteCount: getCollectionCount(collection), setStatus, removeFavorite }
}
