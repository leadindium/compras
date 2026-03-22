import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Setup from './components/auth/Setup'
import AppShell from './components/layout/AppShell'
import ListaActiva from './components/lista/ListaActiva'
import Dashboard from './components/gastos/Dashboard'
import DetalleProducto from './components/gastos/DetalleProducto'
import HistorialListas from './components/gastos/HistorialListas'
import Sucursales from './components/config/Sucursales'
import Categorias from './components/config/Categorias'
import Catalogo from './components/config/Catalogo'
import Hogar from './components/config/Hogar'
import ImportarFactura from './components/config/ImportarFactura'
import ConfigIndex from './components/config/ConfigIndex'

export default function App() {
  const { user, hogarId, alias, loading, crearHogar, unirseHogar, cambiarHogar } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!hogarId) {
    return <Setup onCrear={crearHogar} onUnirse={unirseHogar} />
  }

  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<ListaActiva hogarId={hogarId} alias={alias} />} />
          <Route path="/gastos" element={<Dashboard hogarId={hogarId} />} />
          <Route path="/gastos/historial" element={<HistorialListas hogarId={hogarId} />} />
          <Route path="/gastos/producto/:productoId" element={<DetalleProducto hogarId={hogarId} />} />
          <Route path="/config" element={<ConfigIndex hogarId={hogarId} />} />
          <Route path="/config/sucursales" element={<Sucursales hogarId={hogarId} />} />
          <Route path="/config/categorias" element={<Categorias hogarId={hogarId} />} />
          <Route path="/config/catalogo" element={<Catalogo hogarId={hogarId} />} />
          <Route path="/config/hogar" element={<Hogar hogarId={hogarId} alias={alias} onCambiarHogar={cambiarHogar} />} />
          <Route path="/config/importar" element={<ImportarFactura hogarId={hogarId} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  )
}
