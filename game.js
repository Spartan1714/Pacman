import { db } from "./firebase.js";

import { collection, addDoc } from
"https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

async function guardarScore(){

    console.log("Intentando guardar score");

    try{

        await addDoc(collection(db,"scores"),{
            player:"Andrea",
            score:5000,
            date:new Date()
        });

        console.log("Score guardado");

    }catch(error){

        console.error(error);

    }

}

guardarScore();