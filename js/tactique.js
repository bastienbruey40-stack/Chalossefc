// Dispositifs tactiques, coordonnées sur le terrain et rendu visuel du terrain de football.
import { echapper } from "./ui.js";

// Coordonnées (x, y) en pourcentage sur un terrain vertical :
// y = 89% -> Gardien (en bas) | y = 16% -> Attaquants (en haut)
export const DISPOSITIFS = {
    "4-3-3": {
        nom: "4-3-3",
        description: "4 défenseurs · 3 milieux · 3 attaquants",
        postes: [
            { num: 1,  code: "GB",  label: "Gardien",           categorie: "Gardien",   x: 50, y: 89 },
            { num: 3,  code: "DG",  label: "Latéral gauche",    categorie: "Défenseur", x: 16, y: 71 },
            { num: 4,  code: "DCG", label: "Défenseur central", categorie: "Défenseur", x: 38, y: 73 },
            { num: 5,  code: "DCD", label: "Défenseur central", categorie: "Défenseur", x: 62, y: 73 },
            { num: 2,  code: "DD",  label: "Latéral droit",     categorie: "Défenseur", x: 84, y: 71 },
            { num: 8,  code: "MCG", label: "Milieu relayeur G", categorie: "Milieu",    x: 26, y: 47 },
            { num: 6,  code: "MDC", label: "Milieu défensif",   categorie: "Milieu",    x: 50, y: 53 },
            { num: 10, code: "MCD", label: "Milieu relayeur D", categorie: "Milieu",    x: 74, y: 47 },
            { num: 11, code: "AG",  label: "Ailier gauche",     categorie: "Attaquant", x: 20, y: 22 },
            { num: 9,  code: "BU",  label: "Buteur",            categorie: "Attaquant", x: 50, y: 16 },
            { num: 7,  code: "AD",  label: "Ailier droit",      categorie: "Attaquant", x: 80, y: 22 }
        ]
    },
    "4-4-2": {
        nom: "4-4-2",
        description: "4 défenseurs · 4 milieux à plat · 2 attaquants",
        postes: [
            { num: 1,  code: "GB",  label: "Gardien",           categorie: "Gardien",   x: 50, y: 89 },
            { num: 3,  code: "DG",  label: "Latéral gauche",    categorie: "Défenseur", x: 16, y: 71 },
            { num: 4,  code: "DCG", label: "Défenseur central", categorie: "Défenseur", x: 38, y: 73 },
            { num: 5,  code: "DCD", label: "Défenseur central", categorie: "Défenseur", x: 62, y: 73 },
            { num: 2,  code: "DD",  label: "Latéral droit",     categorie: "Défenseur", x: 84, y: 71 },
            { num: 11, code: "MG",  label: "Milieu gauche",     categorie: "Milieu",    x: 16, y: 46 },
            { num: 6,  code: "MCG", label: "Milieu central G",  categorie: "Milieu",    x: 39, y: 49 },
            { num: 8,  code: "MCD", label: "Milieu central D",  categorie: "Milieu",    x: 61, y: 49 },
            { num: 7,  code: "MD",  label: "Milieu droit",      categorie: "Milieu",    x: 84, y: 46 },
            { num: 9,  code: "BUG", label: "Attaquant G",       categorie: "Attaquant", x: 36, y: 19 },
            { num: 10, code: "BUD", label: "Attaquant D",       categorie: "Attaquant", x: 64, y: 19 }
        ]
    },
    "4-2-3-1": {
        nom: "4-2-3-1",
        description: "4 défenseurs · 2 récupérateurs · 3 offensifs · 1 buteur",
        postes: [
            { num: 1,  code: "GB",   label: "Gardien",            categorie: "Gardien",   x: 50, y: 89 },
            { num: 3,  code: "DG",   label: "Latéral gauche",     categorie: "Défenseur", x: 16, y: 72 },
            { num: 4,  code: "DCG",  label: "Défenseur central",  categorie: "Défenseur", x: 38, y: 74 },
            { num: 5,  code: "DCD",  label: "Défenseur central",  categorie: "Défenseur", x: 62, y: 74 },
            { num: 2,  code: "DD",   label: "Latéral droit",      categorie: "Défenseur", x: 84, y: 72 },
            { num: 6,  code: "MDCG", label: "Milieu défensif G",  categorie: "Milieu",    x: 37, y: 54 },
            { num: 8,  code: "MDCD", label: "Milieu défensif D",  categorie: "Milieu",    x: 63, y: 54 },
            { num: 11, code: "MOG",  label: "Milieu offensif G",  categorie: "Milieu",    x: 20, y: 34 },
            { num: 10, code: "MOC",  label: "Meneur de jeu (10)", categorie: "Milieu",    x: 50, y: 36 },
            { num: 7,  code: "MOD",  label: "Milieu offensif D",  categorie: "Milieu",    x: 80, y: 34 },
            { num: 9,  code: "BU",   label: "Buteur",             categorie: "Attaquant", x: 50, y: 16 }
        ]
    },
    "3-5-2": {
        nom: "3-5-2",
        description: "3 défenseurs centraux · 5 milieux · 2 attaquants",
        postes: [
            { num: 1,  code: "GB",  label: "Gardien",           categorie: "Gardien",   x: 50, y: 89 },
            { num: 4,  code: "DCG", label: "Stoppeur gauche",   categorie: "Défenseur", x: 25, y: 72 },
            { num: 5,  code: "DC",  label: "Libéro / Central",  categorie: "Défenseur", x: 50, y: 74 },
            { num: 2,  code: "DCD", label: "Stoppeur droit",    categorie: "Défenseur", x: 75, y: 72 },
            { num: 3,  code: "PG",  label: "Piston gauche",     categorie: "Milieu",    x: 14, y: 47 },
            { num: 8,  code: "MCG", label: "Milieu relayeur G", categorie: "Milieu",    x: 34, y: 49 },
            { num: 6,  code: "MDC", label: "Sentinelle",        categorie: "Milieu",    x: 50, y: 55 },
            { num: 10, code: "MCD", label: "Milieu relayeur D", categorie: "Milieu",    x: 66, y: 49 },
            { num: 7,  code: "PD",  label: "Piston droit",      categorie: "Milieu",    x: 86, y: 47 },
            { num: 9,  code: "BUG", label: "Attaquant G",       categorie: "Attaquant", x: 36, y: 19 },
            { num: 11, code: "BUD", label: "Attaquant D",       categorie: "Attaquant", x: 64, y: 19 }
        ]
    },
    "4-4-2 Losange": {
        nom: "4-4-2 Losange",
        description: "4 défenseurs · milieu en losange · 2 attaquants",
        postes: [
            { num: 1,  code: "GB",  label: "Gardien",            categorie: "Gardien",   x: 50, y: 89 },
            { num: 3,  code: "DG",  label: "Latéral gauche",     categorie: "Défenseur", x: 16, y: 72 },
            { num: 4,  code: "DCG", label: "Défenseur central",  categorie: "Défenseur", x: 38, y: 74 },
            { num: 5,  code: "DCD", label: "Défenseur central",  categorie: "Défenseur", x: 62, y: 74 },
            { num: 2,  code: "DD",  label: "Latéral droit",      categorie: "Défenseur", x: 84, y: 72 },
            { num: 6,  code: "MDC", label: "Sentinelle (6)",     categorie: "Milieu",    x: 50, y: 56 },
            { num: 8,  code: "MCG", label: "Relayeur gauche",    categorie: "Milieu",    x: 25, y: 45 },
            { num: 7,  code: "MCD", label: "Relayeur droit",     categorie: "Milieu",    x: 75, y: 45 },
            { num: 10, code: "MOC", label: "Meneur de jeu (10)", categorie: "Milieu",    x: 50, y: 34 },
            { num: 9,  code: "BUG", label: "Attaquant G",        categorie: "Attaquant", x: 35, y: 18 },
            { num: 11, code: "BUD", label: "Attaquant D",        categorie: "Attaquant", x: 65, y: 18 }
        ]
    },
    "5-3-2": {
        nom: "5-3-2",
        description: "5 défenseurs · 3 milieux · 2 attaquants",
        postes: [
            { num: 1,  code: "GB",  label: "Gardien",           categorie: "Gardien",   x: 50, y: 89 },
            { num: 3,  code: "DLG", label: "Piston gauche",     categorie: "Défenseur", x: 13, y: 66 },
            { num: 4,  code: "DCG", label: "Défenseur central", categorie: "Défenseur", x: 32, y: 73 },
            { num: 5,  code: "DC",  label: "Défenseur axial",   categorie: "Défenseur", x: 50, y: 75 },
            { num: 6,  code: "DCD", label: "Défenseur central", categorie: "Défenseur", x: 68, y: 73 },
            { num: 2,  code: "DLD", label: "Piston droit",      categorie: "Défenseur", x: 87, y: 66 },
            { num: 8,  code: "MCG", label: "Milieu relayeur G", categorie: "Milieu",    x: 28, y: 46 },
            { num: 10, code: "MDC", label: "Milieu central",    categorie: "Milieu",    x: 50, y: 50 },
            { num: 7,  code: "MCD", label: "Milieu relayeur D", categorie: "Milieu",    x: 72, y: 46 },
            { num: 9,  code: "BUG", label: "Attaquant G",       categorie: "Attaquant", x: 36, y: 19 },
            { num: 11, code: "BUD", label: "Attaquant D",       categorie: "Attaquant", x: 64, y: 19 }
        ]
    },
    "3-4-3": {
        nom: "3-4-3",
        description: "3 défenseurs · 4 milieux · 3 attaquants",
        postes: [
            { num: 1,  code: "GB",  label: "Gardien",           categorie: "Gardien",   x: 50, y: 89 },
            { num: 4,  code: "DCG", label: "Stoppeur gauche",   categorie: "Défenseur", x: 25, y: 72 },
            { num: 5,  code: "DC",  label: "Défenseur central", categorie: "Défenseur", x: 50, y: 74 },
            { num: 2,  code: "DCD", label: "Stoppeur droit",    categorie: "Défenseur", x: 75, y: 72 },
            { num: 3,  code: "MG",  label: "Milieu gauche",     categorie: "Milieu",    x: 15, y: 47 },
            { num: 6,  code: "MCG", label: "Milieu central G",  categorie: "Milieu",    x: 38, y: 50 },
            { num: 8,  code: "MCD", label: "Milieu central D",  categorie: "Milieu",    x: 62, y: 50 },
            { num: 7,  code: "MD",  label: "Milieu droit",      categorie: "Milieu",    x: 85, y: 47 },
            { num: 11, code: "AG",  label: "Ailier gauche",     categorie: "Attaquant", x: 20, y: 21 },
            { num: 9,  code: "BU",  label: "Buteur",            categorie: "Attaquant", x: 50, y: 16 },
            { num: 10, code: "AD",  label: "Ailier droit",      categorie: "Attaquant", x: 80, y: 21 }
        ]
    }
};

