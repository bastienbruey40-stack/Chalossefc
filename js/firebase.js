import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    initializeFirestore, getFirestore, persistentLocalCache, persistentMultipleTabManager,
    collection, doc, getDoc, getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
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

// Activation du cache persistant IndexedDB multi-onglets de Firestore (chargement quasi instantané)
let _db;
try {
    _db = initializeFirestore(_0x4f2a, {
        localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
    });
} catch {
    _db = getFirestore(_0x4f2a);
}
export const db = _db;
export const auth = getAuth(_0x4f2a);

export const SUPER_ADMIN_EMAIL = "bastienbruey1@gmail.com";

export function estSuperAdmin(email) {
    return Boolean(email && email.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase());
}

export function estProfilJoueur(data) {
    if (!data || !data.prenom) return false;
    if (data.est_joueur === false) return false;
    return data.role === "joueur" || data.role === "admin" || Boolean(data.poste);
}

// =========================================================
// CACHE RAPIDE (mémoire + sessionStorage) POUR ACCÉLÉRER LA NAVIGATION
// =========================================================
const CACHE_PREFIX = 'fcc_v1_';
const PROFIL_TTL_MS = 5 * 60 * 1000; // 5 minutes
const COL_TTL_MS = 45 * 1000;        // 45 secondes par défaut

function lireSession(cle, maxAgeMs) {
    try {
        const brut = sessionStorage.getItem(CACHE_PREFIX + cle);
        if (!brut) return null;
        const parsed = JSON.parse(brut);
        if (!parsed || typeof parsed.t !== 'number') return null;
        if (Date.now() - parsed.t > maxAgeMs) return null;
        return parsed.v;
    } catch {
        return null;
    }
}

function ecrireSession(cle, valeur) {
    try {
        sessionStorage.setItem(CACHE_PREFIX + cle, JSON.stringify({ t: Date.now(), v: valeur }));
    } catch {
        // Quota dépassé ou navigation privée : on ignore silencieusement
    }
}

const _c = new Map();
export function chargerProfil(uid) {
    if (!uid) return Promise.resolve(null);
    if (!_c.has(uid)) {
        const enCache = lireSession('profil_' + uid, PROFIL_TTL_MS);
        const majReseau = () => getDoc(doc(db, "utilisateurs", uid))
            .then(s => {
                if (!s.exists()) return null;
                const data = s.data();
                if (auth.currentUser?.email && estSuperAdmin(auth.currentUser.email)) {
                    data.role = "admin";
                    data.super_admin = true;
                }
                ecrireSession('profil_' + uid, data);
                return data;
            });

        if (enCache) {
            if (auth.currentUser?.email && estSuperAdmin(auth.currentUser.email)) {
                enCache.role = "admin";
                enCache.super_admin = true;
            }
            _c.set(uid, Promise.resolve(enCache));
            // Rafraîchissement discret en arrière-plan
            majReseau().then(fresh => { if (fresh) _c.set(uid, Promise.resolve(fresh)); }).catch(() => {});
        } else {
            _c.set(uid, majReseau().catch(e => { _c.delete(uid); throw e; }));
        }
    }
    return _c.get(uid);
}

const _colEnCours = new Map();

/**
 * Lit une collection Firestore avec cache sessionStorage ultra-rapide et déduplication réseau.
 * Retourne un tableau [{ id, data }].
 */
export async function lireCollection(nom, { force = false, maxAgeMs = COL_TTL_MS } = {}) {
    if (!force) {
        const enCache = lireSession('col_' + nom, maxAgeMs);
        if (Array.isArray(enCache)) return enCache;
    }

    const clePromesse = nom + (force ? ':force' : '');
    if (_colEnCours.has(clePromesse)) {
        return _colEnCours.get(clePromesse);
    }

    const p = getDocs(collection(db, nom))
        .then(snap => {
            const items = [];
            snap.forEach(d => items.push({ id: d.id, data: d.data() }));
            ecrireSession('col_' + nom, items);
            return items;
        })
        .finally(() => {
            _colEnCours.delete(clePromesse);
        });

    _colEnCours.set(clePromesse, p);
    return p;
}

/**
 * Lit un document unique en profitant d'abord du cache de la collection si disponible et frais.
 * Retourne { id, data } ou null s'il n'existe pas.
 */
export async function lireDoc(nomCollection, id, { force = false, maxAgeMs = COL_TTL_MS } = {}) {
    if (!id) return null;
    if (!force) {
        const colCache = lireSession('col_' + nomCollection, maxAgeMs);
        if (Array.isArray(colCache)) {
            const trouve = colCache.find(item => item.id === id);
            if (trouve) return trouve;
        }
    }
    const snap = await getDoc(doc(db, nomCollection, id));
    if (!snap.exists()) return null;
    return { id: snap.id, data: snap.data() };
}

/**
 * Invalide le cache sessionStorage pour une ou plusieurs collections (à appeler après une écriture/suppression).
 */
export function invaliderCache(...noms) {
    try {
        if (noms.length === 0) {
            for (let i = sessionStorage.length - 1; i >= 0; i--) {
                const k = sessionStorage.key(i);
                if (k && k.startsWith(CACHE_PREFIX)) sessionStorage.removeItem(k);
            }
            _c.clear();
            return;
        }
        noms.forEach(nom => {
            sessionStorage.removeItem(CACHE_PREFIX + 'col_' + nom);
            if (nom === 'utilisateurs') _c.clear();
        });
    } catch {
        // Ignore
    }
}
