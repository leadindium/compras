import { useState, useRef } from 'react'
import { formatColones } from '../../utils/formatColones'

export default function ItemRow({ item, onToggle, onUpdateCantidad, onEliminar, onActualizarCosto, alias, comprado }) {
  const [editingCosto, setEditingCosto] = useState(false)
  const [costoTemp, setCostoTemp] = useState('')
  const [swiped, setSwiped] = useState(false)
  const touchStartX = useRef(0)
  const touchCurrentX = useRef(0)
  const rowRef = useRef(null)

  const isNew = item.agregadoPor && item.agregadoPor !== alias &&
    item.agregadoEn && (Date.now() - (item.agregadoEn.seconds ? item.agregadoEn.seconds * 1000 : 0)) < 3600000

  // Swipe handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
    touchCurrentX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e) => {
    touchCurrentX.current = e.touches[0].clientX
    const diff = touchStartX.current - touchCurrentX.current

    if (diff > 10 && rowRef.current) {
      const offset = Math.min(diff, 80)
      rowRef.current.style.transform = `translateX(-${offset}px)`
      rowRef.current.style.transition = 'none'
    }
  }

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchCurrentX.current
    if (rowRef.current) {
      rowRef.current.style.transition = 'transform 0.2s ease-out'
      if (diff > 60) {
        rowRef.current.style.transform = 'translateX(-72px)'
        setSwiped(true)
      } else {
        rowRef.current.style.transform = 'translateX(0)'
        setSwiped(false)
      }
    }
  }

  const resetSwipe = () => {
    if (rowRef.current) {
      rowRef.current.style.transition = 'transform 0.2s ease-out'
      rowRef.current.style.transform = 'translateX(0)'
    }
    setSwiped(false)
  }

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Delete button behind the row */}
      <div className="absolute right-0 top-0 bottom-0 w-[72px] flex items-center justify-center bg-red-500 rounded-r-xl">
        <button
          onClick={() => { onEliminar(); resetSwipe() }}
          className="w-full h-full flex items-center justify-center text-white"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Main row content */}
      <div
        ref={rowRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => { if (swiped) { resetSwipe(); return } }}
        className={`relative flex items-center min-h-[56px] py-2 pr-2 bg-white rounded-xl tap-highlight transition-all ${
          comprado ? 'opacity-50' : ''
        } ${isNew ? 'item-enter' : ''}`}
      >
        {/* Zona principal - tap para marcar comprado */}
        <button
          onClick={(e) => { if (swiped) { e.preventDefault(); return } onToggle() }}
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
                onClick={() => {
                  if (item.cantidad <= 1) { onEliminar(); return }
                  onUpdateCantidad(item.cantidad - 1)
                }}
                className="w-8 h-8 flex items-center justify-center text-gray-400 rounded-lg active:bg-gray-100"
              >
                {item.cantidad <= 1 ? (
                  <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                ) : '-'}
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
    </div>
  )
}
