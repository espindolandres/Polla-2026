import { useEffect, useState } from 'react';
import { RefreshCcw, Save } from 'lucide-react';
import LoadingState from '../components/LoadingState.jsx';
import { supabase } from '../lib/supabaseClient.js';

export default function AdminResults() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [message, setMessage] = useState('');

  async function loadMatches() {
    const { data, error } = await supabase
      .from('matches')
      .select('*, predictions(count)')
      .order('match_number', { ascending: true, nullsFirst: false })
      .order('match_date', { ascending: true, nullsFirst: false });

    setMatches((data || []).map((match) => ({ ...match, draft_home_score: match.home_score ?? '', draft_away_score: match.away_score ?? '', draft_status: match.status })));
    setMessage(error?.message || '');
    setLoading(false);
  }

  useEffect(() => {
    loadMatches();
  }, []);

  function updateDraft(id, field, value) {
    setMatches((current) => current.map((match) => (match.id === id ? { ...match, [field]: value } : match)));
  }

  async function saveResult(match) {
    setSavingId(match.id);
    setMessage('');

    const { error } = await supabase
      .from('matches')
      .update({
        home_score: match.draft_home_score === '' ? null : Number(match.draft_home_score),
        away_score: match.draft_away_score === '' ? null : Number(match.draft_away_score),
        status: match.draft_status,
      })
      .eq('id', match.id);

    if (!error) {
      await supabase.rpc('recalculate_match_points', { p_match_id: match.id });
    }

    setSavingId(null);
    setMessage(error ? error.message : 'Resultado actualizado y puntos recalculados');
    await loadMatches();
  }

  async function recalculateAll() {
    setMessage('');
    const { error } = await supabase.rpc('recalculate_all_points');
    setMessage(error ? error.message : 'Todos los puntos fueron recalculados');
  }

  if (loading) return <LoadingState text="Cargando resultados..." />;

  return (
    <div className="container-page space-y-6 pb-24 md:pb-10">
      <section className="panel p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-gold">Admin</p>
            <h1 className="text-3xl font-black text-white">Resultados reales</h1>
            <p className="mt-2 text-slate-300">Al guardar un resultado se recalcula automáticamente ese partido.</p>
          </div>
          <button className="btn-secondary" onClick={recalculateAll}><RefreshCcw className="h-4 w-4" /> Recalcular todo</button>
        </div>
      </section>

      {message && <p className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-slate-100">{message}</p>}

      <section className="grid gap-4">
        {matches.map((match) => (
          <article key={match.id} className="panel p-5">
            <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr_1fr_auto] lg:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">#{match.match_number || match.id} · {match.phase}</p>
                <h2 className="mt-1 text-xl font-black text-white">{match.home_team || 'TBD'} vs {match.away_team || 'TBD'}</h2>
                <p className="mt-2 text-sm text-slate-300">Pronósticos recibidos: {match.predictions?.[0]?.count ?? 0}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label>
                  <span className="label">Local</span>
                  <input className="field mt-2" type="number" min="0" value={match.draft_home_score} onChange={(e) => updateDraft(match.id, 'draft_home_score', e.target.value)} />
                </label>
                <label>
                  <span className="label">Visitante</span>
                  <input className="field mt-2" type="number" min="0" value={match.draft_away_score} onChange={(e) => updateDraft(match.id, 'draft_away_score', e.target.value)} />
                </label>
              </div>
              <label>
                <span className="label">Estado</span>
                <select className="field mt-2" value={match.draft_status} onChange={(e) => updateDraft(match.id, 'draft_status', e.target.value)}>
                  <option value="scheduled">scheduled</option>
                  <option value="live">live</option>
                  <option value="finished">finished</option>
                </select>
              </label>
              <button className="btn-primary" onClick={() => saveResult(match)} disabled={savingId === match.id}><Save className="h-4 w-4" /> Guardar</button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
