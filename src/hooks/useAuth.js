import { useState, useEffect, useCallback } from 'react'
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [hogarId, setHogarId] = useState(null)
  const [alias, setAlias] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        // Buscar datos del usuario en Firestore
        try {
          const userDoc = await getDoc(doc(db, 'usuarios', firebaseUser.uid))
          if (userDoc.exists()) {
            const data = userDoc.data()
            setHogarId(data.hogarId)
            setAlias(data.alias)
          }
        } catch (e) {
          console.error('Error loading user data:', e)
        }
      } else {
        // Login anónimo automático
        try {
          await signInAnonymously(auth)
        } catch (e) {
          console.error('Error signing in anonymously:', e)
        }
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const crearHogar = useCallback(async (nombre, aliasUsuario) => {
    if (!user) return null
    const codigo = generarCodigo()
    const hogarRef = doc(db, 'hogares', codigo)
    await setDoc(hogarRef, {
      nombre,
      codigo,
      creadoEn: new Date()
    })
    await setDoc(doc(db, 'usuarios', user.uid), {
      hogarId: codigo,
      alias: aliasUsuario,
      creadoEn: new Date()
    })
    setHogarId(codigo)
    setAlias(aliasUsuario)
    return codigo
  }, [user])

  const unirseHogar = useCallback(async (codigo, aliasUsuario) => {
    if (!user) return false
    const hogarRef = doc(db, 'hogares', codigo.toUpperCase())
    const hogarDoc = await getDoc(hogarRef)
    if (!hogarDoc.exists()) return false

    await setDoc(doc(db, 'usuarios', user.uid), {
      hogarId: codigo.toUpperCase(),
      alias: aliasUsuario,
      creadoEn: new Date()
    })
    setHogarId(codigo.toUpperCase())
    setAlias(aliasUsuario)
    return true
  }, [user])

  const cambiarHogar = useCallback(async () => {
    if (!user) return
    const { deleteDoc } = await import('firebase/firestore')
    await deleteDoc(doc(db, 'usuarios', user.uid))
    setHogarId(null)
    setAlias(null)
  }, [user])

  return { user, hogarId, alias, loading, crearHogar, unirseHogar, cambiarHogar }
}

function generarCodigo() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}
