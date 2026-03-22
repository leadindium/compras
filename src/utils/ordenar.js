/**
 * Ordena items por categoría según el orden de la sucursal seleccionada
 */
export function ordenarPorSucursal(items, categorias, sucursalId) {
  if (!items || !categorias) return []

  const ordenMap = {}
  categorias.forEach(cat => {
    const orden = sucursalId && cat.ordenPorSucursal?.[sucursalId]
    ordenMap[cat.id] = orden != null ? orden : (cat.ordenDefault || 99)
  })

  return [...items].sort((a, b) => {
    const ordenA = ordenMap[a.categoriaId] ?? 99
    const ordenB = ordenMap[b.categoriaId] ?? 99
    if (ordenA !== ordenB) return ordenA - ordenB
    // Dentro de la misma categoría, no comprados primero
    if (a.comprado !== b.comprado) return a.comprado ? 1 : -1
    return 0
  })
}

/**
 * Agrupa items por categoría, respetando el orden de la sucursal
 */
export function agruparPorCategoria(items, categorias, sucursalId) {
  if (!items || !categorias) return []

  const ordenMap = {}
  const catMap = {}
  categorias.forEach(cat => {
    catMap[cat.id] = cat
    const orden = sucursalId && cat.ordenPorSucursal?.[sucursalId]
    ordenMap[cat.id] = orden != null ? orden : (cat.ordenDefault || 99)
  })

  // Agrupar
  const grupos = {}
  items.forEach(item => {
    const catId = item.categoriaId || 'otros'
    if (!grupos[catId]) {
      grupos[catId] = {
        categoria: catMap[catId] || { id: catId, nombre: catId, icono: '📦' },
        items: [],
        orden: ordenMap[catId] ?? 99
      }
    }
    grupos[catId].items.push(item)
  })

  // Ordenar grupos y dentro de cada grupo: no comprados primero
  return Object.values(grupos)
    .sort((a, b) => a.orden - b.orden)
    .map(grupo => ({
      ...grupo,
      items: grupo.items.sort((a, b) => {
        if (a.comprado !== b.comprado) return a.comprado ? 1 : -1
        const nameA = (a.nombreCorto || a.nombre || '').toLowerCase()
        const nameB = (b.nombreCorto || b.nombre || '').toLowerCase()
        return nameA.localeCompare(nameB, 'es')
      })
    }))
}
