// Lecture haute précision d'une capture d'écran de classement FFF (epreuves.fff.fr)
// Stratégie : Agrandissement 3x sur Canvas + contraste texte noir/blanc + découpe par colonnes
// + double passe Tesseract.js (noms d'équipes sans logos + chiffres seuls avec whitelist stricte 0-9+-)
// + vérification mathématique football (G+N+P = J, Pts = 3G+N, Diff = Bp-Bc).

import { mapNombresClassement, corrigerLigneMathematiquement, estEquipeChalosse } from './fff_classement.js';

let tesseractPromesse = null;

function chargerTesseract() {
    if (window.Tesseract) return Promise.resolve(window.Tesseract);
    if (!tesseractPromesse) {
        tesseractPromesse = new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
            s.onload = () => resolve(window.Tesseract);
            s.onerror = () => reject(new Error("Impossible de charger le moteur OCR (vérifiez votre connexion)."));
            document.head.appendChild(s);
        });
    }
    return tesseractPromesse;
}

function chargerImage(fichier) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(fichier);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Fichier image illisible."));
        };
        img.src = url;
    });
}

/**
 * Agrandit la capture (min ~2800px de large), supprime les traits gris clairs du tableau
 * et renforce le contraste du texte bleu/gris FFF en noir pur sur fond blanc pur.
 */
function preparerCanvasHauteResolution(img) {
    const scale = Math.min(3.5, Math.max(2, 2800 / Math.max(img.width, 1)));
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);

    const imgData = ctx.getImageData(0, 0, w, h);
    const d = imgData.data;

    for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i + 1], b = d[i + 2];
        // Luminance pondérée (le bleu FFF #00338d a une luminance faible ~45, les traits gris ~225)
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        let v;
        if (lum > 198) {
            v = 255; // Efface les fonds gris très clairs et les filets de tableau
        } else if (lum < 120) {
            v = 0;   // Texte bleu foncé et chiffres gris foncé -> noir pur
        } else {
            // Transition douce mais contrastée pour préserver l'anticrénelage des chiffres fins
            v = Math.round(((lum - 120) / (198 - 120)) * 255);
        }
        d[i] = v;
        d[i + 1] = v;
        d[i + 2] = v;
        d[i + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);
    return canvas;
}

function decouperCanvas(source, x, y, w, h) {
    const cx = Math.max(0, Math.round(x));
    const cy = Math.max(0, Math.round(y));
    const cw = Math.max(10, Math.min(source.width - cx, Math.round(w)));
    const ch = Math.max(10, Math.min(source.height - cy, Math.round(h)));

    const out = document.createElement('canvas');
    out.width = cw;
    out.height = ch;
    const ctx = out.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(source, cx, cy, cw, ch, 0, 0, cw, ch);
    return out;
}

function normMot(s) {
    return String(s || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '');
}

/**
 * Repère automatiquement les limites horizontales des colonnes "Equipe" et "Pts..Diff"
 * grâce aux coordonnées des mots d'en-tête trouvés lors de la passe 1.
 */
function detecterZonesColonnes(words, width, height) {
    const headers = { equipe: null, pts: null, diff: null, serie: null };

    for (const w of words || []) {
        const t = normMot(w.text);
        if (!t || !w.bbox) continue;
        // L'en-tête se trouve dans le premier tiers haut de la capture
        if (w.bbox.y0 > height * 0.35) continue;

        if (!headers.equipe && (t === 'EQUIPE' || t === 'EQUIPES')) headers.equipe = w.bbox;
        if (!headers.pts && (t === 'PTS' || t === 'PS' || t === 'PIS')) headers.pts = w.bbox;
        if (!headers.diff && (t === 'DIFF' || t === 'DIF')) headers.diff = w.bbox;
        if (!headers.serie && (t === 'SERIE' || t === 'SERIES')) headers.serie = w.bbox;
    }

    const headerY1 = Math.max(
        headers.equipe?.y1 || 0,
        headers.pts?.y1 || 0,
        headers.diff?.y1 || 0
    );

    const yDebut = headerY1 > 0 ? headerY1 + Math.round(height * 0.008) : 0;

    // Zone Equipe : commence au niveau du mot "Equipe" (donc APRÈS Rang, Pr. et Logo !)
    const xEquipeDebut = headers.equipe
        ? Math.max(0, headers.equipe.x0 - Math.round(width * 0.005))
        : Math.round(width * 0.13);

    // Zone Chiffres : commence juste avant "Pts" et finit juste après "Diff" (AVANT les points colorés "Série")
    const xNumsDebut = headers.pts
        ? Math.max(xEquipeDebut + 40, headers.pts.x0 - Math.round(width * 0.02))
        : Math.round(width * 0.38);

    let xNumsFin;
    if (headers.serie) {
        xNumsFin = Math.max(xNumsDebut + 100, headers.serie.x0 - Math.round(width * 0.01));
    } else if (headers.diff) {
        xNumsFin = Math.min(width, headers.diff.x1 + Math.round(width * 0.02));
    } else {
        xNumsFin = Math.round(width * 0.85);
    }

    // Coupe éventuellement la barre d'URL en bas de capture (ex: "560234-deux-leyres-fc/equipe/...")
    return { yDebut, xEquipeDebut, xNumsDebut, xNumsFin, aHeader: headerY1 > 0 };
}

