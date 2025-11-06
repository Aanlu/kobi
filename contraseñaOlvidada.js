import { auth } from './firebase-config.js'; 
import { sendPasswordResetEmail, fetchSignInMethodsForEmail } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

const resetForm = document.getElementById('reset-form');
const emailInput = document.getElementById('email-reset');

resetForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = emailInput.value;

    fetchSignInMethodsForEmail(auth, email)
        .then((methods) => {
            if (methods.length === 0) {
                alert('No se encontró una cuenta con ese correo electrónico.');
            } else if (methods.includes('password')) {
                sendPasswordResetEmail(auth, email)
                    .then(() => {
                        alert('Se ha enviado un correo para restablecer tu contraseña.');
                        resetForm.reset();
                    })
                    .catch((error) => alert(error.message));
            } else {
                alert(`Esa cuenta está registrada usando ${methods[0]}. \n\nPor favor, inicia sesión con ese método (no tiene contraseña).`);
            }
        })
        .catch((error) => {
            alert('Error al verificar el correo: ' + error.message);
        });
});