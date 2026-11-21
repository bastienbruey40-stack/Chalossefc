// Synchronisation sécurisée des matchs FFF & résolution de joueurs dans Firestore
// Club : CHALOSSE F. C. LAUREDE (Affiliation FFF n° 529258 - District des Landes)

import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db, estProfilJoueur, invaliderCache } from "./firebase.js";
import { formaterNomPrenomFFF, construireIndexJoueurs, associerJoueurFFF } from "./fff_parser.js";
import { MATCHS_FFF_CHALOSSE, planifierSynchronisationFFF } from "./fff_calendrier_sync.js";

export { MATCHS_FFF_CHALOSSE };

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
    invaliderCache("utilisateurs");
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

/**
 * Synchronise les matchs officiels FFF sans JAMAIS modifier ni supprimer les matchs
 * qui possèdent déjà un score, une composition, des stats joueurs, des notes ou une édition manuelle.
 */
export function importerMatchsFFF() {
    if (promesseEnCours) return promesseEnCours;
    promesseEnCours = executerImportFFF().finally(() => {
        promesseEnCours = null;
    });
    return promesseEnCours;
}

async function executerImportFFF() {
    const [matchsSnap, notesSnap] = await Promise.all([
        getDocs(collection(db, "matchs")),
        getDocs(collection(db, "notes")).catch(() => null)
    ]);

    const matchsExistants = [];
    matchsSnap.forEach(d => {
        matchsExistants.push({ id: d.id, data: d.data() });
    });

    // Identifie tous les matchs ayant déjà au moins une note pour ne jamais les altérer
    const notesMatchIds = new Set();
    if (notesSnap) {
        notesSnap.forEach(d => {
            const data = d.data() || {};
            const idPart = d.id.split('_')[0];
            if (idPart) notesMatchIds.add(idPart);
            if (data.matchId) notesMatchIds.add(data.matchId);
            if (data.match_id) notesMatchIds.add(data.match_id);
        });
    }

    const plan = planifierSynchronisationFFF(matchsExistants, notesMatchIds);

    const promesses = [];
    for (const m of plan.aAjouter) {
        promesses.push(addDoc(collection(db, "matchs"), m));
    }
    for (const u of plan.aMettreAJour) {
        promesses.push(updateDoc(doc(db, "matchs", u.id), u.patch));
    }
    for (const idSuppr of plan.aSupprimer) {
        promesses.push(deleteDoc(doc(db, "matchs", idSuppr)));
    }

    if (promesses.length > 0) {
        await Promise.all(promesses);
        invaliderCache("matchs");
    }

    const misAJour = plan.aMettreAJour.filter(u => u.type === 'match').length;
    const logosAjoutes = plan.aMettreAJour.filter(u => u.type === 'logo').length;

    return {
        ajoutes: plan.aAjouter.length,
        misAJour,
        logosAjoutes,
        doublonsSupprimes: plan.aSupprimer.length,
        proteges: plan.proteges
    };
}
