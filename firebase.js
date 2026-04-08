import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";
// 1. IMPORTAR REALTIME DATABASE
import { getDatabase, ref, set, push } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDDjYUCgsPmifR0hNTaw3aD9Qg5dyjDdxM",
  authDomain: "pacman-game-e602a.firebaseapp.com",
  databaseURL: "https://pacman-game-e602a-default-rtdb.firebaseio.com", // 2. TU URL DE REALTIME
  projectId: "pacman-game-e602a",
  storageBucket: "pacman-game-e602a.firebasestorage.app",
  messagingSenderId: "316960307396",
  appId: "1:316960307396:web:2b33cecfd8b3dde621f191"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const dbFirestore = getFirestore(app);
const dbRealtime = getDatabase(app); // 3. INICIALIZAR REALTIME

export let currentUser = null;

onAuthStateChanged(auth, (user) => {
    currentUser = user;
});

// 4. FUNCIÓN PARA GUARDAR EN REALTIME
export async function saveScoreRealtime(username, scoreValue) {
    const scoresRef = ref(dbRealtime, 'scores');
    const newScoreRef = push(scoresRef); // Crea una clave única para el registro
    
    return set(newScoreRef, {
        username: username,
        score: scoreValue,
        timestamp: Date.now()
    });
}