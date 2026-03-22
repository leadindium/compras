import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../../firebase'
import { usePrecios } from '../../hooks/usePrecios'
import { calcularStatsPrecios } from '../../utils/preciosUtils'
import { formatColones } from '../../utils/formatColones'
import { getCategoria } from '../../utils/categorizar'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import Header from '../layout/Header'

export default function DetalleProducto({ hogarId }) {
  const { productoId } = useParams()
  const [producto, setProducto] = useState(null)
  const { precios, loading } = usePrecios(hogarId, productoId)

  useEffect(() => {
    if (!hogarId || !productoId) return
    const unsubscribe = onSnapshot(doc(db, `hogares/${hogarId}/catalogo`, productoId), (snap) => {
      if (snap.exists()) setProducto({ id: snap.id, ...snap.data() })
    })
    return () => unsubscribe()
  }, [hogarId, productoId])

  if (loading || !producto) {
    return (
      <div>
        <Header title="Producto" showBack />
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  const stats = calcularStatsPrecios(precios)
  const cat = getCategoria(producto.categoriaId)

  const chartData = precios.map(p => ({
    fecha: new Date(p.fecha).toLocaleDateString('es-CR', { day: 'numeric', month: 'short' }),
    precio: p.precioUnitarioRef || p.precio
  }))

  return (
    <div>
      <Header title={producto.nombreCorto} showBack />

      <div className="p-4 space-y-4">
        {/* Info del producto */}
        <div className="bg-white rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{cat.icono}</span>
            <div>
              <p className="font-semibold text-gray-900">{producto.nombreCorto}</p>
              <p className="text-sm text-gray-400">{producto.nombre}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{cat.nombre}</span>
            <span>·</span>
            <span>{producto.unidadDetalle || producto.unidadTipo}</span>
            <span>·</span>
            <span>Comprado {producto.frecuencia || 0}x</span>
          </div>
        </div>

        {/* Gráfico de precios */}
        {chartData.length > 1 && (
          <div className="bg-white rounded-2xl p-4">
            <p className="text-sm font-medium text-gray-700 mb-3">Historial de precios</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                  <XAxis
                    dataKey="fecha"
                    tick={{ fontSize: 11, fill: '#9CA3AF' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#9CA3AF' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={v => `₡${v.toLocaleString('es-CR')}`}
                    width={60}
                  />
                  <Tooltip
                    formatter={v => [formatColones(v), 'Precio']}
                    labelStyle={{ fontSize: 12 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="precio"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ fill: '#10B981', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4">
            <p className="text-sm text-gray-400">Precio actual</p>
            <p className="text-xl font-bold text-gray-900">{formatColones(stats.actual)}</p>
            {stats.tendencia.direccion !== 'stable' && (
              <span className={`text-sm font-medium ${stats.tendencia.direccion === 'up' ? 'text-red-500' : 'text-emerald-500'}`}>
                {stats.tendencia.cambio > 0 ? '+' : ''}{stats.tendencia.cambio}%
              </span>
            )}
          </div>
          <div className="bg-white rounded-2xl p-4">
            <p className="text-sm text-gray-400">Promedio</p>
            <p className="text-xl font-bold text-gray-900">{formatColones(stats.promedio)}</p>
          </div>
          <div className="bg-white rounded-2xl p-4">
            <p className="text-sm text-gray-400">Mínimo</p>
            <p className="text-xl font-bold text-emerald-600">{formatColones(stats.min)}</p>
          </div>
          <div className="bg-white rounded-2xl p-4">
            <p className="text-sm text-gray-400">Máximo</p>
            <p className="text-xl font-bold text-red-500">{formatColones(stats.max)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
