// Petits composants d'interface réutilisables : notifications, fenêtres de dialogue, dates.

function racine() {
    let r = document.getElementById('ui-root');
    if (!r) {
        r = document.createElement('div');
        r.id = 'ui-root';
        document.body.appendChild(r);
    }
    return r;
}

/* ---------- Notifications (toasts) ---------- */
function pile() {
    let p = document.querySelector('.toast-stack');
    if (!p) {
        p = document.createElement('div');
        p.className = 'toast-stack';
        p.setAttribute('role', 'status');
        p.setAttribute('aria-live', 'polite');
        racine().appendChild(p);
    }
    return p;
}

const ICONES = { success: '✓', error: '!', info: 'i' };

export function toast(message, type = 'success', duree = 3500) {
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    const ic = document.createElement('span');
    ic.className = 'toast-icon';
    ic.textContent = ICONES[type] || 'i';
    const tx = document.createElement('span');
    tx.className = 'toast-text';
    tx.textContent = message;
    t.append(ic, tx);
    pile().appendChild(t);
    requestAnimationFrame(() => t.classList.add('visible'));
    setTimeout(() => {
        t.classList.remove('visible');
        setTimeout(() => t.remove(), 300);
    }, duree);
}

// Message affiché sur la page suivante (après une redirection)
export function flash(message, type = 'success') {
    try { sessionStorage.setItem('chalosse-flash', JSON.stringify({ message, type })); } catch (e) { /* ignoré */ }
}

export function afficherFlash() {
    try {
        const f = sessionStorage.getItem('chalosse-flash');
        if (!f) return;
        sessionStorage.removeItem('chalosse-flash');
        const { message, type } = JSON.parse(f);
        toast(message, type);
    } catch (e) { /* ignoré */ }
}

/* ---------- Fenêtres de dialogue ---------- */
function ouvrirModal(construire) {
    return new Promise(resolve => {
        const fond = document.createElement('div');
        fond.className = 'modal-backdrop';
        const boite = document.createElement('div');
        boite.className = 'modal';
        boite.setAttribute('role', 'dialog');
        boite.setAttribute('aria-modal', 'true');
        fond.appendChild(boite);

        let fini = false;
        const surTouche = (e) => { if (e.key === 'Escape') fermer(null); };
        function fermer(valeur) {
            if (fini) return;
            fini = true;
            fond.classList.remove('visible');
            document.removeEventListener('keydown', surTouche);
            setTimeout(() => fond.remove(), 200);
            resolve(valeur);
        }
        fond.addEventListener('mousedown', (e) => { if (e.target === fond) fermer(null); });
        document.addEventListener('keydown', surTouche);

        construire(boite, fermer);
        racine().appendChild(fond);
        requestAnimationFrame(() => fond.classList.add('visible'));
        const cible = boite.querySelector('input, select, .btn-modal-ok');
        if (cible) setTimeout(() => cible.focus(), 60);
    });
}

function entete(boite, titre, texte) {
    const h = document.createElement('h3');
    h.className = 'modal-title';
    h.textContent = titre;
    boite.appendChild(h);
    if (texte) {
        const p = document.createElement('p');
        p.className = 'modal-text';
        p.textContent = texte;
        boite.appendChild(p);
    }
}

function boutons(okTexte, annulerTexte, danger) {
    const actions = document.createElement('div');
    actions.className = 'modal-actions';
    const annuler = document.createElement('button');
    annuler.type = 'button';
    annuler.className = 'btn-modal btn-modal-cancel';
    annuler.textContent = annulerTexte;
    const ok = document.createElement('button');
    ok.type = 'submit';
    ok.className = 'btn-modal btn-modal-ok' + (danger ? ' danger' : '');
    ok.textContent = okTexte;
    actions.append(annuler, ok);
    return { actions, annuler, ok };
}

// Remplace confirm() : renvoie une promesse true/false
export function confirmer(message, { titre = 'Confirmation', ok = 'Confirmer', annuler = 'Annuler', danger = false } = {}) {
    return ouvrirModal((boite, fermer) => {
        entete(boite, titre, message);
        const b = boutons(ok, annuler, danger);
        b.annuler.onclick = () => fermer(false);
        b.ok.onclick = () => fermer(true);
        boite.appendChild(b.actions);
    }).then(v => v === true);
}

// Remplace prompt() : formulaire avec plusieurs champs, renvoie { nom: valeur } ou null
export function formulaire({ titre, texte = '', champs = [], ok = 'Enregistrer', annuler = 'Annuler', colonnes = 1, aide = '' }) {
    return ouvrirModal((boite, fermer) => {
        entete(boite, titre, texte);
        const form = document.createElement('form');
        const zone = document.createElement('div');
        zone.className = 'modal-fields' + (colonnes === 2 ? ' cols-2' : '');
        champs.forEach(c => {
            const lab = document.createElement('label');
            lab.className = 'field';
            const span = document.createElement('span');
            span.textContent = c.label;
            const input = document.createElement('input');
            input.name = c.nom;
            input.type = c.type || 'text';
            input.value = c.valeur ?? '';
            if (c.placeholder) input.placeholder = c.placeholder;
            Object.entries(c.attrs || {}).forEach(([k, v]) => input.setAttribute(k, v));
            lab.append(span, input);
            zone.appendChild(lab);
        });
        form.appendChild(zone);
        if (aide) {
            const p = document.createElement('p');
            p.className = 'modal-help';
            p.textContent = aide;
            form.appendChild(p);
        }
        const b = boutons(ok, annuler, false);
        b.annuler.onclick = () => fermer(null);
        form.appendChild(b.actions);
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const res = {};
            champs.forEach(c => { res[c.nom] = form.elements[c.nom].value; });
            fermer(res);
        });
        boite.appendChild(form);
    });
}

/* ---------- Bouton en cours de chargement ---------- */
export function chargement(bouton, actif, texte = 'Enregistrement…') {
    if (!bouton) return;
    if (actif) {
        bouton.dataset.texteOriginal = bouton.innerHTML;
        bouton.disabled = true;
        bouton.innerHTML = `<span class="spinner"></span>${texte}`;
    } else {
        bouton.disabled = false;
        if (bouton.dataset.texteOriginal) bouton.innerHTML = bouton.dataset.texteOriginal;
    }
}

/* ---------- Dates & texte ---------- */
// Accepte "AAAA-MM-JJ", "JJ/MM/AAAA" ou "JJ/MM/AA"
export function versDate(str) {
    if (!str) return null;
    const s = String(str).trim();
    let m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
    if (m) return new Date(+m[1], +m[2] - 1, +m[3], 15);
    m = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/.exec(s);
    if (m) {
        let annee = +m[3];
        if (annee < 100) annee += 2000;
        return new Date(annee, +m[2] - 1, +m[1], 15);
    }
    const d = new Date(s);
    return isNaN(d) ? null : d;
}

export function formaterDate(str) {
    const d = versDate(str);
    if (!d) return str || 'Date inconnue';
    const texte = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    return texte.charAt(0).toUpperCase() + texte.slice(1);
}

export function versISO(str) {
    const d = versDate(str);
    if (!d) return '';
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function echapper(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function initiales(prenom, nom) {
    return `${(prenom || '').charAt(0)}${(nom || '').charAt(0)}`.toUpperCase() || '?';
}
