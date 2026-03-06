import { db } from "./firebase.js";

import { collection, addDoc } from 
"https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

async function testFirebase(){

    try {

        await addDoc(collection(db, "scores"), {
            player: "Andrea",
            score: 5000,
            date: new Date()
        });

        console.log("Score guardado correctamente");

    } catch (error) {

        console.error("Error:", error);

    }

}

testFirebase();