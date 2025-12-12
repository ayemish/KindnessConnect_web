import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; 


const firebaseConfig = {
    apiKey: "AIzaSyCtOnzUqBD8FQM0-wWKDElybyZF1DnesHw",
    authDomain: "kindnessconnect-60cd7.firebaseapp.com",
    projectId: "kindnessconnect-60cd7",
    storageBucket: "kindnessconnect-60cd7.firebasestorage.app",
    messagingSenderId: "1019528677560",
    appId: "1:1019528677560:web:ffd541aa9aaf6b8a5b4c4d",
    measurementId: "G-V5ED4YGC9G"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);


const db = getFirestore(app); 

export { auth, db }; 