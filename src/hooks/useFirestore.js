import { useState, useEffect } from 'react'
import { collection, doc as firestoreDoc, query, onSnapshot, orderBy } from 'firebase/firestore'
import { db } from '../firebase'

/**
 * Hook genérico para suscribirse a una colección de Firestore en tiempo real
 */
export function useCollection(path, queryConstraints = []) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!path) {
      setLoading(false)
      return
    }

    setLoading(true)
    const ref = collection(db, path)
    const q = queryConstraints.length > 0 ? query(ref, ...queryConstraints) : ref

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setData(items)
        setLoading(false)
        setError(null)
      },
      (err) => {
        console.error(`Error in collection ${path}:`, err)
        setError(err)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [path])

  return { data, loading, error }
}

/**
 * Hook para suscribirse a un documento específico
 */
export function useDocument(path) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!path) {
      setLoading(false)
      return
    }

    const ref = firestoreDoc(db, path)

    const unsubscribe = onSnapshot(ref,
      (snapshot) => {
        if (snapshot.exists()) {
          setData({ id: snapshot.id, ...snapshot.data() })
        } else {
          setData(null)
        }
        setLoading(false)
      },
      (err) => {
        console.error(`Error in document ${path}:`, err)
        setError(err)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [path])

  return { data, loading, error }
}