/**
 * Regroupe une liste de mots Tesseract (avec bbox) en lignes horizontales triées de haut en bas.
 */
function regrouperMotsEnLignes(words, hauteurRef) {
    const valides = (words || [])
        .filter(w => w && w.bbox && String(w.text || '').trim().length > 0)
        .map(w => ({
            text: String(w.text).trim(),
            x0: w.bbox.x0,
            x1: w.bbox.x1,
            y0: w.bbox.y0,
            y1: w.bbox.y1,
            yMid: (w.bbox.y0 + w.bbox.y1) / 2,
            h: w.bbox.y1 - w.bbox.y0
        }))
        .sort((a, b) => a.yMid - b.yMid);

    if (valides.length === 0) return [];

    // Tolérance verticale basée sur la hauteur médiane des caractères
    const hauteurs = valides.map(v => v.h).filter(h => h > 4).sort((a, b) => a - b);
    const medH = hauteurs[Math.floor(hauteurs.length / 2)] || Math.max(18, hauteurRef * 0.02);
    const tolY = Math.max(12, medH * 0.75);

    const groupes = [];
    for (const mot of valides) {
        let groupe = null;
        for (const g of groupes) {
            if (Math.abs(mot.yMid - g.yMid) <= tolY) {
                groupe = g;
                break;
            }
        }
        if (groupe) {
            groupe.mots.push(mot);
            groupe.yMid = groupe.mots.reduce((acc, m) => acc + m.yMid, 0) / groupe.mots.length;
        } else {
            groupes.push({ yMid: mot.yMid, mots: [mot] });
        }
    }

    return groupes
        .sort((a, b) => a.yMid - b.yMid)
        .map(g => {
            g.mots.sort((a, b) => a.x0 - b.x0);
            return {
                yMid: g.yMid,
                mots: g.mots,
                texte: g.mots.map(m => m.text).join(' ').replace(/\s+/g, ' ').trim()
            };
        });
}

function nettoyerNomEquipeOcr(texte) {
    let s = String(texte || '').trim();
    // Supprime d'éventuels résidus de bord de logo en tout début de ligne (1 caractère isolé ou ponctuation)
    s = s.replace(/^[^A-Za-zÀ-ÿ0-9]+\s*/, '');
    s = s.replace(/^[a-z0-9]{1,2}\s+(?=[A-ZÀ-Ÿ]{2,})/, '');
    s = s.replace(/\s+/g, ' ').trim();
    // Ignore les URLs de barre d'état navigateur en bas de capture (ex: "60234-deux-leyres-fc/equipe/...")
    if (s.includes('/') || s.includes('_SEM_') || /^\d{4,}-/.test(s)) return '';
    if (!/[A-Za-zÀ-ÿ]{3,}/.test(s)) return '';
    const u = normMot(s);
    if (['EQUIPE', 'EQUIPES', 'CLASSEMENT', 'SERIEENCOURS'].includes(u)) return '';
    return s.toUpperCase();
}

function extraireNombresLigneOcr(mots) {
    const nums = [];
    for (const m of mots) {
        // Retire les éventuels espaces internes ou caractères parasites
        const t = m.text.replace(/[^0-9+-]/g, '');
        if (!t || t === '-' || t === '+') continue;
        // Si un signe "-" a été séparé du nombre suivant, on le gère via la boucle
        if (/^[+-]?\d{1,3}$/.test(t)) {
            nums.push(parseInt(t.replace('+', ''), 10));
        }
    }
    return nums;
}

/**
 * Lit une capture d'écran de classement FFF (File ou Blob) et retourne :
 * { lignes: Array<LigneClassement>, texteTabule: string }
 */
