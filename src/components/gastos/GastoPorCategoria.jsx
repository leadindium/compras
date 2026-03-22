import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { formatColones } from '../../utils/formatColones'

export default function GastoPorCategoria({ datos }) {
  if (!datos || datos.length === 0) return null

  const total = datos.reduce((sum, d) => sum + d.total, 0)
  const top5 = datos.slice(0, 5)

  return (
    <div>
      <div className="flex items-center gap-4">
        <div className="w-32 h-32">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={top5}
                dataKey="total"
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={55}
                paddingAngle={2}
              >
                {top5.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-2">
          {top5.map((cat, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
              <span className="text-xs text-gray-600 flex-1 truncate">{cat.nombre}</span>
              <span className="text-xs font-medium text-gray-900">{formatColones(cat.total)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