// Normalise les données de compo d'un match (compatible avec les anciens matchs n'ayant que `compo: [...]`)
export function extraireCompoTactique(matchData = {}) {
    const t = matchData.compo_tactique;
    if (t && typeof t === 'object') {
        const disp = DISPOSITIFS[t.dispositif] ? t.dispositif : "4-3-3";
        const titulaires = {};
        for (let i = 0; i < 11; i++) {
            if (t.titulaires && t.titulaires[i]) titulaires[i] = t.titulaires[i];
        }
        const idsTitulaires = new Set(Object.values(titulaires));
        const remplacants = Array.isArray(t.remplacants)
            ? t.remplacants.filter(id => id && !idsTitulaires.has(id))
            : [];
        return { dispositif: disp, titulaires, remplacants };
    }

    // Rétrocompatibilité : répartit les 11 premiers dans le 4-3-3 et le reste sur le banc
    const ancien = Array.isArray(matchData.compo) ? matchData.compo : [];
    const titulaires = {};
    ancien.slice(0, 11).forEach((id, idx) => { titulaires[idx] = id; });
    const remplacants = ancien.slice(11);
    return { dispositif: "4-3-3", titulaires, remplacants };
}

// Convertit la structure tactique en tableau plat `compo` (11 titulaires + remplaçants) pour les stats et notations
export function compilerListeCompo(titulaires, remplacants) {
    const ids = [];
    for (let i = 0; i < 11; i++) {
        if (titulaires[i] && !ids.includes(titulaires[i])) ids.push(titulaires[i]);
    }
    (remplacants || []).forEach(id => {
        if (id && !ids.includes(id)) ids.push(id);
    });
    return ids;
}

