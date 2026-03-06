import { db } from "./firebase.js";

import { ref, push } from
"https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js";

console.log("Intentando guardar score");

push(ref(db,"scores"),{
  player:"Andrea",
  score:100,
  date:Date.now()
});