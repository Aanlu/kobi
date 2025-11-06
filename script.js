import { auth } from './firebase-config.js';
import { 
    signInWithEmailAndPassword, 
    GoogleAuthProvider, 
    FacebookAuthProvider, 
    signInWithPopup, 
    getAdditionalUserInfo,
    fetchSignInMethodsForEmail,
    linkWithCredential,
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

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

function iniciarSesionConPopup(provider) {
    signInWithPopup(auth, provider)
        .then((result) => {
            const infoAdicional = getAdditionalUserInfo(result);
            if (infoAdicional.isNewUser) {
                console.log('¡Bienvenido nuevo usuario!', result.user);
            }
            window.location.href = 'https://media.tenor.com/5JtSeb0T71MAAAAM/dancing-banana.gif';
        })
        .catch((error) => {
            if (error.code === 'auth/account-exists-with-different-credential') {
                
                const pendingCredential = error.credential;
                const email = error.customData.email;
                
                fetchSignInMethodsForEmail(auth, email)
                    .then((methods) => {
                        const firstProvider = methods[0];
                        const nombreProveedorExistente = getNombreAmigable(firstProvider);
                        const nombreProveedorNuevo = getNombreAmigable(provider.providerId);

                        if (firstProvider === 'password') {
                            const password = prompt(`Ya tienes una cuenta con ${email} (registrada con contraseña).\n\nIngresa tu contraseña para vincular tu cuenta de ${nombreProveedorNuevo}:`);
                            
                            if (password) {
                                signInWithEmailAndPassword(auth, email, password)
                                    .then((userCredential) => {
                                        return linkWithCredential(userCredential.user, pendingCredential);
                                    })
                                    .then(() => {
                                        alert('¡Cuentas vinculadas con éxito! Iniciando sesión...');
                                        window.location.href = 'https://media.tenor.com/5JtSeb0T71MAAAAM/dancing-banana.gif';
                                    })
                                    .catch((linkError) => {
                                        alert('Error al vincular: Contraseña incorrecta o ' + linkError.message);
                                    });
                            }
                        } else {
                            alert(`Ya tienes una cuenta con ${email} registrada usando ${nombreProveedorExistente}.\n\nPor favor, inicia sesión con ${nombreProveedorExistente}.`);
                        }
                    });

            } else if (error.code === 'auth/popup-closed-by-user') {
                alert('El popup de autenticación fue cerrado antes de completar el inicio de sesión.');
            } else {
                alert('Error al iniciar sesión con el proveedor seleccionado.');
            }
        });
}