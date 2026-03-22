import { useState } from 'react'
import { formatColones } from '../../utils/formatColones'

export default function ItemRow({ item, onToggle, onUpdateCantidad, onEliminar, onActualizarCosto, alias, comprado }) {
  const [editando, setEditando] = useState(false)
  const [editingCosto, setEditingCosto] = useState(false)
  const [costoTemp, setCostoTemp] = useState('')

  const isNew = item.agregadoPor && item.agregadoPor !== alias &&
    item.agregadoEn && (Date.now() - (item.agregadoEn.seconds ? item.agregadoEn.seconds * 1000 : 0)) < 3600000

  return (
    <>
      <div
        className={`flex items-center min-h-[56px] py-2 pr-2 rounded-xl tap-highlight transition-all ${
          comprado ? 'opacity-50' : ''
        } ${isNew ? 'item-enter' : ''}`}
      >
        {/* Tap para marcar comprado */}
        <button
          onClick={onToggle}
          className="flex-1 flex items-center gap-3 text-left min-h-[48px] tap-highlight"
        >
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
            comprado ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'
          }`}>
            {comprado && (
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>

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
              {item.cantidad > 1 && <span>{item.cantidad} {item.unidadTipo || 'uds'}</span>}
              {item.cantidad <= 1 && item.unidadDetalle && <span>{item.unidadDetalle}</span>}
              {item.notas && <span className="truncate">· {item.notas}</span>}
            </div>
          </div>
        </button>

        {/* Right side: cantidad (si >1) + edit/costo */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {!comprado && item.cantidad > 1 && (
            <span className="text-xs text-gray-400 mr-1">×{item.cantidad}</span>
          )}

          {!comprado && (
            <button
              onClick={() => setEditando(!editando)}
              className="w-8 h-8 flex items-center justify-center text-gray-300 active:text-gray-500 rounded-lg"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
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

      {/* Panel de edición expandible */}
      {editando && !comprado && (
        <div className="flex items-center gap-2 px-9 pb-2 -mt-1">
          <div className="flex items-center bg-gray-100 rounded-lg">
            <button
              onClick={() => {
                if (item.cantidad <= 1) { onEliminar(); setEditando(false); return }
                onUpdateCantidad(item.cantidad - 1)
              }}
              className="w-9 h-9 flex items-center justify-center text-gray-500 text-lg active:bg-gray-200 rounded-l-lg"
            >
              -
            </button>
            <span className="w-8 text-center text-sm font-semibold text-gray-700">{item.cantidad}</span>
            <button
              onClick={() => onUpdateCantidad(item.cantidad + 1)}
              className="w-9 h-9 flex items-center justify-center text-gray-500 text-lg active:bg-gray-200 rounded-r-lg"
            >
              +
            </button>
          </div>
          <button
            onClick={() => { onEliminar(); setEditando(false) }}
            className="px-3 py-2 text-red-500 text-sm font-medium rounded-lg active:bg-red-50"
          >
            Eliminar
          </button>
        </div>
      )}
    </>
  )
}
