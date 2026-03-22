import { useState, useRef, useMemo } from 'react'
import { getCategoria, CATEGORIAS_DEFAULT } from '../../utils/categorizar'
import NuevoProducto from './NuevoProducto'

export default function AgregarItem({ catalogo, categorias, onAgregar, onClose }) {
  const [busqueda, setBusqueda] = useState('')
  const [agregados, setAgregados] = useState({}) // { productoId: cantidad }
  const [mostrarNuevo, setMostrarNuevo] = useState(false)
  const searchRef = useRef(null)

  const cats = categorias?.length > 0 ? categorias : CATEGORIAS_DEFAULT
  const catsSorted = [...cats].sort((a, b) => (a.ordenDefault || 99) - (b.ordenDefault || 99))

  // Filtrar productos por búsqueda o mostrar todos agrupados por categoría
  const resultados = useMemo(() => {
    if (busqueda.trim().length >= 2) {
      return catalogo.buscar(busqueda)
    }
    return null
  }, [busqueda, catalogo])

  const handleAgregar = (producto) => {
    const cant = 1
    onAgregar(producto, cant, '')
    setAgregados(prev => ({ ...prev, [producto.id]: (prev[producto.id] || 0) + 1 }))
  }

  const handleCantidadChange = (producto, nuevaCantidad) => {
    if (nuevaCantidad < 1) return
    const diff = nuevaCantidad - (agregados[producto.id] || 1)
    // We track the displayed quantity; actual list item quantity is managed separately
    setAgregados(prev => ({ ...prev, [producto.id]: nuevaCantidad }))
  }

  const handleNuevoProducto = async (producto) => {
    const id = await catalogo.agregarProducto(producto)
    if (id) {
      onAgregar({ ...producto, id }, 1, '')
      setAgregados(prev => ({ ...prev, [id]: 1 }))
      setMostrarNuevo(false)
    }
  }

  // Render un producto en la lista
  const renderProducto = (producto) => {
    const yaAgregado = agregados[producto.id]
    const cat = getCategoria(producto.categoriaId)

    return (
      <div
        key={producto.id}
        className="flex items-center gap-2 py-2.5 px-1"
      >
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${yaAgregado ? 'text-emerald-700' : 'text-gray-900'}`}>
            {producto.nombreCorto || producto.nombre}
          </p>
        </div>

        {yaAgregado ? (
          <div className="flex items-center bg-emerald-50 rounded-lg border border-emerald-200">
            <button
              onClick={() => handleCantidadChange(producto, yaAgregado - 1)}
              className="w-8 h-8 flex items-center justify-center text-emerald-600 text-lg"
            >
              -
            </button>
            <span className="w-6 text-center text-sm font-semibold text-emerald-700">{yaAgregado}</span>
            <button
              onClick={() => handleCantidadChange(producto, yaAgregado + 1)}
              className="w-8 h-8 flex items-center justify-center text-emerald-600 text-lg"
            >
              +
            </button>
          </div>
        ) : (
          <button
            onClick={() => handleAgregar(producto)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-500 text-white text-lg font-light active:bg-emerald-600 active:scale-95 transition-all flex-shrink-0"
          >
            +
          </button>
        )}
      </div>
    )
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

  const totalAgregados = Object.values(agregados).reduce((sum, c) => sum + c, 0)

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sheet" onClick={onClose}>
      <div
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl flex flex-col"
        style={{ maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle + header */}
        <div className="flex-shrink-0">
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>

          <div className="flex items-center justify-between px-4 pb-2">
            <h3 className="text-lg font-semibold text-gray-900">Agregar productos</h3>
            {totalAgregados > 0 && (
              <span className="text-sm text-emerald-600 font-medium">
                {totalAgregados} agregados
              </span>
            )}
          </div>

          {/* Búsqueda estilo Apple - sutil arriba */}
          <div className="px-4 pb-3">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={searchRef}
                type="text"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                placeholder="Buscar producto..."
                className="w-full pl-9 pr-8 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:bg-gray-50 focus:ring-2 focus:ring-emerald-500"
              />
              {busqueda && (
                <button
                  onClick={() => { setBusqueda(''); searchRef.current?.focus() }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content: búsqueda o categorías */}
        <div className="flex-1 overflow-y-auto px-4 pb-safe scrollbar-hide">
          {resultados !== null ? (
            // Resultados de búsqueda
            <div>
              {resultados.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {resultados.map(p => renderProducto(p))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-sm mb-3">No se encontró "{busqueda}"</p>
                  <button
                    onClick={() => setMostrarNuevo(true)}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium active:bg-emerald-600"
                  >
                    Crear producto nuevo
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Vista de todas las categorías expandidas
            <div>
              {catsSorted.map(cat => {
                const prods = (catalogo.porCategoria[cat.id] || [])
                if (prods.length === 0) return null

                return (
                  <div key={cat.id} className="mb-4">
                    {/* Header categoría */}
                    <div className="flex items-center gap-2 py-1.5 sticky top-0 bg-white z-10">
                      <span className="text-base">{cat.icono}</span>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{cat.nombre}</span>
                      <div className="flex-1 h-px bg-gray-100" />
                    </div>
                    {/* Productos */}
                    <div className="divide-y divide-gray-50">
                      {prods.map(p => renderProducto(p))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer: botón cerrar */}
        <div className="flex-shrink-0 px-4 py-3 border-t border-gray-100 bg-white">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold active:bg-gray-800"
          >
            {totalAgregados > 0 ? `Listo (${totalAgregados} productos)` : 'Cerrar'}
          </button>
        </div>
      </div>
    </div>
  )
}
