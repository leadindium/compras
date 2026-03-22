import { useState } from 'react'
import { CATEGORIAS_DEFAULT } from '../../utils/categorizar'

export default function ProductosPorCategoria({ porCategoria, categorias, onSelect }) {
  const [expandida, setExpandida] = useState(null)

  const cats = categorias?.length > 0 ? categorias : CATEGORIAS_DEFAULT

  return (
    <div className="py-2">
      {cats.map(cat => {
        const productos = porCategoria[cat.id] || []
        if (productos.length === 0) return null

        const isOpen = expandida === cat.id

        return (
          <div key={cat.id}>
            <button
              onClick={() => setExpandida(isOpen ? null : cat.id)}
              className="w-full flex items-center gap-3 px-4 py-3 tap-highlight active:bg-gray-50"
            >
              <span className="text-lg">{cat.icono}</span>
              <span className="flex-1 text-left text-sm font-medium text-gray-700">{cat.nombre}</span>
              <span className="text-xs text-gray-400">{productos.length}</span>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isOpen && (
              <div className="px-4 pb-2">
                {productos.map(p => (
                  <button
                    key={p.id}
                    onClick={() => onSelect(p)}
                    className="w-full text-left px-3 py-2.5 text-sm text-gray-700 rounded-lg active:bg-emerald-50 tap-highlight"
                  >
                    {p.nombreCorto || p.nombre}
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
