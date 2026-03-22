import { useState } from 'react'

export default function Setup({ onCrear, onUnirse }) {
  const [modo, setModo] = useState(null) // 'crear' | 'unirse'
  const [nombre, setNombre] = useState('')
  const [alias, setAlias] = useState('')
  const [codigo, setCodigo] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const handleCrear = async () => {
    if (!nombre.trim() || !alias.trim()) {
      setError('Completá todos los campos')
      return
    }
    setCargando(true)
    setError('')
    try {
      const code = await onCrear(nombre.trim(), alias.trim())
      // Se redirige automáticamente
    } catch (e) {
      setError('Error al crear el hogar')
      setCargando(false)
    }
  }

  const handleUnirse = async () => {
    if (!codigo.trim() || !alias.trim()) {
      setError('Completá todos los campos')
      return
    }
    setCargando(true)
    setError('')
    try {
      const ok = await onUnirse(codigo.trim(), alias.trim())
      if (!ok) {
        setError('Código no encontrado')
        setCargando(false)
      }
    } catch (e) {
      setError('Error al unirse')
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-2xl font-bold text-gray-900">Lista de Compras</h1>
          <p className="text-gray-500 mt-2">Organizá tus compras del super</p>
        </div>

        {!modo && (
          <div className="space-y-3">
            <button
              onClick={() => setModo('crear')}
              className="w-full py-4 px-6 bg-emerald-500 text-white rounded-2xl font-semibold text-lg active:bg-emerald-600 transition-colors"
            >
              Crear hogar nuevo
            </button>
            <button
              onClick={() => setModo('unirse')}
              className="w-full py-4 px-6 bg-white text-gray-700 rounded-2xl font-semibold text-lg border-2 border-gray-200 active:bg-gray-50 transition-colors"
            >
              Unirme a un hogar
            </button>
          </div>
        )}

        {modo === 'crear' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del hogar</label>
              <input
                type="text"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder="Ej: Casa Vega"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tu nombre</label>
              <div className="grid grid-cols-2 gap-2">
                {['Albert', 'Duni'].map(name => (
                  <button
                    key={name}
                    onClick={() => setAlias(name)}
                    className={`py-3 px-4 rounded-xl font-medium text-base transition-colors ${
                      alias === name
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white border-2 border-gray-200 text-gray-700 active:bg-gray-50'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              onClick={handleCrear}
              disabled={cargando}
              className="w-full py-4 px-6 bg-emerald-500 text-white rounded-2xl font-semibold text-lg active:bg-emerald-600 transition-colors disabled:opacity-50"
            >
              {cargando ? 'Creando...' : 'Crear hogar'}
            </button>
            <button
              onClick={() => { setModo(null); setError('') }}
              className="w-full py-3 text-gray-500 text-sm"
            >
              Volver
            </button>
          </div>
        )}

        {modo === 'unirse' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código del hogar</label>
              <input
                type="text"
                value={codigo}
                onChange={e => setCodigo(e.target.value.toUpperCase())}
                placeholder="Ej: VEGA26"
                maxLength={6}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none text-center text-2xl font-mono tracking-widest uppercase"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tu nombre</label>
              <div className="grid grid-cols-2 gap-2">
                {['Albert', 'Duni'].map(name => (
                  <button
                    key={name}
                    onClick={() => setAlias(name)}
                    className={`py-3 px-4 rounded-xl font-medium text-base transition-colors ${
                      alias === name
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white border-2 border-gray-200 text-gray-700 active:bg-gray-50'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              onClick={handleUnirse}
              disabled={cargando}
              className="w-full py-4 px-6 bg-emerald-500 text-white rounded-2xl font-semibold text-lg active:bg-emerald-600 transition-colors disabled:opacity-50"
            >
              {cargando ? 'Uniéndose...' : 'Unirme'}
            </button>
            <button
              onClick={() => { setModo(null); setError('') }}
              className="w-full py-3 text-gray-500 text-sm"
            >
              Volver
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
