import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getAuth, connectAuthEmulator } from 'firebase/auth'

// ============================================================
// INSTRUCCIONES PARA CONFIGURAR FIREBASE:
//
// 1. Andá a https://console.firebase.google.com/
// 2. Creá un proyecto nuevo (ej: "lista-compras-vega")
// 3. En el proyecto, habilitá:
//    - Authentication > Sign-in method > Anonymous
//    - Firestore Database > Create database > Start in test mode
// 4. En Project Settings > General > Your apps > Web app (</> icon)
// 5. Copiá las credenciales y reemplazá los valores abajo
// 6. Ejecutá `npm run seed` para poblar el catálogo inicial
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyCwYAEmUxS9Af8AO92kFRfmkUWyfXuONUE",
  authDomain: "compras-f3aa1.firebaseapp.com",
  projectId: "compras-f3aa1",
  storageBucket: "compras-f3aa1.firebasestorage.app",
  messagingSenderId: "59148557394",
  appId: "1:59148557394:web:0b919ec2f344ce411b938b",
  measurementId: "G-J3743900SW"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
export const db = getFirestore(app)
export const auth = getAuth(app)

// Descomentar para usar emuladores locales:
// connectFirestoreEmulator(db, 'localhost', 8080)
// connectAuthEmulator(auth, 'http://localhost:9099')
