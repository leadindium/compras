import { useState, useEffect, useCallback, useMemo } from 'react'
import { collection, doc, addDoc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { searchProducts, findDuplicate } from '../utils/fuzzySearch'

export function useCatalogo(hogarId) {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!hogarId) return

    const ref = collection(db, `hogares/${hogarId}/catalogo`)
    const unsubscribe = onSnapshot(ref, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setProductos(items)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [hogarId])

  const frecuentes = useMemo(() => {
    return [...productos]
      .filter(p => p.activo !== false)
      .sort((a, b) => (b.frecuencia || 0) - (a.frecuencia || 0))
      .slice(0, 25)
  }, [productos])

  const buscar = useCallback((query) => {
    const activos = productos.filter(p => p.activo !== false)
    return searchProducts(query, activos)
  }, [productos])

  const verificarDuplicado = useCallback((nombre) => {
    return findDuplicate(nombre, productos)
  }, [productos])

  const agregarProducto = useCallback(async (producto) => {
    if (!hogarId) return null
    const ref = collection(db, `hogares/${hogarId}/catalogo`)
    const docRef = await addDoc(ref, {
      nombre: producto.nombre,
      nombreCorto: producto.nombreCorto || producto.nombre,
      categoriaId: producto.categoriaId || 'otros',
      unidadTipo: producto.unidadTipo || 'unidad',
      unidadDetalle: producto.unidadDetalle || '',
      cantidadDefault: producto.cantidadDefault || 1,
      frecuencia: 0,
      ultimaCompra: null,
      precioUnitarioRef: producto.precioUnitarioRef || null,
      activo: true
    })
    return docRef.id
  }, [hogarId])

  const actualizarProducto = useCallback(async (productoId, datos) => {
    if (!hogarId) return
    const ref = doc(db, `hogares/${hogarId}/catalogo`, productoId)
    await updateDoc(ref, datos)
  }, [hogarId])

  const desactivarProducto = useCallback(async (productoId) => {
    if (!hogarId) return
    const ref = doc(db, `hogares/${hogarId}/catalogo`, productoId)
    await updateDoc(ref, { activo: false })
  }, [hogarId])

  const mergeProductos = useCallback(async (productoKeepId, productoDeleteId) => {
    if (!hogarId) return
    // Desactivar el duplicado, mantener el principal
    const ref = doc(db, `hogares/${hogarId}/catalogo`, productoDeleteId)
    await updateDoc(ref, { activo: false, mergedInto: productoKeepId })
  }, [hogarId])

  const porCategoria = useMemo(() => {
    const grupos = {}
    productos.filter(p => p.activo !== false).forEach(p => {
      const catId = p.categoriaId || 'otros'
      if (!grupos[catId]) grupos[catId] = []
      grupos[catId].push(p)
    })
    // Ordenar por frecuencia dentro de cada categoría
    Object.keys(grupos).forEach(catId => {
      grupos[catId].sort((a, b) => (b.frecuencia || 0) - (a.frecuencia || 0))
    })
    return grupos
  }, [productos])

  return {
    productos,
    frecuentes,
    porCategoria,
    loading,
    buscar,
    verificarDuplicado,
    agregarProducto,
    actualizarProducto,
    desactivarProducto,
    mergeProductos
  }
}
