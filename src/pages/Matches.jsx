import { useEffect, useState } from 'react';
import EmptyState from '../components/EmptyState.jsx';
import LoadingState from '../components/LoadingState.jsx';
import MatchCard from '../components/MatchCard.jsx';
import { supabase } from '../lib/supabaseClient.js';
import { groupMatchesByPhase } from '../utils/grouping.js';

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      const { data, error: requestError } = await supabase
        .from('matches')
        .select('*')
        .order('match_date', { ascending: true, nullsFirst: false })
        .order('match_number', { ascending: true, nullsFirst: false });
      setMatches(data || []);
      setError(requestError?.message || '');
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <LoadingState text="Cargando partidos..." />;

  const grouped = groupMatchesByPhase(matches);

  return (
    <div className="container-page space-y-6 pb-24 md:pb-10">
      <section className="panel p-6">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-gold">Calendario</p>
        <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">Partidos del torneo</h1>
        <p className="mt-3 text-slate-300">Vista de solo lectura para revisar fases, sedes, estados y resultados.</p>
      </section>

      {error && <p className="rounded-2xl bg-rose-500/15 px-4 py-3 text-sm font-semibold text-rose-100">{error}</p>}
      {!matches.length && <EmptyState title="No hay partidos cargados" description="Carga el calendario desde el panel administrador." />}

      {grouped.map(([phase, phaseMatches]) => (
        <section key={phase} className="space-y-4">
          <h2 className="text-2xl font-black text-white">{phase}</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {phaseMatches.map((match) => <MatchCard key={match.id} match={match} />)}
          </div>
        </section>
      ))}
    </div>
  );
}
