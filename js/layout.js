// Navigation responsive : barre latérale (ordinateur) + barre d'onglets en bas (mobile/tablette)
import { onAuthStateChanged, signOut, sendPasswordResetEmail, deleteUser } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { auth, chargerProfil } from "./firebase.js";
import { afficherFlash, flash, confirmer, ouvrirModal, toast, initiales, echapper } from "./ui.js";
import { importerMatchsFFF, CLE_IMPORT_FFF } from "./fff_import.js";

const SVG = {
    home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    chart: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
    userPlus: '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>',
    plus: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>',
    clipboard: '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
    menu: '<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>'
};
const icone = (n) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${SVG[n]}</svg>`;

const PRINCIPAL = [
    { href: 'index.html', label: 'Accueil', icon: 'home' },
    { href: 'calendrier.html', label: 'Calendrier', icon: 'calendar' },
    { href: 'effectif.html', label: 'Effectif', icon: 'users' },
    { href: 'stats.html', label: 'Stats', icon: 'chart' }
];
const ADMIN = [
    { href: 'ajouter.html', label: 'Ajouter un joueur', icon: 'userPlus' },
    { href: 'ajouter_match.html', label: 'Ajouter un match', icon: 'plus' },
    { href: 'gerer_compo.html', label: 'Compositions', icon: 'clipboard' },
    { href: 'saisir_stats.html', label: 'Saisir les stats', icon: 'edit' },
    { href: 'gerer_comptes.html', label: 'Comptes', icon: 'shield' }
];

const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
const PARENTS = { 'match_detail.html': 'calendrier.html', 'noter.html': 'calendrier.html', 'classement.html': 'stats.html' };
const actif = PARENTS[page] || page;
const estActif = (href) => href === actif;

function lienLateral(item) {
    return `<a href="${item.href}" class="nav-link${estActif(item.href) ? ' active' : ''}"${estActif(item.href) ? ' aria-current="page"' : ''}>${icone(item.icon)}<span>${item.label}</span></a>`;
}

const blocUtilisateur = `
    <div class="user-chip clickable" title="Voir les détails de mon compte">
        <span class="avatar">?</span>
        <span class="user-meta"><strong class="user-name">Chargement…</strong><span class="user-email"></span></span>
    </div>`;

// Barre latérale (≥ 1024px)
const sidebar = document.createElement('aside');
sidebar.className = 'sidebar';
sidebar.innerHTML = `
    <a href="index.html" class="brand"><img src="chalosse.webp" alt=""><span>FC Chalosse<small>Espace club</small></span></a>
    <nav class="nav-group" aria-label="Navigation principale">${PRINCIPAL.map(lienLateral).join('')}</nav>
    <div class="nav-admin hidden">
        <div class="nav-section">Administration</div>
        <nav class="nav-group" aria-label="Administration">${ADMIN.map(lienLateral).join('')}</nav>
    </div>
    <div class="sidebar-footer">
        ${blocUtilisateur}
        <button type="button" class="nav-link nav-logout">${icone('logout')}<span>Se déconnecter</span></button>
    </div>`;

// Barre d'onglets (< 1024px)
const bottom = document.createElement('nav');
bottom.className = 'bottom-nav';
bottom.setAttribute('aria-label', 'Navigation principale');
bottom.innerHTML = PRINCIPAL.map(i =>
    `<a href="${i.href}" class="${estActif(i.href) ? 'active' : ''}"${estActif(i.href) ? ' aria-current="page"' : ''}><span class="ic">${icone(i.icon)}</span><span>${i.label}</span></a>`
).join('') + `<button type="button" class="btn-menu${ADMIN.some(a => estActif(a.href)) ? ' active' : ''}" aria-label="Ouvrir le menu"><span class="ic">${icone('menu')}</span><span>Menu</span></button>`;

// Panneau "Menu" qui monte depuis le bas (mobile)
const sheet = document.createElement('div');
sheet.className = 'sheet-wrap';
sheet.innerHTML = `
    <div class="sheet-backdrop"></div>
    <div class="sheet" role="dialog" aria-modal="true" aria-label="Menu">
        <div class="grabber"></div>
        ${blocUtilisateur}
        <div class="sheet-admin hidden">
            <div class="sheet-section">Administration</div>
            <div class="sheet-grid">
                ${ADMIN.map(i => `<a href="${i.href}" class="sheet-item${estActif(i.href) ? ' active' : ''}">${icone(i.icon)}<span>${i.label}</span></a>`).join('')}
            </div>
        </div>
        <button type="button" class="sheet-logout nav-logout">${icone('logout')}<span>Se déconnecter</span></button>
    </div>`;

document.body.prepend(sidebar);
document.body.append(bottom, sheet);

const ouvrirMenu = () => document.body.classList.add('sheet-open');
const fermerMenu = () => document.body.classList.remove('sheet-open');
bottom.querySelector('.btn-menu').addEventListener('click', ouvrirMenu);
sheet.querySelector('.sheet-backdrop').addEventListener('click', fermerMenu);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') fermerMenu(); });

let utilisateurCourant = null;
let profilCourant = null;

// Modale "Mon compte" affichant clairement l'adresse e-mail liée au compte
function afficherMonCompte() {
    if (!utilisateurCourant) return;
    fermerMenu();
    const email = utilisateurCourant.email || 'Aucune adresse mail';
    const nom = profilCourant?.prenom
        ? `${profilCourant.prenom} ${profilCourant.nom || ''}`.trim()
        : email.split('@')[0];
    const role = profilCourant?.role === 'admin' ? 'Administrateur' : 'Utilisateur / Joueur';

    ouvrirModal((boite, fermer) => {
        boite.innerHTML = `
            <h3 class="modal-title">👤 Mon compte</h3>
            <p class="modal-text">Informations du compte actuellement connecté</p>
            <div class="account-info-list">
                <div class="account-info-item">
                    <div>
                        <small>Adresse e-mail liée</small>
                        <strong>✉️ ${echapper(email)}</strong>
                    </div>
                    <button type="button" class="btn-chip" id="btn-copier-mail">Copier</button>
                </div>
                <div class="account-info-item">
                    <div>
                        <small>Nom</small>
                        <strong>${echapper(nom)}</strong>
                    </div>
                    <span class="tag ${profilCourant?.role === 'admin' ? 'admin' : 'user'}">${echapper(role)}</span>
                </div>
            </div>
            <div class="modal-actions" style="flex-direction: column;">
                <button type="button" class="btn-modal btn-modal-cancel" id="btn-reset-mail">🔑 Changer de mot de passe par mail</button>
                <button type="button" class="btn-modal btn-modal-ok" id="btn-fermer-compte">Fermer</button>
            </div>
        `;
        boite.querySelector('#btn-fermer-compte').onclick = () => fermer();
        boite.querySelector('#btn-copier-mail').onclick = () => {
            navigator.clipboard?.writeText(email);
            toast('Adresse e-mail copiée !');
        };
        boite.querySelector('#btn-reset-mail').onclick = async () => {
            try {
                await sendPasswordResetEmail(auth, email);
                toast(`E-mail de changement de mot de passe envoyé à ${email}`);
                fermer();
            } catch (e) {
                toast("Erreur : " + e.message, 'error');
            }
        };
    });
}

document.querySelectorAll('.user-chip').forEach(chip => chip.addEventListener('click', afficherMonCompte));

document.querySelectorAll('.nav-logout').forEach(btn => btn.addEventListener('click', async () => {
    fermerMenu();
    const ok = await confirmer('Vous devrez vous reconnecter pour accéder à l\'application.', {
        titre: 'Se déconnecter ?', ok: 'Se déconnecter', danger: true
    });
    if (!ok) return;
    await signOut(auth);
    window.location.href = 'connexion.html';
}));

onAuthStateChanged(auth, async (user) => {
    utilisateurCourant = user;
    const noms = document.querySelectorAll('.user-name');
    const emails = document.querySelectorAll('.user-email');
    const avatars = document.querySelectorAll('.avatar');
    if (!user) {
        noms.forEach(e => e.textContent = 'Invité');
        return;
    }
    emails.forEach(e => e.textContent = user.email || '');
    let profil = null;
    let erreurProfil = false;
    try { profil = await chargerProfil(user.uid); } catch (e) { console.error(e); erreurProfil = true; }
    profilCourant = profil;
    if (!profil && !erreurProfil) {
        // Si le compte a été supprimé par un administrateur dans Firestore, on purge aussi Firebase Auth
        await deleteUser(user).catch(() => signOut(auth));
        flash("Ce compte a été supprimé par un administrateur.", 'info');
        window.location.href = 'connexion.html';
        return;
    }
    if (profil?.attente_confirmation_mail && !user.emailVerified) {
        window.location.href = 'inscription.html?attente=1';
        return;
    }
    const nom = profil?.prenom ? `${profil.prenom} ${profil.nom || ''}`.trim() : (user.email || 'Utilisateur').split('@')[0];
    noms.forEach(e => e.textContent = nom);
    avatars.forEach(e => e.textContent = profil?.prenom ? initiales(profil.prenom, profil.nom) : nom.charAt(0).toUpperCase());
    if (profil?.role === 'admin') {
        document.querySelectorAll('.nav-admin, .sheet-admin').forEach(e => e.classList.remove('hidden'));
        if (!localStorage.getItem(CLE_IMPORT_FFF)) {
            try {
                const res = await importerMatchsFFF({ forcerVidageCompos: true });
                localStorage.setItem(CLE_IMPORT_FFF, '1');
                if (res.ajoutes > 0 || res.misAJour > 0 || res.composVidees > 0 || res.joueursSupprimes > 0) {
                    flash(`Compositions nettoyées (${res.composVidees} match(s), ${res.joueursSupprimes} joueur(s) fictif(s) retiré(s)).`, 'info');
                    window.location.reload();
                    return;
                }
            } catch (e) { console.error(e); }
        }
    }
});

afficherFlash();

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
}
