import { auth } from './firebase-config.js'; 
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";
import { db } from './firebase-config.js'; 

const menuToggle = document.getElementById('menu-toggle');
const dropdownMenu = document.getElementById('dropdown-menu');
const logoutBtn = document.getElementById('logout-btn');
const displayUsername = document.getElementById('display-username');

onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("Usuario actual:", user.uid);

        try {
            const userDocRef = doc(db, "usuarios", user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                displayUsername.textContent = userData.nombreMostrado || user.displayName || "Usuario";
            } else {
                displayUsername.textContent = user.displayName || "Usuario"; 
            }
        } catch (error) {
            console.error("Error al obtener datos del usuario de Firestore:", error);
            displayUsername.textContent = user.displayName || "Usuario"; 
        }

    } else {
        console.log("Usuario no logueado, redirigiendo a index.html");
        window.location.href = '/src/index.html'; 
    }
});

menuToggle.addEventListener('click', () => {
    dropdownMenu.classList.toggle('show'); 
    menuToggle.classList.toggle('active'); 
});

document.addEventListener('click', (e) => {
    if (!menuToggle.contains(e.target) && !dropdownMenu.contains(e.target)) {
        
        dropdownMenu.classList.remove('show');
        menuToggle.classList.remove('active'); 
    }
});

logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
        console.log("Sesión cerrada correctamente.");
        window.location.href = '/src/index.html'; 
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
        alert("Ocurrió un error al cerrar sesión. Inténtalo de nuevo.");
    }
});