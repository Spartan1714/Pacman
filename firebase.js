import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js";
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
    // 🔥 LIMPIEZA: Quitamos puntos o caracteres que Firebase no acepta como llaves
    const cleanUsername = username.replace(/\./g, '_'); 
    
    // Usamos el nombre limpio como ID único
    const userScoreRef = ref(dbRealtime, `scores/${cleanUsername}`);

    try {
        const snapshot = await get(userScoreRef);
        if (snapshot.exists()) {
            if (scoreValue > snapshot.val().score) {
                await set(userScoreRef, { username, score: scoreValue });
            }
        } else {
            await set(userScoreRef, { username, score: scoreValue });
        }
    } catch (e) { console.error(e); }
}
export { app };