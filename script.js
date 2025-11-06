//aca anda lo de firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyAycV6E9jTbPwV4qZsER3XFy1iRRdiAc94",
    authDomain: "kobi-ee1a1.firebaseapp.com",
    projectId: "kobi-ee1a1",
    storageBucket: "kobi-ee1a1.firebasestorage.app",
    messagingSenderId: "979366954149",
    appId: "1:979366954149:web:31be274915461794d6b94c",
    measurementId: "G-W2LMVCCV3Q"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

//aca anda lo del ojo
const passwordInput = document.getElementById('password');
const toggle = document.getElementById('toggle-password'); 
const eye = toggle.querySelector('.eye'); 

toggle.addEventListener('click', () => {
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggle.classList.add('active');
        eye.style.transform = 'translate(0px, 0px)';
    } else {
        passwordInput.type = 'password';
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

const loginForm = document.getElementById('login-form');

loginForm.addEventListener('submit', (e) => {
    e.preventDefault(); 

    const emailInput = document.getElementById('email'); 
    const passwordInputLogin = document.getElementById('password');
    const email = emailInput.value;
    const password = passwordInputLogin.value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log('¡Bienvenido!', userCredential.user);
            window.location.href = 'https://media.tenor.com/5JtSeb0T71MAAAAM/dancing-banana.gif'; 
        })
        .catch((error) => {
            console.error('Error en el inicio de sesión:', error);
            
            let mensajeError = 'Error al iniciar sesión. ';
            if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-email') {
                mensajeError = 'Usuario no encontrado.';
            } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                mensajeError = 'Contraseña incorrecta.';
            }
            
            alert(mensajeError);
        });
});