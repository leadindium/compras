import { useState, useEffect } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'

export function usePrecios(hogarId, productoId) {
  const [precios, setPrecios] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!hogarId || !productoId) {
      setLoading(false)
      return
    }

    const ref = collection(db, `hogares/${hogarId}/catalogo/${productoId}/precios`)
    const unsubscribe = onSnapshot(ref, (snapshot) => {
      const items = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => (a.fecha || '').localeCompare(b.fecha || ''))
      setPrecios(items)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [hogarId, productoId])

  return { precios, loading }
}
