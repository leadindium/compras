import { useState, useRef, useCallback } from 'react'
import { doc, updateDoc, writeBatch } from 'firebase/firestore'
import { db } from '../../firebase'
import { useCollection } from '../../hooks/useFirestore'
import Header from '../layout/Header'

export default function Sucursales({ hogarId }) {
  const { data: sucursales } = useCollection(hogarId ? `hogares/${hogarId}/sucursales` : null)
  const { data: categorias } = useCollection(hogarId ? `hogares/${hogarId}/categorias` : null)
  const [editando, setEditando] = useState(null)

  // Drag state
  const [localOrder, setLocalOrder] = useState(null)
  const [draggingIdx, setDraggingIdx] = useState(null)
  const [dragOverIdx, setDragOverIdx] = useState(null)
  const touchStartY = useRef(0)
  const rowRefs = useRef({})
  const containerRef = useRef(null)

  const sucursalActual = sucursales.find(s => s.id === editando)

  const catOrdenadas = editando && categorias
    ? [...categorias].sort((a, b) => {
        const oa = a.ordenPorSucursal?.[editando] ?? a.ordenDefault ?? 99
        const ob = b.ordenPorSucursal?.[editando] ?? b.ordenDefault ?? 99
        return oa - ob
      })
    : []

  // Use local order if dragging, otherwise Firestore order
  const displayOrder = localOrder || catOrdenadas

  const saveOrder = useCallback(async (newOrder) => {
    const batch = writeBatch(db)
    newOrder.forEach((cat, idx) => {
      batch.update(doc(db, `hogares/${hogarId}/categorias`, cat.id), {
        [`ordenPorSucursal.${editando}`]: idx + 1
      })
    })
    await batch.commit()
  }, [hogarId, editando])

  // Touch drag handlers
  const handleTouchStart = (e, idx) => {
    touchStartY.current = e.touches[0].clientY
    setDraggingIdx(idx)
    setDragOverIdx(idx)
    setLocalOrder([...displayOrder])
  }

  const handleTouchMove = (e, idx) => {
    if (draggingIdx === null) return
    e.preventDefault()

    const touchY = e.touches[0].clientY

    // Find which row we're over
    const entries = Object.entries(rowRefs.current)
    for (const [key, el] of entries) {
      if (!el) continue
      const rect = el.getBoundingClientRect()
      if (touchY >= rect.top && touchY <= rect.bottom) {
        const overIdx = parseInt(key)
        if (overIdx !== dragOverIdx) {
          setDragOverIdx(overIdx)
          // Reorder the local array
          setLocalOrder(prev => {
            if (!prev) return prev
            const next = [...prev]
            const [moved] = next.splice(draggingIdx, 1)
            next.splice(overIdx, 0, moved)
            setDraggingIdx(overIdx)
            return next
          })
        }
        break
      }
    }
  }

  const handleTouchEnd = async () => {
    if (localOrder) {
      await saveOrder(localOrder)
    }
    setDraggingIdx(null)
    setDragOverIdx(null)
    setLocalOrder(null)
  }

  return (
    <div>
      <Header title="Sucursales" showBack />

      {!editando ? (
        <div className="p-4 space-y-2">
          {sucursales.map(suc => (
            <button
              key={suc.id}
              onClick={() => setEditando(suc.id)}
              className="w-full flex items-center gap-3 p-4 bg-white rounded-xl text-left active:bg-gray-50 tap-highlight"
            >
              <span className="text-xl">🏪</span>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{suc.nombre}</p>
                <p className="text-sm text-gray-400">{suc.direccion}</p>
              </div>
              <span className="text-xs text-emerald-600 font-medium">Editar orden</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-900">{sucursalActual?.nombre}</h2>
              <p className="text-sm text-gray-400">Mantené presionado ≡ y arrastrá</p>
            </div>
            <button onClick={() => setEditando(null)} className="text-sm text-emerald-600 font-medium">
              Listo
            </button>
          </div>

          <div ref={containerRef} className="space-y-1">
            {displayOrder.map((cat, idx) => (
              <div
                key={cat.id}
                ref={el => rowRefs.current[idx] = el}
                className={`flex items-center gap-2 p-3 bg-white rounded-xl transition-shadow ${
                  draggingIdx === idx ? 'shadow-lg scale-[1.02] z-10 relative bg-emerald-50' : ''
                }`}
              >
                {/* Drag handle */}
                <div
                  onTouchStart={e => handleTouchStart(e, idx)}
                  onTouchMove={e => handleTouchMove(e, idx)}
                  onTouchEnd={handleTouchEnd}
                  className="w-8 h-10 flex items-center justify-center text-gray-300 cursor-grab active:text-gray-500 touch-none"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 6h2v2H8V6zm6 0h2v2h-2V6zM8 11h2v2H8v-2zm6 0h2v2h-2v-2zm-6 5h2v2H8v-2zm6 0h2v2h-2v-2z" />
                  </svg>
                </div>
                <span className="text-sm text-gray-400 w-5 text-center">{idx + 1}</span>
                <span className="text-lg">{cat.icono}</span>
                <span className="flex-1 text-sm font-medium text-gray-700">{cat.nombre}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
