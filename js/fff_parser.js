// Parseur et associeur intelligent de feuilles de match FFF (epreuves.fff.fr)
// Module JS pur sans dépendance Firebase, testable directement sous Node.js.

/**
 * Normalise une chaîne pour la comparaison (sans accents, minuscules, espaces nettoyés).
 */
export function normaliserNom(str) {
    return String(str || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function capitaliserMot(mot) {
    if (!mot) return '';
    return mot
        .split('-')
        .map(part => part ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : '')
        .join('-');
}

/**
 * Formate un nom brut issu d'une feuille FFF (ex: "LOIK P.", "GUILLAUME ALEXANDRE R.", "Jean-Luc Dupont")
 * en { prenom, nom } propres pour l'affichage ou la création dans Firestore.
 */
export function formaterNomPrenomFFF(nomBrut) {
    const propre = String(nomBrut || '')
        .replace(/\s+/g, ' ')
        .trim();
    if (!propre) return { prenom: '', nom: '' };

    const tokens = propre.split(' ').filter(Boolean);
    if (tokens.length === 1) {
        return { prenom: capitaliserMot(tokens[0].replace(/\.+$/, '')), nom: '' };
    }

    const dernier = tokens[tokens.length - 1];
    const dernierSansPoint = dernier.replace(/\.+$/, '');
    if (/^[a-zA-ZÀ-ÿ]$/.test(dernierSansPoint)) {
        const prenom = tokens.slice(0, -1).map(t => capitaliserMot(t.replace(/\.+$/, ''))).join(' ');
        const nom = `${dernierSansPoint.toUpperCase()}.`;
        return { prenom, nom };
    }

    const prenom = capitaliserMot(tokens[0].replace(/\.+$/, ''));
    const nom = tokens.slice(1).map(t => capitaliserMot(t.replace(/\.+$/, ''))).join(' ');
    return { prenom, nom };
}

/**
 * Construit un index pré-normalisé à partir de la liste des joueurs de l'effectif.
 */
export function construireIndexJoueurs(listeJoueurs) {
    return (listeJoueurs || [])
        .filter(j => j && j.id && (j.prenom || j.nom || j.nomComplet))
        .map(j => {
            let prenom = String(j.prenom || '').trim();
            let nom = String(j.nom || '').trim();
            const nomCompletBrut = String(j.nomComplet || `${prenom} ${nom}`).trim();

            if (!prenom && nomCompletBrut.includes(' ')) {
                const parts = nomCompletBrut.split(/\s+/);
                prenom = parts[0];
                nom = parts.slice(1).join(' ');
            } else if (!nom && nomCompletBrut.includes(' ')) {
                const parts = nomCompletBrut.split(/\s+/);
                prenom = parts[0];
                nom = parts.slice(1).join(' ');
            }

            const prenomNorm = normaliserNom(prenom);
            const nomNorm = normaliserNom(nom);
            const prenomSansTiret = prenomNorm.replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
            const nomSansTiret = nomNorm.replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
            const complet1 = [prenomNorm, nomNorm].filter(Boolean).join(' ');
            const complet2 = [nomNorm, prenomNorm].filter(Boolean).join(' ');

            // Tous les mots du nom complet du joueur
            const tokens = normaliserNom(nomCompletBrut).split(' ').filter(Boolean);
            const initiales = new Set(tokens.map(t => t[0]));

            return {
                id: j.id,
                prenom,
                nom,
                nomComplet: j.nomComplet || `${prenom} ${nom}`.trim() || nomCompletBrut,
                poste: j.poste || 'Milieu',
                numero: j.numero ?? null,
                prenomNorm,
                nomNorm,
                prenomSansTiret,
                nomSansTiret,
                complet1,
                complet2,
                tokens,
                initiales
            };
        });
}

function levenshtein(a, b) {
    if (a === b) return 0;
    const la = a.length, lb = b.length;
    if (la === 0) return lb;
    if (lb === 0) return la;
    const prev = Array.from({ length: lb + 1 }, (_, j) => j);
    for (let i = 1; i <= la; i++) {
        let diag = prev[0];
        prev[0] = i;
        for (let j = 1; j <= lb; j++) {
            const tmp = prev[j];
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + cost);
            diag = tmp;
        }
    }
    return prev[lb];
}

function dedupCandidats(liste) {
    const vus = new Set();
    return liste.filter(j => {
        if (!j || vus.has(j.id)) return false;
        vus.add(j.id);
        return true;
    });
}

function conclureAssociation(candidats, niveauSiUnique) {
    const uniques = dedupCandidats(candidats);
    if (uniques.length === 1) {
        return { statut: niveauSiUnique, candidatId: uniques[0].id, candidats: uniques };
    }
    if (uniques.length > 1) {
        return { statut: 'ambigu', candidatId: null, candidats: uniques };
    }
    return null;
}

/**
 * Associe un nom issu d'une feuille FFF (ex: "10 THIBAUT C.") aux joueurs de l'index.
 * Retourne { statut: 'exact'|'probable'|'ambigu'|'nouveau'|'anonyme', candidatId, candidats }.
 */
export function associerJoueurFFF(nomBrut, indexJoueurs) {
    const norm = normaliserNom(nomBrut);
    if (!norm || norm === 'anonyme' || norm.startsWith('anonyme ') || norm.startsWith('joueur anonyme')) {
        return { statut: 'anonyme', candidatId: null, candidats: [] };
    }

    const normNoDash = norm.replace(/-/g, ' ').replace(/\s+/g, ' ').trim();

    // Tier 1 : correspondance exacte complète (Prénom Nom ou Nom Prénom)
    const tier1 = indexJoueurs.filter(j => {
        const c1 = j.complet1.replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
        const c2 = j.complet2.replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
        return j.complet1 === norm || j.complet2 === norm || c1 === normNoDash || c2 === normNoDash;
    });
    const res1 = conclureAssociation(tier1, 'exact');
    if (res1) return res1;

    const tokens = norm.split(' ').filter(Boolean);

    // Format FFF typique : "PRENOM(S) INITIALE" (ex: "thibaut c", "guillaume alexandre r")
    if (tokens.length >= 2 && tokens[tokens.length - 1].length === 1) {
        const init = tokens[tokens.length - 1];
        const prenomFFF = tokens.slice(0, -1).join(' ');
        const prenomFFFNoDash = prenomFFF.replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
        const premierMotFFF = prenomFFFNoDash.split(' ')[0];

        // Joueurs qui possèdent cette initiale (dans le nom, le prénom, ou n'importe quel mot de leur nom complet)
        const memeInit = indexJoueurs.filter(j => 
            (j.nomNorm && j.nomNorm.startsWith(init)) ||
            (j.prenomNorm && j.prenomNorm.startsWith(init)) ||
            (j.initiales && j.initiales.has(init))
        );

        const estPrenomIdentique = (j, cible) => {
            return j.prenomSansTiret === cible || j.nomSansTiret === cible || (j.tokens && j.tokens.includes(cible));
        };

        // Tier 2a : Prénom exact + initiale exacte
        const tier2a = memeInit.filter(j => estPrenomIdentique(j, prenomFFFNoDash));
        const res2a = conclureAssociation(tier2a, 'exact');
        if (res2a) return res2a;

        // Tier 2b : Prénom composé / premier mot du prénom + initiale exacte (ex: "GUILLAUME ALEXANDRE R." <-> "Guillaume Roussel")
        const tier2b = memeInit.filter(j => {
            const premJ1 = (j.prenomSansTiret || '').split(' ')[0];
            const premJ2 = (j.nomSansTiret || '').split(' ')[0];
            return (
                (premJ1 && (premJ1 === premierMotFFF || j.prenomSansTiret.startsWith(prenomFFFNoDash) || prenomFFFNoDash.startsWith(j.prenomSansTiret))) ||
                (premJ2 && (premJ2 === premierMotFFF || j.nomSansTiret.startsWith(prenomFFFNoDash) || prenomFFFNoDash.startsWith(j.nomSansTiret))) ||
                (j.tokens && j.tokens.includes(premierMotFFF))
            );
        });
        const res2b = conclureAssociation(tier2b, 'probable');
        if (res2b) return res2b;

        // Tier 3 : Tolérance orthographique sur le prénom + initiale exacte (ex: LOIK <-> Loïc, MATIS <-> Mathis)
        const tier3 = memeInit.filter(j => {
            const cibles = [j.prenomSansTiret, j.nomSansTiret, ...(j.tokens || [])].filter(Boolean);
            return cibles.some(c => {
                const dist1 = levenshtein(c, prenomFFFNoDash);
                if (dist1 <= 1) return true;
                if (dist1 <= 2 && c.length >= 5 && prenomFFFNoDash.length >= 5 && c.slice(0, 3) === prenomFFFNoDash.slice(0, 3)) return true;
                const dist2 = levenshtein(c, premierMotFFF);
                if (dist2 <= 1) return true;
                return false;
            });
        });
        const res3 = conclureAssociation(tier3, 'probable');
        if (res3) return res3;

        // Tier 3b : Prénom unique dans tout l'effectif (même si l'initiale diffère légèrement ou nom de jeune fille / composé)
        const parPrenomSeul = indexJoueurs.filter(j => {
            const premJ = (j.prenomSansTiret || '').split(' ')[0];
            const premNom = (j.nomSansTiret || '').split(' ')[0];
            if (premJ === premierMotFFF || premNom === premierMotFFF) return true;
            if (j.tokens && j.tokens.includes(premierMotFFF)) return true;
            if (levenshtein(premJ, premierMotFFF) <= 1 || levenshtein(premNom, premierMotFFF) <= 1) return true;
            return false;
        });
        if (parPrenomSeul.length === 1) {
            return { statut: 'probable', candidatId: parPrenomSeul[0].id, candidats: parPrenomSeul };
        } else if (parPrenomSeul.length > 1) {
            return { statut: 'ambigu', candidatId: null, candidats: parPrenomSeul };
        }
    }

    // Tier 4 : Mot unique (saisie manuelle rapide par nom ou prénom seul)
    if (tokens.length === 1) {
        const tier4 = indexJoueurs.filter(j => j.nomNorm === norm || j.prenomNorm === norm);
        const res4 = conclureAssociation(tier4, 'probable');
        if (res4) return res4;
    }

    return { statut: 'nouveau', candidatId: null, candidats: [] };
}

function normMaj(s) {
    return String(s || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .replace(/\s+/g, ' ')
        .trim();
}

function estEnteteEquipeChalosse(u) {
    if (!u || !u.includes('CHALOSSE') || u.length > 50) return false;
    if (/^(BUT|CHANGEMENT|REMPLACEMENT|AVERTISSEMENT|EXPULSION|CARTON|DEBUT|FIN)\b/.test(u)) return false;
    if (/\bVS\b/.test(u)) return false;
    if (/\b\d+\s*[-–]\s*\d+\b/.test(u) || /\b\d+\s+\d+\b/.test(u)) return false;
    return true;
}

function estLigneDecorative(l, u) {
    if (!l) return true;
    if (/^\d{1,3}['’](\+\d+)?$/.test(u)) return true;
    if (/^\d+\s*[-–]\s*\d+$/.test(u)) return true;
    if (/^\(?C\)?$/.test(u) || u === 'CAPITAINE' || u === 'CAP.' || u === 'CAP') return true;
    if (!/[A-Z0-9]/.test(u)) return true;
    return false;
}

function nettoyerNomLigneFFF(str) {
    let s = String(str || '').trim();
    // Retire mentions de minute en fin de ligne (ex: "13'", "45'+2"), mentions capitaine, emojis
    s = s.replace(/\s+\d{1,3}\s*['’](?:\s*\+\s*\d+)?\b/g, ' ');
    s = s.replace(/\(\s*C\s*\)|\(\s*CAP\.?\s*\)/gi, ' ');
    s = s.replace(/\bCAPITAINE\b/gi, ' ');
    s = s.replace(/[^\p{L}\p{N}\s.'-]/gu, ' ');
    s = s.replace(/\s+/g, ' ').trim();
    // Supprime les points isolés ou en fin de mot complet (>1 lettre), mais garde le point après une initiale seule ("P.")
    s = s.replace(/(^|\s)([^\s.]{2,})\.+(?=\s|$)/g, '$1$2');
    return s.trim();
}

function extraireEvenementsResume(lignesResume) {
    const evenements = {};
    const majList = lignesResume.map(l => normMaj(l));

    function ajouterEvt(nomBrut, champ) {
        if (!nomBrut) return;
        let nettoye = nomBrut
            .replace(/\(\s*(?:P|S\.P\.|PENALTY|PEN|CSC|CONTRE SON CAMP)\s*\)/gi, ' ')
            .replace(/\b(?:PENALTY|S\.P\.)\b/gi, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        const cle = normaliserNom(nettoye);
        if (!cle || cle === 'anonyme' || cle.startsWith('anonyme ') || cle.startsWith('joueur anonyme')) return;
        if (!evenements[cle]) evenements[cle] = { buts: 0, jaunes: 0, rouges: 0 };
        evenements[cle][champ]++;
    }

    for (let i = 0; i < majList.length; i++) {
        const u = majList[i];
        const uNext = i + 1 < majList.length ? majList[i + 1] : '';

        // 1. But pour CHALOSSE (hors CSC)
        if (/BUT\s+POUR\s+.*CHALOSSE/.test(u) && !/\b(CSC|CONTRE SON CAMP)\b/.test(u)) {
            let matchBut = u.match(/INSCRIT\s+PAR\s+(.+)$/);
            let ligneSource = u;
            if (!matchBut && uNext) {
                matchBut = uNext.match(/INSCRIT\s+PAR\s+(.+)$/);
                ligneSource = uNext;
            }
            if (matchBut && !/\b(CSC|CONTRE SON CAMP)\b/.test(ligneSource)) {
                ajouterEvt(matchBut[1], 'buts');
            }
            continue;
        }

        // 2. Avertissement (carton jaune) pour CHALOSSE
        if (/AVERTISSEMENT\s+POUR\s+.*CHALOSSE/.test(u)) {
            let m = uNext.match(/^(.+?)\s+EST\s+AVERTI(?:\b|$)/);
            if (!m) {
                const sansClub = u.replace(/^.*?\bCHALOSSE(?:\s+F\.?\s*C\.?)?(?:\s+LAUREDE)?(?:\s*\d+)?\b\s*[-:–]?\s*/, '');
                m = sansClub.match(/^(.+?)\s+EST\s+AVERTI(?:\b|$)/);
            }
            if (m) ajouterEvt(m[1], 'jaunes');
            continue;
        }

        // 3. Expulsion (carton rouge) pour CHALOSSE
        if (/EXPULSION\s+POUR\s+.*CHALOSSE/.test(u)) {
            let m = uNext.match(/^(.+?)\s+EST\s+EXPULSE(?:\b|$)/);
            if (!m) {
                const sansClub = u.replace(/^.*?\bCHALOSSE(?:\s+F\.?\s*C\.?)?(?:\s+LAUREDE)?(?:\s*\d+)?\b\s*[-:–]?\s*/, '');
                m = sansClub.match(/^(.+?)\s+EST\s+EXPULSE(?:\b|$)/);
            }
            if (m) ajouterEvt(m[1], 'rouges');
        }
    }

    return evenements;
}

/**
 * Parse un copier-coller d'une feuille de match `epreuves.fff.fr` (ou une simple liste de noms).
 * Retourne { format: 'fff' | 'liste', titulaires: Array<{numero, nom}>, remplacants: Array<{numero, nom}>, evenements }.
 */
export function parserFeuilleFFF(texteBrut) {
    const brut = String(texteBrut || '');
    const lignes = brut
        .replace(/\r\n?/g, '\n')
        .split('\n')
        .map(l => l.replace(/\t+/g, ' ').trim())
        .filter(Boolean);

    if (lignes.length === 0) {
        return { format: 'liste', titulaires: [], remplacants: [], evenements: {} };
    }

    const idxCompo = lignes.findIndex(l => {
        const u = normMaj(l);
        return u === 'COMPOSITION' || u === 'COMPOSITIONS';
    });

    const aEnteteResume = lignes.some(l => {
        const u = normMaj(l);
        return u === 'RESUME' || u === 'DEBUT DU MATCH' || /^(BUT|AVERTISSEMENT|EXPULSION)\s+POUR\s+/.test(u);
    });

    const lignesResume = idxCompo !== -1
        ? lignes.slice(0, idxCompo)
        : (aEnteteResume ? lignes : []);
    const evenements = extraireEvenementsResume(lignesResume);

    let lignesCompo = idxCompo !== -1 ? lignes.slice(idxCompo + 1) : lignes;
    const idxChalosse = lignesCompo.findIndex(l => estEnteteEquipeChalosse(normMaj(l)));
    if (idxChalosse !== -1) {
        lignesCompo = lignesCompo.slice(idxChalosse + 1);
    }

    const titulaires = [];
    const remplacants = [];
    let mode = 'titulaires';
    let numeroEnAttente = null;
    let vuEnteteSectionFFF = idxCompo !== -1 || idxChalosse !== -1;
    let lignesNonStructurees = 0;

    const STOP_REGEX = /^(ARBITRES?|OFFICIELS?|ENCADREMENT|ENTRAINEURS?|EDUCATEURS?|DIRIGEANTS?|STAFF|DELEGUES?|AUTRES MATCHS|STATISTIQUES|MENTIONS LEGALES|PARTENAIRES|SUIVEZ|©)/;

    function ajouterJoueur(numero, nomBrut) {
        const nom = nettoyerNomLigneFFF(nomBrut);
        if (!nom) return;
        const n = (numero >= 1 && numero <= 20) ? numero : null;
        if (mode === 'titulaires' && titulaires.length < 11) {
            titulaires.push({ numero: n, nom });
        } else {
            remplacants.push({ numero: n, nom });
        }
    }

    for (const l of lignesCompo) {
        const u = normMaj(l);

        if (STOP_REGEX.test(u)) break;

        if (u === 'TITULAIRES' || u === 'TITULAIRE') {
            if (titulaires.length > 0) break; // Début de la composition de l'équipe adverse
            mode = 'titulaires';
            numeroEnAttente = null;
            vuEnteteSectionFFF = true;
            continue;
        }

        if (u === 'REMPLACANTS' || u === 'REMPLACANT') {
            mode = 'remplacants';
            numeroEnAttente = null;
            vuEnteteSectionFFF = true;
            continue;
        }

        if (estLigneDecorative(l, u)) continue;

        // Ligne contenant uniquement un numéro (ex: "1", "10", "N° 12")
        const mNum = l.match(/^(?:N°\s*)?(\d{1,2})\.?$/i);
        if (mNum) {
            const n = parseInt(mNum[1], 10);
            if (n >= 1 && n <= 20) {
                numeroEnAttente = n;
                continue;
            }
        }

        // Ligne "numéro + nom" (ex: "1 LOIK P.", "10. THIBAUT C.")
        const mNumNom = l.match(/^(?:N°\s*)?(\d{1,2})[\s.)\-–]+(.+)$/i);
        if (mNumNom) {
            const n = parseInt(mNumNom[1], 10);
            const reste = mNumNom[2].trim();
            if (n >= 1 && n <= 20 && reste && !/^['’]/.test(reste) && !/^min\b/i.test(reste) && !reste.includes(',')) {
                ajouterJoueur(n, reste);
                numeroEnAttente = null;
                continue;
            }
        }

        if (numeroEnAttente !== null) {
            ajouterJoueur(numeroEnAttente, l);
            numeroEnAttente = null;
            continue;
        }

        lignesNonStructurees++;
        // En mode remplaçants, une ligne sans numéro annonce typiquement le nom du club adverse avant son "TITULAIRES"
        if (mode === 'remplacants') {
            numeroEnAttente = null;
        }
    }

    const estStructureFFFValide = (titulaires.length > 0 || remplacants.length > 0) &&
        (vuEnteteSectionFFF || (lignesNonStructurees === 0 && (titulaires.length + remplacants.length) >= 2));

    if (estStructureFFFValide) {
        return {
            format: 'fff',
            titulaires,
            remplacants,
            evenements
        };
    }

    // Fallback : simple liste de noms séparés par retours à la ligne, virgules ou points-virgules
    const IGNORE_FALLBACK = new Set([
        'COMPOSITION', 'COMPOSITIONS', 'TITULAIRES', 'TITULAIRE', 'REMPLACANTS', 'REMPLACANT', 'RESUME', 'LE MATCH'
    ]);
    const items = brut
        .split(/[\n,;]+/)
        .map(s => s.trim())
        .filter(Boolean);

    const joueursListe = [];
    for (const item of items) {
        if (IGNORE_FALLBACK.has(normMaj(item))) continue;
        let num = null;
        let nomPart = item;
        const m = item.match(/^\s*(\d{1,2})[\s.)-]+(.+)$/);
        if (m) {
            const n = parseInt(m[1], 10);
            if (n >= 1 && n <= 20) num = n;
            nomPart = m[2];
        }
        nomPart = nomPart.replace(/\(.*?\)/g, ' ').replace(/\s+/g, ' ').trim();
        if (!nomPart) continue;
        joueursListe.push({ numero: num, nom: nomPart });
    }

    return {
        format: 'liste',
        titulaires: joueursListe.slice(0, 11),
        remplacants: joueursListe.slice(11),
        evenements
    };
}
