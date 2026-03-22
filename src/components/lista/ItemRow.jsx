import { useState } from 'react'
import { formatColones } from '../../utils/formatColones'

export default function ItemRow({ item, onToggle, onUpdateCantidad, onEliminar, onActualizarCosto, alias, comprado }) {
  const [showActions, setShowActions] = useState(false)
  const [editingCosto, setEditingCosto] = useState(false)
  const [costoTemp, setCostoTemp] = useState('')

  const isNew = item.agregadoPor && item.agregadoPor !== alias &&
    item.agregadoEn && (Date.now() - (item.agregadoEn.seconds ? item.agregadoEn.seconds * 1000 : 0)) < 3600000

  return (
    <div
      className={`relative flex items-center min-h-[56px] py-2 pr-2 rounded-xl tap-highlight transition-all ${
        comprado ? 'opacity-50' : ''
      } ${isNew ? 'item-enter' : ''}`}
    >
      {/* Zona principal - tap para marcar comprado */}
      <button
        onClick={onToggle}
        className="flex-1 flex items-center gap-3 text-left min-h-[48px] tap-highlight"
      >
        {/* Checkbox */}
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
          comprado ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'
        }`}>
          {comprado && (
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`font-medium text-base ${comprado ? 'line-through text-gray-400' : 'text-gray-900'}`}>
              {item.nombreCorto || item.nombre}
            </span>
            {isNew && (
              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full">
                Nuevo
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            {item.cantidad > 1 && <span>{item.cantidad} {item.unidadTipo}</span>}
            {item.cantidad <= 1 && item.unidadDetalle && <span>{item.unidadDetalle}</span>}
            {item.notas && <span className="truncate">· {item.notas}</span>}
          </div>
        </div>
      </button>

      {/* Cantidad / acciones */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {!comprado && (
          <>
            <button
              onClick={() => item.cantidad > 1 && onUpdateCantidad(item.cantidad - 1)}
              className="w-8 h-8 flex items-center justify-center text-gray-400 rounded-lg active:bg-gray-100"
            >
              -
            </button>
            <span className="w-6 text-center text-sm font-medium text-gray-600">{item.cantidad}</span>
            <button
              onClick={() => onUpdateCantidad(item.cantidad + 1)}
              className="w-8 h-8 flex items-center justify-center text-gray-400 rounded-lg active:bg-gray-100"
            >
              +
            </button>
          </>
        )}

        {comprado && !editingCosto && (
          <button
            onClick={() => { setEditingCosto(true); setCostoTemp(item.costoReal || '') }}
            className="text-xs text-gray-400 px-2 py-1 rounded active:bg-gray-100"
          >
            {item.costoReal ? formatColones(item.costoReal) : '₡?'}
          </button>
        )}

        {editingCosto && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-400">₡</span>
            <input
              type="number"
              value={costoTemp}
              onChange={e => setCostoTemp(e.target.value)}
              onBlur={() => {
                if (costoTemp) onActualizarCosto(parseInt(costoTemp))
                setEditingCosto(false)
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  if (costoTemp) onActualizarCosto(parseInt(costoTemp))
                  setEditingCosto(false)
                }
              }}
              className="w-20 px-2 py-1 text-sm border rounded-lg focus:outline-none focus:border-emerald-500"
              autoFocus
              inputMode="numeric"
            />
          </div>
        )}
      </div>
    </div>
  )
}
