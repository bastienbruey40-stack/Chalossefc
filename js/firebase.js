// Configuration Firebase centralisée : un seul endroit à modifier pour tout le site.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

export const firebaseConfig = {
    apiKey: "AIzaSyCeE9UX-3y3rqc3oBoUJsmKrLUgyGRPxNI",
    authDomain: "chalosse-d1ef5.firebaseapp.com",
    projectId: "chalosse-d1ef5",
    storageBucket: "chalosse-d1ef5.firebasestorage.app",
    messagingSenderId: "33787098721",
    appId: "1:33787098721:web:1c55d5f153426e1ae85c20"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Profil (document "utilisateurs/{uid}") mis en cache pour éviter les lectures en double
const cacheProfils = new Map();
export function chargerProfil(uid) {
    if (!cacheProfils.has(uid)) {
        cacheProfils.set(uid, getDoc(doc(db, "utilisateurs", uid))
            .then(snap => snap.exists() ? snap.data() : null)
            .catch(err => { cacheProfils.delete(uid); throw err; }));
    }
    return cacheProfils.get(uid);
}
