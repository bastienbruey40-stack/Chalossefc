// Résolution automatique des logos officiels FFF des clubs (District des Landes & Nouvelle-Aquitaine)
// CDN officiel FFF : https://cdn-transverse.azureedge.net/phlogos/BC{numero_affiliation_fff}.jpg

import { echapper } from './ui.js';

const CDN_FFF_LOGO = (code) => `https://cdn-transverse.azureedge.net/phlogos/BC${code}.jpg`;

// Base des numéros d'affiliation FFF (6 chiffres) des clubs affrontés en D2, D3 et Coupes
const CLUBS_FFF = [
    { code: 'LOCAL',  mots: ['CHALOSSE', 'LAUREDE'], url: 'chalosse.webp' },
    // Départemental 2 - Poule A
    { code: '560234', mots: ['DEUX LEYRES', '2 LEYRES'] },
    { code: '500097', mots: ['STADE MONTOIS'] },
    { code: '505875', mots: ['ARMAGNAC'] },
    { code: '532419', mots: ['BRETAGNE'] },
    { code: '530682', mots: ['LABENNE'] },
    { code: '526616', mots: ['ST PAUL DESPO', 'SAINT PAUL DESPO', 'DESPO'] },
    { code: '531446', mots: ['ST PIERRE DU MONT', 'SAINT PIERRE DU MONT'] },
    { code: '533882', mots: ['ST GEOURS', 'SAINT GEOURS'] },
    { code: '505752', mots: ['MARENSIN'] },
    { code: '505774', mots: ['HAGETMAU'] },
    { code: '582261', mots: ['LALUQUE', 'RION'] },
    // Départemental 3 - Poule C & Coupes
    { code: '535300', mots: ['CIBOURE'] },
    { code: '522899', mots: ['MAULEON', 'MAULEONAIS'] },
    { code: '505160', mots: ['ST PAUL SPORT', 'SAINT PAUL SPORT'] },
    { code: '531681', mots: ['DOAZIT'] },
    { code: '546487', mots: ['BORN'] },
    { code: '521896', mots: ['MAURRIN', 'MAURRINOISE'] },
    { code: '524139', mots: ['ST PERDON', 'SAINT PERDON', 'PERDON'] },
    { code: '582046', mots: ['AMOU', 'POUDENX'] },
    { code: '515831', mots: ['ES MONTOISE', 'ETOILE SPORTIVE MONTOISE'] },
    { code: '582280', mots: ['US MARSAN', 'MARSAN US'] },
    { code: '514725', mots: ['CAZERIENNE', 'CAZERES'] },
    { code: '527927', mots: ['ST SEVER', 'SAINT SEVER', 'ST SEVERIN'] },
    { code: '524135', mots: ['LATRILLE', 'ST AGNET', 'SAINT AGNET'] }
];

function normaliserNomClub(str) {
    return String(str || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .replace(/\(.*?\)/g, ' ')       // Retire "(Coupe de France)", "(Coupe des Landes)", etc.
        .replace(/[^A-Z0-9]+/g, ' ')
        .replace(/\b(FC|US|AS|SA|SC|ES|JSFC|OSC|CLUB|FOOTBALL|ENTENTE|SPORTIVE)\b/g, ' ')
        .replace(/\b[1234]\b/g, ' ')    // Retire le numéro d'équipe (1, 2, 3)
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Extrait un numéro d'affiliation FFF à 6 chiffres (commençant par 5) depuis une URL epreuves.fff.fr ou un texte.
 */
export function extraireCodeClubFFF(str) {
    if (!str) return null;
    const s = String(str).trim();
    if (/^5\d{5}$/.test(s)) return s;
    const mUrl = s.match(/\/club\/(5\d{5})\b/i) || s.match(/BC(5\d{5})\.jpg/i);
    return mUrl ? mUrl[1] : null;
}

/**
 * Retourne l'URL du logo officiel d'un club à partir de son nom, d'une URL explicite ou d'un code FFF.
 */
export function trouverLogoClub(nomClub, urlOuCodeExplicite = '') {
    if (urlOuCodeExplicite && typeof urlOuCodeExplicite === 'string') {
        const u = urlOuCodeExplicite.trim();
        if (u === 'chalosse.webp') return u;
        const codeDirect = extraireCodeClubFFF(u);
        if (codeDirect) {
            return codeDirect === '529258' ? 'chalosse.webp' : CDN_FFF_LOGO(codeDirect);
        }
        if (/^https?:\/\//i.test(u)) return u;
    }

    const codeDansNom = extraireCodeClubFFF(nomClub);
    if (codeDansNom) {
        return codeDansNom === '529258' ? 'chalosse.webp' : CDN_FFF_LOGO(codeDansNom);
    }

    const brut = String(nomClub || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    const norm = normaliserNomClub(nomClub);
    if (!brut && !norm) return '';

    for (const c of CLUBS_FFF) {
        for (const mot of c.mots) {
            if (brut.includes(mot) || norm.includes(mot)) {
                return c.url || CDN_FFF_LOGO(c.code);
            }
        }
    }

    return '';
}

/**
 * Génère le HTML d'un logo de club avec repli automatique élégant sur 🛡️ si l'image n'existe pas sur le CDN FFF.
 */
export function rendreLogoClubHTML(nomClub, { url = '', classe = 'logo', style = '' } = {}) {
    const src = trouverLogoClub(nomClub, url);
    const styleAttr = style ? ` style="${style}"` : '';
    if (!src) {
        return `<div class="${classe}"${styleAttr}>🛡️</div>`;
    }
    return `<img src="${echapper(src)}" class="${classe}"${styleAttr} alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.display='none';if(this.nextElementSibling)this.nextElementSibling.style.display='inline-flex';"><div class="${classe}" style="display:none;${style}">🛡️</div>`;
}
