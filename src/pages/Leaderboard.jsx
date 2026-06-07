import { useEffect, useState } from 'react';
import LeaderboardTable from '../components/LeaderboardTable.jsx';
import LoadingState from '../components/LoadingState.jsx';
import { supabase } from '../lib/supabaseClient.js';

export default function Leaderboard() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadLeaderboard() {
      const { data, error: requestError } = await supabase
        .from('leaderboard_view')
        .select('*')
        .order('total_points', { ascending: false })
        .order('exact_scores', { ascending: false })
        .order('correct_results', { ascending: false });

      setRows(data || []);
      setError(requestError?.message || '');
      setLoading(false);
    }

    loadLeaderboard();
  }, []);

  if (loading) return <LoadingState text="Cargando tabla..." />;

  return (
    <div className="container-page space-y-6 pb-24 md:pb-10">
      <section className="panel p-6">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-gold">Competencia</p>
        <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">Tabla de posiciones</h1>
        <p className="mt-3 text-slate-300">Ordenada por puntos, marcadores exactos y resultados acertados.</p>
      </section>

      {error && <p className="rounded-2xl bg-rose-500/15 px-4 py-3 text-sm font-semibold text-rose-100">{error}</p>}
      <LeaderboardTable rows={rows} search={search} onSearchChange={setSearch} />
    </div>
  );
}
