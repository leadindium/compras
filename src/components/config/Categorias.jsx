import { useState } from 'react'
import { doc, updateDoc, deleteDoc, collection, getDocs, writeBatch } from 'firebase/firestore'
import { db } from '../../firebase'
import { useCollection } from '../../hooks/useFirestore'
import { useCatalogo } from '../../hooks/useCatalogo'
import Header from '../layout/Header'

const EMOJI_OPTIONS = ['🥬', '🥩', '🐟', '🧀', '🥚', '🥫', '🍝', '🍞', '🧂', '🥤', '🍪', '🥣', '🧊', '🧹', '🧴', '📦', '🍕', '🥜', '🧈', '🍯', '🥛', '🍎', '🥑', '🌽', '🍗', '🧃']

export default function Categorias({ hogarId }) {
  const { data: categorias } = useCollection(hogarId ? `hogares/${hogarId}/categorias` : null)
  const { productos } = useCatalogo(hogarId)
  const [editando, setEditando] = useState(null)
  const [formData, setFormData] = useState({})
  const [fusionando, setFusionando] = useState(null)
  const [procesando, setProcesando] = useState(false)

  const sorted = [...categorias].sort((a, b) => (a.ordenDefault || 99) - (b.ordenDefault || 99))

  const startEdit = (cat) => {
    setEditando(cat.id)
    setFormData({ nombre: cat.nombre, icono: cat.icono })
    setFusionando(null)
  }

  const handleSave = async () => {
    if (!editando || !formData.nombre?.trim()) return
    await updateDoc(doc(db, `hogares/${hogarId}/categorias`, editando), {
      nombre: formData.nombre.trim(),
      icono: formData.icono
    })
    setEditando(null)
  }

  const handleFusionar = async (destinoId) => {
    if (!fusionando || !destinoId || fusionando === destinoId) return
    setProcesando(true)

    // Mover todos los productos de la categoría origen a la destino
    const productosAMover = productos.filter(p => p.categoriaId === fusionando && p.activo !== false)

    const batch = writeBatch(db)
    for (const producto of productosAMover) {
      const ref = doc(db, `hogares/${hogarId}/catalogo`, producto.id)
      batch.update(ref, { categoriaId: destinoId })
    }

    // Eliminar la categoría origen
    batch.delete(doc(db, `hogares/${hogarId}/categorias`, fusionando))

    await batch.commit()

    setProcesando(false)
    setFusionando(null)
    setEditando(null)
  }

  const conteoProductos = (catId) => {
    return productos.filter(p => p.categoriaId === catId && p.activo !== false).length
  }

  return (
    <div>
      <Header title="Categorías" showBack />
      <div className="p-4 space-y-1">
        {sorted.map(cat => (
          <button
            key={cat.id}
            onClick={() => startEdit(cat)}
            className="w-full flex items-center gap-3 p-3 bg-white rounded-xl text-left active:bg-gray-50 tap-highlight"
          >
            <span
              className="w-2 h-8 rounded-full flex-shrink-0"
              style={{ backgroundColor: cat.colorHex || '#9CA3AF' }}
            />
            <span className="text-xl">{cat.icono}</span>
            <div className="flex-1">
              <p className="font-medium text-sm text-gray-900">{cat.nombre}</p>
              <p className="text-xs text-gray-400">{conteoProductos(cat.id)} productos</p>
            </div>
            <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>

      {/* Bottom sheet de edición */}
      {editando && !fusionando && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sheet" onClick={() => setEditando(null)}>
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 pb-safe"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-center mb-3">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Editar categoría</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ícono</label>
                <div className="grid grid-cols-8 gap-2">
                  {EMOJI_OPTIONS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => setFormData({ ...formData, icono: emoji })}
                      className={`text-2xl p-2 rounded-lg text-center transition-colors ${
                        formData.icono === emoji
                          ? 'bg-emerald-50 border-2 border-emerald-500'
                          : 'bg-gray-50 border-2 border-transparent'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSave}
                className="w-full py-3 bg-emerald-500 text-white rounded-xl font-semibold active:bg-emerald-600"
              >
                Guardar
              </button>

              {categorias.length > 1 && editando !== 'otros' && (
                <button
                  onClick={() => setFusionando(editando)}
                  className="w-full py-3 bg-amber-50 text-amber-700 rounded-xl font-medium text-sm active:bg-amber-100"
                >
                  Fusionar con otra categoría ({conteoProductos(editando)} productos se moverán)
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Selección de categoría destino para fusión */}
      {fusionando && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sheet" onClick={() => setFusionando(null)}>
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 pb-safe max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-center mb-3">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Fusionar categoría</h3>
            <p className="text-sm text-gray-500 mb-4">
              Los {conteoProductos(fusionando)} productos de "{categorias.find(c => c.id === fusionando)?.nombre}" se moverán a la categoría que elijas, y la original se eliminará.
            </p>

            {procesando ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-500">Fusionando...</p>
              </div>
            ) : (
              <div className="space-y-1">
                {sorted.filter(c => c.id !== fusionando).map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => handleFusionar(cat.id)}
                    className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-xl text-left active:bg-emerald-50 tap-highlight"
                  >
                    <span className="text-xl">{cat.icono}</span>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900">{cat.nombre}</p>
                      <p className="text-xs text-gray-400">{conteoProductos(cat.id)} productos</p>
                    </div>
                    <span className="text-xs text-emerald-600 font-medium">Mover aquí</span>
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => setFusionando(null)}
              className="w-full py-3 mt-3 text-gray-500 text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