// Nom court affiché sous le maillot sur le terrain (ex: "B. DUPONT" ou "Bastien")
export function nomCourtTerrain(joueur) {
    if (!joueur) return "";
    const p = (joueur.prenom || "").trim();
    const n = (joueur.nom || "").trim();
    if (p && n) return `${p.charAt(0)}. ${n}`;
    return p || n || "Joueur";
}

// Génère un maillot de football SVG avec col, manches et numéro centré sur le torse
export function svgMaillotTerrain({ numero, estGB = false, vide = false, texteVide = '+' } = {}) {
    if (vide) {
        return `
            <svg class="pitch-jersey" viewBox="0 0 64 58" aria-hidden="true">
                <path d="M22 6 L10 12 L4 26 L14 31 L18 22 L18 52 L46 52 L46 22 L50 31 L60 26 L54 12 L42 6 Q32 13 22 6 Z"
                      fill="rgba(15, 23, 42, 0.5)" stroke="rgba(255, 255, 255, 0.78)" stroke-width="2.5" stroke-dasharray="4 3" stroke-linejoin="round"/>
                <text x="32" y="38" text-anchor="middle" fill="rgba(255,255,255,0.92)" font-size="18" font-weight="800" font-family="Inter, system-ui, sans-serif">${echapper(texteVide)}</text>
            </svg>`;
    }

    const corps = estGB ? '#38bdf8' : '#ffcc00';
    const bord = estGB ? '#0c4a6e' : '#111214';
    const col = estGB ? '#ffffff' : '#111214';
    const texte = estGB ? '#082f49' : '#111214';
    const bande = estGB ? 'rgba(255,255,255,0.22)' : 'rgba(17,18,20,0.08)';

    return `
        <svg class="pitch-jersey" viewBox="0 0 64 58" aria-hidden="true">
            <path d="M22 6 L10 12 L4 26 L14 31 L18 22 L18 52 L46 52 L46 22 L50 31 L60 26 L54 12 L42 6 Q32 13 22 6 Z"
                  fill="${corps}" stroke="${bord}" stroke-width="2.6" stroke-linejoin="round"/>
            <rect x="27" y="12" width="10" height="38" fill="${bande}" rx="2"/>
            <path d="M6 22 L15 26.5 M58 22 L49 26.5" stroke="${col}" stroke-width="2.4" stroke-linecap="round"/>
            <path d="M22 6 Q32 15 42 6" fill="none" stroke="${col}" stroke-width="3" stroke-linecap="round"/>
            <text x="32" y="39" text-anchor="middle" fill="${texte}" font-size="20" font-weight="900" font-family="Inter, system-ui, sans-serif">${echapper(numero)}</text>
        </svg>`;
}

