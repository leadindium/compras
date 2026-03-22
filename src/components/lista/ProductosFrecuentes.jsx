import { getCategoria } from '../../utils/categorizar'

export default function ProductosFrecuentes({ productos, onSelect }) {
  if (!productos || productos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>No hay productos frecuentes aún</p>
      </div>
    )
  }

  return (
    <div className="p-4 grid grid-cols-2 gap-2">
      {productos.map(producto => {
        const cat = getCategoria(producto.categoriaId)
        return (
          <button
            key={producto.id}
            onClick={() => onSelect(producto)}
            className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-100 text-left active:bg-gray-50 tap-highlight transition-colors"
          >
            <span className="text-lg flex-shrink-0">{cat.icono}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {producto.nombreCorto || producto.nombre}
              </p>
              {producto.frecuencia > 3 && (
                <p className="text-[11px] text-gray-400">
                  {producto.frecuencia}x comprado
                </p>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
