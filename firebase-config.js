import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

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
export const auth = getAuth(app);