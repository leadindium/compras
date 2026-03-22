/**
 * Calcula la tendencia de precio entre los últimos dos registros
 * Retorna: { cambio: number (%), direccion: 'up' | 'down' | 'stable' }
 */
export function calcularTendencia(historial) {
  if (!historial || historial.length < 2) return { cambio: 0, direccion: 'stable' }

  const sorted = [...historial].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  const actual = sorted[0].precioUnitarioRef || sorted[0].precio
  const anterior = sorted[1].precioUnitarioRef || sorted[1].precio

  if (!anterior || anterior === 0) return { cambio: 0, direccion: 'stable' }

  const cambio = ((actual - anterior) / anterior) * 100
  const direccion = cambio > 1 ? 'up' : cambio < -1 ? 'down' : 'stable'

  return { cambio: Math.round(cambio * 10) / 10, direccion }
}

/**
 * Calcula stats de precio para un producto
 */
export function calcularStatsPrecios(historial) {
  if (!historial || historial.length === 0) {
    return { promedio: 0, min: 0, max: 0, actual: 0, tendencia: { cambio: 0, direccion: 'stable' } }
  }

  const precios = historial.map(h => h.precioUnitarioRef || h.precio).filter(p => p > 0)
  if (precios.length === 0) return { promedio: 0, min: 0, max: 0, actual: 0, tendencia: { cambio: 0, direccion: 'stable' } }

  const sorted = [...historial].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  const actual = sorted[0].precioUnitarioRef || sorted[0].precio

  return {
    promedio: Math.round(precios.reduce((a, b) => a + b, 0) / precios.length),
    min: Math.min(...precios),
    max: Math.max(...precios),
    actual,
    tendencia: calcularTendencia(historial)
  }
}

/**
 * Obtiene productos con cambios de precio significativos (>10%)
 */
export function getAlertasPrecios(catalogo) {
  if (!catalogo) return []

  return catalogo
    .filter(p => p.historialPrecios && p.historialPrecios.length >= 2)
    .map(p => {
      const tendencia = calcularTendencia(p.historialPrecios)
      return { ...p, tendencia }
    })
    .filter(p => Math.abs(p.tendencia.cambio) >= 10)
    .sort((a, b) => Math.abs(b.tendencia.cambio) - Math.abs(a.tendencia.cambio))
}

/**
 * Calcula gasto total de una lista (suma de costoReal de items)
 */
export function calcularGastoLista(items) {
  if (!items) return 0
  return items.reduce((total, item) => total + (item.costoReal || 0), 0)
}

/**
 * Calcula gasto por categoría
 */
export function calcularGastoPorCategoria(items, categorias) {
  if (!items) return []

  const gastos = {}
  items.forEach(item => {
    if (item.costoReal) {
      const catId = item.categoriaId || 'otros'
      gastos[catId] = (gastos[catId] || 0) + item.costoReal
    }
  })

  return Object.entries(gastos)
    .map(([catId, total]) => {
      const cat = categorias?.find(c => c.id === catId) || { nombre: catId, colorHex: '#9CA3AF' }
      return { categoriaId: catId, nombre: cat.nombre, color: cat.colorHex, total }
    })
    .sort((a, b) => b.total - a.total)
}

/**
 * Agrupa gastos por semana
 */
export function agruparGastosPorSemana(listas) {
  if (!listas) return []

  const semanas = {}
  listas.forEach(lista => {
    if (!lista.completadaEn || !lista.totalReal) return
    const fecha = new Date(lista.completadaEn.seconds ? lista.completadaEn.seconds * 1000 : lista.completadaEn)
    const semana = getInicioSemana(fecha)
    const key = semana.toISOString().split('T')[0]
    semanas[key] = (semanas[key] || 0) + lista.totalReal
  })

  return Object.entries(semanas)
    .map(([semana, total]) => ({ semana, total }))
    .sort((a, b) => a.semana.localeCompare(b.semana))
}

function getInicioSemana(fecha) {
  const d = new Date(fecha)
  const day = d.getDay()
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}
