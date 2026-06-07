import { useEffect, useState } from 'react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import AdminMatchEditor from '../components/AdminMatchEditor.jsx';
import LoadingState from '../components/LoadingState.jsx';
import { supabase } from '../lib/supabaseClient.js';
import { formatDateTime } from '../utils/dateLock.js';

export default function AdminMatches() {
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function loadMatches() {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .order('match_number', { ascending: true, nullsFirst: false })
      .order('match_date', { ascending: true, nullsFirst: false });

    setMatches(data || []);
    setMessage(error?.message || '');
    setLoading(false);
  }

  useEffect(() => {
    loadMatches();
  }, []);

  async function saveMatch(payload, id) {
    setSaving(true);
    setMessage('');
    const result = id
      ? await supabase.from('matches').update(payload).eq('id', id)
      : await supabase.from('matches').insert(payload);

    setSaving(false);
    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    setMessage(id ? 'Partido actualizado' : 'Partido creado');
    setSelectedMatch(null);
    setShowNew(false);
    await loadMatches();
  }

  async function deleteMatch(id) {
    const confirmed = window.confirm('¿Eliminar este partido? También se eliminarán sus pronósticos por cascada.');
    if (!confirmed) return;

    const { error } = await supabase.from('matches').delete().eq('id', id);
    setMessage(error ? error.message : 'Partido eliminado');
    await loadMatches();
  }

  if (loading) return <LoadingState text="Cargando partidos del admin..." />;

  return (
    <div className="container-page space-y-6 pb-24 md:pb-10">
      <section className="panel p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-gold">Admin</p>
            <h1 className="text-3xl font-black text-white">Gestión de partidos</h1>
          </div>
          <button className="btn-primary" onClick={() => { setSelectedMatch(null); setShowNew(true); }}><Plus className="h-4 w-4" /> Crear partido</button>
        </div>
      </section>

      {(showNew || selectedMatch) && (
        <AdminMatchEditor match={selectedMatch} saving={saving} onSave={saveMatch} onCancel={() => { setSelectedMatch(null); setShowNew(false); }} />
      )}

      {message && <p className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-slate-100">{message}</p>}

      <section className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-slate-950/40 text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-4 text-left">#</th>
                <th className="px-5 py-4 text-left">Partido</th>
                <th className="px-5 py-4 text-left">Fase</th>
                <th className="px-5 py-4 text-left">Fecha</th>
                <th className="px-5 py-4 text-left">Estado</th>
                <th className="px-5 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {matches.map((match) => (
                <tr key={match.id}>
                  <td className="px-5 py-4 font-bold text-slate-200">{match.match_number || match.id}</td>
                  <td className="px-5 py-4 font-bold text-white">{match.home_team || 'TBD'} vs {match.away_team || 'TBD'}</td>
                  <td className="px-5 py-4 text-slate-300">{match.phase || '—'}</td>
                  <td className="px-5 py-4 text-slate-300">{formatDateTime(match.match_date)}</td>
                  <td className="px-5 py-4"><span className="badge bg-white/10 text-slate-200">{match.status}</span></td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button className="btn-secondary px-3 py-2" onClick={() => { setSelectedMatch(match); setShowNew(false); }}><Edit className="h-4 w-4" /></button>
                      <button className="btn-danger px-3 py-2" onClick={() => deleteMatch(match.id)}><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!matches.length && (
                <tr><td colSpan="6" className="px-5 py-10 text-center text-slate-300">No hay partidos cargados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
