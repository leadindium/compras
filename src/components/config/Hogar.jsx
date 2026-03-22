import { useState, useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../../firebase'
import Header from '../layout/Header'

export default function Hogar({ hogarId, alias, onCambiarHogar }) {
  const [hogar, setHogar] = useState(null)

  useEffect(() => {
    if (!hogarId) return
    const unsubscribe = onSnapshot(doc(db, 'hogares', hogarId), (snap) => {
      if (snap.exists()) setHogar(snap.data())
    })
    return () => unsubscribe()
  }, [hogarId])

  return (
    <div>
      <Header title="Hogar" showBack />
      <div className="p-4 space-y-4">
        <div className="bg-white rounded-xl p-4">
          <p className="text-sm text-gray-400 mb-1">Nombre del hogar</p>
          <p className="text-lg font-semibold text-gray-900">{hogar?.nombre || '—'}</p>
        </div>

        <div className="bg-white rounded-xl p-4">
          <p className="text-sm text-gray-400 mb-1">Código para unirse</p>
          <p className="text-3xl font-mono font-bold text-emerald-600 tracking-widest">{hogarId}</p>
          <p className="text-xs text-gray-400 mt-1">Compartí este código con la otra persona</p>
        </div>

        <div className="bg-white rounded-xl p-4">
          <p className="text-sm text-gray-400 mb-1">Tu alias</p>
          <p className="text-lg font-semibold text-gray-900">{alias || '—'}</p>
        </div>

        {onCambiarHogar && (
          <button
            onClick={onCambiarHogar}
            className="w-full py-3 px-4 bg-red-50 text-red-600 rounded-xl font-medium text-sm active:bg-red-100 transition-colors"
          >
            Cambiar de hogar
          </button>
        )}
      </div>
    </div>
  )
}
