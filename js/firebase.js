import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const _0x4f2a = (() => {
    const _k = [0x5A, 0xA5, 0x3C, 0x7E, 0x91, 0xD2, 0x4B, 0xE8];
    const _p = [
        33,135,93,14,248,153,46,145,120,159,30,63,216,168,42,187,35,230,89,59,168,135,19,197,105,220,15,12,224,177,120,135,
        24,202,105,52,226,191,0,154,22,240,91,7,214,128,27,144,20,236,30,82,179,179,62,156,50,225,83,19,240,187,37,202,96,
        135,95,22,240,190,36,155,41,192,17,26,160,183,45,221,116,195,85,12,244,176,42,155,63,196,76,14,191,177,36,133,120,
        137,30,14,227,189,33,141,57,209,117,26,179,232,105,139,50,196,80,17,226,161,46,197,62,148,89,24,164,240,103,202,41,
        209,83,12,240,181,46,170,47,198,87,27,229,240,113,202,57,205,93,18,254,161,56,141,119,193,13,27,247,231,101,142,51,
        215,89,28,240,161,46,155,46,202,78,31,246,183,101,137,42,213,30,82,179,191,46,155,41,196,91,23,255,181,24,141,52,
        193,89,12,216,182,105,210,120,150,15,73,169,229,123,209,98,146,14,79,179,254,105,137,42,213,117,26,179,232,105,217,
        96,150,15,73,169,229,123,209,98,146,14,79,171,165,46,138,96,148,95,75,164,182,126,142,107,144,15,74,163,228,46,217,
        59,192,4,75,242,224,123,202,39
    ];
    return initializeApp(JSON.parse(new TextDecoder().decode(Uint8Array.from(_p, (b, i) => b ^ _k[i & 7]))));
})();

export const app = _0x4f2a;
export const db = getFirestore(_0x4f2a);
export const auth = getAuth(_0x4f2a);

const _c = new Map();
export function chargerProfil(uid) {
    if (!_c.has(uid)) {
        _c.set(uid, getDoc(doc(db, "utilisateurs", uid))
            .then(s => s.exists() ? s.data() : null)
            .catch(e => { _c.delete(uid); throw e; }));
    }
    return _c.get(uid);
}
