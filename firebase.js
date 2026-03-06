type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyDDjYUCgsPmifR0hNTaw3aD9Qg5dyjDdxM",
    authDomain: "pacman-game-e602a.firebaseapp.com",
    databaseURL: "https://pacman-game-e602a-default-rtdb.firebaseio.com",
    projectId: "pacman-game-e602a",
    storageBucket: "pacman-game-e602a.firebasestorage.app",
    messagingSenderId: "316960307396",
    appId: "1:316960307396:web:2b33cecfd8b3dde621f191",
    measurementId: "G-ER40M0DJ2M"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
