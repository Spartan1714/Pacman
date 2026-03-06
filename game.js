import { db, ref, push } from "./firebase.js";

console.log("Guardando score");

push(ref(db, "scores"), {
  player: "Osejo",
  score: 100,
  date: Date.now()
});