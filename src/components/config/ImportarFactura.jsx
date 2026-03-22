import { useState } from 'react'
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import { useLista } from '../../hooks/useLista'
import { formatColones } from '../../utils/formatColones'
import Header from '../layout/Header'

export default function ImportarFactura({ hogarId }) {
  const { listaActiva, items } = useLista(hogarId)
  const [textoFactura, setTextoFactura] = useState('')
  const [matches, setMatches] = useState(null)
  const [importando, setImportando] = useState(false)

  const parsearFactura = () => {
    if (!textoFactura.trim()) return

    const lineas = textoFactura.trim().split('\n')
    const parsed = []

    for (const linea of lineas) {
      // Intentar extraer nombre y precio de cada línea
      // Formato típico Automercado: "PRODUCTO   ₡1,234" o "PRODUCTO  1234"
      const match = linea.match(/^(.+?)\s+₡?([\d,]+(?:\.\d{2})?)\s*$/)
      if (match) {
        const nombre = match[1].trim()
        const precio = parseInt(match[2].replace(/[,.\s]/g, ''))
        if (nombre && precio > 0) {
          parsed.push({ nombre, precio })
        }
      }
    }

    // Match con items de la lista
    const matched = parsed.map(facturaItem => {
      const itemMatch = items.find(item => {
        const n1 = (item.nombre || '').toLowerCase()
        const n2 = (item.nombreCorto || '').toLowerCase()
        const fn = facturaItem.nombre.toLowerCase()
        return n1.includes(fn) || fn.includes(n1) || n2.includes(fn) || fn.includes(n2)
      })
      return {
        ...facturaItem,
        itemId: itemMatch?.id || null,
        itemNombre: itemMatch?.nombreCorto || null,
        confirmado: !!itemMatch
      }
    })

    setMatches(matched)
  }

  const aplicarMatches = async () => {
    if (!matches || !listaActiva) return
    setImportando(true)

    for (const m of matches) {
      if (m.itemId && m.confirmado) {
        const ref = doc(db, `hogares/${hogarId}/listas/${listaActiva.id}/items`, m.itemId)
        await updateDoc(ref, { costoReal: m.precio })
      }
    }

    setImportando(false)
    setMatches(null)
    setTextoFactura('')
  }

  return (
    <div>
      <Header title="Importar Factura" showBack />
      <div className="p-4 space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <p className="text-sm text-amber-700">
            Pegá el texto de la factura del Automercado. El sistema intentará hacer match con los items de tu lista activa.
          </p>
        </div>

        {!listaActiva && (
          <div className="text-center py-8 text-gray-400">
            <p>No hay lista activa para importar</p>
          </div>
        )}

        {listaActiva && !matches && (
          <>
            <textarea
              value={textoFactura}
              onChange={e => setTextoFactura(e.target.value)}
              placeholder={"Pegá el texto de la factura aquí...\n\nEjemplo:\nLeche Dos Pinos  ₡1,860\nPan integral  ₡2,500"}
              rows={10}
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-emerald-500 resize-none"
            />
            <button
              onClick={parsearFactura}
              disabled={!textoFactura.trim()}
              className="w-full py-3 bg-emerald-500 text-white rounded-xl font-semibold active:bg-emerald-600 disabled:opacity-40"
            >
              Procesar factura
            </button>
          </>
        )}

        {matches && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              {matches.filter(m => m.confirmado).length} de {matches.length} items con match
            </p>

            {matches.map((m, idx) => (
              <div key={idx} className={`p-3 rounded-xl ${m.confirmado ? 'bg-emerald-50' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{m.nombre}</p>
                    {m.itemNombre && (
                      <p className="text-xs text-emerald-600">= {m.itemNombre}</p>
                    )}
                  </div>
                  <p className="font-medium">{formatColones(m.precio)}</p>
                </div>
                {!m.confirmado && (
                  <p className="text-xs text-gray-400 mt-1">Sin match - no se importará</p>
                )}
              </div>
            ))}

            <div className="flex gap-2">
              <button
                onClick={() => setMatches(null)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={aplicarMatches}
                disabled={importando}
                className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-semibold active:bg-emerald-600 disabled:opacity-50"
              >
                {importando ? 'Importando...' : 'Aplicar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
