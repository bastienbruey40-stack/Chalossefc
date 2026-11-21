// Calendrier officiel FFF (Saison 2026-2027) & moteur pur de synchronisation sécurisée
// Club : CHALOSSE F. C. LAUREDE (Affiliation FFF n° 529258 - District des Landes)
// Équipe 1 : Séniors Départemental 2 (Poule A) & Coupes
// Équipe 2 : Séniors Départemental 3 (Poule C) & Coupe des Réserves
//
// Module JS pur (sans dépendance Firebase), testable directement sous Node.js.
// RÈGLE D'OR : ne jamais modifier ni supprimer un match contenant un score,
// une composition, des stats joueurs, des notes ou une modification manuelle.

import { trouverLogoClub, extraireCodeClubFFF } from './logos_clubs.js';

export const MATCHS_FFF_CHALOSSE = [
    // =========================================================================
    // 🔵 ÉQUIPE PREMIÈRE (Séniors 1 - Départemental 2 Poule A & Coupes)
    // =========================================================================
    { equipe_type: "premiere", date: "2026-08-23", adversaire: "Ciboure FC (Coupe de France)", score_chalosse: 3, score_adversaire: 1 },
    { equipe_type: "premiere", date: "2026-08-26", adversaire: "Labenne OSC (Trophée des Champions)", score_chalosse: 1, score_adversaire: 3 },
    { equipe_type: "premiere", date: "2026-08-29", adversaire: "SA Mauléonais (Coupe de France)", score_chalosse: 1, score_adversaire: 2 },
    { equipe_type: "premiere", date: "2026-09-05", adversaire: "SC St-Pierre-du-Mont 2", score_chalosse: 2, score_adversaire: 2 },
    { equipe_type: "premiere", date: "2026-09-18", adversaire: "Stade Montois 2", score_chalosse: 0, score_adversaire: 2 },
    { equipe_type: "premiere", date: "2026-10-03", adversaire: "AS Bretagne-Marsan", score_chalosse: 3, score_adversaire: 0 },
    { equipe_type: "premiere", date: "2026-10-11", adversaire: "St-Paul Despo (Coupe des Landes)", score_chalosse: 2, score_adversaire: 2 },
    { equipe_type: "premiere", date: "2026-10-17", adversaire: "FC St-Geours 2", score_chalosse: 2, score_adversaire: 3 },
    { equipe_type: "premiere", date: "2026-10-31", adversaire: "FC Marensin 2", score_chalosse: 5, score_adversaire: 1 },
    { equipe_type: "premiere", date: "2026-11-08", adversaire: "St-Paul Despo", score_chalosse: 1, score_adversaire: 4 },
    { equipe_type: "premiere", date: "2026-11-11", adversaire: "Hagetmau FC 2", score_chalosse: 2, score_adversaire: 1 },
    { equipe_type: "premiere", date: "2026-11-14", adversaire: "Hagetmau FC 1 (Coupe des Landes)", score_chalosse: 3, score_adversaire: 1 },
    { equipe_type: "premiere", date: "2026-11-21", adversaire: "JSFC Laluque Rion", score_chalosse: null, score_adversaire: null },
    { equipe_type: "premiere", date: "2026-11-29", adversaire: "FC des Deux Leyres", score_chalosse: null, score_adversaire: null },
    { equipe_type: "premiere", date: "2026-12-05", adversaire: "US Armagnac", score_chalosse: null, score_adversaire: null },
    { equipe_type: "premiere", date: "2026-12-12", adversaire: "Labenne OSC 2", score_chalosse: null, score_adversaire: null },
    { equipe_type: "premiere", date: "2027-01-23", adversaire: "Stade Montois 2", score_chalosse: null, score_adversaire: null },
    { equipe_type: "premiere", date: "2027-01-31", adversaire: "AS Bretagne-Marsan", score_chalosse: null, score_adversaire: null },
    { equipe_type: "premiere", date: "2027-02-06", adversaire: "FC St-Geours 2", score_chalosse: null, score_adversaire: null },
    { equipe_type: "premiere", date: "2027-03-06", adversaire: "Hagetmau FC 2", score_chalosse: null, score_adversaire: null },
    { equipe_type: "premiere", date: "2027-03-14", adversaire: "FC Marensin 2", score_chalosse: null, score_adversaire: null },
    { equipe_type: "premiere", date: "2027-03-20", adversaire: "St-Paul Despo", score_chalosse: null, score_adversaire: null },
    { equipe_type: "premiere", date: "2027-04-03", adversaire: "JSFC Laluque Rion", score_chalosse: null, score_adversaire: null },
    { equipe_type: "premiere", date: "2027-04-10", adversaire: "FC des Deux Leyres", score_chalosse: null, score_adversaire: null },
    { equipe_type: "premiere", date: "2027-05-01", adversaire: "Labenne OSC 2", score_chalosse: null, score_adversaire: null },
    { equipe_type: "premiere", date: "2027-05-15", adversaire: "US Armagnac", score_chalosse: null, score_adversaire: null },
    { equipe_type: "premiere", date: "2027-05-30", adversaire: "SC St-Pierre-du-Mont 2", score_chalosse: null, score_adversaire: null },

    // =========================================================================
    // 🟢 ÉQUIPE RÉSERVE (Séniors 2 - Départemental 3 Poule C & Coupe des Réserves)
    // =========================================================================
    { equipe_type: "reserve", date: "2026-09-05", adversaire: "SC St-Pierre-du-Mont 3", score_chalosse: 2, score_adversaire: 4 },
    { equipe_type: "reserve", date: "2026-09-27", adversaire: "US Latrille St-Agnet", score_chalosse: 1, score_adversaire: 3 },
    { equipe_type: "reserve", date: "2026-10-03", adversaire: "AS Bretagne-Marsan 2", score_chalosse: 1, score_adversaire: 1 },
    { equipe_type: "reserve", date: "2026-10-10", adversaire: "FC Born 2 (Coupe des Réserves)", score_chalosse: 2, score_adversaire: 3 },
    { equipe_type: "reserve", date: "2026-10-17", adversaire: "AS Maurrinoise", score_chalosse: 0, score_adversaire: 4 },
    { equipe_type: "reserve", date: "2026-10-31", adversaire: "FC Amou Poudenx", score_chalosse: 1, score_adversaire: 1 },
    { equipe_type: "reserve", date: "2026-11-08", adversaire: "ES Montoise 3", score_chalosse: 2, score_adversaire: 1 },
    { equipe_type: "reserve", date: "2026-11-14", adversaire: "St-Perdon Sports 2", score_chalosse: 2, score_adversaire: 2 },
    { equipe_type: "reserve", date: "2026-11-21", adversaire: "US Marsan 2", score_chalosse: null, score_adversaire: null },
    { equipe_type: "reserve", date: "2026-11-29", adversaire: "AS Cazérienne 2", score_chalosse: null, score_adversaire: null },
    { equipe_type: "reserve", date: "2026-12-05", adversaire: "SA Saint-Sever 2", score_chalosse: null, score_adversaire: null },
    { equipe_type: "reserve", date: "2026-12-12", adversaire: "US Armagnac 2", score_chalosse: null, score_adversaire: null },
    { equipe_type: "reserve", date: "2027-01-24", adversaire: "US Latrille St-Agnet", score_chalosse: null, score_adversaire: null },
    { equipe_type: "reserve", date: "2027-01-31", adversaire: "AS Bretagne-Marsan 2", score_chalosse: null, score_adversaire: null },
    { equipe_type: "reserve", date: "2027-02-06", adversaire: "AS Maurrinoise", score_chalosse: null, score_adversaire: null },
    { equipe_type: "reserve", date: "2027-03-06", adversaire: "St-Perdon Sports 2", score_chalosse: null, score_adversaire: null },
    { equipe_type: "reserve", date: "2027-03-14", adversaire: "FC Amou Poudenx", score_chalosse: null, score_adversaire: null },
    { equipe_type: "reserve", date: "2027-03-20", adversaire: "ES Montoise 3", score_chalosse: null, score_adversaire: null },
    { equipe_type: "reserve", date: "2027-04-03", adversaire: "US Marsan 2", score_chalosse: null, score_adversaire: null },
    { equipe_type: "reserve", date: "2027-04-10", adversaire: "AS Cazérienne 2", score_chalosse: null, score_adversaire: null },
    { equipe_type: "reserve", date: "2027-05-01", adversaire: "SA Saint-Sever 2", score_chalosse: null, score_adversaire: null },
    { equipe_type: "reserve", date: "2027-05-15", adversaire: "US Armagnac 2", score_chalosse: null, score_adversaire: null },
    { equipe_type: "reserve", date: "2027-05-30", adversaire: "SC St-Pierre-du-Mont 3", score_chalosse: null, score_adversaire: null }
];

