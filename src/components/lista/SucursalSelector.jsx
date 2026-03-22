export default function SucursalSelector({ sucursales, seleccionada, onChange }) {
  if (!sucursales || sucursales.length === 0) return null

  return (
    <select
      value={seleccionada || ''}
      onChange={e => onChange(e.target.value || null)}
      className="flex-1 px-3 py-1.5 text-sm bg-gray-100 rounded-lg border-0 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
    >
      <option value="">Sin sucursal</option>
      {sucursales.filter(s => s.activa !== false).map(s => (
        <option key={s.id} value={s.id}>{s.nombre}</option>
      ))}
    </select>
  )
}
