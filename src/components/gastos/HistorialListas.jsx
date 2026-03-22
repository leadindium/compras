import { useGastos } from '../../hooks/useGastos'
import { formatColones } from '../../utils/formatColones'
import Header from '../layout/Header'

export default function HistorialListas({ hogarId }) {
  const { listas, loading } = useGastos(hogarId)

  const sorted = [...listas].sort((a, b) => {
    const fa = a.completadaEn?.seconds || 0
    const fb = b.completadaEn?.seconds || 0
    return fb - fa
  })

  return (
    <div>
      <Header title="Historial" showBack />

      <div className="p-4 space-y-2">
        {loading && (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        )}

        {!loading && sorted.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p>No hay listas completadas aún</p>
          </div>
        )}

        {sorted.map(lista => {
          const fecha = lista.completadaEn?.seconds
            ? new Date(lista.completadaEn.seconds * 1000)
            : null

          return (
            <div key={lista.id} className="p-4 bg-white rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{lista.nombre}</p>
                  {fecha && (
                    <p className="text-sm text-gray-400">
                      {fecha.toLocaleDateString('es-CR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                </div>
                {lista.totalReal > 0 && (
                  <p className="font-semibold text-gray-900">{formatColones(lista.totalReal)}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