// Tracé SVG des lignes blanches du terrain de football
export const SVG_LIGNES_TERRAIN = `
<svg class="pitch-lines" viewBox="0 0 680 960" preserveAspectRatio="none" aria-hidden="true">
    <!-- Cadre extérieur -->
    <rect x="24" y="24" width="632" height="912" rx="6" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="4"/>
    <!-- Ligne médiane & rond central -->
    <line x1="24" y1="480" x2="656" y2="480" stroke="rgba(255,255,255,0.45)" stroke-width="4"/>
    <circle cx="340" cy="480" r="86" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="4"/>
    <circle cx="340" cy="480" r="6" fill="rgba(255,255,255,0.65)"/>
    <!-- Surface de réparation haute (attaque) -->
    <rect x="148" y="24" width="384" height="146" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="4"/>
    <rect x="238" y="24" width="204" height="54" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="4"/>
    <circle cx="340" cy="118" r="5" fill="rgba(255,255,255,0.65)"/>
    <path d="M 272 170 A 78 78 0 0 0 408 170" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="4"/>
    <!-- Surface de réparation basse (gardien) -->
    <rect x="148" y="790" width="384" height="146" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="4"/>
    <rect x="238" y="882" width="204" height="54" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="4"/>
    <circle cx="340" cy="842" r="5" fill="rgba(255,255,255,0.65)"/>
    <path d="M 272 790 A 78 78 0 0 1 408 790" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="4"/>
    <!-- Quarts de cercle de corner -->
    <path d="M 24 44 A 20 20 0 0 0 44 24" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="3"/>
    <path d="M 636 24 A 20 20 0 0 0 656 44" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="3"/>
    <path d="M 44 936 A 20 20 0 0 0 24 916" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="3"/>
    <path d="M 656 916 A 20 20 0 0 0 636 936" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="3"/>
</svg>`;

