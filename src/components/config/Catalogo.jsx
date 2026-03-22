import { useState } from 'react'
import { useCatalogo } from '../../hooks/useCatalogo'
import { useCollection } from '../../hooks/useFirestore'
import { getCategoria, CATEGORIAS_DEFAULT } from '../../utils/categorizar'
import { formatColones } from '../../utils/formatColones'
import Header from '../layout/Header'

export default function Catalogo({ hogarId }) {
  const { productos, actualizarProducto, desactivarProducto } = useCatalogo(hogarId)
  const { data: categorias } = useCollection(hogarId ? `hogares/${hogarId}/categorias` : null)
  const [filtro, setFiltro] = useState('')
  const [editando, setEditando] = useState(null)
  const [formData, setFormData] = useState({})

  const activos = productos.filter(p => p.activo !== false)
  const filtrados = filtro
    ? activos.filter(p =>
        p.nombreCorto?.toLowerCase().includes(filtro.toLowerCase()) ||
        p.nombre?.toLowerCase().includes(filtro.toLowerCase())
      )
    : activos

  const porCategoria = {}
  filtrados.forEach(p => {
    const catId = p.categoriaId || 'otros'
    if (!porCategoria[catId]) porCategoria[catId] = []
    porCategoria[catId].push(p)
  })

  const cats = categorias?.length > 0 ? categorias : CATEGORIAS_DEFAULT

  const startEdit = (producto) => {
    setEditando(producto.id)
    setFormData({
      nombreCorto: producto.nombreCorto || '',
      nombre: producto.nombre || '',
      categoriaId: producto.categoriaId || 'otros'
    })
  }

  const handleSave = async () => {
    if (!editando || !formData.nombreCorto?.trim()) return
    await actualizarProducto(editando, {
      nombreCorto: formData.nombreCorto.trim(),
      nombre: formData.nombre.trim(),
      categoriaId: formData.categoriaId
    })
    setEditando(null)
  }

  const handleDesactivar = async () => {
    if (!editando) return
    await desactivarProducto(editando)
    setEditando(null)
  }

  return (
    <div>
      <Header title={`Catálogo (${activos.length})`} showBack />

      <div className="p-4">
        <input
          type="text"
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
          placeholder="Filtrar productos..."
          className="w-full px-4 py-3 bg-gray-100 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div className="px-4 pb-4">
        {Object.entries(porCategoria)
          .sort(([a], [b]) => {
            const catA = getCategoria(a)
            const catB = getCategoria(b)
            return (catA.ordenDefault || 99) - (catB.ordenDefault || 99)
          })
          .map(([catId, prods]) => {
            const cat = getCategoria(catId)
            return (
              <div key={catId} className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">{cat.icono}</span>
                  <span className="text-sm font-semibold text-gray-600">{cat.nombre}</span>
                  <span className="text-xs text-gray-400">({prods.length})</span>
                </div>
                <div className="space-y-1">
                  {prods.sort((a, b) => (b.frecuencia || 0) - (a.frecuencia || 0)).map(p => (
                    <button
                      key={p.id}
                      onClick={() => startEdit(p)}
                      className="w-full flex items-center gap-2 p-2 bg-white rounded-lg text-left active:bg-gray-50 tap-highlight"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{p.nombreCorto}</p>
                        <p className="text-xs text-gray-400 truncate">{p.nombre}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {p.precioUnitarioRef && (
                          <p className="text-xs text-gray-500">{formatColones(p.precioUnitarioRef)}</p>
                        )}
                        <p className="text-[10px] text-gray-400">{p.frecuencia || 0}x</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
      </div>

      {/* Bottom sheet de edición */}
      {editando && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sheet" onClick={() => setEditando(null)}>
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 pb-safe"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-center mb-3">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Editar producto</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre corto</label>
                <input
                  type="text"
                  value={formData.nombreCorto}
                  onChange={e => setFormData({ ...formData, nombreCorto: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                  {cats.sort((a, b) => (a.ordenDefault || 99) - (b.ordenDefault || 99)).map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setFormData({ ...formData, categoriaId: cat.id })}
                      className={`flex flex-col items-center p-2 rounded-xl text-center transition-colors ${
                        formData.categoriaId === cat.id
                          ? 'bg-emerald-50 border-2 border-emerald-500'
                          : 'bg-gray-50 border-2 border-transparent active:bg-gray-100'
                      }`}
                    >
                      <span className="text-xl mb-0.5">{cat.icono}</span>
                      <span className="text-[10px] text-gray-600 leading-tight">{cat.nombre}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleDesactivar}
                  className="px-4 py-3 bg-red-50 text-red-600 rounded-xl font-medium text-sm active:bg-red-100 flex-shrink-0"
                >
                  Desactivar
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-semibold active:bg-emerald-600"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
