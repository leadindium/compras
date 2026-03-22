import { useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import { useCollection } from '../../hooks/useFirestore'
import Header from '../layout/Header'

export default function Sucursales({ hogarId }) {
  const { data: sucursales } = useCollection(hogarId ? `hogares/${hogarId}/sucursales` : null)
  const { data: categorias } = useCollection(hogarId ? `hogares/${hogarId}/categorias` : null)
  const [editando, setEditando] = useState(null) // sucursalId

  const sucursalActual = sucursales.find(s => s.id === editando)

  const catOrdenadas = editando && categorias
    ? [...categorias].sort((a, b) => {
        const oa = a.ordenPorSucursal?.[editando] ?? a.ordenDefault ?? 99
        const ob = b.ordenPorSucursal?.[editando] ?? b.ordenDefault ?? 99
        return oa - ob
      })
    : []

  const moverCategoria = async (catId, direccion) => {
    const idx = catOrdenadas.findIndex(c => c.id === catId)
    const swapIdx = idx + direccion
    if (swapIdx < 0 || swapIdx >= catOrdenadas.length) return

    const catA = catOrdenadas[idx]
    const catB = catOrdenadas[swapIdx]

    const ordenA = catA.ordenPorSucursal?.[editando] ?? catA.ordenDefault ?? idx
    const ordenB = catB.ordenPorSucursal?.[editando] ?? catB.ordenDefault ?? swapIdx

    // Swap orders
    await updateDoc(doc(db, `hogares/${hogarId}/categorias`, catA.id), {
      [`ordenPorSucursal.${editando}`]: ordenB
    })
    await updateDoc(doc(db, `hogares/${hogarId}/categorias`, catB.id), {
      [`ordenPorSucursal.${editando}`]: ordenA
    })
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
              <p className="text-sm text-gray-400">Arrastrá las categorías según el orden de pasillos</p>
            </div>
            <button onClick={() => setEditando(null)} className="text-sm text-emerald-600 font-medium">
              Listo
            </button>
          </div>

          <div className="space-y-1">
            {catOrdenadas.map((cat, idx) => (
              <div key={cat.id} className="flex items-center gap-2 p-3 bg-white rounded-xl">
                <span className="text-sm text-gray-400 w-6 text-center">{idx + 1}</span>
                <span className="text-lg">{cat.icono}</span>
                <span className="flex-1 text-sm font-medium text-gray-700">{cat.nombre}</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => moverCategoria(cat.id, -1)}
                    disabled={idx === 0}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 active:bg-gray-100 disabled:opacity-20"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => moverCategoria(cat.id, 1)}
                    disabled={idx === catOrdenadas.length - 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 active:bg-gray-100 disabled:opacity-20"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
