import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
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

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const dbRealtime = getDatabase(app);

export let currentUser = null;

// Observador del estado de autenticación
onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    
    if (user) {
        const userRef = ref(dbRealtime, `users/${user.uid}`);
        const snapshot = await get(userRef);

        if (!snapshot.exists() || !snapshot.val().username) {
            // Caso A: Usuario logueado pero SIN nickname
            const modal = document.getElementById("usernameModal");
            if (modal) {
                modal.classList.remove("hidden");
                modal.style.display = "flex";
                configurarBotonNickname(user);
            }
        } else {
            // Caso B: Usuario logueado y YA TIENE nickname
            // Simplemente ocultamos todo lo relacionado al login para que se vea el juego
            ocultarInterfazLogin();
        }
    }
});

// Función interna para guardar el Nickname inicial
function configurarBotonNickname(user) {
    const btn = document.getElementById("saveNicknameBtn");
    const input = document.getElementById("nicknameInput");

    btn.onclick = async () => {
        const nickname = input.value.trim();
        if (nickname.length < 3) return alert("Nickname too short!");

        try {
            await set(ref(dbRealtime, `users/${user.uid}`), {
                username: nickname,
                email: user.email
            });

            // Una vez guardado, ocultamos la interfaz
            ocultarInterfazLogin();

        } catch (e) {
            console.error("Error saving nickname:", e);
        }
    };
}

// FUNCIÓN PARA GUARDAR PUNTAJES (Ahora usa el Nickname guardado)
export async function saveScoreRealtime(username, scoreValue) {
    // Si username viene como el email, lo limpiamos, 
    // pero idealmente pasarás el Nickname desde game.js
    const cleanUsername = username.replace(/\./g, '_'); 
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

export { auth, dbRealtime, app };