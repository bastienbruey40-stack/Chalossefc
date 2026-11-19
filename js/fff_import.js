// Calendrier & résultats officiels FFF (Saison 2026-2027)
// Club : CHALOSSE F. C. LAUREDE (Affiliation FFF n° 529258 - District des Landes)
// Équipe 1 : Séniors Départemental 2 (Poule A) & Coupes
// Équipe 2 : Séniors Départemental 3 (Poule C) & Coupe des Réserves

import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from "./firebase.js";

export const CLE_IMPORT_FFF = 'chalosse_fff_2026_2027_v4_empty';

// Liste normalisée (sans accents) des joueurs fictifs de l'étape précédente à retirer automatiquement
const JOUEURS_FICTIFS_A_NETTOYER = new Set([
    "bastien bruey",
    "lucas dufour",
    "maxime lalanne",
    "thomas darricau",
    "julien laborde",
    "romain tastet",
    "nicolas dubos",
    "hugo bats",
    "antoine lesgourgues",
    "mathieu darracq",
    "clement lafitte",
    "florian mora",
    "baptiste lasserre",
    "quentin cazenave",
    "theo dupouy",
    "alexandre brettes",
    "dylan larrieu",
    "dylan rrieu",
    "enzo carrere"
]);

export const MATCHS_FFF_CHALOSSE = [
    // =========================================================================
    // 🔵 ÉQUIPE PREMIÈRE (Séniors 1 - Départemental 2 Poule A & Coupes)
    // =========================================================================
    { equipe_type: "premiere", date: "2026-08-23", adversaire: "Ciboure FC (Coupe de France)", score_chalosse: 3, score_adversaire: 1 },
    { equipe_type: "premiere", date: "2026-08-26", adversaire: "Labenne OSC (Trophée des Champions)", score_chalosse: 1, score_adversaire: 3 },
    { equipe_type: "premiere", date: "2026-08-29", adversaire: "SA Mauléonais (Coupe de France)", score_chalosse: 1, score_adversaire: 2 },
    { equipe_type: "premiere", date: "2026-09-05", adversaire: "SC St-Pierre-du-Mont 2", score_chalosse: 2, score_adversaire: 2 },
    { equipe_type: "premiere", date: "2026-09-18", adversaire: "Stade Montois 2", score_chalosse: 0, score_adversaire: 2 },
    { equipe_type: "premiere", date: "2026-10-03", adversaire: "AS Bretagne-Marsan", score_chalosse: 3, score_adversaire: 0 },
    { equipe_type: "premiere", date: "2026-10-11", adversaire: "St-Paul Sports (Coupe des Landes)", score_chalosse: 2, score_adversaire: 2 },
    { equipe_type: "premiere", date: "2026-10-17", adversaire: "FC St-Geours 2", score_chalosse: 2, score_adversaire: 3 },
    { equipe_type: "premiere", date: "2026-10-24", adversaire: "St-Paul Despo", score_chalosse: null, score_adversaire: null },
    { equipe_type: "premiere", date: "2026-10-31", adversaire: "FC Marensin 2", score_chalosse: 5, score_adversaire: 1 },
    { equipe_type: "premiere", date: "2026-11-08", adversaire: "Hagetmau FC 2", score_chalosse: 4, score_adversaire: 1 },
    { equipe_type: "premiere", date: "2026-11-14", adversaire: "Hagetmau FC 1 (Coupe des Landes)", score_chalosse: null, score_adversaire: null },
    { equipe_type: "premiere", date: "2026-11-21", adversaire: "JSFC Laluque Rion", score_chalosse: null, score_adversaire: null },
    { equipe_type: "premiere", date: "2026-11-29", adversaire: "FC des Deux Leyres", score_chalosse: null, score_adversaire: null },
    { equipe_type: "premiere", date: "2026-12-05", adversaire: "US Armagnac", score_chalosse: null, score_adversaire: null },
    { equipe_type: "premiere", date: "2026-12-12", adversaire: "Labenne OSC 2", score_chalosse: null, score_adversaire: null },
    { equipe_type: "premiere", date: "2027-01-23", adversaire: "Stade Montois 2", score_chalosse: null, score_adversaire: null },
    { equipe_type: "premiere", date: "2027-01-31", adversaire: "AS Bretagne-Marsan", score_chalosse: null, score_adversaire: null },
    { equipe_type: "premiere", date: "2027-02-06", adversaire: "FC St-Geours 2", score_chalosse: null, score_adversaire: null },
    { equipe_type: "premiere", date: "2027-03-06", adversaire: "Hagetmau FC 2", score_chalosse: null, score_adversaire: null },
    { equipe_type: "premiere", date: "2027-03-14", adversaire: "FC Marensin 2", score_chalosse: null, score_adversaire: null },
    { equipe_type: "premiere", date: "2027-03-20", adversaire: "St-Paul Despo", score_chalosse: null, score_adversaire: null },
    { equipe_type: "premiere", date: "2027-04-03", adversaire: "JSFC Laluque Rion", score_chalosse: null, score_adversaire: null },
    { equipe_type: "premiere", date: "2027-04-10", adversaire: "FC des Deux Leyres", score_chalosse: null, score_adversaire: null },
    { equipe_type: "premiere", date: "2027-05-01", adversaire: "Labenne OSC 2", score_chalosse: null, score_adversaire: null },
    { equipe_type: "premiere", date: "2027-05-15", adversaire: "US Armagnac", score_chalosse: null, score_adversaire: null },
    { equipe_type: "premiere", date: "2027-05-30", adversaire: "SC St-Pierre-du-Mont 2", score_chalosse: null, score_adversaire: null },

    // =========================================================================
    // 🟢 ÉQUIPE RÉSERVE (Séniors 2 - Départemental 3 Poule C & Coupe des Réserves)
    // =========================================================================
    { equipe_type: "reserve", date: "2026-09-05", adversaire: "SC St-Pierre-du-Mont 3", score_chalosse: 2, score_adversaire: 4 },
    { equipe_type: "reserve", date: "2026-09-27", adversaire: "US Latrille St-Agnet", score_chalosse: 1, score_adversaire: 3 },
    { equipe_type: "reserve", date: "2026-10-03", adversaire: "AS Bretagne-Marsan 2", score_chalosse: 1, score_adversaire: 1 },
    { equipe_type: "reserve", date: "2026-10-10", adversaire: "FC Born 2 (Coupe des Réserves)", score_chalosse: 2, score_adversaire: 3 },
    { equipe_type: "reserve", date: "2026-10-17", adversaire: "AS Maurrinoise", score_chalosse: 2, score_adversaire: 4 },
    { equipe_type: "reserve", date: "2026-10-24", adversaire: "St-Perdon Sports 2", score_chalosse: null, score_adversaire: null },
    { equipe_type: "reserve", date: "2026-10-31", adversaire: "FC Amou Poudenx", score_chalosse: null, score_adversaire: null },
    { equipe_type: "reserve", date: "2026-11-08", adversaire: "ES Montoise 3", score_chalosse: 2, score_adversaire: 1 },
    { equipe_type: "reserve", date: "2026-11-21", adversaire: "US Marsan 2", score_chalosse: null, score_adversaire: null },
    { equipe_type: "reserve", date: "2026-11-29", adversaire: "AS Cazérienne 2", score_chalosse: null, score_adversaire: null },
    { equipe_type: "reserve", date: "2026-12-05", adversaire: "SA Saint-Sever 2", score_chalosse: null, score_adversaire: null },
    { equipe_type: "reserve", date: "2026-12-12", adversaire: "US Armagnac 2", score_chalosse: null, score_adversaire: null },
    { equipe_type: "reserve", date: "2027-01-24", adversaire: "US Latrille St-Agnet", score_chalosse: null, score_adversaire: null },
    { equipe_type: "reserve", date: "2027-01-31", adversaire: "AS Bretagne-Marsan 2", score_chalosse: null, score_adversaire: null },
    { equipe_type: "reserve", date: "2027-02-06", adversaire: "AS Maurrinoise", score_chalosse: null, score_adversaire: null },
    { equipe_type: "reserve", date: "2027-03-06", adversaire: "St-Perdon Sports 2", score_chalosse: null, score_adversaire: null },
    { equipe_type: "reserve", date: "2027-03-14", adversaire: "FC Amou Poudenx", score_chalosse: null, score_adversaire: null },
    { equipe_type: "reserve", date: "2027-03-20", adversaire: "ES Montoise 3", score_chalosse: null, score_adversaire: null },
    { equipe_type: "reserve", date: "2027-04-03", adversaire: "US Marsan 2", score_chalosse: null, score_adversaire: null },
    { equipe_type: "reserve", date: "2027-04-10", adversaire: "AS Cazérienne 2", score_chalosse: null, score_adversaire: null },
    { equipe_type: "reserve", date: "2027-05-01", adversaire: "SA Saint-Sever 2", score_chalosse: null, score_adversaire: null },
    { equipe_type: "reserve", date: "2027-05-15", adversaire: "US Armagnac 2", score_chalosse: null, score_adversaire: null },
    { equipe_type: "reserve", date: "2027-05-30", adversaire: "SC St-Pierre-du-Mont 3", score_chalosse: null, score_adversaire: null }
];

