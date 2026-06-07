import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DRY_RUN = process.env.DRY_RUN === 'true';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const now = new Date().toISOString();
const { data, error } = await supabase
  .from('matches')
  .select('id, match_number, home_team, away_team, match_date, status')
  .eq('status', 'scheduled')
  .lte('match_date', now);

if (error) throw error;

const matches = data || [];
console.log(`Partidos scheduled ya iniciados: ${matches.length}`);

for (const match of matches) {
  console.log(`#${match.match_number}: ${match.home_team || 'TBD'} vs ${match.away_team || 'TBD'} (${match.match_date})`);
  if (!DRY_RUN) {
    const { error: updateError } = await supabase
      .from('matches')
      .update({ status: 'live', last_synced_at: now, sync_note: 'Marcado live automaticamente por fecha de inicio' })
      .eq('id', match.id);
    if (updateError) throw updateError;
  }
}
