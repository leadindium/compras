import { useNavigate } from 'react-router-dom'
import { useGastos } from '../../hooks/useGastos'
import { useCatalogo } from '../../hooks/useCatalogo'
import { useCollection } from '../../hooks/useFirestore'
import { getAlertasPrecios } from '../../utils/preciosUtils'
import { formatColones } from '../../utils/formatColones'
import Header from '../layout/Header'
import GastoSemanal from './GastoSemanal'
import GastoPorCategoria from './GastoPorCategoria'
import AlertasPrecios from './AlertasPrecios'

export default function Dashboard({ hogarId }) {
  const { listas, loading, resumenMes, gastoSemanal } = useGastos(hogarId)
  const { productos } = useCatalogo(hogarId)
  const { data: categorias } = useCollection(hogarId ? `hogares/${hogarId}/categorias` : null)
  const navigate = useNavigate()

  const alertas = getAlertasPrecios(productos)
  const hayGastosReales = resumenMes.total > 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <Header title="Gastos" />

      <div className="p-4 space-y-4">
        {/* Resumen del mes */}
        <div className="bg-white rounded-2xl p-4">
          <p className="text-sm text-gray-400 mb-1">Este mes</p>
          {hayGastosReales ? (
            <>
              <p className="text-3xl font-bold text-gray-900">{formatColones(resumenMes.total)}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-sm text-gray-500">{resumenMes.compras} compras</span>
                {resumenMes.cambioVsMesAnterior !== 0 && (
                  <span className={`text-sm font-medium ${resumenMes.cambioVsMesAnterior > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                    {resumenMes.cambioVsMesAnterior > 0 ? '+' : ''}{resumenMes.cambioVsMesAnterior}% vs mes anterior
                  </span>
                )}
              </div>
            </>
          ) : (
            <div className="py-4 text-center">
              <p className="text-gray-400 text-sm">Sin datos de gasto aún</p>
              <p className="text-gray-300 text-xs mt-1">Importá facturas para ver los gastos reales</p>
            </div>
          )}
        </div>

        {/* Gasto semanal */}
        {gastoSemanal.length > 0 && (
          <div className="bg-white rounded-2xl p-4">
            <p className="text-sm font-medium text-gray-700 mb-3">Gasto semanal</p>
            <GastoSemanal datos={gastoSemanal} />
          </div>
        )}

        {/* Alertas de precios - funciona desde el día uno */}
        {alertas.length > 0 && (
          <div className="bg-white rounded-2xl p-4">
            <p className="text-sm font-medium text-gray-700 mb-3">Cambios de precio</p>
            <AlertasPrecios alertas={alertas} hogarId={hogarId} />
          </div>
        )}

        {/* Historial */}
        <button
          onClick={() => navigate('/gastos/historial')}
          className="w-full p-4 bg-white rounded-2xl text-left flex items-center justify-between active:bg-gray-50 tap-highlight"
        >
          <div>
            <p className="font-medium text-gray-900">Historial de listas</p>
            <p className="text-sm text-gray-400">{listas.length} listas completadas</p>
          </div>
          <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