// Génère le HTML du terrain en mode lecture (ou interactif si interactif = true)
export function rendreTerrainHTML({
    dispositif = "4-3-3",
    titulaires = {},
    joueursMap = {},
    statsMatch = {},
    notesMoyennes = {},
    interactif = false,
    slotSelectionne = null
} = {}) {
    const config = DISPOSITIFS[dispositif] || DISPOSITIFS["4-3-3"];
    const pions = config.postes.map((poste, index) => {
        const joueurId = titulaires[index];
        const joueur = joueurId ? joueursMap[joueurId] : null;
        const estGB = index === 0;
        const estActif = interactif && slotSelectionne === index;
        const numero = poste.num || (index + 1);

        if (!joueur) {
            return `
                <button type="button" class="pitch-node empty${estGB ? ' gk' : ''}${estActif ? ' active' : ''}"
                        style="left:${poste.x}%; top:${poste.y}%"
                        data-slot="${index}"
                        ${interactif ? '' : 'disabled'}>
                    <span class="pitch-jersey-wrap">
                        ${svgMaillotTerrain({ numero, estGB, vide: true, texteVide: interactif ? '+' : numero })}
                    </span>
                    <span class="pitch-label">
                        <span class="pitch-num">${numero}</span>
                        <span class="pitch-role">${echapper(poste.code)}</span>
                    </span>
                </button>`;
        }

        const nomAffiche = nomCourtTerrain(joueur);
        const st = statsMatch[joueurId] || {};
        const noteMoy = notesMoyennes[joueurId];

        let badgesEvents = '';
        if (st.buts > 0) badgesEvents += `<span class="pitch-ev" title="${st.buts} but(s)">⚽${st.buts > 1 ? st.buts : ''}</span>`;
        if (st.passes > 0) badgesEvents += `<span class="pitch-ev" title="${st.passes} passe(s)">🎯${st.passes > 1 ? st.passes : ''}</span>`;
        if (st.jaunes > 0) badgesEvents += `<span class="pitch-ev" title="Carton jaune">🟨</span>`;
        if (st.rouges > 0) badgesEvents += `<span class="pitch-ev" title="Carton rouge">🟥</span>`;

        const badgeNote = noteMoy !== undefined
            ? `<span class="pitch-rating" title="Note moyenne">⭐ ${noteMoy}</span>`
            : '';

        return `
            <button type="button" class="pitch-node filled${estGB ? ' gk' : ''}${estActif ? ' active' : ''}"
                    style="left:${poste.x}%; top:${poste.y}%"
                    data-slot="${index}" data-joueur-id="${echapper(joueurId)}"
                    ${interactif ? 'draggable="true"' : ''}>
                <span class="pitch-pos-tag">${echapper(poste.code)}</span>
                ${badgeNote}
                <span class="pitch-jersey-wrap">
                    ${svgMaillotTerrain({ numero, estGB })}
                </span>
                ${badgesEvents ? `<span class="pitch-events">${badgesEvents}</span>` : ''}
                <span class="pitch-label">
                    <span class="pitch-num">${numero}</span>
                    <span class="pitch-name">${echapper(nomAffiche)}</span>
                </span>
            </button>`;
    }).join('');

    return `
        <div class="pitch-board${interactif ? ' interactive' : ''}">
            <div class="pitch-header">
                <span class="pitch-formation-badge">⚽ Dispositif ${echapper(config.nom)}</span>
                <span class="pitch-count-badge">${Object.keys(titulaires).length} / 11 titulaires</span>
            </div>
            <div class="pitch-field">
                ${SVG_LIGNES_TERRAIN}
                ${pions}
            </div>
        </div>`;
}
