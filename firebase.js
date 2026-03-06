import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDDjYUCgsPmifR0hNTaw3aD9Qg5dyjDdxM",
  authDomain: "pacman-game-e602a.firebaseapp.com",
  databaseURL: "https://pacman-game-e602a-default-rtdb.firebaseio.com",
  projectId: "pacman-game-e602a",
  storageBucket: "pacman-game-e602a.firebasestorage.app",
  messagingSenderId: "316960307396",
  appId: "1:316960307396:web:2b33cecfd8b3dde621f191"
};

const app = initializeApp(firebaseConfig);

const db = getDatabase(app);

export { db };