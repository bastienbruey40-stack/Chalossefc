// Récupération et parsing des classements FFF (API DOFA + repli copier-coller epreuves.fff.fr)
// Club : CHALOSSE F. C. LAUREDE (Affiliation FFF n° 529258 - District des Landes)

import { trouverLogoClub, extraireCodeClubFFF } from './logos_clubs.js';

export const CLUB_FFF_ID = 529258;
export const URL_FFF_CLUB = `https://epreuves.fff.fr/club/${CLUB_FFF_ID}`;
const API_BASE = 'https://api-dofa.fff.fr/api';

// Classement officiel FFF pré-embarqué (Séniors Départemental 2 · Poule A - Journée 7)
// Sert d'affichage immédiat tant qu'une mise à jour plus récente n'a pas été enregistrée dans Firestore.
export const CLASSEMENTS_FFF_DEFAUT = {
    premiere: {
        competition: 'Séniors Départemental 2 · Poule A',
        poule: 'Poule A',
        journee: 7,
        source: 'fff-defaut',
        maj: '2026-11-21T18:00:00.000Z',
        lignes: [
            { rang: 1,  equipe: 'DEUX LEYRES FC',         points: 19, joues: 7, gagnes: 6, nuls: 1, perdus: 0, forfaits: 0, bp: 30, bc: 8,  diff: 22,  estChalosse: false },
            { rang: 2,  equipe: 'STADE MONTOIS 2',        points: 16, joues: 7, gagnes: 5, nuls: 1, perdus: 1, forfaits: 0, bp: 19, bc: 3,  diff: 16,  estChalosse: false },
            { rang: 3,  equipe: 'ARMAGNAC US',            points: 15, joues: 7, gagnes: 5, nuls: 0, perdus: 2, forfaits: 0, bp: 13, bc: 18, diff: -5,  estChalosse: false },
            { rang: 4,  equipe: 'BRETAGNE AS',            points: 13, joues: 7, gagnes: 4, nuls: 1, perdus: 2, forfaits: 0, bp: 24, bc: 20, diff: 4,   estChalosse: false },
            { rang: 5,  equipe: 'LABENNE OSC 2',          points: 13, joues: 7, gagnes: 4, nuls: 1, perdus: 2, forfaits: 0, bp: 19, bc: 15, diff: 4,   estChalosse: false },
            { rang: 6,  equipe: 'ST-PAUL DESPO',          points: 10, joues: 7, gagnes: 3, nuls: 1, perdus: 3, forfaits: 0, bp: 18, bc: 17, diff: 1,   estChalosse: false },
            { rang: 7,  equipe: 'ST PIERRE DU MONT SC 2', points: 10, joues: 7, gagnes: 3, nuls: 1, perdus: 3, forfaits: 0, bp: 20, bc: 16, diff: 4,   estChalosse: false },
            { rang: 8,  equipe: 'CHALOSSE FC LAUREDE',    points: 10, joues: 7, gagnes: 3, nuls: 1, perdus: 3, forfaits: 0, bp: 15, bc: 13, diff: 2,   estChalosse: true  },
            { rang: 9,  equipe: 'FC ST GEOURS 2',         points: 8,  joues: 7, gagnes: 2, nuls: 2, perdus: 3, forfaits: 0, bp: 14, bc: 15, diff: -1,  estChalosse: false },
            { rang: 10, equipe: 'MARENSIN FC 2',          points: 6,  joues: 7, gagnes: 2, nuls: 0, perdus: 5, forfaits: 0, bp: 14, bc: 25, diff: -11, estChalosse: false },
            { rang: 11, equipe: 'HAGETMAU FC 2',          points: 1,  joues: 7, gagnes: 0, nuls: 1, perdus: 6, forfaits: 0, bp: 6,  bc: 23, diff: -17, estChalosse: false },
            { rang: 12, equipe: 'LALUQUE RION JSFC',      points: 0,  joues: 7, gagnes: 0, nuls: 0, perdus: 7, forfaits: 0, bp: 8,  bc: 27, diff: -19, estChalosse: false }
        ].map(l => ({ ...l, logo: trouverLogoClub(l.equipe) }))
    },
    reserve: null
};

