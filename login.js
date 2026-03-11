import { app } from "./firebase.js";

import {
getAuth,
createUserWithEmailAndPassword,
signInWithEmailAndPassword,
GoogleAuthProvider,
signInWithPopup,
sendEmailVerification
}
from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

const auth = getAuth(app);

document.getElementById("register").onclick = async () => {

const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

try{

const userCredential =
await createUserWithEmailAndPassword(auth,email,password);

await sendEmailVerification(userCredential.user);

alert("Verification email sent");

}catch(error){

alert(error.message);

}

};

document.getElementById("login").onclick = async () => {

const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

try{

await signInWithEmailAndPassword(auth,email,password);

window.location = "index.html";

}catch(error){

alert(error.message);

}

};

document.getElementById("google").onclick = async () => {

const provider = new GoogleAuthProvider();

try{

await signInWithPopup(auth,provider);

window.location = "index.html";

}catch(error){

alert(error.message);

}

};