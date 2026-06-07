import { createClient } from '@supabase/supabase-js';

const REQUIRED_ENV = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const PROVIDER = process.env.RESULTS_PROVIDER || 'api-football';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY;
const API_FOOTBALL_LEAGUE_ID = process.env.API_FOOTBALL_LEAGUE_ID || '1';
const API_FOOTBALL_SEASON = process.env.API_FOOTBALL_SEASON || '2026';
const API_FOOTBALL_BASE_URL = process.env.API_FOOTBALL_BASE_URL || 'https://v3.football.api-sports.io';
const DRY_RUN = process.env.DRY_RUN === 'true';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/gi, ' ')
    .trim()
    .toLowerCase();
}

function isSameVenue(localMatch, apiMatch) {
  const localVenue = normalizeText(`${localMatch.stadium || ''} ${localMatch.city || ''}`);
  const apiVenue = normalizeText(`${apiMatch.stadium || ''} ${apiMatch.city || ''}`);
  if (!localVenue || !apiVenue) return false;
  const localWords = new Set(localVenue.split(' ').filter(Boolean));
  const apiWords = apiVenue.split(' ').filter(Boolean);
  const overlap = apiWords.filter((word) => localWords.has(word));
  return overlap.length >= 2 || localVenue.includes(apiVenue) || apiVenue.includes(localVenue);
}

function hoursBetween(a, b) {
  return Math.abs(new Date(a).getTime() - new Date(b).getTime()) / 36e5;
}

function mapApiFootballStatus(shortStatus) {
  const status = String(shortStatus || '').toUpperCase();
  if (['FT', 'AET', 'PEN', 'AWD', 'WO'].includes(status)) return 'finished';
  if (['1H', 'HT', '2H', 'ET', 'BT', 'P', 'SUSP', 'INT', 'LIVE'].includes(status)) return 'live';
  return 'scheduled';
}

function hasScore(value) {
  return Number.isInteger(value) && value >= 0;
}

function parseApiFootballFixture(item) {
  const fixture = item.fixture || {};
  const teams = item.teams || {};
  const goals = item.goals || {};
  const venue = fixture.venue || {};
  const status = fixture.status || {};

  return {
    provider: 'api-football',
    external_fixture_id: fixture.id ? String(fixture.id) : null,
    match_date: fixture.date || null,
    stadium: venue.name || null,
    city: venue.city || null,
    home_team: teams.home?.name || null,
    away_team: teams.away?.name || null,
    home_score: hasScore(goals.home) ? goals.home : null,
    away_score: hasScore(goals.away) ? goals.away : null,
    status: mapApiFootballStatus(status.short),
    provider_status: status.short || null,
    elapsed: status.elapsed || null,
  };
}

