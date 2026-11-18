// Affichage et actions communes des cartes de match (Accueil + Calendrier + Détail du match)
import { doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from "./firebase.js";
import { toast, confirmer, ouvrirModal, chargement, formaterDate, versDate, versISO, echapper } from "./ui.js";

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
    const btnEdit = afficherActionsAdmin
        ? `<button type="button" class="btn-score-match" data-id="${id}" title="Modifier le match (infos, date, équipe, score)" aria-label="Modifier le match">✏️</button>`
        : '';
    const btnSuppr = afficherActionsAdmin && gestion
        ? `<button type="button" class="btn-supprimer-match" data-id="${id}" title="Supprimer le match" aria-label="Supprimer le match">🗑️</button>`
        : '';
    const pillSelect = modeSelection
        ? `<span class="match-select-pill">${selectionne ? '✓ Sélectionné' : '☐ Sélectionner'}</span>`
        : '';

    return `
        <div class="match-container${modeSelection ? ' selectable' : ''}${selectionne ? ' selected' : ''}" data-match-id="${id}">
            ${pillSelect}
            ${btnEdit}
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
                </div>
            </a>
            ${btnSuppr}
        </div>`;
}

// Modale complète permettant de modifier toutes les informations d'un match (équipe, adversaire, date, score, logo)
export function editerMatchComplet(id, d) {
    return ouvrirModal((boite, fermer) => {
        let equipeChoisie = d.equipe_type === 'reserve' ? 'reserve' : 'premiere';
        const scoreC = estJoue(d) ? d.score_chalosse : '';
        const scoreA = estJoue(d) ? d.score_adversaire : '';
        const dateIso = versISO(d.date);

        boite.innerHTML = `
            <h3 class="modal-title">✏️ Modifier le match</h3>
            <p class="modal-text">Modifiez l'équipe, l'adversaire, la date ou le score.</p>
            <form id="form-edit-match">
                <label style="margin-top: 10px;">Équipe concernée</label>
                <div class="choice-grid" id="modal-choix-equipe">
                    <button type="button" class="choice-card premiere ${equipeChoisie === 'premiere' ? 'active' : ''}" data-eq="premiere" style="padding: 10px 8px;">
                        <span>🔵 Première</span>
                    </button>
                    <button type="button" class="choice-card reserve ${equipeChoisie === 'reserve' ? 'active' : ''}" data-eq="reserve" style="padding: 10px 8px;">
                        <span>🟢 Réserve</span>
                    </button>
                </div>

                <div class="form-row">
                    <div>
                        <label for="edit-adv">Nom de l'adversaire</label>
                        <input type="text" id="edit-adv" value="${echapper(d.adversaire || '')}" placeholder="Ex : FC Doazit" required>
                    </div>
                    <div>
                        <label for="edit-date">Date du match</label>
                        <input type="date" id="edit-date" value="${echapper(dateIso)}" required>
                    </div>
                </div>

                <label>Score <span class="muted" style="font-weight:400">(laisser vide si non joué)</span></label>
                <div class="modal-fields cols-2">
                    <label class="field" style="margin:0">
                        <span>FC Chalosse</span>
                        <input type="number" id="edit-score-c" min="0" inputmode="numeric" value="${echapper(scoreC)}" placeholder="–">
                    </label>
                    <label class="field" style="margin:0">
                        <span id="lbl-adv-score">${echapper(d.adversaire || 'Adversaire')}</span>
                        <input type="number" id="edit-score-a" min="0" inputmode="numeric" value="${echapper(scoreA)}" placeholder="–">
                    </label>
                </div>

                <label for="edit-logo">Logo adverse <span class="muted" style="font-weight:400">(URL optionnelle)</span></label>
                <input type="url" id="edit-logo" value="${echapper(d.logo || '')}" placeholder="https://…">

                <div class="modal-actions">
                    <button type="button" class="btn-modal btn-modal-cancel" id="btn-edit-annuler">Annuler</button>
                    <button type="submit" class="btn-modal btn-modal-ok" id="btn-edit-valider">Enregistrer</button>
                </div>
            </form>
        `;

        boite.querySelectorAll('#modal-choix-equipe [data-eq]').forEach(btn => {
            btn.addEventListener('click', () => {
                boite.querySelectorAll('#modal-choix-equipe [data-eq]').forEach(b => b.classList.toggle('active', b === btn));
                equipeChoisie = btn.dataset.eq;
            });
        });

        const inAdv = boite.querySelector('#edit-adv');
        const lblAdv = boite.querySelector('#lbl-adv-score');
        inAdv.addEventListener('input', () => {
            lblAdv.textContent = inAdv.value.trim() || 'Adversaire';
        });

        boite.querySelector('#btn-edit-annuler').onclick = () => fermer(false);

        boite.querySelector('#form-edit-match').addEventListener('submit', async (e) => {
            e.preventDefault();
            const adversaire = inAdv.value.trim();
            const date = boite.querySelector('#edit-date').value;
            const logo = boite.querySelector('#edit-logo').value.trim();
            const valC = boite.querySelector('#edit-score-c').value.trim();
            const valA = boite.querySelector('#edit-score-a').value.trim();

            if (!adversaire || !date) {
                toast("Renseignez au moins l'adversaire et la date.", 'error');
                return;
            }

            const maj = {
                equipe_type: equipeChoisie,
                adversaire: adversaire,
                date: date,
                logo: logo
            };

            if (valC === '' && valA === '') {
                maj.score_chalosse = null;
                maj.score_adversaire = null;
            } else {
                maj.score_chalosse = parseInt(valC) || 0;
                maj.score_adversaire = parseInt(valA) || 0;
            }

            const btnOk = boite.querySelector('#btn-edit-valider');
            chargement(btnOk, true);
            try {
                await updateDoc(doc(db, "matchs", id), maj);
                toast('Match mis à jour !');
                fermer(true);
            } catch (err) {
                console.error(err);
                toast('Erreur : ' + err.message, 'error');
                chargement(btnOk, false);
            }
        });
    }).then(v => v === true);
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
            if (btn.classList.contains('btn-score-match') || btn.classList.contains('btn-date')) {
                modifie = await editerMatchComplet(id, d);
            } else {
                modifie = await supprimerMatch(id, d);
            }
            if (modifie) recharger();
        } catch (err) {
            console.error(err);
            toast('Erreur : ' + err.message, 'error');
        }
    });
}
