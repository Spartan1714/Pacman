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

// --- NUEVA FUNCIÓN: Oculta el login y muestra el juego ---
// Función mejorada para ocultar el login sin parpadeos
function ocultarInterfazLogin() {
    const modal = document.getElementById("usernameModal");
    const loginContainer = document.querySelector(".login-container") || document.getElementById("loginContainer");
    
    // Usamos requestAnimationFrame para asegurar que el navegador esté listo
    requestAnimationFrame(() => {
        if (modal) {
            modal.style.setProperty("display", "none", "important");
            modal.classList.add("hidden");
        }
        if (loginContainer) {
            loginContainer.style.setProperty("display", "none", "important");
            loginContainer.classList.add("hidden");
        }
        
        // Si el canvas estaba oculto, lo mostramos aquí
        const gameCanvas = document.getElementById("gameCanvas");
        if (gameCanvas) gameCanvas.style.display = "block";
    });
}

onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    
    if (user) {
        const userRef = ref(dbRealtime, `users/${user.uid}`);
        const snapshot = await get(userRef);

        if (!snapshot.exists() || !snapshot.val().username) {
            // Caso: Falta Nickname -> Mostrar Modal
            const modal = document.getElementById("usernameModal");
            if (modal) {
                modal.classList.remove("hidden");
                modal.style.display = "flex";
                configurarBotonNickname(user);
            }
        } else {
            // Caso: Todo OK -> Ocultar login DE INMEDIATO
            ocultarInterfazLogin();
        }
    } else {
        // Si NO hay usuario, nos aseguramos de que el login sea visible
        const loginContainer = document.querySelector(".login-container") || document.getElementById("loginContainer");
        if (loginContainer) {
            loginContainer.classList.remove("hidden");
            loginContainer.style.display = "flex";
        }
    }
});
function configurarBotonNickname(user) {
    const btn = document.getElementById("saveNicknameBtn");
    const input = document.getElementById("nicknameInput");

    if (!btn) return;

    btn.onclick = async () => {
        const nickname = input.value.trim();
        if (nickname.length < 3) return alert("Nickname too short!");

        try {
            // Guardamos la relación UID -> Username
            await set(ref(dbRealtime, `users/${user.uid}`), {
                username: nickname,
                email: user.email
            });

            // Ocultamos todo para empezar a jugar
            ocultarInterfazLogin();

        } catch (e) {
            console.error("Error saving nickname:", e);
        }
    };
}

export async function saveScoreRealtime(username, scoreValue) {
    // Limpieza de caracteres prohibidos en llaves de Firebase
    const cleanUsername = username.replace(/[\.\#\$\[\]]/g, '_'); 
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
    } catch (e) { 
        console.error("Error saving score:", e); 
    }
}

export { auth, dbRealtime, app };