import { auth, db } from './firebase-config.js'; 
import { 
    signInWithEmailAndPassword, 
    GoogleAuthProvider, 
    FacebookAuthProvider, 
    signInWithPopup, 
    getAdditionalUserInfo,
    fetchSignInMethodsForEmail,
    linkWithCredential,
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

import { 
    doc, 
    setDoc, 
    getDoc, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

function getNombreAmigable(providerId) {
    if (providerId === 'google.com') {
        return 'Google';
    } else if (providerId === 'facebook.com') {
        return 'Facebook';
    } else if (providerId === 'password') {
        return 'correo y contraseña';
    }
    return providerId;
}

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
            const user = userCredential.user;
            if (user.emailVerified) {
                console.log('¡Bienvenido!', user);
                window.location.href = 'https://media.tenor.com/5JtSeb0T71MAAAAM/dancing-banana.gif'; 
            } else {
                console.log('Intento de login con correo no verificado');
                alert('Tu cuenta ya está registrada, pero aún no has verificado tu correo.\n\nPor favor, revisa tu bandeja de entrada (y spam).');
                
                sendEmailVerification(user); 
            }
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

const googleBtn = document.getElementById('google-btn');
const facebookBtn = document.getElementById('facebook-btn');

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

facebookProvider.addScope('email');
facebookProvider.addScope('public_profile');

googleBtn.addEventListener('click', () => {
    iniciarSesionConPopup(googleProvider);
});

facebookBtn.addEventListener('click', () => {
    iniciarSesionConPopup(facebookProvider);
});

async function iniciarSesionConPopup(provider) {
    try {
        const result = await signInWithPopup(auth, provider);
        const infoAdicional = getAdditionalUserInfo(result);
        const user = result.user;

        if (infoAdicional.isNewUser) {
            console.log('Detectado nuevo usuario social:', user.uid);

            let idUsuarioBase = user.displayName.replace(/\s+/g, '').toLowerCase();
            let idUsuario = idUsuarioBase;
            let i = 1;
            
            let usernameRef = doc(db, "usernames", idUsuario);
            let docSnap = await getDoc(usernameRef);
            
            while (docSnap.exists()) {
                idUsuario = `${idUsuarioBase}${i}`;
                i++;
                usernameRef = doc(db, "usernames", idUsuario);
                docSnap = await getDoc(usernameRef);
            }

            const userDocRef = doc(db, "usuarios", user.uid);
            const userData = {
                idUsuario: idUsuario, 
                nombreMostrado: user.displayName,
                correo: user.email,
                avatarUrl: user.photoURL || "https://i.imgur.com/83USY6U.png", 
                puntuacionTotal: 0,
                rachaActual: 0,
                ultimaActividad: serverTimestamp()
            };

            const userDocPromise = setDoc(userDocRef, userData);

            const usernameDocPromise = setDoc(usernameRef, { uid: user.uid });

            await Promise.all([userDocPromise, usernameDocPromise]);
            
            console.log('Perfil de usuario social creado en Firestore.');
        }

        console.log('Inicio de sesión social exitoso.');
        window.location.href = 'https://media.tenor.com/5JtSeb0T71MAAAAM/dancing-banana.gif';

    } catch (error) {
        console.error("Error en login social:", error);

        if (error.code === 'auth/account-exists-with-different-credential') {
            const pendingCredential = error.credential;
            const email = error.customData.email;
            
            const methods = await fetchSignInMethodsForEmail(auth, email);
            const firstProvider = methods[0];
            const nombreProveedorExistente = getNombreAmigable(firstProvider);
            const nombreProveedorNuevo = getNombreAmigable(provider.providerId);

            if (firstProvider === 'password') {
                const password = prompt(`Ya tienes una cuenta con ${email} (registrada con contraseña).\n\nIngresa tu contraseña para vincular tu cuenta de ${nombreProveedorNuevo}:`);
                if (password) {
                    try {
                        const userCredential = await signInWithEmailAndPassword(auth, email, password);
                        await linkWithCredential(userCredential.user, pendingCredential);
                        alert('¡Cuentas vinculadas con éxito! Iniciando sesión...');
                        window.location.href = 'https://media.tenor.com/5JtSeb0T71MAAAAM/dancing-banana.gif';
                    } catch (linkError) {
                        alert('Error al vincular: Contraseña incorrecta o ' + linkError.message);
                    }
                }
            } else {
                alert(`Ya tienes una cuenta con ${email} registrada usando ${nombreProveedorExistente}.\n\nPor favor, inicia sesión con ${nombreProveedorExistente}.`);
            }
        } else if (error.code === 'auth/popup-closed-by-user') {
            alert('El popup de autenticación fue cerrado.');
        } else {
            alert('Error al iniciar sesión con el proveedor: ' + error.message);
        }
    }
}