export async function lireClassementDepuisImage(fichier, onProgress = () => {}) {
    onProgress('Chargement du moteur OCR…');
    const [Tesseract, img] = await Promise.all([
        chargerTesseract(),
        chargerImage(fichier)
    ]);

    onProgress('Amélioration haute résolution de la capture…');
    const canvasHD = preparerCanvasHauteResolution(img);

    const worker = await Tesseract.createWorker('fra');
    try {
        // PASSE 1 : Détection globale pour localiser les colonnes exactes (Equipe, Pts, Diff, Série)
        onProgress('Analyse des colonnes du tableau (1/3)…');
        await worker.setParameters({ tessedit_pageseg_mode: '6' });
        const pass1 = await worker.recognize(canvasHD);

        const zones = detecterZonesColonnes(pass1.data?.words, canvasHD.width, canvasHD.height);
        const hCorps = canvasHD.height - zones.yDebut;

        // Découpe 2 bandes propres : Noms d'équipes (sans logos) + Chiffres (sans logos ni points de série)
        const canvasEquipes = decouperCanvas(
            canvasHD,
            zones.xEquipeDebut,
            zones.yDebut,
            zones.xNumsDebut - zones.xEquipeDebut,
            hCorps
        );
        const canvasNums = decouperCanvas(
            canvasHD,
            zones.xNumsDebut,
            zones.yDebut,
            zones.xNumsFin - zones.xNumsDebut,
            hCorps
        );

        // PASSE 2 : Lecture dédiée des noms d'équipes (sans aucun logo)
        onProgress("Lecture des noms d'équipes (2/3)…");
        await worker.setParameters({
            tessedit_pageseg_mode: '6',
            tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ0123456789 -'."
        });
        const passEquipes = await worker.recognize(canvasEquipes);

        // PASSE 3 : Lecture dédiée des chiffres avec whitelist stricte 0-9 + -
        onProgress('Lecture haute précision des scores et points (3/3)…');
        await worker.setParameters({
            tessedit_pageseg_mode: '6',
            tessedit_char_whitelist: '0123456789+- '
        });
        const passNums = await worker.recognize(canvasNums);

        const lignesEquipes = regrouperMotsEnLignes(passEquipes.data?.words, hCorps)
            .map(l => ({ yMid: l.yMid, equipe: nettoyerNomEquipeOcr(l.texte) }))
            .filter(l => Boolean(l.equipe));

        const lignesNums = regrouperMotsEnLignes(passNums.data?.words, hCorps)
            .map(l => ({ yMid: l.yMid, nums: extraireNombresLigneOcr(l.mots) }))
            .filter(l => l.nums.length >= 7);

        // Tolérance verticale d'appariement entre une ligne de nom et sa ligne de chiffres
        const pasMoyen = lignesEquipes.length > 1
            ? (lignesEquipes[lignesEquipes.length - 1].yMid - lignesEquipes[0].yMid) / (lignesEquipes.length - 1)
            : hCorps / 12;
        const tolAppariement = Math.max(25, pasMoyen * 0.45);

        const utilises = new Set();
        const lignesFinales = [];

        for (const eqRow of lignesEquipes) {
            let meilleurIdx = -1;
            let meilleurDist = Infinity;
            for (let k = 0; k < lignesNums.length; k++) {
                if (utilises.has(k)) continue;
                const d = Math.abs(lignesNums[k].yMid - eqRow.yMid);
                if (d < meilleurDist && d <= tolAppariement) {
                    meilleurDist = d;
                    meilleurIdx = k;
                }
            }
            if (meilleurIdx === -1) continue;
            utilises.add(meilleurIdx);

            const rang = lignesFinales.length + 1;
            const brute = mapNombresClassement(rang, eqRow.equipe, lignesNums[meilleurIdx].nums);
            if (!brute) continue;

            const corrigee = corrigerLigneMathematiquement(brute, { depuisOcr: true });
            corrigee.estChalosse = estEquipeChalosse(corrigee.equipe);
            lignesFinales.push(corrigee);
        }

        // Génère un texte tabulé propre (pour affichage/édition facile dans la zone texte)
        const texteTabule = lignesFinales.map(l =>
            `${l.rang}\t${l.equipe}\t${l.points}\t${l.joues}\t${l.gagnes}\t${l.nuls}\t${l.perdus}\t${l.forfaits || 0}\t0\t${l.bp}\t${l.bc}\t${l.diff}`
        ).join('\n');

        return { lignes: lignesFinales, texteTabule };
    } finally {
        await worker.terminate();
    }
}
