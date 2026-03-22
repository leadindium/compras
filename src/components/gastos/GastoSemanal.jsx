import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from 'recharts'
import { formatColones } from '../../utils/formatColones'

export default function GastoSemanal({ datos }) {
  if (!datos || datos.length === 0) return null

  const promedio = datos.reduce((sum, d) => sum + d.total, 0) / datos.length

  const chartData = datos.map(d => ({
    ...d,
    semanaLabel: new Date(d.semana).toLocaleDateString('es-CR', { day: 'numeric', month: 'short' })
  }))

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <XAxis
            dataKey="semanaLabel"
            tick={{ fontSize: 11, fill: '#9CA3AF' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#9CA3AF' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `₡${(v / 1000).toFixed(0)}k`}
            width={45}
          />
          <ReferenceLine
            y={promedio}
            stroke="#9CA3AF"
            strokeDasharray="3 3"
            label={{ value: 'Promedio', position: 'right', fontSize: 10, fill: '#9CA3AF' }}
          />
          <Bar
            dataKey="total"
            fill="#10B981"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
