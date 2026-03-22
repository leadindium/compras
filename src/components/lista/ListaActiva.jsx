import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLista } from '../../hooks/useLista'
import { useCatalogo } from '../../hooks/useCatalogo'
import { useCollection } from '../../hooks/useFirestore'
import { agruparPorCategoria } from '../../utils/ordenar'
import CategoriaGroup from './CategoriaGroup'
import SucursalSelector from './SucursalSelector'
import AgregarItem from './AgregarItem'

export default function ListaActiva({ hogarId, alias }) {
  const { listaActiva, items, loading, crearLista, agregarItem, toggleComprado, actualizarCantidad, eliminarItem, actualizarCostoReal, completarLista, seleccionarSucursal, archivarYCrearNueva } = useLista(hogarId)
  const catalogo = useCatalogo(hogarId)
  const { data: categorias } = useCollection(hogarId ? `hogares/${hogarId}/categorias` : null)
  const { data: sucursales } = useCollection(hogarId ? `hogares/${hogarId}/sucursales` : null)
  const [mostrarAgregar, setMostrarAgregar] = useState(false)
  const [mostrarMenu, setMostrarMenu] = useState(false)
  const navigate = useNavigate()

  const grupos = agruparPorCategoria(items, categorias, listaActiva?.sucursalSeleccionada)

  const pendientes = items.filter(i => !i.comprado).length
  const comprados = items.filter(i => i.comprado).length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!listaActiva) {
    return (
      <div className="px-4 pt-16 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No hay lista activa</h2>
        <p className="text-gray-500 mb-6">Creá una nueva lista para empezar</p>
        <button
          onClick={() => crearLista()}
          className="px-6 py-3 bg-emerald-500 text-white rounded-2xl font-semibold text-base active:bg-emerald-600 transition-colors"
        >
          Crear lista nueva
        </button>
      </div>
    )
  }

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-lg font-semibold text-gray-900 truncate">{listaActiva.nombre}</h1>
          <div className="flex items-center gap-2 flex-shrink-0">
            {items.length > 0 && (
              <span className="text-sm text-gray-500">
                {comprados}/{items.length}
              </span>
            )}
            {/* Menu button */}
            <button
              onClick={() => setMostrarMenu(!mostrarMenu)}
              className="p-1 text-gray-400 active:text-gray-600 tap-highlight"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SucursalSelector
            sucursales={sucursales}
            seleccionada={listaActiva.sucursalSeleccionada}
            onChange={seleccionarSucursal}
          />
          {comprados > 0 && (
            <button
              onClick={completarLista}
              className="px-3 py-1.5 bg-emerald-500 text-white text-sm rounded-lg font-medium active:bg-emerald-600 flex-shrink-0"
            >
              Completar
            </button>
          )}
        </div>
      </div>

      {/* Dropdown menu */}
      {mostrarMenu && (
        <div className="fixed inset-0 z-50" onClick={() => setMostrarMenu(false)}>
          <div
            className="absolute top-14 right-4 bg-white rounded-xl shadow-lg border border-gray-200 py-1 w-56"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => { archivarYCrearNueva(); setMostrarMenu(false) }}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 active:bg-gray-50 flex items-center gap-3"
            >
              <span className="text-base">📝</span>
              Nueva lista
            </button>
            <button
              onClick={() => { navigate('/gastos/historial'); setMostrarMenu(false) }}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 active:bg-gray-50 flex items-center gap-3"
            >
              <span className="text-base">📋</span>
              Listas anteriores
            </button>
            {comprados > 0 && (
              <button
                onClick={() => { completarLista(); setMostrarMenu(false) }}
                className="w-full text-left px-4 py-3 text-sm text-emerald-600 active:bg-gray-50 flex items-center gap-3 border-t border-gray-100"
              >
                <span className="text-base">✅</span>
                Completar lista
              </button>
            )}
          </div>
        </div>
      )}

      {/* Progress bar */}
      {items.length > 0 && (
        <div className="px-4 pt-3">
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${(comprados / items.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Lista de items agrupados */}
      <div className="px-4 pt-2">
        {grupos.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg">Lista vacía</p>
            <p className="text-sm mt-1">Tocá + para agregar productos</p>
          </div>
        )}
        {grupos.map(grupo => (
          <CategoriaGroup
            key={grupo.categoria.id}
            categoria={grupo.categoria}
            items={grupo.items}
            onToggleComprado={(itemId) => toggleComprado(itemId, alias)}
            onActualizarCantidad={actualizarCantidad}
            onEliminar={eliminarItem}
            onActualizarCosto={actualizarCostoReal}
            alias={alias}
          />
        ))}
      </div>

      {/* FAB agregar */}
      <button
        onClick={() => setMostrarAgregar(true)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-emerald-500 text-white rounded-full shadow-lg flex items-center justify-center text-2xl font-light active:bg-emerald-600 active:scale-95 transition-all z-30"
      >
        +
      </button>

      {/* Bottom sheet agregar item */}
      {mostrarAgregar && (
        <AgregarItem
          catalogo={catalogo}
          categorias={categorias}
          onAgregar={(producto, cantidad, notas) => {
            agregarItem(producto, cantidad, notas, alias)
          }}
          onClose={() => setMostrarAgregar(false)}
        />
      )}
    </div>
  )
}
