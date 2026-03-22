import { useState, useEffect, useMemo } from 'react'
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { calcularGastoLista, calcularGastoPorCategoria, agruparGastosPorSemana } from '../utils/preciosUtils'

export function useGastos(hogarId) {
  const [listas, setListas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!hogarId) return

    const ref = collection(db, `hogares/${hogarId}/listas`)
    const q = query(ref, where('estado', 'in', ['completada', 'archivada']))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setListas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      setLoading(false)
    })

    return () => unsubscribe()
  }, [hogarId])

  const resumenMes = useMemo(() => {
    const ahora = new Date()
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
    const inicioMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1)

    const listasEsteMes = listas.filter(l => {
      if (!l.completadaEn) return false
      const fecha = l.completadaEn.seconds ? new Date(l.completadaEn.seconds * 1000) : new Date(l.completadaEn)
      return fecha >= inicioMes
    })

    const listasMesAnterior = listas.filter(l => {
      if (!l.completadaEn) return false
      const fecha = l.completadaEn.seconds ? new Date(l.completadaEn.seconds * 1000) : new Date(l.completadaEn)
      return fecha >= inicioMesAnterior && fecha < inicioMes
    })

    const totalEsteMes = listasEsteMes.reduce((sum, l) => sum + (l.totalReal || 0), 0)
    const totalMesAnterior = listasMesAnterior.reduce((sum, l) => sum + (l.totalReal || 0), 0)
    const cambio = totalMesAnterior > 0 ? ((totalEsteMes - totalMesAnterior) / totalMesAnterior) * 100 : 0

    return {
      total: totalEsteMes,
      compras: listasEsteMes.length,
      cambioVsMesAnterior: Math.round(cambio * 10) / 10,
      totalMesAnterior
    }
  }, [listas])

  const gastoSemanal = useMemo(() => {
    return agruparGastosPorSemana(listas)
  }, [listas])

  return { listas, loading, resumenMes, gastoSemanal }
}
