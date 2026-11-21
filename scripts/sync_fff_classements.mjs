// Script Node.js exécuté par GitHub Actions pour synchroniser les classements FFF
// Club : CHALOSSE F. C. LAUREDE (Affiliation FFF n° 529258 - District des Landes)
// Zéro dépendance externe (Node 18+ natif avec fetch)

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FICHIER_SORTIE = path.resolve(__dirname, '..', 'data', 'classements_fff.json');

const CLUB_FFF_ID = 529258;
const API_BASE = 'https://api-dofa.fff.fr/api';
const HEADERS = {
    'Accept': 'application/ld+json, application/json',
    'User-Agent': 'Mozilla/5.0 (compatible; ChalosseFC-Bot/1.0; +https://github.com/bastienbruey40-stack/Chalossefc)'
};

function normaliser(str) {
    return String(str || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .replace(/\s+/g, ' ')
        .trim();
}

function extraireMembres(json) {
    if (Array.isArray(json)) return json;
    if (json && Array.isArray(json['hydra:member'])) return json['hydra:member'];
    if (json && Array.isArray(json.member)) return json.member;
    return [];
}

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
        estChalosse: normaliser(nom).includes('CHALOSSE')
    };
}

async function fetchJson(url) {
    console.log(`→ GET ${url}`);
    const resp = await fetch(url, { headers: HEADERS });
    if (!resp.ok) {
        const body = await resp.text().catch(() => '');
        throw new Error(`HTTP ${resp.status} sur ${url} ${body.slice(0, 160)}`);
    }
    return resp.json();
}

async function chargerPoule(cpNo, phaseNo, pouleNo, meta) {
    const url = `${API_BASE}/compets/${cpNo}/phases/${phaseNo}/poules/${pouleNo}/classement_journees`;
    const json = await fetchJson(url);
    const membres = extraireMembres(json);
    if (membres.length === 0) {
        throw new Error(`Classement vide pour compet ${cpNo} phase ${phaseNo} poule ${pouleNo}`);
    }

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
        source: 'github-actions-fff',
        maj: new Date().toISOString(),
        lignes
    };
}

async function main() {
    // Charge l'ancien fichier s'il existe afin de ne jamais écraser un bon classement en cas d'erreur partielle
    let existant = { maj: null, premiere: null, reserve: null };
    try {
        const brut = await fs.readFile(FICHIER_SORTIE, 'utf8');
        existant = JSON.parse(brut);
    } catch {
        // Premier lancement
    }

    const jsonEquipes = await fetchJson(`${API_BASE}/clubs/${CLUB_FFF_ID}/equipes`);
    const equipes = extraireMembres(jsonEquipes);
    console.log(`Équipes trouvées pour le club ${CLUB_FFF_ID} : ${equipes.length}`);

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

    console.log('Engagements retenus :', JSON.stringify(engagements));

    const nouveau = {
        maj: new Date().toISOString(),
        clubId: CLUB_FFF_ID,
        premiere: existant.premiere || null,
        reserve: existant.reserve || null
    };

    let nbMaj = 0;

    for (const cle of ['premiere', 'reserve']) {
        const e = engagements[cle];
        if (!e) {
            console.warn(`⚠️ Aucun engagement championnat trouvé pour : ${cle}`);
            continue;
        }
        try {
            const data = await chargerPoule(e.cpNo, e.phaseNo, e.pouleNo, e);
            nouveau[cle] = data;
            nbMaj++;
            const ch = data.lignes.find(l => l.estChalosse);
            console.log(`✅ ${cle} (${data.competition} ${data.poule}) : ${data.lignes.length} équipes${ch ? ` | Chalosse ${ch.rang}e (${ch.points} pts)` : ''}`);
        } catch (err) {
            console.error(`❌ Erreur pour ${cle} :`, err.message);
        }
    }

    if (nbMaj === 0) {
        throw new Error("Aucun classement n'a pu être récupéré depuis l'API FFF.");
    }

    await fs.mkdir(path.dirname(FICHIER_SORTIE), { recursive: true });
    await fs.writeFile(FICHIER_SORTIE, JSON.stringify(nouveau, null, 2) + '\n', 'utf8');
    console.log(`💾 Fichier écrit : ${FICHIER_SORTIE}`);
}

main().catch((err) => {
    console.error('Échec synchronisation FFF :', err);
    process.exit(1);
});