async function fetchApiFootballFixtures() {
  if (!API_FOOTBALL_KEY) {
    throw new Error('Falta API_FOOTBALL_KEY. Crea una cuenta en API-Football/API-SPORTS y guarda la llave como secret en GitHub.');
  }

  const url = new URL('/fixtures', API_FOOTBALL_BASE_URL);
  url.searchParams.set('league', API_FOOTBALL_LEAGUE_ID);
  url.searchParams.set('season', API_FOOTBALL_SEASON);

  const response = await fetch(url, {
    headers: {
      'x-apisports-key': API_FOOTBALL_KEY,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`API-Football respondio ${response.status}: ${body.slice(0, 500)}`);
  }

  const json = await response.json();
  const apiErrors = json.errors && Object.keys(json.errors).length > 0 ? JSON.stringify(json.errors) : '';
  if (apiErrors) throw new Error(`API-Football errors: ${apiErrors}`);

  return (json.response || []).map(parseApiFootballFixture).filter((match) => match.external_fixture_id);
}

async function getLocalMatches() {
  const { data, error } = await supabase
    .from('matches')
    .select('id, match_number, phase, group_name, home_team, away_team, match_date, stadium, city, home_score, away_score, status, external_provider, external_fixture_id')
    .order('match_number', { ascending: true, nullsFirst: false });

  if (error) throw error;
  return data || [];
}

function findLocalMatch(apiMatch, localMatches) {
  const linked = localMatches.find(
    (match) => match.external_provider === apiMatch.provider && match.external_fixture_id === apiMatch.external_fixture_id,
  );
  if (linked) return linked;

  const candidates = localMatches
    .filter((match) => !match.external_fixture_id)
    .filter((match) => match.match_date && apiMatch.match_date)
    .filter((match) => hoursBetween(match.match_date, apiMatch.match_date) <= 3)
    .filter((match) => isSameVenue(match, apiMatch));

  if (candidates.length === 1) return candidates[0];

  const teamCandidates = candidates.filter((match) => {
    const localHome = normalizeText(match.home_team);
    const localAway = normalizeText(match.away_team);
    const apiHome = normalizeText(apiMatch.home_team);
    const apiAway = normalizeText(apiMatch.away_team);
    return localHome && localAway && apiHome && apiAway && localHome === apiHome && localAway === apiAway;
  });

  if (teamCandidates.length === 1) return teamCandidates[0];
  return null;
}

function shouldReplaceTeam(localTeam, apiTeam) {
  if (!apiTeam) return false;
  const local = normalizeText(localTeam);
  return !local || ['tbd', 'por definir', 'pendiente'].includes(local) || local.includes('winner') || local.includes('ganador');
}

function buildUpdate(localMatch, apiMatch) {
  const update = {
    external_provider: apiMatch.provider,
    external_fixture_id: apiMatch.external_fixture_id,
    last_synced_at: new Date().toISOString(),
    sync_note: `API status ${apiMatch.provider_status || 'unknown'}${apiMatch.elapsed ? `, ${apiMatch.elapsed} min` : ''}`,
  };

  if (apiMatch.match_date) update.match_date = apiMatch.match_date;
  if (apiMatch.stadium) update.stadium = apiMatch.stadium;
  if (apiMatch.city) update.city = apiMatch.city;
  if (shouldReplaceTeam(localMatch.home_team, apiMatch.home_team)) update.home_team = apiMatch.home_team;
  if (shouldReplaceTeam(localMatch.away_team, apiMatch.away_team)) update.away_team = apiMatch.away_team;

  update.status = apiMatch.status;

  if (apiMatch.status === 'live' || apiMatch.status === 'finished') {
    update.home_score = apiMatch.home_score;
    update.away_score = apiMatch.away_score;
  }

  if (apiMatch.status === 'scheduled') {
    update.home_score = null;
    update.away_score = null;
  }

  return update;
}

function didChange(localMatch, update) {
  return Object.entries(update).some(([key, value]) => {
    if (key === 'last_synced_at' || key === 'sync_note') return false;
    return (localMatch[key] ?? null) !== (value ?? null);
  });
}

async function insertAutomationRun(run) {
  const { error } = await supabase.from('automation_runs').insert(run);
  if (error) console.warn('No se pudo guardar automation_runs:', error.message);
}

async function main() {
  const startedAt = new Date().toISOString();
  let matchesSeen = 0;
  let matchesUpdated = 0;
  const messages = [];

  try {
    if (PROVIDER !== 'api-football') {
      throw new Error(`Proveedor no soportado: ${PROVIDER}`);
    }

    const [apiMatches, localMatches] = await Promise.all([fetchApiFootballFixtures(), getLocalMatches()]);
    matchesSeen = apiMatches.length;

    for (const apiMatch of apiMatches) {
      const localMatch = findLocalMatch(apiMatch, localMatches);
      if (!localMatch) {
        messages.push(`Sin match local para fixture externo ${apiMatch.external_fixture_id} ${apiMatch.home_team || 'TBD'} vs ${apiMatch.away_team || 'TBD'} ${apiMatch.match_date || ''}`);
        continue;
      }

      const update = buildUpdate(localMatch, apiMatch);
      if (!didChange(localMatch, update) && localMatch.external_fixture_id) continue;

      if (DRY_RUN) {
        console.log('[DRY RUN]', localMatch.match_number, localMatch.home_team, 'vs', localMatch.away_team, update);
        matchesUpdated += 1;
        continue;
      }

      const { error } = await supabase.from('matches').update(update).eq('id', localMatch.id);
      if (error) {
        messages.push(`Error actualizando partido ${localMatch.match_number || localMatch.id}: ${error.message}`);
      } else {
        matchesUpdated += 1;
        Object.assign(localMatch, update);
        console.log(`Actualizado partido #${localMatch.match_number || localMatch.id}: ${localMatch.home_team || 'TBD'} vs ${localMatch.away_team || 'TBD'} -> ${update.status}`);
      }
    }

    await insertAutomationRun({
      source: PROVIDER,
      status: messages.length > 0 ? 'warning' : 'ok',
      started_at: startedAt,
      finished_at: new Date().toISOString(),
      matches_seen: matchesSeen,
      matches_updated: matchesUpdated,
      message: messages.slice(0, 20).join('\n') || `Sincronizacion completada. Actualizados: ${matchesUpdated}`,
    });

    if (messages.length > 0) {
      console.warn(messages.join('\n'));
    }
    console.log(`Listo. Vistos: ${matchesSeen}. Actualizados: ${matchesUpdated}.`);
  } catch (error) {
    await insertAutomationRun({
      source: PROVIDER,
      status: 'error',
      started_at: startedAt,
      finished_at: new Date().toISOString(),
      matches_seen: matchesSeen,
      matches_updated: matchesUpdated,
      message: error.message,
    });
    console.error(error);
    process.exit(1);
  }
}

main();