function versDatePur(val) {
    if (!val) return null;
    if (typeof val === 'object' && typeof val.toDate === 'function') return val.toDate();
    if (val instanceof Date) return isNaN(val) ? null : val;
    const s = String(val).trim();
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

export function normaliserDateISO(val) {
    const d = versDatePur(val);
    if (!d) return '';
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function ecartJours(isoA, isoB) {
    if (!isoA || !isoB) return Infinity;
    const a = versDatePur(isoA);
    const b = versDatePur(isoB);
    if (!a || !b) return Infinity;
    return Math.round(Math.abs(a.getTime() - b.getTime()) / 86400000);
}

function phaseSaison(isoDate) {
    if (!isoDate) return 'inconnue';
    // Phase Aller : avant janvier 2027 ; Phase Retour : à partir de janvier 2027
    return isoDate < '2027-01-01' ? 'aller' : 'retour';
}

export function estMatchCoupe(adversaire) {
    const s = String(adversaire || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase();
    return /\b(COUPE|TROPHEE|CHALLENGE)\b/.test(s);
}

export function cleClubAdversaire(adversaire) {
    const logo = trouverLogoClub(adversaire);
    const code = extraireCodeClubFFF(logo);
    if (code) return `FFF_${code}`;

    return String(adversaire || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .replace(/\(.*?\)/g, ' ')
        .replace(/[^A-Z0-9]+/g, ' ')
        .replace(/\b(FC|US|AS|SA|SC|ES|JSFC|OSC|CLUB|FOOTBALL|ENTENTE|SPORTIVE)\b/g, ' ')
        .replace(/\b[1234]\b/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

export function aUnScoreValide(d) {
    return Boolean(
        d &&
        d.score_chalosse !== undefined &&
        d.score_chalosse !== null &&
        d.score_chalosse !== '' &&
        !isNaN(Number(d.score_chalosse)) &&
        d.score_adversaire !== undefined &&
        d.score_adversaire !== null &&
        d.score_adversaire !== '' &&
        !isNaN(Number(d.score_adversaire))
    );
}

export function aUneCompoOuStats(d) {
    if (!d) return false;
    if (Array.isArray(d.compo) && d.compo.length > 0) return true;
    if (d.compo_tactique) {
        const tit = Object.values(d.compo_tactique.titulaires || {}).filter(Boolean);
        const remp = Array.isArray(d.compo_tactique.remplacants) ? d.compo_tactique.remplacants.filter(Boolean) : [];
        if (tit.length > 0 || remp.length > 0) return true;
    }
    if (d.stats_joueurs && Object.keys(d.stats_joueurs).length > 0) return true;
    return false;
}

/**
 * Calcule le plan de synchronisation sécurisée entre `MATCHS_FFF_CHALOSSE` et les matchs
 * déjà présents dans Firestore.
 *
 * Garanties strictes :
 *  1. Aucun match avec score, compo, stats, notes ou édition manuelle n'est JAMAIS modifié
 *     (hormis ajout du logo si totalement absent) ni supprimé.
 *  2. L'appariement se fait par identité de rencontre (équipe + club + coupe/championnat + phase),
 *     ce qui évite les doublons quand une date ou un nom d'adversaire a été modifié/reporté.
 *  3. Les doublons vides (sans compo, sans stats, sans notes) issus d'anciennes synchronisations
 *     sont nettoyés proprement.
 *
 * @param {Array<{id: string, data: Object}>} matchsExistants
 * @param {Set<string>} [notesMatchIds] - IDs des matchs ayant déjà au moins une note joueur
 * @returns {{
 *   aAjouter: Array<Object>,
 *   aMettreAJour: Array<{id: string, patch: Object, type: 'match'|'logo'}>,
 *   aSupprimer: Array<string>,
 *   proteges: number
 * }}
 */
export function planifierSynchronisationFFF(matchsExistants, notesMatchIds = new Set()) {
    const notesSet = notesMatchIds instanceof Set ? notesMatchIds : new Set(notesMatchIds || []);

    // Enrichit chaque match existant avec ses métadonnées de protection et de correspondance
    const existants = (matchsExistants || []).map(item => {
        const data = item.data || {};
        const equipe = data.equipe_type === 'reserve' ? 'reserve' : 'premiere';
        const dateISO = normaliserDateISO(data.date);
        const club = cleClubAdversaire(data.adversaire);
        const coupe = estMatchCoupe(data.adversaire);
        const phase = phaseSaison(dateISO);
        const aCompo = aUneCompoOuStats(data);
        const aNotes = notesSet.has(item.id);
        const aScore = aUnScoreValide(data);
        const manuel = Boolean(data.modifie_manuellement);
        // Un match est protégé dès qu'il possède un score, une compo, des stats, des notes ou une édition manuelle
        const estProtege = aCompo || aNotes || aScore || manuel;
        const richesse = (aCompo ? 100 : 0) + (aNotes ? 50 : 0) + (manuel ? 20 : 0) + (aScore ? 10 : 0);

        return {
            id: item.id,
            data,
            equipe,
            dateISO,
            club,
            coupe,
            phase,
            aCompo,
            aNotes,
            aScore,
            manuel,
            estProtege,
            richesse,
            apparie: false
        };
    });

    // On traite en priorité les matchs les plus riches (compo > notes > manuel > score > vide)
    existants.sort((a, b) => b.richesse - a.richesse || a.dateISO.localeCompare(b.dateISO));

    const fffItems = MATCHS_FFF_CHALOSSE.map((m, idx) => ({
        idx,
        match: m,
        equipe: m.equipe_type === 'reserve' ? 'reserve' : 'premiere',
        dateISO: normaliserDateISO(m.date),
        club: cleClubAdversaire(m.adversaire),
        coupe: estMatchCoupe(m.adversaire),
        phase: phaseSaison(normaliserDateISO(m.date)),
        apparieDoc: null
    }));

    function associer(fffItem, docItem) {
        fffItem.apparieDoc = docItem;
        docItem.apparie = true;
    }

    // Passe 1 : même équipe + même club + même date exacte (ou ±3 jours) + même type coupe/championnat
    for (const f of fffItems) {
        if (f.apparieDoc) continue;
        const cand = existants.find(d =>
            !d.apparie &&
            d.equipe === f.equipe &&
            d.club && d.club === f.club &&
            d.coupe === f.coupe &&
            ecartJours(d.dateISO, f.dateISO) <= 3
        );
        if (cand) associer(f, cand);
    }

    // Passe 2 : même équipe + même club + même type coupe/championnat + même phase (Aller/Retour)
    // (rattrape les matchs reportés comme St-Paul Despo 24/10 -> 08/11 ou St-Perdon 24/10 -> 14/11)
    for (const f of fffItems) {
        if (f.apparieDoc) continue;
        const cand = existants.find(d =>
            !d.apparie &&
            d.equipe === f.equipe &&
            d.club && d.club === f.club &&
            d.coupe === f.coupe &&
            (d.phase === f.phase || d.phase === 'inconnue')
        );
        if (cand) associer(f, cand);
    }

    // Passe 3 : même équipe + date exacte + même type coupe/championnat
    // (ex: 11/10/2026 "St-Paul Sports (Coupe des Landes)" renommé en "St-Paul Despo (Coupe des Landes)")
    for (const f of fffItems) {
        if (f.apparieDoc) continue;
        const cand = existants.find(d =>
            !d.apparie &&
            d.equipe === f.equipe &&
            d.coupe === f.coupe &&
            d.dateISO && d.dateISO === f.dateISO
        );
        if (cand) associer(f, cand);
    }

    // Passe 4 : même équipe + même club + même date (±3 jours), même si "(Coupe ...)" a été retiré par l'admin
    for (const f of fffItems) {
        if (f.apparieDoc) continue;
        const cand = existants.find(d =>
            !d.apparie &&
            d.equipe === f.equipe &&
            d.club && d.club === f.club &&
            ecartJours(d.dateISO, f.dateISO) <= 3
        );
        if (cand) associer(f, cand);
    }

    const aAjouter = [];
    const aMettreAJour = [];
    const aSupprimer = [];
    let proteges = 0;

    // Traitement des matchs officiels FFF
    for (const f of fffItems) {
        const m = f.match;
        const docItem = f.apparieDoc;

        if (!docItem) {
            // Match absent de Firestore -> on l'ajoute proprement
            aAjouter.push({
                equipe_type: m.equipe_type,
                adversaire: m.adversaire,
                date: m.date,
                logo: trouverLogoClub(m.adversaire),
                score_chalosse: m.score_chalosse,
                score_adversaire: m.score_adversaire,
                compo: []
            });
            continue;
        }

        const data = docItem.data;
        const logoAuto = !data.logo ? trouverLogoClub(data.adversaire || m.adversaire) : '';

        if (docItem.estProtege) {
            // RÈGLE D'OR : match avec score, compo, stats, notes ou édition manuelle -> INTACT !
            proteges++;
            if (logoAuto) {
                aMettreAJour.push({ id: docItem.id, patch: { logo: logoAuto }, type: 'logo' });
            }
            continue;
        }

        // Match existant SANS score, SANS compo, SANS stats, SANS notes et NON modifié manuellement :
        // on peut compléter son score officiel et/ou sa date officielle si reportée.
        const patch = {};
        let modifMatch = false;

        if (m.score_chalosse !== null && m.score_adversaire !== null) {
            patch.score_chalosse = m.score_chalosse;
            patch.score_adversaire = m.score_adversaire;
            modifMatch = true;
        }
        if (f.dateISO && docItem.dateISO !== f.dateISO) {
            patch.date = f.dateISO;
            modifMatch = true;
        }
        if (logoAuto) {
            patch.logo = logoAuto;
        }

        if (modifMatch) {
            aMettreAJour.push({ id: docItem.id, patch, type: 'match' });
        } else if (logoAuto) {
            aMettreAJour.push({ id: docItem.id, patch: { logo: logoAuto }, type: 'logo' });
        }
    }

    // Nettoyage sécurisé des doublons strictement vides (sans compo, sans stats, sans notes, non manuels)
    // issus d'anciennes synchronisations ou d'un décalage de date.
    const empreintesPaires = fffItems
        .filter(f => f.apparieDoc)
        .map(f => ({
            equipe: f.equipe,
            club: f.club,
            coupe: f.coupe,
            phase: f.phase,
            dateISO: f.apparieDoc.dateISO,
            scoreC: f.apparieDoc.data.score_chalosse,
            scoreA: f.apparieDoc.data.score_adversaire,
            aScore: f.apparieDoc.aScore
        }));

    for (const d of existants) {
        if (d.apparie) continue;

        // Jamais supprimer un match avec compo, stats, notes ou modification manuelle
        if (d.aCompo || d.aNotes || d.manuel) {
            proteges++;
            const logoAuto = !d.data.logo ? trouverLogoClub(d.data.adversaire) : '';
            if (logoAuto) aMettreAJour.push({ id: d.id, patch: { logo: logoAuto }, type: 'logo' });
            continue;
        }

        // Vérifie si ce document non apparié est un doublon d'un match déjà apparié
        const estDoublonVide = !d.aScore && empreintesPaires.some(p =>
            p.equipe === d.equipe && (
                (d.club && p.club === d.club && p.coupe === d.coupe && (p.phase === d.phase || d.phase === 'inconnue')) ||
                (d.dateISO && p.dateISO === d.dateISO && d.club && p.club === d.club)
            )
        );

        const estCloneIdentiqueSansCompo = d.aScore && empreintesPaires.some(p =>
            p.equipe === d.equipe &&
            d.club && p.club === d.club &&
            p.coupe === d.coupe &&
            p.phase === d.phase &&
            p.aScore &&
            Number(p.scoreC) === Number(d.data.score_chalosse) &&
            Number(p.scoreA) === Number(d.data.score_adversaire)
        );

        if (estDoublonVide || estCloneIdentiqueSansCompo) {
            aSupprimer.push(d.id);
        } else {
            if (d.aScore) proteges++;
            const logoAuto = !d.data.logo ? trouverLogoClub(d.data.adversaire) : '';
            if (logoAuto) aMettreAJour.push({ id: d.id, patch: { logo: logoAuto }, type: 'logo' });
        }
    }

    return { aAjouter, aMettreAJour, aSupprimer, proteges };
}
