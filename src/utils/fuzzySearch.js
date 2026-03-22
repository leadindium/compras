import Fuse from 'fuse.js'

const defaultOptions = {
  keys: ['nombreCorto', 'nombre'],
  threshold: 0.4,
  distance: 100,
  minMatchCharLength: 2,
  shouldSort: true,
  sortFn: (a, b) => {
    // Si los scores son similares, ordenar por frecuencia
    if (Math.abs(a.score - b.score) < 0.1) {
      return (b.item?.frecuencia || 0) - (a.item?.frecuencia || 0)
    }
    return a.score - b.score
  }
}

let fuseInstance = null
let lastItems = null

export function createSearchIndex(items, options = {}) {
  fuseInstance = new Fuse(items, { ...defaultOptions, ...options })
  lastItems = items
  return fuseInstance
}

export function searchProducts(query, items, options = {}) {
  if (!query || query.trim().length < 2) return []

  // Recrear índice si los items cambiaron
  if (items !== lastItems || !fuseInstance) {
    createSearchIndex(items, options)
  }

  return fuseInstance.search(query.trim()).map(r => r.item)
}

/**
 * Verifica si un producto ya existe en el catálogo (para prevenir duplicados)
 */
export function findDuplicate(nombre, items) {
  if (!nombre || nombre.trim().length < 3) return null
  const fuse = new Fuse(items, {
    keys: ['nombreCorto', 'nombre'],
    threshold: 0.3,
    distance: 50
  })
  const results = fuse.search(nombre.trim())
  return results.length > 0 ? results[0].item : null
}
