import { useLocation, useNavigate } from 'react-router-dom'

const tabs = [
  { path: '/', label: 'Lista', icon: '🛒' },
  { path: '/gastos', label: 'Gastos', icon: '📊' },
  { path: '/config', label: 'Config', icon: '⚙️' }
]

export default function BottomTabs() {
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-50">
      <div className="max-w-lg mx-auto flex">
        {tabs.map(tab => (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`flex-1 flex flex-col items-center py-2 pt-3 tap-highlight transition-colors ${
              isActive(tab.path) ? 'text-emerald-600' : 'text-gray-400'
            }`}
          >
            <span className="text-xl mb-0.5">{tab.icon}</span>
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
