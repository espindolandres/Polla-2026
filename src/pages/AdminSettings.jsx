import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import LoadingState from '../components/LoadingState.jsx';
import { supabase } from '../lib/supabaseClient.js';
import { fromDateTimeLocalValue, toDateTimeLocalValue } from '../utils/dateLock.js';

const defaultScoring = {
  exact_score: 3,
  correct_result: 1,
  champion: 5,
  runner_up: 3,
};

export default function AdminSettings() {
  const [scoring, setScoring] = useState(defaultScoring);
  const [bonusLockAt, setBonusLockAt] = useState('');
  const [officialResult, setOfficialResult] = useState({ champion: '', runner_up: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from('settings').select('*').in('key', ['scoring_rules', 'bonus_lock_at', 'official_result']);
      if (!error) {
        const map = Object.fromEntries((data || []).map((row) => [row.key, row.value]));
        setScoring({ ...defaultScoring, ...(map.scoring_rules || {}) });
        setBonusLockAt(toDateTimeLocalValue(map.bonus_lock_at?.lock_at));
        setOfficialResult({ champion: map.official_result?.champion || '', runner_up: map.official_result?.runner_up || '' });
      } else {
        setMessage(error.message);
      }
      setLoading(false);
    }
    load();
  }, []);

  function updateScoring(field, value) {
    setScoring((current) => ({ ...current, [field]: Number(value) }));
  }

  async function saveSettings(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    const rows = [
      { key: 'scoring_rules', value: scoring },
      { key: 'bonus_lock_at', value: { lock_at: fromDateTimeLocalValue(bonusLockAt) } },
      { key: 'official_result', value: { champion: officialResult.champion.trim() || null, runner_up: officialResult.runner_up.trim() || null } },
    ];

    const { error } = await supabase.from('settings').upsert(rows, { onConflict: 'key' });
    if (!error) {
      await supabase.rpc('recalculate_all_points');
    }

    setSaving(false);
    setMessage(error ? error.message : 'Configuración guardada y puntos recalculados');
  }

  if (loading) return <LoadingState text="Cargando configuración..." />;

  return (
    <div className="container-page space-y-6 pb-24 md:pb-10">
      <section className="panel p-6">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-gold">Admin</p>
        <h1 className="mt-2 text-3xl font-black text-white">Configuración</h1>
        <p className="mt-3 text-slate-300">Edita reglas de puntuación, fecha de bloqueo de bonus y resultado oficial final.</p>
      </section>

      <form onSubmit={saveSettings} className="panel p-6">
        <h2 className="text-2xl font-black text-white">Reglas de puntuación</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label>
            <span className="label">Marcador exacto</span>
            <input className="field mt-2" type="number" min="0" value={scoring.exact_score} onChange={(e) => updateScoring('exact_score', e.target.value)} />
          </label>
          <label>
            <span className="label">Resultado acertado</span>
            <input className="field mt-2" type="number" min="0" value={scoring.correct_result} onChange={(e) => updateScoring('correct_result', e.target.value)} />
          </label>
          <label>
            <span className="label">Campeón</span>
            <input className="field mt-2" type="number" min="0" value={scoring.champion} onChange={(e) => updateScoring('champion', e.target.value)} />
          </label>
          <label>
            <span className="label">Subcampeón</span>
            <input className="field mt-2" type="number" min="0" value={scoring.runner_up} onChange={(e) => updateScoring('runner_up', e.target.value)} />
          </label>
        </div>

        <h2 className="mt-8 text-2xl font-black text-white">Pronósticos especiales</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <label>
            <span className="label">Fecha límite</span>
            <input className="field mt-2" type="datetime-local" value={bonusLockAt} onChange={(e) => setBonusLockAt(e.target.value)} />
          </label>
          <label>
            <span className="label">Campeón oficial</span>
            <input className="field mt-2" value={officialResult.champion} onChange={(e) => setOfficialResult({ ...officialResult, champion: e.target.value })} />
          </label>
          <label>
            <span className="label">Subcampeón oficial</span>
            <input className="field mt-2" value={officialResult.runner_up} onChange={(e) => setOfficialResult({ ...officialResult, runner_up: e.target.value })} />
          </label>
        </div>

        <div className="mt-6 flex justify-end">
          <button className="btn-primary" disabled={saving}><Save className="h-4 w-4" /> {saving ? 'Guardando...' : 'Guardar configuración'}</button>
        </div>

        {message && <p className="mt-4 rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-slate-100">{message}</p>}
      </form>
    </div>
  );
}
