import { useState } from 'react'
import ItemRow from './ItemRow'

export default function CategoriaGroup({ categoria, items, onToggleComprado, onActualizarCantidad, onEliminar, onActualizarCosto, alias }) {
  const [collapsed, setCollapsed] = useState(false)

  const pendientes = items.filter(i => !i.comprado)
  const comprados = items.filter(i => i.comprado)

  return (
    <div className="mb-3">
      {/* Header de categoría */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center gap-2 py-2 tap-highlight"
      >
        <span
          className="w-1 h-6 rounded-full"
          style={{ backgroundColor: categoria.colorHex || '#9CA3AF' }}
        />
        <span className="text-lg">{categoria.icono}</span>
        <span className="font-semibold text-sm text-gray-700 flex-1 text-left">
          {categoria.nombre}
        </span>
        <span className="text-xs text-gray-400 mr-1">
          {pendientes.length > 0 && `${pendientes.length}`}
          {pendientes.length > 0 && comprados.length > 0 && ' / '}
          {comprados.length > 0 && <span className="line-through">{comprados.length}</span>}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${collapsed ? '-rotate-90' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Items */}
      {!collapsed && (
        <div className="ml-3 border-l-2 border-gray-100 pl-2">
          {pendientes.map(item => (
            <ItemRow
              key={item.id}
              item={item}
              onToggle={() => onToggleComprado(item.id)}
              onUpdateCantidad={(c) => onActualizarCantidad(item.id, c)}
              onEliminar={() => onEliminar(item.id)}
              onActualizarCosto={(c) => onActualizarCosto(item.id, c)}
              alias={alias}
            />
          ))}
          {comprados.map(item => (
            <ItemRow
              key={item.id}
              item={item}
              onToggle={() => onToggleComprado(item.id)}
              onUpdateCantidad={(c) => onActualizarCantidad(item.id, c)}
              onEliminar={() => onEliminar(item.id)}
              onActualizarCosto={(c) => onActualizarCosto(item.id, c)}
              alias={alias}
              comprado
            />
          ))}
        </div>
      )}
    </div>
  )
}
