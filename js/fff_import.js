// Calendrier & résultats officiels FFF (Saison 2026-2027)
// Club : CHALOSSE F. C. LAUREDE (Affiliation FFF n° 529258 - District des Landes)
// Équipe 1 : Séniors Départemental 2 (Poule A) & Coupes
// Équipe 2 : Séniors Départemental 3 (Poule C) & Coupe des Réserves

import { collection, getDocs, addDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db, estProfilJoueur } from "./firebase.js";
import { formaterNomPrenomFFF, construireIndexJoueurs, associerJoueurFFF } from "./fff_parser.js";

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

/**
 * Crée un nouveau joueur dans la collection Firestore `utilisateurs`
 * à partir d'un nom brut FFF (ex: "10 THIBAUT C.") et renvoie son ID.
 */
export async function creerJoueurEffectif({ nomBrut, poste = 'Milieu', numero = null }) {
    const { prenom, nom } = formaterNomPrenomFFF(nomBrut);
    if (!prenom) throw new Error("Nom de joueur invalide.");
    const docData = {
        prenom,
        nom,
        poste: poste || 'Milieu',
        role: "joueur"
    };
    const n = parseInt(numero, 10);
    if (!isNaN(n) && n >= 1 && n <= 14) docData.numero = n;

    const docRef = await addDoc(collection(db, "utilisateurs"), docData);
    return docRef.id;
}

/**
 * Associe une liste de noms de joueurs aux joueurs existants dans Firestore,
 * ou crée automatiquement ceux qui n'existent pas encore !
 * @param {Array<{nom: string, poste?: string}>} listeNomsPostes
 * @returns {Promise<Array<string>>} Liste des IDs Firestore des joueurs dans le même ordre
 */
export async function resoudreOuCreerJoueursParNom(listeNomsPostes) {
    const snap = await getDocs(collection(db, "utilisateurs"));
    const joueursBruts = [];

    snap.forEach(d => {
        const data = d.data();
        if (estProfilJoueur(data)) {
            joueursBruts.push({
                id: d.id,
                prenom: data.prenom,
                nom: data.nom || '',
                poste: data.poste || 'Milieu',
                numero: (data.numero >= 1 && data.numero <= 14) ? Number(data.numero) : null
            });
        }
    });

    let indexJoueurs = construireIndexJoueurs(joueursBruts);
    const idsResultat = [];

    for (const item of listeNomsPostes) {
        const brut = String(item.nom || '').trim();
        if (!brut) continue;
        const posteDefaut = item.poste || 'Milieu';

        const res = associerJoueurFFF(brut, indexJoueurs);
        if (res.statut === 'anonyme') continue;
        if (res.candidatId) {
            idsResultat.push(res.candidatId);
            continue;
        }

        const { prenom, nom } = formaterNomPrenomFFF(brut);
        const nouvelId = await creerJoueurEffectif({ nomBrut: brut, poste: posteDefaut });

        joueursBruts.push({ id: nouvelId, prenom, nom, poste: posteDefaut, numero: null });
        indexJoueurs = construireIndexJoueurs(joueursBruts);
        idsResultat.push(nouvelId);
    }

    return idsResultat;
}

let promesseEnCours = null;

// Importe les matchs FFF manquants et met à jour les scores manquants sans jamais toucher aux compositions ou stats existantes
export function importerMatchsFFF() {
    if (promesseEnCours) return promesseEnCours;
    promesseEnCours = executerImportFFF().finally(() => {
        promesseEnCours = null;
    });
    return promesseEnCours;
}

async function executerImportFFF() {
    const fffParCle = new Map();
    for (const m of MATCHS_FFF_CHALOSSE) {
        fffParCle.set(`${m.equipe_type}_${m.date}`, m);
    }

    const snap = await getDocs(collection(db, "matchs"));
    const clesPresentes = new Set();

    let ajoutes = 0;
    let misAJour = 0;
    const promesses = [];

    snap.forEach(d => {
        const data = d.data();
        const cle = `${data.equipe_type || 'premiere'}_${data.date || ''}`;
        clesPresentes.add(cle);

        const mFFF = fffParCle.get(cle);
        if (mFFF && mFFF.score_chalosse !== null && (data.score_chalosse === undefined || data.score_chalosse === null)) {
            misAJour++;
            promesses.push(updateDoc(doc(db, "matchs", d.id), {
                score_chalosse: mFFF.score_chalosse,
                score_adversaire: mFFF.score_adversaire
            }));
        }
    });

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
    return { ajoutes, misAJour };
}