function normaliser(str) {
    return String(str || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .replace(/\s+/g, ' ')
        .trim();
}

export function estEquipeChalosse(nomEquipe) {
    const u = normaliser(nomEquipe);
    return u.includes('CHALOSSE');
}

function extraireMembres(json) {
    if (Array.isArray(json)) return json;
    if (json && Array.isArray(json['hydra:member'])) return json['hydra:member'];
    if (json && Array.isArray(json.member)) return json.member;
    return [];
}

/**
 * Normalise une ligne de classement issue de l'API DOFA FFF.
 */
function normaliserLigneApi(row, fallbackRang = 0) {
    const equipeObj = row.equipe || row.team || {};
    const nom = equipeObj.short_name || equipeObj.name || row.equipe_short_name || row.club_name || row.name || 'Équipe';
    const rang = parseInt(row.rank ?? row.rang ?? row.position ?? fallbackRang, 10) || fallbackRang;
    const points = parseInt(row.point_count ?? row.points ?? row.pts ?? 0, 10) || 0;
    const joues = parseInt(row.total_games_count ?? row.games_count ?? row.joues ?? row.j ?? 0, 10) || 0;
    const gagnes = parseInt(row.won_games_count ?? row.wins ?? row.gagnes ?? row.g ?? 0, 10) || 0;
    const nuls = parseInt(row.draw_games_count ?? row.draws ?? row.nuls ?? row.n ?? 0, 10) || 0;
    const perdus = parseInt(row.lost_games_count ?? row.losses ?? row.perdus ?? row.p ?? 0, 10) || 0;
    const forfaits = parseInt(row.forfeits_games_count ?? row.forfaits ?? row.f ?? 0, 10) || 0;
    const bp = parseInt(row.goals_for_count ?? row.goals_for ?? row.bp ?? 0, 10) || 0;
    const bc = parseInt(row.goals_against_count ?? row.goals_against ?? row.bc ?? 0, 10) || 0;
    const diffRaw = row.goals_diff ?? row.goal_difference ?? row.diff;
    const diff = (diffRaw !== undefined && diffRaw !== null && !isNaN(parseInt(diffRaw, 10)))
        ? parseInt(diffRaw, 10)
        : (bp - bc);

    return {
        rang,
        equipe: String(nom).trim(),
        points,
        joues,
        gagnes,
        nuls,
        perdus,
        forfaits,
        bp,
        bc,
        diff,
        estChalosse: estEquipeChalosse(nom)
    };
}

/**
 * Interroge l'API FFF pour une poule précise et retourne le classement de la dernière journée.
 */
async function chargerPouleApi(cpNo, phaseNo, pouleNo, meta = {}) {
    const url = `${API_BASE}/compets/${cpNo}/phases/${phaseNo}/poules/${pouleNo}/classement_journees`;
    const resp = await fetch(url, {
        headers: { 'Accept': 'application/ld+json, application/json' }
    });
    if (!resp.ok) {
        throw new Error(`API FFF HTTP ${resp.status}`);
    }
    const json = await resp.json();
    const membres = extraireMembres(json);
    if (membres.length === 0) {
        throw new Error("Classement vide retourné par l'API FFF.");
    }

    // L'endpoint classement_journees peut renvoyer plusieurs journées (champ cj_no / pja_no) :
    // on garde uniquement la journée la plus élevée si le champ est présent.
    const journees = membres
        .map(m => parseInt(m.cj_no ?? m.pja_no ?? m.journee ?? m.day ?? -1, 10))
        .filter(n => !isNaN(n) && n >= 0);

    let filtre = membres;
    let derniereJournee = null;
    if (journees.length > 0) {
        derniereJournee = Math.max(...journees);
        const deDerniere = membres.filter(m => parseInt(m.cj_no ?? m.pja_no ?? m.journee ?? m.day ?? -1, 10) === derniereJournee);
        if (deDerniere.length > 0) filtre = deDerniere;
    }

    const lignes = filtre
        .map((row, idx) => normaliserLigneApi(row, idx + 1))
        .sort((a, b) => a.rang - b.rang || b.points - a.points || b.diff - a.diff);

    return {
        competition: meta.competition || 'Championnat FFF',
        poule: meta.poule || '',
        journee: derniereJournee,
        cpNo,
        phaseNo,
        pouleNo,
        source: 'api-fff',
        maj: new Date().toISOString(),
        lignes
    };
}

/**
 * Récupère automatiquement les classements de l'Équipe Première et de l'Équipe Réserve
 * via l'API publique DOFA de la FFF (club 529258 - CHALOSSE F. C. LAUREDE).
 */
export async function recupererClassementsViaApiFFF() {
    const resp = await fetch(`${API_BASE}/clubs/${CLUB_FFF_ID}/equipes`, {
        headers: { 'Accept': 'application/ld+json, application/json' }
    });
    if (!resp.ok) {
        throw new Error(`Accès API FFF refusé (HTTP ${resp.status}).`);
    }
    const json = await resp.json();
    const equipes = extraireMembres(json);

    // Repère les engagements en championnat ("CH") des équipes Séniors 1 et 2
    const engagements = { premiere: null, reserve: null };

    for (const eq of equipes) {
        const cat = normaliser(eq.category_label || eq.category?.label || eq.short_name || '');
        const isSenior = cat.includes('SENIOR') || cat.includes('SEM') || eq.category_code === 'SEM';
        const numEq = parseInt(eq.number ?? eq.code ?? eq.team_number ?? 0, 10);
        if (!isSenior && numEq !== 1 && numEq !== 2) continue;

        const engs = Array.isArray(eq.engagements) ? eq.engagements : [];
        for (const eng of engs) {
            const comp = eng.competition || {};
            const typeComp = normaliser(comp.type || '');
            const nomComp = comp.name || '';
            const nomCompNorm = normaliser(nomComp);

            // On ne garde que les championnats (on ignore les coupes)
            if (typeComp && typeComp !== 'CH') continue;
            if (nomCompNorm.includes('COUPE') || nomCompNorm.includes('TROPHEE')) continue;

            const cpNo = comp.cp_no ?? comp.id;
            const phaseNo = eng.phase?.number ?? eng.phase?.ph_no ?? 1;
            const pouleNo = eng.poule?.stage_number ?? eng.poule?.po_no ?? eng.poule?.number ?? 1;
            const pouleNom = eng.poule?.name || '';
            if (!cpNo) continue;

            const meta = { cpNo, phaseNo, pouleNo, competition: nomComp, poule: pouleNom };

            if ((numEq === 1 || nomCompNorm.includes('DEPARTEMENTAL 2') || nomCompNorm.includes('D2')) && !engagements.premiere) {
                engagements.premiere = meta;
            } else if ((numEq === 2 || nomCompNorm.includes('DEPARTEMENTAL 3') || nomCompNorm.includes('D3')) && !engagements.reserve) {
                engagements.reserve = meta;
            }
        }
    }

    const resultat = { premiere: null, reserve: null };
    const taches = [];

    if (engagements.premiere) {
        const e = engagements.premiere;
        taches.push(
            chargerPouleApi(e.cpNo, e.phaseNo, e.pouleNo, e)
                .then(data => { resultat.premiere = data; })
        );
    }
    if (engagements.reserve) {
        const e = engagements.reserve;
        taches.push(
            chargerPouleApi(e.cpNo, e.phaseNo, e.pouleNo, e)
                .then(data => { resultat.reserve = data; })
        );
    }

    if (taches.length === 0) {
        throw new Error("Aucun championnat Séniors trouvé pour le club 529258 sur l'API FFF.");
    }

    await Promise.all(taches);
    return resultat;
}

/**
 * Applique une vérification/auto-correction mathématique légère sur une ligne de classement
 * (utile surtout après OCR d'une capture d'écran).
 * Invariants foot : G + N + P = J ; Pts = 3*G + N + P/Bo ; Diff = Bp - Bc.
 */
export function corrigerLigneMathematiquement(ligne, { depuisOcr = false } = {}) {
    if (!ligne) return ligne;
    const res = { ...ligne };

    if (depuisOcr) {
        // 1. Si G + N + P = J et P/Bo = 0 et F = 0, vérifie Pts = 3*G + N
        if (res.gagnes >= 0 && res.nuls >= 0 && res.perdus >= 0 && res.gagnes + res.nuls + res.perdus === res.joues && res.joues > 0) {
            const ptsAttendu = res.gagnes * 3 + res.nuls;
            if ((res.forfaits || 0) === 0 && res.points !== ptsAttendu) {
                // Si la différence ressemble à un chiffre avalé par l'OCR (ex: 13 lu 3 ou 8, 10 lu 0)
                if (res.points < 0 || Math.abs(res.points - ptsAttendu) >= 3) {
                    res.points = ptsAttendu;
                }
            }
        }
        // 2. Toujours recalculer Diff = Bp - Bc si incohérent (rattrape les signes "-" manqués ex: 5 au lieu de -5)
        if (res.bp >= 0 && res.bc >= 0 && res.bp - res.bc !== res.diff) {
            res.diff = res.bp - res.bc;
        }
    }

    return res;
}

const MOTS_BRUIT_CLASSEMENT = new Set([
    'UNDEFINED', 'NULL', 'LOGO', 'IMAGE', 'IMG', 'PR', 'PR.', 'EQUIPE', 'EQUIPES',
    'CLUB', 'PTS', 'J', 'J.', 'G', 'G.', 'N', 'N.', 'P', 'P.', 'F', 'F.',
    'P/BO', 'P/BO.', 'BP', 'BP.', 'BC', 'BC.', 'DIFF', 'DIFF.', 'SERIE EN COURS',
    'CLASSEMENT', 'JOURNEE'
]);

/**
 * Parse un copier-coller (Ctrl+A / Ctrl+C) de la page Classement de epreuves.fff.fr ou fff.fr.
 * Gère tous les formats de navigateurs :
 * - Format hybride epreuves.fff.fr (rang sur 1 ligne, "undefined", nom sur 1 ligne, 10 chiffres tabulés sur 1 ligne)
 * - Format tabulé (1 ligne par équipe)
 * - Format multi-lignes (1 cellule par ligne)
 * - Liens Markdown [NOM](https://...)
 */
export function parserClassementFFF(texteBrut) {
    if (!texteBrut || !String(texteBrut).trim()) {
        return { lignes: [], competition: '' };
    }

    // Mémorise les codes clubs FFF présents dans les liens Markdown [NOM](https://.../club/560234-...) avant nettoyage
    const codesParEquipe = new Map();
    const rawLines = String(texteBrut)
        .replace(/\r/g, '\n')
        .split('\n')
        .map(l => {
            const mLink = l.match(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/);
            if (mLink) {
                const code = extraireCodeClubFFF(mLink[2]);
                if (code) codesParEquipe.set(normaliser(mLink[1]), code);
            }
            return l.replace(/\[([^\]]+)\]\(https?:\/\/[^)]+\)/g, '$1').trim();
        })
        .filter(l => {
            if (!l) return false;
            const u = normaliser(l);
            if (u === 'UNDEFINED' || u === 'NULL') return false;
            return true;
        });

    // Détecte éventuellement le titre de la compétition
    let competition = '';
    for (const l of rawLines.slice(0, 25)) {
        const u = normaliser(l);
        if ((u.includes('DEPARTEMENTAL') || u.includes('REGIONAL') || u.includes('POULE')) && l.length < 80) {
            competition = l;
            break;
        }
    }

    const estCelluleProgression = (s) => /^[↑↓▲▼+-]?\s*\d{1,2}$/.test(s) || /^[↑↓▲▼=–-]$/.test(s);
    const estCelluleNombre = (s) => /^[+-]?\d{1,3}$/.test(s);
    const estNomEquipeValide = (s) => {
        if (!s || s.length < 2) return false;
        if (estCelluleNombre(s)) return false;
        if (!/[A-Za-zÀ-ÿ]{2,}/.test(s)) return false;
        const u = normaliser(s);
        if (MOTS_BRUIT_CLASSEMENT.has(u)) return false;
        if (u.startsWith('CLASSEMENT SOUS RESERVE')) return false;
        return true;
    };

    // 1. Passe "1 ligne par équipe" (séparée par espaces ou tabulations complètes)
    //    Gère aussi les équipes réserves finissant par un chiffre (ex: "2 STADE MONTOIS 2 16 7 5 1 1 0 0 19 3 16")
    const lignesMono = [];
    for (const l of rawLines) {
        const mLigne = l.match(/^(\d{1,2})[\t ]+(?:[↑↓▲▼+-]?\s*\d{1,2}[\t ]+)?(?:undefined[\t ]+)?([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ0-9\s.'-]{1,50}?)[\t ]+((?:[+-]?\d{1,3}[\t ]+){6,10}[+-]?\d{1,3})(?:[\t ]+[^\d\t +-].*)?$/i);
        if (mLigne) {
            const rang = parseInt(mLigne[1], 10);
            let equipe = mLigne[2].trim();
            let nums = mLigne[3].trim().split(/[\t ]+/).map(v => parseInt(v.replace('+', ''), 10));

            // Si un chiffre de numéro d'équipe (1..5) a été aspiré au début des statistiques,
            // on le rattache au nom d'équipe (ex: "STADE MONTOIS" + "2" -> "STADE MONTOIS 2").
            if (nums.length >= 8 && nums[0] >= 1 && nums[0] <= 5) {
                const sansPremier = nums.slice(1);
                const coherentAvec = nums[1] === nums[2] + nums[3] + nums[4] && nums.length <= 10;
                const coherentSans = sansPremier.length >= 7 && sansPremier[1] === sansPremier[2] + sansPremier[3] + sansPremier[4];
                if (nums.length === 11 || (!coherentAvec && coherentSans)) {
                    equipe = `${equipe} ${nums[0]}`;
                    nums = sansPremier;
                }
            }

            if (rang >= 1 && rang <= 24 && estNomEquipeValide(equipe)) {
                const parsed = mapNombresClassement(rang, equipe, nums);
                if (parsed) lignesMono.push(parsed);
            }
        }
    }

    if (lignesMono.length >= 3) {
        lignesMono.forEach(l => {
            const code = codesParEquipe.get(normaliser(l.equipe));
            if (code) l.logo = trouverLogoClub(l.equipe, code);
        });
        return { lignes: dedupEtTrier(lignesMono), competition };
    }

    // 2. Passe unifiée par jetons (gère à la fois le format hybride exact de epreuves.fff.fr
    //    "11 \n undefined \n HAGETMAU FC 2 \n 1\t7\t0\t1\t6\t0\t0\t6\t23\t-17"
    //    ET le format 100% tabulé ET le format 100% multi-lignes !)
    const tokens = [];
    for (const l of rawLines) {
        const parts = l.split('\t').map(p => p.trim()).filter(Boolean);
        for (const part of parts) {
            const uPart = normaliser(part);
            if (uPart === 'UNDEFINED' || uPart === 'NULL') continue;

            // Si un morceau ne contient QUE des nombres séparés par des espaces (ex: "1 7 0 1 6 0 0 6 23 -17" ou "4 1"),
            // on l'éclate en nombres individuels.
            if (/^[+-]?\d{1,3}(?:\s+[+-]?\d{1,3})+$/.test(part)) {
                part.split(/\s+/).forEach(n => tokens.push(n));
            } else {
                tokens.push(part);
            }
        }
    }

    const unifie = [];
    for (let i = 0; i < tokens.length - 8; i++) {
        if (!/^\d{1,2}$/.test(tokens[i])) continue;
        const rang = parseInt(tokens[i], 10);
        if (rang < 1 || rang > 24) continue;

        let idxNom = i + 1;
        // Saute jusqu'à 2 jetons optionnels de progression "Pr." (ex: "↑", "1", "↓ 3", "-")
        let sauts = 0;
        while (sauts < 2 && tokens[idxNom] && estCelluleProgression(tokens[idxNom]) && tokens[idxNom + 1]) {
            idxNom++;
            sauts++;
        }

        const nomCandidat = tokens[idxNom];
        if (!estNomEquipeValide(nomCandidat)) continue;

        const nums = [];
        let j = idxNom + 1;
        while (j < tokens.length && nums.length < 10 && estCelluleNombre(tokens[j])) {
            const valNum = parseInt(tokens[j].replace('+', ''), 10);
            const suivant = tokens[j + 1];
            const suivant2 = tokens[j + 2];
            const ressembleAuRangSuivant =
                nums.length >= 7 &&
                valNum === rang + 1 &&
                (
                    (suivant && estNomEquipeValide(suivant)) ||
                    (suivant && estCelluleProgression(suivant) && suivant2 && estNomEquipeValide(suivant2))
                );
            if (ressembleAuRangSuivant) break;
            nums.push(valNum);
            j++;
        }

        if (nums.length >= 7) {
            const code = codesParEquipe.get(normaliser(nomCandidat)) || '';
            const parsed = mapNombresClassement(rang, nomCandidat, nums, code);
            if (parsed) {
                unifie.push(parsed);
                i = j - 1;
            }
        }
    }

    return { lignes: dedupEtTrier(unifie), competition };
}

export function mapNombresClassement(rang, equipe, nums, codeOuUrlLogo = '') {
    if (!equipe || nums.length < 7) return null;
    // Formats FFF officiels :
    // 10 nombres (epreuves.fff.fr actuel) : Pts, J, G, N, P, F, P/Bo, Bp, Bc, Diff
    //  9 nombres                          : Pts, J, G, N, P, F, Bp, Bc, Diff
    //  8 nombres                          : Pts, J, G, N, P, Bp, Bc, Diff
    //  7 nombres                          : Pts, J, G, N, P, Bp, Bc
    const points = nums[0];
    const joues = nums[1];
    const gagnes = nums[2];
    const nuls = nums[3];
    const perdus = nums[4];

    let forfaits = 0, bp = 0, bc = 0, diff = 0;
    if (nums.length >= 10) {
        forfaits = nums[5];
        bp = nums[7];
        bc = nums[8];
        diff = nums[9];
    } else if (nums.length === 9) {
        forfaits = nums[5];
        bp = nums[6];
        bc = nums[7];
        diff = nums[8];
    } else if (nums.length === 8) {
        bp = nums[5];
        bc = nums[6];
        diff = nums[7];
    } else {
        bp = nums[5];
        bc = nums[6];
        diff = bp - bc;
    }

    const nomPropre = equipe.trim();
    return {
        rang,
        equipe: nomPropre,
        logo: trouverLogoClub(nomPropre, codeOuUrlLogo),
        points,
        joues,
        gagnes,
        nuls,
        perdus,
        forfaits,
        bp,
        bc,
        diff,
        estChalosse: estEquipeChalosse(nomPropre)
    };
}

function dedupEtTrier(liste) {
    const vus = new Set();
    return liste
        .filter(item => {
            const cle = `${item.rang}_${normaliser(item.equipe)}`;
            if (vus.has(cle)) return false;
            vus.add(cle);
            return true;
        })
        .sort((a, b) => a.rang - b.rang || b.points - a.points || b.diff - a.diff);
}
