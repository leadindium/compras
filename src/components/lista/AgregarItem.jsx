import { useState, useRef, useMemo, useEffect } from 'react'
import { getCategoria, CATEGORIAS_DEFAULT } from '../../utils/categorizar'
import NuevoProducto from './NuevoProducto'

export default function AgregarItem({ catalogo, categorias, onAgregar, onClose }) {
  const [busqueda, setBusqueda] = useState('')
  const [agregados, setAgregados] = useState({}) // { productoId: cantidad }
  const [mostrarNuevo, setMostrarNuevo] = useState(false)
  const [editandoProducto, setEditandoProducto] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [viewportHeight, setViewportHeight] = useState(window.visualViewport?.height || window.innerHeight)
  const searchRef = useRef(null)

  const cats = categorias?.length > 0 ? categorias : CATEGORIAS_DEFAULT
  const catsSorted = [...cats].sort((a, b) => (a.ordenDefault || 99) - (b.ordenDefault || 99))

  // Track visual viewport for iOS keyboard
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const onResize = () => setViewportHeight(vv.height)
    vv.addEventListener('resize', onResize)
    return () => vv.removeEventListener('resize', onResize)
  }, [])

  const resultados = useMemo(() => {
    if (busqueda.trim().length >= 2) {
      return catalogo.buscar(busqueda)
    }
    return null
  }, [busqueda, catalogo])

  const handleAgregar = (producto) => {
    onAgregar(producto, 1, '')
    setAgregados(prev => ({ ...prev, [producto.id]: (prev[producto.id] || 0) + 1 }))
  }

  const handleCantidadChange = (producto, nuevaCantidad) => {
    if (nuevaCantidad < 1) return
    setAgregados(prev => ({ ...prev, [producto.id]: nuevaCantidad }))
  }

  const handleNuevoProducto = async (producto) => {
    const id = await catalogo.agregarProducto(producto)
    if (id) {
      onAgregar({ ...producto, id }, 1, '')
      setAgregados(prev => ({ ...prev, [id]: 1 }))
      setMostrarNuevo(false)
      setBusqueda('')
    }
  }

  const startEditProducto = (producto) => {
    setEditandoProducto(producto.id)
    setEditForm({
      nombreCorto: producto.nombreCorto || '',
      nombre: producto.nombre || '',
      categoriaId: producto.categoriaId || 'otros'
    })
  }

  const saveEditProducto = async () => {
    if (!editandoProducto || !editForm.nombreCorto?.trim()) return
    await catalogo.actualizarProducto(editandoProducto, {
      nombreCorto: editForm.nombreCorto.trim(),
      nombre: editForm.nombre.trim(),
      categoriaId: editForm.categoriaId
    })
    setEditandoProducto(null)
  }

  const renderProducto = (producto) => {
    const yaAgregado = agregados[producto.id]

    return (
      <div key={producto.id} className="flex items-center gap-2 py-2.5 px-1">
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${yaAgregado ? 'text-emerald-700' : 'text-gray-900'}`}>
            {producto.nombreCorto || producto.nombre}
          </p>
        </div>

        {/* Edit button */}
        <button
          onClick={() => startEditProducto(producto)}
          className="w-7 h-7 flex items-center justify-center text-gray-300 active:text-gray-500 flex-shrink-0"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>

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

  // Sort products alphabetically within each category
  const sortAlpha = (prods) => [...prods].sort((a, b) =>
    (a.nombreCorto || a.nombre || '').localeCompare(b.nombreCorto || b.nombre || '', 'es')
  )

  // Edit product inline sheet
  if (editandoProducto) {
    return (
      <div className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sheet" onClick={() => setEditandoProducto(null)}>
        <div
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 pb-safe"
          style={{ maxHeight: `${viewportHeight * 0.7}px` }}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-center mb-3">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Editar producto</h3>
          <div className="space-y-3 overflow-y-auto">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre corto</label>
              <input
                type="text"
                value={editForm.nombreCorto}
                onChange={e => setEditForm({ ...editForm, nombreCorto: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
              <input
                type="text"
                value={editForm.nombre}
                onChange={e => setEditForm({ ...editForm, nombre: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
              <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto">
                {catsSorted.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setEditForm({ ...editForm, categoriaId: cat.id })}
                    className={`flex flex-col items-center p-1.5 rounded-xl text-center transition-colors ${
                      editForm.categoriaId === cat.id
                        ? 'bg-emerald-50 border-2 border-emerald-500'
                        : 'bg-gray-50 border-2 border-transparent'
                    }`}
                  >
                    <span className="text-lg">{cat.icono}</span>
                    <span className="text-[9px] text-gray-600 leading-tight">{cat.nombre}</span>
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={saveEditProducto}
              className="w-full py-3 bg-emerald-500 text-white rounded-xl font-semibold active:bg-emerald-600"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (mostrarNuevo) {
    return (
      <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sheet" onClick={() => setMostrarNuevo(false)}>
        <div
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl overflow-y-auto"
          style={{ maxHeight: `${viewportHeight * 0.85}px` }}
          onClick={e => e.stopPropagation()}
        >
          <NuevoProducto
            categorias={categorias}
            onCrear={handleNuevoProducto}
            onCancel={() => setMostrarNuevo(false)}
            verificarDuplicado={catalogo.verificarDuplicado}
            nombreInicial={busqueda.trim()}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sheet" onClick={onClose}>
      <div
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl flex flex-col"
        style={{ maxHeight: `${viewportHeight * 0.9}px` }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle + header */}
        <div className="flex-shrink-0">
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>

          <div className="flex items-center justify-between px-4 pb-2">
            <h3 className="text-lg font-semibold text-gray-900">Agregar productos</h3>
            <button
              onClick={onClose}
              className="px-3 py-1 bg-gray-900 text-white text-sm rounded-lg font-medium active:bg-gray-700"
            >
              Listo
            </button>
          </div>

          {/* Search bar */}
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-hide">
          {resultados !== null ? (
            <div>
              {resultados.length > 0 && (
                <div className="divide-y divide-gray-100">
                  {resultados.map(p => renderProducto(p))}
                </div>
              )}
              {/* Always show create option when searching */}
              <div className="py-4 text-center border-t border-gray-100 mt-2">
                <p className="text-gray-400 text-xs mb-2">
                  {resultados.length > 0 ? '¿No es lo que buscás?' : `No se encontró "${busqueda}"`}
                </p>
                <button
                  onClick={() => setMostrarNuevo(true)}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium active:bg-emerald-600"
                >
                  Crear "{busqueda.trim()}" como producto nuevo
                </button>
              </div>
            </div>
          ) : (
            <div>
              {catsSorted.map(cat => {
                const prods = sortAlpha(catalogo.porCategoria[cat.id] || [])
                if (prods.length === 0) return null

                return (
                  <div key={cat.id} className="mb-4">
                    <div className="flex items-center gap-2 py-1.5 sticky top-0 bg-white z-10">
                      <span className="text-base">{cat.icono}</span>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{cat.nombre}</span>
                      <div className="flex-1 h-px bg-gray-100" />
                    </div>
                    <div className="divide-y divide-gray-50">
                      {prods.map(p => renderProducto(p))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
