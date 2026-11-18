// Affichage et actions communes des cartes de match (Accueil + Calendrier)
import { doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from "./firebase.js";
import { toast, confirmer, formulaire, formaterDate, versDate, versISO, echapper } from "./ui.js";

const cache = new Map();

export function estJoue(d) {
    return d.score_chalosse !== undefined && d.score_chalosse !== null;
}

export function trierParDate(liste) {
    return liste.sort((a, b) => (versDate(a.data.date)?.getTime() ?? Infinity) - (versDate(b.data.date)?.getTime() ?? Infinity));
}

export function carteMatch(id, d, { admin = false, gestion = false, modeSelection = false, selectionne = false } = {}) {
    cache.set(id, d);
    const adv = echapper(d.adversaire || 'Adversaire');
    const logoAdv = d.logo
        ? `<img src="${echapper(d.logo)}" class="logo" alt="" loading="lazy">`
        : `<div class="logo">🛡️</div>`;

    let centre = `<div class="vs-box">VS</div>`;
    let badge = '';
    if (estJoue(d)) {
        const c = Number(d.score_chalosse), a = Number(d.score_adversaire);
        centre = `<div class="score-box">${c}<span>-</span>${a}</div>`;
        const r = c > a ? ['Victoire', 'win'] : c < a ? ['Défaite', 'loss'] : ['Nul', 'draw'];
        badge = `<span class="result-badge ${r[1]}">${r[0]}</span>`;
    } else {
        const date = versDate(d.date);
        if (date && date.getTime() >= Date.now() - 86400000) badge = `<span class="result-badge upcoming">À venir</span>`;
    }

    const afficherActionsAdmin = admin && !modeSelection;
    const btnScore = afficherActionsAdmin ? `<button type="button" class="btn-score-match" data-id="${id}" title="Modifier le score" aria-label="Modifier le score">✏️</button>` : '';
    const btnSuppr = afficherActionsAdmin && gestion ? `<button type="button" class="btn-supprimer-match" data-id="${id}" title="Supprimer le match" aria-label="Supprimer le match">🗑️</button>` : '';
    const btnDate = afficherActionsAdmin && gestion ? `<button type="button" class="btn-date" data-id="${id}" title="Modifier la date" aria-label="Modifier la date">🗓️</button>` : '';
    const pillSelect = modeSelection
        ? `<span class="match-select-pill">${selectionne ? '✓ Sélectionné' : '☐ Sélectionner'}</span>`
        : '';

    return `
        <div class="match-container${modeSelection ? ' selectable' : ''}${selectionne ? ' selected' : ''}" data-match-id="${id}">
            ${pillSelect}
            ${btnScore}
            <a href="match_detail.html?match=${id}" class="match-row" style="${modeSelection ? 'padding-top:46px' : ''}">
                <div class="match-content">
                    <div class="team">
                        <img src="chalosse.webp" class="logo" alt="FC Chalosse">
                        <span class="team-name">FC Chalosse</span>
                    </div>
                    ${centre}
                    <div class="team right">
                        <span class="team-name">${adv}</span>
                        ${logoAdv}
                    </div>
                </div>
                <div class="match-date">
                    ${badge}
                    <span>📅 ${echapper(formaterDate(d.date))}</span>
                    ${btnDate}
                </div>
            </a>
            ${btnSuppr}
        </div>`;
}

async function editerScore(id, d) {
    const res = await formulaire({
        titre: 'Modifier le score',
        texte: `FC Chalosse – ${d.adversaire || 'Adversaire'}`,
        colonnes: 2,
        aide: 'Laissez les champs vides pour effacer le score.',
        champs: [
            { nom: 'c', label: 'FC Chalosse', type: 'number', valeur: estJoue(d) ? d.score_chalosse : '', attrs: { min: 0, inputmode: 'numeric' } },
            { nom: 'a', label: d.adversaire || 'Adversaire', type: 'number', valeur: estJoue(d) ? d.score_adversaire : '', attrs: { min: 0, inputmode: 'numeric' } }
        ]
    });
    if (!res) return false;
    if (res.c.trim() === '' && res.a.trim() === '') {
        await updateDoc(doc(db, "matchs", id), { score_chalosse: null, score_adversaire: null });
        toast('Score effacé');
    } else {
        await updateDoc(doc(db, "matchs", id), {
            score_chalosse: parseInt(res.c) || 0,
            score_adversaire: parseInt(res.a) || 0
        });
        toast('Score enregistré');
    }
    return true;
}

async function editerDate(id, d) {
    const res = await formulaire({
        titre: 'Modifier la date',
        texte: `FC Chalosse – ${d.adversaire || 'Adversaire'}`,
        champs: [{ nom: 'date', label: 'Date du match', type: 'date', valeur: versISO(d.date) }]
    });
    if (!res || !res.date) return false;
    await updateDoc(doc(db, "matchs", id), { date: res.date });
    toast('Date mise à jour');
    return true;
}

async function supprimerMatch(id, d) {
    const ok = await confirmer(`Le match contre ${d.adversaire || 'cet adversaire'} sera supprimé définitivement.`, {
        titre: 'Supprimer le match ?', ok: 'Supprimer', danger: true
    });
    if (!ok) return false;
    await deleteDoc(doc(db, "matchs", id));
    toast('Match supprimé');
    return true;
}

// Un seul écouteur pour tous les boutons d'administration des cartes
export function activerActionsMatchs(recharger) {
    document.addEventListener('click', async (e) => {
        const btn = e.target.closest('.btn-score-match, .btn-date, .btn-supprimer-match');
        if (!btn) return;
        e.preventDefault();
        e.stopPropagation();
        const id = btn.dataset.id;
        const d = cache.get(id) || {};
        try {
            let modifie;
            if (btn.classList.contains('btn-score-match')) modifie = await editerScore(id, d);
            else if (btn.classList.contains('btn-date')) modifie = await editerDate(id, d);
            else modifie = await supprimerMatch(id, d);
            if (modifie) recharger();
        } catch (err) {
            console.error(err);
            toast('Erreur : ' + err.message, 'error');
        }
    });
}
