import { useState } from 'react'
import { CATEGORIAS_DEFAULT } from '../../utils/categorizar'

export default function NuevoProducto({ categorias, onCrear, onCancel, verificarDuplicado, nombreInicial = '' }) {
  const [nombre, setNombre] = useState(nombreInicial)
  const [categoriaId, setCategoriaId] = useState('')
  const [duplicado, setDuplicado] = useState(null)

  const cats = categorias?.length > 0 ? categorias : CATEGORIAS_DEFAULT

  const handleNombreChange = (value) => {
    setNombre(value)
    if (value.length >= 3 && verificarDuplicado) {
      const dup = verificarDuplicado(value)
      setDuplicado(dup)
    } else {
      setDuplicado(null)
    }
  }

  const handleCrear = () => {
    if (!nombre.trim() || !categoriaId) return
    onCrear({
      nombre: nombre.trim(),
      nombreCorto: nombre.trim(),
      categoriaId,
      unidadTipo: 'unidad',
      unidadDetalle: '',
      cantidadDefault: 1
    })
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Nuevo producto</h3>
        <button onClick={onCancel} className="text-gray-400 text-sm">Cancelar</button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del producto</label>
          <input
            type="text"
            value={nombre}
            onChange={e => handleNombreChange(e.target.value)}
            placeholder="Ej: Yogurt griego natural"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none text-base"
            autoFocus
          />
          {duplicado && (
            <p className="mt-1 text-sm text-amber-600">
              Ya existe un producto similar: "{duplicado.nombreCorto}"
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
          <div className="grid grid-cols-4 gap-2">
            {cats.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategoriaId(cat.id)}
                className={`flex flex-col items-center p-2 rounded-xl text-center transition-colors ${
                  categoriaId === cat.id
                    ? 'bg-emerald-50 border-2 border-emerald-500'
                    : 'bg-gray-50 border-2 border-transparent active:bg-gray-100'
                }`}
              >
                <span className="text-xl mb-0.5">{cat.icono}</span>
                <span className="text-[10px] text-gray-600 leading-tight">{cat.nombre}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleCrear}
          disabled={!nombre.trim() || !categoriaId}
          className="w-full py-3 bg-emerald-500 text-white rounded-xl font-semibold active:bg-emerald-600 disabled:opacity-40 disabled:active:bg-emerald-500"
        >
          Crear y agregar
        </button>
      </div>
    </div>
  )
}
