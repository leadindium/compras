import { useCatalogo } from '../../hooks/useCatalogo'
import Header from '../layout/Header'

export default function MergeDuplicados({ hogarId }) {
  const { productos, mergeProductos } = useCatalogo(hogarId)

  // Simple duplicate detection based on similar short names
  const posiblesDuplicados = []
  const activos = productos.filter(p => p.activo !== false)

  for (let i = 0; i < activos.length; i++) {
    for (let j = i + 1; j < activos.length; j++) {
      const a = activos[i].nombreCorto?.toLowerCase() || ''
      const b = activos[j].nombreCorto?.toLowerCase() || ''
      if (a && b && (a.includes(b) || b.includes(a)) && a !== b) {
        posiblesDuplicados.push([activos[i], activos[j]])
      }
    }
  }

  return (
    <div>
      <Header title="Duplicados" showBack />
      <div className="p-4">
        {posiblesDuplicados.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg">No se detectaron duplicados</p>
          </div>
        ) : (
          <div className="space-y-3">
            {posiblesDuplicados.map(([a, b], idx) => (
              <div key={idx} className="p-4 bg-white rounded-xl">
                <p className="text-sm text-gray-400 mb-2">Posible duplicado:</p>
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex-1 text-sm font-medium">{a.nombreCorto}</span>
                  <span className="text-gray-300">vs</span>
                  <span className="flex-1 text-sm font-medium text-right">{b.nombreCorto}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => mergeProductos(a.id, b.id)}
                    className="flex-1 py-2 text-sm bg-emerald-50 text-emerald-700 rounded-lg font-medium"
                  >
                    Mantener "{a.nombreCorto}"
                  </button>
                  <button
                    onClick={() => mergeProductos(b.id, a.id)}
                    className="flex-1 py-2 text-sm bg-emerald-50 text-emerald-700 rounded-lg font-medium"
                  >
                    Mantener "{b.nombreCorto}"
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
