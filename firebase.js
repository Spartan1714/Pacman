import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDDjYUCgsPmifR0hNTaw3aD9Qg5dyjDdxM",
  authDomain: "pacman-game-e602a.firebaseapp.com",
  projectId: "pacman-game-e602a",
  storageBucket: "pacman-game-e602a.firebasestorage.app",
  messagingSenderId: "316960307396",
  appId: "1:316960307396:web:2b33cecfd8b3dde621f191"
};

const app = initializeApp(firebaseConfig);

// 🔥 AUTH
const auth = getAuth(app);

// 🔥 FIRESTORE
const db = getFirestore(app);

// 🔥 USUARIO GLOBAL (IMPORTANTE)
export let currentUser = null;

// 🔥 ESCUCHAR LOGIN REAL
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        console.log("Usuario listo:", user.email);
    } else {
        currentUser = null;
    }
});

// 👉 guardar score
export async function saveScore(username, score) {
    try {
        await addDoc(collection(db, "scores"), {
            username: username,
            score: score,
            date: new Date()
        });
        console.log("Score guardado");
    } catch (e) {
        console.error("Error guardando score:", e);
    }
}

export { app };