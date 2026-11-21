// Récupération et parsing des classements FFF (API DOFA + repli copier-coller epreuves.fff.fr)
// Club : CHALOSSE F. C. LAUREDE (Affiliation FFF n° 529258 - District des Landes)

export const CLUB_FFF_ID = 529258;
export const URL_FFF_CLUB = `https://epreuves.fff.fr/club/${CLUB_FFF_ID}`;
const API_BASE = 'https://api-dofa.fff.fr/api';

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
 * Parse un copier-coller (Ctrl+A / Ctrl+C) de la page Classement de epreuves.fff.fr ou fff.fr.
 * Gère aussi bien les lignes tabulées qu'un format multi-lignes (une cellule par ligne).
 */
export function parserClassementFFF(texteBrut) {
    if (!texteBrut || !String(texteBrut).trim()) {
        return { lignes: [], competition: '' };
    }

    const rawLines = String(texteBrut)
        .replace(/\r/g, '\n')
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean);

    // Détecte éventuellement le titre de la compétition
    let competition = '';
    for (const l of rawLines.slice(0, 25)) {
        const u = normaliser(l);
        if ((u.includes('DEPARTEMENTAL') || u.includes('REGIONAL') || u.includes('POULE')) && l.length < 80) {
            competition = l;
            break;
        }
    }

    const lignes = [];

    // 1. Tentative format tabulé ou une ligne par équipe :
    // Ex: "1\tCHALOSSE FC LAUREDE\t24\t10\t7\t3\t0\t0\t25\t10\t+15"
    // ou  "1 CHALOSSE FC LAUREDE 24 10 7 3 0 25 10 15"
    const regexLigneComplete = /^(\d{1,2})\s+([^\d\t][^\t]*?|\S[\s\S]*?)\s+(-?\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)(?:\s+(\d+))?\s+(\d+)\s+(\d+)\s+([+-]?\d+)$/;

    for (const l of rawLines) {
        // Cas séparé par tabulations
        if (l.includes('\t')) {
            const cols = l.split('\t').map(c => c.trim()).filter(c => c !== '');
            if (cols.length >= 9 && /^\d{1,2}$/.test(cols[0])) {
                const rang = parseInt(cols[0], 10);
                const equipe = cols[1];
                const nums = cols.slice(2).map(c => parseInt(c.replace('+', ''), 10));
                if (nums.every(n => !isNaN(n))) {
                    // Format FFF standard : Pts, J, G, N, P, [F], BP, BC, [Pén], Diff
                    const parsed = mapNombresClassement(rang, equipe, nums);
                    if (parsed) {
                        lignes.push(parsed);
                        continue;
                    }
                }
            }
        }

        const m = l.match(regexLigneComplete);
        if (m) {
            const rang = parseInt(m[1], 10);
            const equipe = m[2].trim();
            const nums = [m[3], m[4], m[5], m[6], m[7], m[8], m[9], m[10], m[11]]
                .filter(v => v !== undefined)
                .map(v => parseInt(v.replace('+', ''), 10));
            const parsed = mapNombresClassement(rang, equipe, nums);
            if (parsed) lignes.push(parsed);
        }
    }

    if (lignes.length >= 3) {
        return { lignes: dedupEtTrier(lignes), competition };
    }

    // 2. Tentative format multi-lignes (Edge / Chrome copie parfois chaque cellule sur une ligne séparée)
    // Motif : ligne "rang" (1..20) -> ligne "nom d'équipe" (avec lettres) -> 7 à 10 lignes numériques
    const multi = [];
    for (let i = 0; i < rawLines.length - 8; i++) {
        if (!/^\d{1,2}$/.test(rawLines[i])) continue;
        const rang = parseInt(rawLines[i], 10);
        if (rang < 1 || rang > 24) continue;

        const nomCandidat = rawLines[i + 1];
        if (!nomCandidat || /^\d+$/.test(nomCandidat) || nomCandidat.length < 3) continue;
        const uNom = normaliser(nomCandidat);
        if (['PTS', 'EQUIPE', 'CLUB', 'CLASSEMENT', 'JOURNEE'].includes(uNom)) continue;

        const nums = [];
        let j = i + 2;
        while (j < rawLines.length && nums.length < 10 && /^[+-]?\d{1,3}$/.test(rawLines[j])) {
            const valNum = parseInt(rawLines[j].replace('+', ''), 10);
            const suivant = rawLines[j + 1];
            if (nums.length >= 7 && valNum === rang + 1 && suivant && !/^[+-]?\d+$/.test(suivant) && suivant.length >= 3) {
                break;
            }
            nums.push(valNum);
            j++;
        }

        if (nums.length >= 7) {
            const parsed = mapNombresClassement(rang, nomCandidat, nums);
            if (parsed) {
                multi.push(parsed);
                i = j - 1;
            }
        }
    }

    return { lignes: dedupEtTrier(multi), competition };
}

function mapNombresClassement(rang, equipe, nums) {
    if (!equipe || nums.length < 7) return null;
    // Formats FFF courants :
    // 8 nombres : Pts, J, G, N, P, BP, BC, Diff
    // 9 nombres : Pts, J, G, N, P, F, BP, BC, Diff
    // 10 nombres : Pts, J, G, N, P, F, BP, BC, Pén, Diff
    const points = nums[0];
    const joues = nums[1];
    const gagnes = nums[2];
    const nuls = nums[3];
    const perdus = nums[4];

    let forfaits = 0, bp = 0, bc = 0, diff = 0;
    if (nums.length === 7) {
        bp = nums[5];
        bc = nums[6];
        diff = bp - bc;
    } else if (nums.length === 8) {
        bp = nums[5];
        bc = nums[6];
        diff = nums[7];
    } else if (nums.length === 9) {
        forfaits = nums[5];
        bp = nums[6];
        bc = nums[7];
        diff = nums[8];
    } else {
        forfaits = nums[5];
        bp = nums[6];
        bc = nums[7];
        diff = nums[nums.length - 1];
    }

    return {
        rang,
        equipe: equipe.trim(),
        points,
        joues,
        gagnes,
        nuls,
        perdus,
        forfaits,
        bp,
        bc,
        diff,
        estChalosse: estEquipeChalosse(equipe)
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
