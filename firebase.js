import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";
import { getDatabase, ref, set, push } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDDjYUCgsPmifR0hNTaw3aD9Qg5dyjDdxM",
  authDomain: "pacman-game-e602a.firebaseapp.com",
  databaseURL: "https://pacman-game-e602a-default-rtdb.firebaseio.com",
  projectId: "pacman-game-e602a",
  storageBucket: "pacman-game-e602a.firebasestorage.app",
  messagingSenderId: "316960307396",
  appId: "1:316960307396:web:2b33cecfd8b3dde621f191"
};

// 🔥 EVITAR DUPLICADOS: Solo inicializa si no existe ninguna app
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const dbRealtime = getDatabase(app);

export let currentUser = null;

onAuthStateChanged(auth, (user) => {
    currentUser = user;
});

// FUNCIÓN PARA GUARDAR EN REALTIME (Asegúrate de que el nombre coincida con tu import en game.js)
export async function saveScoreRealtime(username, scoreValue) {
    const scoresRef = ref(dbRealtime, 'scores');
    const newScoreRef = push(scoresRef); 
    
    return set(newScoreRef, {
        username: username,
        score: scoreValue,
        timestamp: Date.now()
    });
}

export { app };