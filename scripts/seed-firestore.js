#!/usr/bin/env node

/**
 * Script para poblar Firestore con datos iniciales:
 * - Categorías
 * - Catálogo de 86 productos con historial de precios
 * - 3 sucursales
 *
 * Uso: npm run seed
 *
 * IMPORTANTE: Antes de ejecutar, configurá las credenciales en src/firebase.js
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, doc, setDoc, collection, addDoc } from 'firebase/firestore'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// ============================================================
// COPIÁ TUS CREDENCIALES DE FIREBASE AQUÍ (las mismas de src/firebase.js)
// ============================================================
const firebaseConfig = {
  apiKey: "AIzaSyCwYAEmUxS9Af8AO92kFRfmkUWyfXuONUE",
  authDomain: "compras-f3aa1.firebaseapp.com",
  projectId: "compras-f3aa1",
  storageBucket: "compras-f3aa1.firebasestorage.app",
  messagingSenderId: "59148557394",
  appId: "1:59148557394:web:0b919ec2f344ce411b938b"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// ID del hogar (cambiá esto por el código de tu hogar)
const HOGAR_ID = 'VEGA26'

const CATEGORIAS = [
  { id: 'frutas-verduras', nombre: 'Frutas y Verduras', icono: '🥬', colorHex: '#22C55E', ordenDefault: 1, ordenPorSucursal: { 'los-yoses': 1, 'plaza-mayor': 1, 'alajuela': 1 } },
  { id: 'carnes', nombre: 'Carnes y Embutidos', icono: '🥩', colorHex: '#EF4444', ordenDefault: 2, ordenPorSucursal: { 'los-yoses': 3, 'plaza-mayor': 2, 'alajuela': 3 } },
  { id: 'pescados', nombre: 'Pescados y Mariscos', icono: '🐟', colorHex: '#3B82F6', ordenDefault: 3, ordenPorSucursal: { 'los-yoses': 4, 'plaza-mayor': 3, 'alajuela': 4 } },
  { id: 'lacteos', nombre: 'Lácteos y Quesos', icono: '🧀', colorHex: '#F59E0B', ordenDefault: 4, ordenPorSucursal: { 'los-yoses': 2, 'plaza-mayor': 7, 'alajuela': 2 } },
  { id: 'huevos', nombre: 'Huevos', icono: '🥚', colorHex: '#F97316', ordenDefault: 5, ordenPorSucursal: { 'los-yoses': 5, 'plaza-mayor': 8, 'alajuela': 5 } },
  { id: 'enlatados', nombre: 'Enlatados', icono: '🥫', colorHex: '#DC2626', ordenDefault: 6, ordenPorSucursal: { 'los-yoses': 8, 'plaza-mayor': 5, 'alajuela': 8 } },
  { id: 'pastas-granos', nombre: 'Pastas y Granos', icono: '🍝', colorHex: '#D97706', ordenDefault: 7, ordenPorSucursal: { 'los-yoses': 9, 'plaza-mayor': 6, 'alajuela': 9 } },
  { id: 'panaderia', nombre: 'Panadería', icono: '🍞', colorHex: '#92400E', ordenDefault: 8, ordenPorSucursal: { 'los-yoses': 6, 'plaza-mayor': 4, 'alajuela': 6 } },
  { id: 'condimentos', nombre: 'Condimentos y Salsas', icono: '🧂', colorHex: '#7C3AED', ordenDefault: 9, ordenPorSucursal: { 'los-yoses': 10, 'plaza-mayor': 9, 'alajuela': 10 } },
  { id: 'bebidas', nombre: 'Bebidas', icono: '🥤', colorHex: '#06B6D4', ordenDefault: 10, ordenPorSucursal: { 'los-yoses': 7, 'plaza-mayor': 10, 'alajuela': 7 } },
  { id: 'snacks', nombre: 'Snacks y Galletas', icono: '🍪', colorHex: '#F472B6', ordenDefault: 11, ordenPorSucursal: { 'los-yoses': 11, 'plaza-mayor': 11, 'alajuela': 11 } },
  { id: 'cereales', nombre: 'Cereales y Granola', icono: '🥣', colorHex: '#A78BFA', ordenDefault: 12, ordenPorSucursal: { 'los-yoses': 12, 'plaza-mayor': 12, 'alajuela': 12 } },
  { id: 'congelados', nombre: 'Congelados', icono: '🧊', colorHex: '#67E8F9', ordenDefault: 13, ordenPorSucursal: { 'los-yoses': 13, 'plaza-mayor': 13, 'alajuela': 13 } },
  { id: 'limpieza', nombre: 'Limpieza del Hogar', icono: '🧹', colorHex: '#34D399', ordenDefault: 14, ordenPorSucursal: { 'los-yoses': 14, 'plaza-mayor': 14, 'alajuela': 14 } },
  { id: 'cuidado-personal', nombre: 'Cuidado Personal', icono: '🧴', colorHex: '#E879F9', ordenDefault: 15, ordenPorSucursal: { 'los-yoses': 15, 'plaza-mayor': 15, 'alajuela': 15 } },
  { id: 'otros', nombre: 'Otros', icono: '📦', colorHex: '#9CA3AF', ordenDefault: 16, ordenPorSucursal: { 'los-yoses': 16, 'plaza-mayor': 16, 'alajuela': 16 } }
]

const SUCURSALES = [
  { id: 'los-yoses', nombre: 'Automercado Los Yoses', direccion: 'Barrio Dent, San Pedro', activa: true },
  { id: 'plaza-mayor', nombre: 'Automercado Plaza Mayor', direccion: 'Rohrmoser', activa: true },
  { id: 'alajuela', nombre: 'Automercado Alajuela', direccion: 'Alajuela Centro', activa: true }
]

async function seed() {
  console.log('🌱 Iniciando seed de datos...')
  console.log(`   Hogar: ${HOGAR_ID}`)

  // 1. Crear hogar
  console.log('\n📋 Creando hogar...')
  await setDoc(doc(db, 'hogares', HOGAR_ID), {
    nombre: 'Casa Vega',
    codigo: HOGAR_ID,
    creadoEn: new Date()
  })

  // 2. Crear categorías
  console.log('📂 Creando categorías...')
  for (const cat of CATEGORIAS) {
    await setDoc(doc(db, `hogares/${HOGAR_ID}/categorias`, cat.id), cat)
  }
  console.log(`   ✅ ${CATEGORIAS.length} categorías creadas`)

  // 3. Crear sucursales
  console.log('🏪 Creando sucursales...')
  for (const suc of SUCURSALES) {
    await setDoc(doc(db, `hogares/${HOGAR_ID}/sucursales`, suc.id), suc)
  }
  console.log(`   ✅ ${SUCURSALES.length} sucursales creadas`)

  // 4. Importar catálogo
  console.log('📦 Importando catálogo...')
  const catalogoRaw = readFileSync(join(__dirname, '..', 'data', 'catalogo_inicial.json'), 'utf-8')
  const catalogo = JSON.parse(catalogoRaw)

  let count = 0
  for (const producto of catalogo) {
    const productoDoc = {
      nombre: producto.nombre,
      nombreCorto: producto.nombreCorto,
      categoriaId: producto.categoriaId,
      unidadTipo: producto.unidadTipo,
      unidadDetalle: producto.unidadDetalle,
      cantidadDefault: producto.cantidadDefault || 1,
      frecuencia: producto.frecuencia || 0,
      ultimaCompra: null,
      precioUnitarioRef: producto.ultimoPrecio || null,
      activo: true
    }

    const docRef = await addDoc(collection(db, `hogares/${HOGAR_ID}/catalogo`), productoDoc)

    // Guardar historial de precios
    if (producto.historialPrecios && producto.historialPrecios.length > 0) {
      for (const precio of producto.historialPrecios) {
        await addDoc(collection(db, `hogares/${HOGAR_ID}/catalogo/${docRef.id}/precios`), {
          fecha: precio.fecha,
          precioUnitarioRef: precio.precio,
          fuente: 'historial-automercado'
        })
      }
    }

    count++
    if (count % 10 === 0) console.log(`   ... ${count}/${catalogo.length} productos`)
  }
  console.log(`   ✅ ${count} productos importados con historial de precios`)

  console.log('\n🎉 ¡Seed completado exitosamente!')
  console.log('   Ahora podés abrir la app y crear/unirte al hogar con el código:', HOGAR_ID)
  process.exit(0)
}

seed().catch(err => {
  console.error('❌ Error durante el seed:', err)
  process.exit(1)
})
