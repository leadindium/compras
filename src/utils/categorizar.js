/**
 * Categorías iniciales del sistema
 */
export const CATEGORIAS_DEFAULT = [
  { id: 'frutas-verduras', nombre: 'Frutas y Verduras', icono: '🥬', colorHex: '#22C55E', ordenDefault: 1 },
  { id: 'carnes', nombre: 'Carnes y Embutidos', icono: '🥩', colorHex: '#EF4444', ordenDefault: 2 },
  { id: 'pescados', nombre: 'Pescados y Mariscos', icono: '🐟', colorHex: '#3B82F6', ordenDefault: 3 },
  { id: 'lacteos', nombre: 'Lácteos y Quesos', icono: '🧀', colorHex: '#F59E0B', ordenDefault: 4 },
  { id: 'huevos', nombre: 'Huevos', icono: '🥚', colorHex: '#F97316', ordenDefault: 5 },
  { id: 'enlatados', nombre: 'Enlatados', icono: '🥫', colorHex: '#DC2626', ordenDefault: 6 },
  { id: 'pastas-granos', nombre: 'Pastas y Granos', icono: '🍝', colorHex: '#D97706', ordenDefault: 7 },
  { id: 'panaderia', nombre: 'Panadería', icono: '🍞', colorHex: '#92400E', ordenDefault: 8 },
  { id: 'condimentos', nombre: 'Condimentos y Salsas', icono: '🧂', colorHex: '#7C3AED', ordenDefault: 9 },
  { id: 'bebidas', nombre: 'Bebidas', icono: '🥤', colorHex: '#06B6D4', ordenDefault: 10 },
  { id: 'snacks', nombre: 'Snacks y Galletas', icono: '🍪', colorHex: '#F472B6', ordenDefault: 11 },
  { id: 'cereales', nombre: 'Cereales y Granola', icono: '🥣', colorHex: '#A78BFA', ordenDefault: 12 },
  { id: 'congelados', nombre: 'Congelados', icono: '🧊', colorHex: '#67E8F9', ordenDefault: 13 },
  { id: 'limpieza', nombre: 'Limpieza del Hogar', icono: '🧹', colorHex: '#34D399', ordenDefault: 14 },
  { id: 'cuidado-personal', nombre: 'Cuidado Personal', icono: '🧴', colorHex: '#E879F9', ordenDefault: 15 },
  { id: 'otros', nombre: 'Otros', icono: '📦', colorHex: '#9CA3AF', ordenDefault: 16 }
]

/**
 * Obtener categoría por ID
 */
export function getCategoria(categoriaId) {
  return CATEGORIAS_DEFAULT.find(c => c.id === categoriaId) || CATEGORIAS_DEFAULT[CATEGORIAS_DEFAULT.length - 1]
}

/**
 * Obtener mapa de categorías { id: categoria }
 */
export function getCategoriaMap() {
  const map = {}
  CATEGORIAS_DEFAULT.forEach(c => { map[c.id] = c })
  return map
}
