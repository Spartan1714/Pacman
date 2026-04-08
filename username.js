/* --- username.js --- */
import { dbRealtime, currentUser } from "./firebase.js";
import { ref, get, set } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js";

export async function checkUsername(user) {
    if (!user) return "GUEST"; // Si no hay usuario, es invitado

    const userRef = ref(dbRealtime, `users/${user.uid}`);
    
    try {
        const snapshot = await get(userRef);
        if (snapshot.exists() && snapshot.val().username) {
            return snapshot.val().username.toUpperCase();
        } else {
            // Si el usuario existe pero no tiene username en la BD, lo pedimos
            return await mostrarModalUsername(user);
        }
    } catch (e) {
        console.error("Error al obtener nombre:", e);
        return "GUEST";
    }
}

function mostrarModalUsername() {
    return new Promise((resolve) => {
        // Creamos el HTML del modal dinámicamente para no ensuciar el index.html
        const overlay = document.createElement("div");
        overlay.className = "menu-overlay";
        overlay.style.display = "flex";
        overlay.innerHTML = `
            <div style="background: black; border: 2px solid #ffe600; padding: 30px; text-align: center;">
                <h2 style="color: #ffe600; font-family: 'Press Start 2P'; font-size: 14px;">ENTER NICKNAME</h2>
                <input type="text" id="nickInput" maxlength="10" 
                       style="background: #222; color: white; border: 1px solid white; padding: 10px; margin: 20px 0; font-family: 'Press Start 2P'; width: 80%;">
                <br>
                <button id="saveNickBtn" class="menu-btn" style="background: #ffe600; color: black; border: none; padding: 10px 20px; cursor: pointer; font-family: 'Press Start 2P';">START</button>
            </div>
        `;
        document.body.appendChild(overlay);

        document.getElementById("saveNickBtn").onclick = async () => {
            const input = document.getElementById("nickInput");
            const name = input.value.trim().toUpperCase() || "PAC-MAN";
            
            // Guardar en Firebase
            await set(ref(dbRealtime, `users/${currentUser.uid}`), {
                username: name,
                email: currentUser.email
            });

            overlay.remove();
            resolve(name);
        };
    });
}