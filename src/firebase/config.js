import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Extracted from safegaurd/lib/firebase_options.dart for real app connection
const firebaseConfig = {
    apiKey: "AIzaSyBep_kKYOk4Hikdqqr-0p_J0kegBTUi0gA",
    appId: "1:308474236520:web:20c72fe7e86c8b189675dd",
    messagingSenderId: "308474236520",
    projectId: "safegaurd-app",
    authDomain: "safegaurd-app.firebaseapp.com",
    storageBucket: "safegaurd-app.firebasestorage.app",
    measurementId: "G-NB8LZY3JMF"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
