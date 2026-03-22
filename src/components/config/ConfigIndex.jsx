import { useNavigate } from 'react-router-dom'
import Header from '../layout/Header'

const menuItems = [
  { path: '/config/sucursales', icon: '🏪', label: 'Sucursales', desc: 'Orden de categorías por sucursal' },
  { path: '/config/categorias', icon: '📂', label: 'Categorías', desc: 'Nombre, ícono y color' },
  { path: '/config/catalogo', icon: '📦', label: 'Catálogo', desc: 'Gestión de productos' },
  { path: '/config/importar', icon: '🧾', label: 'Importar factura', desc: 'Registrar costos reales' },
  { path: '/config/hogar', icon: '🏠', label: 'Hogar', desc: 'Código, nombre, usuarios' },
]

export default function ConfigIndex() {
  const navigate = useNavigate()

  return (
    <div>
      <Header title="Configuración" />
      <div className="p-4 space-y-2">
        {menuItems.map(item => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="w-full flex items-center gap-4 p-4 bg-white rounded-xl text-left active:bg-gray-50 tap-highlight transition-colors"
          >
            <span className="text-2xl">{item.icon}</span>
            <div>
              <p className="font-medium text-gray-900">{item.label}</p>
              <p className="text-sm text-gray-400">{item.desc}</p>
            </div>
            <svg className="w-5 h-5 text-gray-300 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  )
}
