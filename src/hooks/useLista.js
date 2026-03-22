import { useState, useEffect, useCallback } from 'react'
import {
  collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot,
  query, where, orderBy, limit, serverTimestamp, getDocs
} from 'firebase/firestore'
import { db } from '../firebase'

export function useLista(hogarId) {
  const [listaActiva, setListaActiva] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  // Suscribirse a la lista activa
  useEffect(() => {
    if (!hogarId) return
    const listasRef = collection(db, `hogares/${hogarId}/listas`)
    const q = query(listasRef, where('estado', '==', 'activa'), limit(1))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.docs.length > 0) {
        setListaActiva({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() })
      } else {
        setListaActiva(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [hogarId])

  // Suscribirse a los items de la lista activa
  useEffect(() => {
    if (!hogarId || !listaActiva?.id) {
      setItems([])
      return
    }

    const itemsRef = collection(db, `hogares/${hogarId}/listas/${listaActiva.id}/items`)
    const unsubscribe = onSnapshot(itemsRef, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    })

    return () => unsubscribe()
  }, [hogarId, listaActiva?.id])

  const crearLista = useCallback(async (nombre) => {
    if (!hogarId) return
    const listasRef = collection(db, `hogares/${hogarId}/listas`)
    const docRef = await addDoc(listasRef, {
      nombre: nombre || `Semana ${new Date().toLocaleDateString('es-CR', { day: 'numeric', month: 'short', year: 'numeric' })}`,
      estado: 'activa',
      creadaEn: serverTimestamp(),
      completadaEn: null,
      sucursalSeleccionada: null,
      totalReal: 0,
      totalEstimado: 0
    })
    return docRef.id
  }, [hogarId])

  const agregarItem = useCallback(async (producto, cantidad = 1, notas = '', alias = '') => {
    if (!hogarId || !listaActiva?.id) return

    const itemsRef = collection(db, `hogares/${hogarId}/listas/${listaActiva.id}/items`)
    await addDoc(itemsRef, {
      productoId: producto.id || null,
      nombre: producto.nombre,
      nombreCorto: producto.nombreCorto || producto.nombre,
      cantidad,
      unidadTipo: producto.unidadTipo || 'unidad',
      unidadDetalle: producto.unidadDetalle || '',
      categoriaId: producto.categoriaId || 'otros',
      comprado: false,
      compradoEn: null,
      compradoPor: null,
      agregadoPor: alias,
      agregadoEn: serverTimestamp(),
      notas: notas,
      costoReal: null
    })
  }, [hogarId, listaActiva?.id])

  const toggleComprado = useCallback(async (itemId, alias) => {
    if (!hogarId || !listaActiva?.id) return
    const item = items.find(i => i.id === itemId)
    if (!item) return

    const itemRef = doc(db, `hogares/${hogarId}/listas/${listaActiva.id}/items`, itemId)
    await updateDoc(itemRef, {
      comprado: !item.comprado,
      compradoEn: !item.comprado ? serverTimestamp() : null,
      compradoPor: !item.comprado ? alias : null
    })
  }, [hogarId, listaActiva?.id, items])

  const actualizarCantidad = useCallback(async (itemId, cantidad) => {
    if (!hogarId || !listaActiva?.id || cantidad < 1) return
    const itemRef = doc(db, `hogares/${hogarId}/listas/${listaActiva.id}/items`, itemId)
    await updateDoc(itemRef, { cantidad })
  }, [hogarId, listaActiva?.id])

  const eliminarItem = useCallback(async (itemId) => {
    if (!hogarId || !listaActiva?.id) return
    const itemRef = doc(db, `hogares/${hogarId}/listas/${listaActiva.id}/items`, itemId)
    await deleteDoc(itemRef)
  }, [hogarId, listaActiva?.id])

  const actualizarCostoReal = useCallback(async (itemId, costoReal) => {
    if (!hogarId || !listaActiva?.id) return
    const itemRef = doc(db, `hogares/${hogarId}/listas/${listaActiva.id}/items`, itemId)
    await updateDoc(itemRef, { costoReal })
  }, [hogarId, listaActiva?.id])

  const completarLista = useCallback(async () => {
    if (!hogarId || !listaActiva?.id) return
    const listaRef = doc(db, `hogares/${hogarId}/listas`, listaActiva.id)
    const totalReal = items.reduce((sum, i) => sum + (i.costoReal || 0), 0)
    await updateDoc(listaRef, {
      estado: 'completada',
      completadaEn: serverTimestamp(),
      totalReal
    })
  }, [hogarId, listaActiva?.id, items])

  const seleccionarSucursal = useCallback(async (sucursalId) => {
    if (!hogarId || !listaActiva?.id) return
    const listaRef = doc(db, `hogares/${hogarId}/listas`, listaActiva.id)
    await updateDoc(listaRef, { sucursalSeleccionada: sucursalId })
  }, [hogarId, listaActiva?.id])

  const archivarYCrearNueva = useCallback(async () => {
    if (!hogarId) return
    // Archivar lista actual si existe
    if (listaActiva?.id) {
      const listaRef = doc(db, `hogares/${hogarId}/listas`, listaActiva.id)
      const totalReal = items.reduce((sum, i) => sum + (i.costoReal || 0), 0)
      await updateDoc(listaRef, {
        estado: 'archivada',
        completadaEn: serverTimestamp(),
        totalReal
      })
    }
    // Crear nueva
    await crearLista()
  }, [hogarId, listaActiva?.id, items, crearLista])

  return {
    listaActiva,
    items,
    loading,
    crearLista,
    agregarItem,
    toggleComprado,
    actualizarCantidad,
    eliminarItem,
    actualizarCostoReal,
    completarLista,
    seleccionarSucursal,
    archivarYCrearNueva
  }
}
