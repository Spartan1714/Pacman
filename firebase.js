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
    // Referencia directa al usuario: /scores/nombreUsuario
    const userScoreRef = ref(dbRealtime, `scores/${username}`);

    // Intentamos obtener el puntaje que ya tiene guardado
    const snapshot = await get(userScoreRef);
    
    if (snapshot.exists()) {
        const currentData = snapshot.val();
        // 🔥 SOLO ACTUALIZA SI EL NUEVO SCORE ES MAYOR
        if (scoreValue > currentData.score) {
            return set(userScoreRef, {
                username: username,
                score: scoreValue,
                timestamp: Date.now()
            });
        } else {
            console.log("El puntaje actual es menor al récord. No se guarda.");
            return Promise.resolve(); 
        }
    } else {
        // Si el usuario no existe, creamos su primer récord
        return set(userScoreRef, {
            username: username,
            score: scoreValue,
            timestamp: Date.now()
        });
    }
}

export { app };