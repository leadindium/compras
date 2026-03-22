import { useState } from 'react'
import ProductosFrecuentes from './ProductosFrecuentes'
import ProductosPorCategoria from './ProductosPorCategoria'
import BuscarProducto from './BuscarProducto'
import NuevoProducto from './NuevoProducto'

const TABS = [
  { id: 'frecuentes', label: 'Frecuentes' },
  { id: 'categoria', label: 'Por categoría' },
  { id: 'buscar', label: 'Buscar' }
]

export default function AgregarItem({ catalogo, categorias, onAgregar, onClose }) {
  const [tab, setTab] = useState('frecuentes')
  const [productoSeleccionado, setProductoSeleccionado] = useState(null)
  const [cantidad, setCantidad] = useState(1)
  const [notas, setNotas] = useState('')
  const [mostrarNuevo, setMostrarNuevo] = useState(false)

  const handleSeleccionar = (producto) => {
    setProductoSeleccionado(producto)
    setCantidad(producto.cantidadDefault || 1)
    setNotas('')
  }

  const handleAgregar = () => {
    if (!productoSeleccionado) return
    onAgregar(productoSeleccionado, cantidad, notas)
    setProductoSeleccionado(null)
    setCantidad(1)
    setNotas('')
  }

  const handleNuevoProducto = async (producto) => {
    const id = await catalogo.agregarProducto(producto)
    if (id) {
      onAgregar({ ...producto, id }, 1, '')
      setMostrarNuevo(false)
    }
  }

  if (mostrarNuevo) {
    return (
      <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sheet" onClick={() => setMostrarNuevo(false)}>
        <div
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[85vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <NuevoProducto
            categorias={categorias}
            onCrear={handleNuevoProducto}
            onCancel={() => setMostrarNuevo(false)}
            verificarDuplicado={catalogo.verificarDuplicado}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sheet" onClick={onClose}>
      <div
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Producto seleccionado - mini form */}
        {productoSeleccionado && (
          <div className="px-4 py-3 bg-emerald-50 border-b border-emerald-100">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">{productoSeleccionado.nombreCorto || productoSeleccionado.nombre}</span>
              <button onClick={() => setProductoSeleccionado(null)} className="text-gray-400 text-sm">Cambiar</button>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-white rounded-xl border border-gray-200">
                <button
                  onClick={() => cantidad > 1 && setCantidad(cantidad - 1)}
                  className="w-10 h-10 flex items-center justify-center text-lg text-gray-500 active:bg-gray-50 rounded-l-xl"
                >
                  -
                </button>
                <span className="w-10 text-center font-semibold">{cantidad}</span>
                <button
                  onClick={() => setCantidad(cantidad + 1)}
                  className="w-10 h-10 flex items-center justify-center text-lg text-gray-500 active:bg-gray-50 rounded-r-xl"
                >
                  +
                </button>
              </div>
              <input
                type="text"
                value={notas}
                onChange={e => setNotas(e.target.value)}
                placeholder="Nota (opcional)"
                className="flex-1 px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleAgregar}
                className="px-4 py-2 bg-emerald-500 text-white rounded-xl font-semibold active:bg-emerald-600"
              >
                Agregar
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-4">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                tab === t.id
                  ? 'text-emerald-600 border-b-2 border-emerald-500'
                  : 'text-gray-400'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-safe" style={{ maxHeight: productoSeleccionado ? '40vh' : '60vh' }}>
          {tab === 'frecuentes' && (
            <ProductosFrecuentes
              productos={catalogo.frecuentes}
              onSelect={handleSeleccionar}
            />
          )}
          {tab === 'categoria' && (
            <ProductosPorCategoria
              porCategoria={catalogo.porCategoria}
              categorias={categorias}
              onSelect={handleSeleccionar}
            />
          )}
          {tab === 'buscar' && (
            <BuscarProducto
              onSearch={catalogo.buscar}
              onSelect={handleSeleccionar}
              onNuevo={() => setMostrarNuevo(true)}
            />
          )}
        </div>
      </div>
    </div>
  )
}