// Normalise un nom (sans accents, minuscules, espaces nettoyés) pour comparer avec les joueurs déjà créés
function normaliserNom(str) {
    return String(str || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Associe une liste de noms de joueurs aux joueurs existants dans Firestore,
 * ou crée automatiquement ceux qui n'existent pas encore !
 * @param {Array<{nom: string, poste?: string}>} listeNomsPostes
 * @returns {Promise<Array<string>>} Liste des IDs Firestore des joueurs dans le même ordre
 */
export async function resoudreOuCreerJoueursParNom(listeNomsPostes) {
    const snap = await getDocs(collection(db, "utilisateurs"));
    const joueursExistants = [];

    snap.forEach(d => {
        const data = d.data();
        if (data.prenom && (data.role === "joueur" || data.role === "admin")) {
            const prenomNorm = normaliserNom(data.prenom);
            const nomNorm = normaliserNom(data.nom);
            joueursExistants.push({
                id: d.id,
                prenom: data.prenom,
                nom: data.nom || '',
                poste: data.poste || 'Milieu',
                prenomNorm,
                nomNorm,
                complet1: `${prenomNorm} ${nomNorm}`.trim(),
                complet2: `${nomNorm} ${prenomNorm}`.trim()
            });
        }
    });

    const idsResultat = [];

    for (const item of listeNomsPostes) {
        const brut = String(item.nom || '').trim();
        if (!brut) continue;
        const posteDefaut = item.poste || 'Milieu';
        const norm = normaliserNom(brut);

        // 1. Recherche dans les joueurs déjà créés (Prénom Nom, Nom Prénom, ou Nom de famille unique)
        const trouve = joueursExistants.find(j =>
            j.complet1 === norm ||
            j.complet2 === norm ||
            (j.nomNorm && j.nomNorm === norm) ||
            (j.prenomNorm && !j.nomNorm && j.prenomNorm === norm)
        );

        if (trouve) {
            idsResultat.push(trouve.id);
            continue;
        }

        // 2. Si le joueur n'existe pas encore, on le crée dans Firestore
        const morceaux = brut.split(/\s+/);
        let prenom = morceaux[0];
        let nom = morceaux.slice(1).join(' ');
        prenom = prenom.charAt(0).toUpperCase() + prenom.slice(1).toLowerCase();
        if (!nom) nom = "";

        const docRef = await addDoc(collection(db, "utilisateurs"), {
            prenom,
            nom,
            poste: posteDefaut,
            role: "joueur"
        });

        const prenomNorm = normaliserNom(prenom);
        const nomNorm = normaliserNom(nom);
        joueursExistants.push({
            id: docRef.id,
            prenom,
            nom,
            poste: posteDefaut,
            prenomNorm,
            nomNorm,
            complet1: `${prenomNorm} ${nomNorm}`.trim(),
            complet2: `${nomNorm} ${prenomNorm}`.trim()
        });
        idsResultat.push(docRef.id);
    }

    return idsResultat;
}

let promesseEnCours = null;

// Importe les matchs FFF SANS joueurs fictifs et nettoie intégralement les compos auto-générées
export function importerMatchsFFF({ forcerVidageCompos = false } = {}) {
    if (promesseEnCours) return promesseEnCours;
    promesseEnCours = executerImportFFF({ forcerVidageCompos }).finally(() => {
        promesseEnCours = null;
    });
    return promesseEnCours;
}

async function executerImportFFF({ forcerVidageCompos = false } = {}) {
    // 1. Nettoyage complet des joueurs fictifs créés lors de l'étape précédente
    const usersSnap = await getDocs(collection(db, "utilisateurs"));
    const idsFictifs = new Set();
    const idsJoueursValides = new Set();
    const promessesNettoyage = [];

    usersSnap.forEach(d => {
        const data = d.data();
        const nomBrut = `${data.prenom || ''} ${data.nom || ''}`.trim();
        const nomNorm = normaliserNom(nomBrut);
        const contientCyrillique = /[\u0400-\u04FF]/.test(nomBrut);

        if (data.role === "joueur" && (JOUEURS_FICTIFS_A_NETTOYER.has(nomNorm) || contientCyrillique)) {
            idsFictifs.add(d.id);
            promessesNettoyage.push(deleteDoc(doc(db, "utilisateurs", d.id)));
        } else {
            idsJoueursValides.add(d.id);
        }
    });

    if (promessesNettoyage.length > 0) {
        await Promise.all(promessesNettoyage);
    }

    // 2. Indexation des matchs FFF attendus
    const fffParCle = new Map();
    for (const m of MATCHS_FFF_CHALOSSE) {
        fffParCle.set(`${m.equipe_type}_${m.date}`, m);
    }

    // 3. Inspection de TOUS les matchs existants dans Firestore
    const snap = await getDocs(collection(db, "matchs"));
    const clesPresentes = new Set();

    let ajoutes = 0;
    let misAJour = 0;
    let composVidees = 0;
    const promesses = [];

    snap.forEach(d => {
        const data = d.data();
        const cle = `${data.equipe_type || 'premiere'}_${data.date || ''}`;
        clesPresentes.add(cle);

        const compoActuelle = Array.isArray(data.compo) ? data.compo : [];
        const idsDansTactique = [
            ...Object.values(data.compo_tactique?.titulaires || {}),
            ...(Array.isArray(data.compo_tactique?.remplacants) ? data.compo_tactique.remplacants : [])
        ].filter(Boolean);

        const aUneCompo =
            compoActuelle.length > 0 ||
            Boolean(data.compo_tactique) ||
            (data.stats_joueurs && Object.keys(data.stats_joueurs).length > 0);

        const contientIdInvalide =
            compoActuelle.some(id => !idsJoueursValides.has(id)) ||
            idsDansTactique.some(id => !idsJoueursValides.has(id));

        const mFFF = fffParCle.get(cle);
        const maj = {};
        let aModifier = false;

        if (mFFF && mFFF.score_chalosse !== null && (data.score_chalosse === undefined || data.score_chalosse === null)) {
            maj.score_chalosse = mFFF.score_chalosse;
            maj.score_adversaire = mFFF.score_adversaire;
            aModifier = true;
        }

        if (aUneCompo && (forcerVidageCompos === true || Boolean(mFFF) || contientIdInvalide)) {
            maj.compo = [];
            maj.compo_tactique = null;
            maj.stats_joueurs = {};
            composVidees++;
            aModifier = true;
        }

        if (aModifier) {
            misAJour++;
            promesses.push(updateDoc(doc(db, "matchs", d.id), maj));
        }
    });

    // 4. Ajout des matchs FFF manquants (avec compositions vides)
    for (const m of MATCHS_FFF_CHALOSSE) {
        const cle = `${m.equipe_type}_${m.date}`;
        if (!clesPresentes.has(cle)) {
            ajoutes++;
            promesses.push(addDoc(collection(db, "matchs"), {
                equipe_type: m.equipe_type,
                adversaire: m.adversaire,
                date: m.date,
                logo: "",
                score_chalosse: m.score_chalosse,
                score_adversaire: m.score_adversaire,
                compo: []
            }));
        }
    }

    if (promesses.length > 0) {
        await Promise.all(promesses);
    }
    localStorage.setItem(CLE_IMPORT_FFF, '1');
    return { ajoutes, misAJour, composVidees, joueursSupprimes: idsFictifs.size };
}
