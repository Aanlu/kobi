import { auth, db } from './firebase-config.js';

import { 
    createUserWithEmailAndPassword,
    sendEmailVerification,
    updateProfile
 } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

 import { 
    doc, 
    setDoc, 
    getDoc, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const registerForm = document.getElementById('register-form');
const usernameInput = document.getElementById('user-name');
const emailInput = document.getElementById('register-email');
const passwordInput = document.getElementById('password');
const verifyPasswordInput = document.getElementById('verifypassword');

const toggle = document.getElementById('toggle-password'); 
const eye = toggle.querySelector('.eye'); 

usernameInput.addEventListener('input', function(e) {
    this.value = this.value.replace(/\s/g, '');
});

toggle.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';

    const newType = isPassword ? 'text' : 'password';

    passwordInput.type = newType;
    verifyPasswordInput.type = newType;

    if (isPassword) {
        toggle.classList.add('active'); 
        eye.style.transform = 'translate(0px, 0px)';
    } else {
        toggle.classList.remove('active');
    }
});

document.addEventListener('mousemove', (e) => {
    if (toggle.classList.contains('active')) {
        return;
    }
    const containerRect = toggle.getBoundingClientRect();
    const containerX = containerRect.left + containerRect.width / 2;
    const containerY = containerRect.top + containerRect.height / 2;
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    const angle = Math.atan2(mouseY - containerY, mouseX - containerX);
    const maxMoveX = (containerRect.width - eye.offsetWidth) / 2;
    const maxMoveY = (containerRect.height - eye.offsetHeight) / 2; 
    const eyeX = Math.cos(angle) * maxMoveX;
    const eyeY = Math.sin(angle) * maxMoveY;
    eye.style.transform = `translate(${eyeX}px, ${eyeY}px)`;
});

registerForm.addEventListener('submit', (e) => {
    e.preventDefault(); 

    const idUsuario = usernameInput.value.trim().toLowerCase();
    const email = emailInput.value;
    const password = passwordInput.value;
    const verifyPassword = verifyPasswordInput.value;

    if (!idUsuario || !email || !password) {
        return alert('Por favor, rellena todos los campos.');
    }
    if (idUsuario.length < 3) {
        return alert('El nombre de usuario debe tener al menos 3 caracteres.');
    }
    if (password !== verifyPassword) {
        return alert('Las contraseñas no coinciden.');
    }
    if (password.length < 6) {
        return alert('La contraseña debe tener al menos 6 caracteres.');
    }

    registrarUsuario(idUsuario, email, password);

    
        async function registrarUsuario(idUsuario, email, password) {
        const usernameRef = doc(db, "usernames", idUsuario);
    
        try {
            const docSnap = await getDoc(usernameRef);

            if (docSnap.exists()) {
                return alert('Error: Ese nombre de usuario ya está registrado. Por favor, elige otro.');
            } 
        
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
        
            console.log('Usuario creado en Auth:', user.uid);

            const userDocRef = doc(db, "usuarios", user.uid);
            const userData = {
                idUsuario: idUsuario,
                nombreMostrado: idUsuario, 
                correo: email,
                avatarUrl: "https://i.imgur.com/83USY6U.png",
                puntuacionTotal: 0,
                rachaActual: 0,
                ultimaActividad: serverTimestamp() 
            };
            const userDocPromise = setDoc(userDocRef, userData);

            const usernameDocPromise = setDoc(usernameRef, { 
                uid: user.uid 
            });
    
            const profilePromise = updateProfile(user, {
                displayName: idUsuario 
            });
        
            const emailPromise = sendEmailVerification(user);

            await Promise.all([userDocPromise, usernameDocPromise, profilePromise, emailPromise]);

            alert('¡Registro exitoso! Te hemos enviado un correo.\n\nPor favor, verifica tu cuenta antes de iniciar sesión.');
            window.location.href = 'index.html';

        } catch (error) {
            console.error('Error en el registro:', error);
            
            if (error.code === 'auth/email-already-in-use') {
                alert('Error: Este correo electrónico ya está registrado.');
            } else if (error.code === 'auth/invalid-email') {
                alert('Error: El formato del correo electrónico no es válido.');
            } else if (error.code === 'auth/weak-password') {
                alert('Error: La contraseña es muy débil.');
            } else {
                alert('Ocurrió un error inesperado: ' + error.message);
            }
        }
    }
});