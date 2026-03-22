import { useNavigate } from 'react-router-dom'
import { formatColones } from '../../utils/formatColones'

export default function AlertasPrecios({ alertas, hogarId }) {
  const navigate = useNavigate()

  if (!alertas || alertas.length === 0) return null

  return (
    <div className="space-y-2">
      {alertas.slice(0, 5).map(producto => (
        <button
          key={producto.id}
          onClick={() => navigate(`/gastos/producto/${producto.id}`)}
          className="w-full flex items-center gap-3 p-2 rounded-lg text-left active:bg-gray-50 tap-highlight"
        >
          <div className={`text-lg ${producto.tendencia.direccion === 'up' ? '' : ''}`}>
            {producto.tendencia.direccion === 'up' ? '📈' : '📉'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{producto.nombreCorto}</p>
            <p className="text-xs text-gray-400">
              {formatColones(producto.precioUnitarioRef || producto.ultimoPrecio)}
            </p>
          </div>
          <span className={`text-sm font-semibold ${
            producto.tendencia.direccion === 'up' ? 'text-red-500' : 'text-emerald-500'
          }`}>
            {producto.tendencia.cambio > 0 ? '+' : ''}{producto.tendencia.cambio}%
          </span>
        </button>
      ))}
    </div>
  )
}
