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
    // IMPORTANTE: Aquí usamos el nombre de usuario como la ruta fija
    // Esto evita que se creen IDs aleatorios como -Opek...
    const userScoreRef = ref(dbRealtime, `scores/${username}`);

    try {
        const snapshot = await get(userScoreRef);
        
        if (snapshot.exists()) {
            const data = snapshot.val();
            // Solo sobreescribimos si el nuevo puntaje es más alto
            if (scoreValue > data.score) {
                await set(userScoreRef, {
                    username: username,
                    score: scoreValue,
                    timestamp: Date.now()
                });
                console.log("Récord actualizado");
            }
        } else {
            // Si es la primera vez que este usuario juega
            await set(userScoreRef, {
                username: username,
                score: scoreValue,
                timestamp: Date.now()
            });
        }
    } catch (e) {
        console.error("Error al guardar:", e);
    }
}
export { app };