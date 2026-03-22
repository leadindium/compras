import { useState, useCallback } from 'react'
import { getCategoria } from '../../utils/categorizar'

export default function BuscarProducto({ onSearch, onSelect, onNuevo }) {
  const [query, setQuery] = useState('')
  const [resultados, setResultados] = useState([])

  const handleChange = useCallback((value) => {
    setQuery(value)
    if (value.trim().length >= 2) {
      const results = onSearch(value)
      setResultados(results)
    } else {
      setResultados([])
    }
  }, [onSearch])

  return (
    <div className="p-4">
      <input
        type="text"
        value={query}
        onChange={e => handleChange(e.target.value)}
        placeholder="Buscar producto..."
        className="w-full px-4 py-3 bg-gray-100 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
        autoFocus
      />

      <div className="mt-3">
        {resultados.length > 0 ? (
          <div className="space-y-1">
            {resultados.map(p => {
              const cat = getCategoria(p.categoriaId)
              return (
                <button
                  key={p.id}
                  onClick={() => onSelect(p)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left active:bg-emerald-50 tap-highlight"
                >
                  <span className="text-lg">{cat.icono}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.nombreCorto}</p>
                    <p className="text-xs text-gray-400 truncate">{p.nombre}</p>
                  </div>
                </button>
              )
            })}
          </div>
        ) : query.length >= 2 ? (
          <div className="text-center py-6">
            <p className="text-gray-400 text-sm mb-3">No se encontró "{query}"</p>
            <button
              onClick={onNuevo}
              className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium active:bg-emerald-600"
            >
              Agregar producto nuevo
            </button>
          </div>
        ) : (
          <p className="text-center text-gray-400 text-sm py-6">
            Escribí al menos 2 letras para buscar
          </p>
        )}
      </div>
    </div>
  )
}
