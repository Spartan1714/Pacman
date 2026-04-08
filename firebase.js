import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
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

const auth = getAuth(app);
const db = getFirestore(app);

// usuario global
export let currentUser = null;

// escuchar login
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    console.log("USER:", user?.email);
});

// guardar score
export async function saveScore(username, score) {
    try {
        await addDoc(collection(db, "scores"), {
            username,
            score,
            date: new Date()
        });
    } catch (e) {
        console.error(e);
    }
}

// logout
export function logout() {
    signOut(auth);
}