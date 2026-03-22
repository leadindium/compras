/**
 * Formatea un número como colones costarricenses: ₡1,860
 */
export function formatColones(amount) {
  if (amount == null || isNaN(amount)) return ''
  return '₡' + Math.round(amount).toLocaleString('es-CR')
}

/**
 * Formatea un número como colones con decimales si es necesario
 */
export function formatColonesDecimal(amount) {
  if (amount == null || isNaN(amount)) return ''
  const rounded = Math.round(amount * 100) / 100
  if (rounded % 1 === 0) return formatColones(rounded)
  return '₡' + rounded.toLocaleString('es-CR', { minimumFractionDigits: 2 })
}

/**
 * Parsea un string de colones a número: "₡1,860" → 1860
 */
export function parseColones(str) {
  if (!str) return null
  const cleaned = str.replace(/[₡,.\s]/g, '')
  const num = parseInt(cleaned, 10)
  return isNaN(num) ? null : num
}
