import { auth } from './firebase-config.js'; 
import { sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

const resetForm = document.getElementById('reset-form');
const emailInput = document.getElementById('email-reset');

resetForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = emailInput.value;

    if (!email) {
        alert('Por favor, ingresa un correo.');
        return;
    }

    sendPasswordResetEmail(auth, email)
        .then(() => {
            alert('¡Correo de recuperación enviado! \n\Revisa tu bandeja de entrada y spam.');
            resetForm.reset();
        })
        .catch((error) => {
            console.error("Error en sendPasswordResetEmail:", error);

            if (error.code === 'auth/user-not-found') {
                alert('No se encontró una cuenta con ese correo electrónico.');
            } else if (error.code === 'auth/invalid-email') {
                alert('El formato del correo es incorrecto.');
            } else {
                alert('Error: ' + error.message);
            }
        });
});