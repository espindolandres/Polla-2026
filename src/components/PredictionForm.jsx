import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { supabase } from '../lib/supabaseClient.js';
import { useAuth } from '../context/AuthContext.jsx';
import { isMatchLocked } from '../utils/dateLock.js';

export default function PredictionForm({ match, prediction, onSaved }) {
  const { user } = useAuth();
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const locked = isMatchLocked(match);

  useEffect(() => {
    setHomeScore(prediction?.predicted_home_score ?? '');
    setAwayScore(prediction?.predicted_away_score ?? '');
  }, [prediction?.predicted_home_score, prediction?.predicted_away_score]);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');

    if (!user) {
      setMessage('Debes iniciar sesión para guardar pronósticos.');
      return;
    }

    if (locked) {
      setMessage('Este partido ya está bloqueado');
      return;
    }

    const predictedHome = Number(homeScore);
    const predictedAway = Number(awayScore);

    if (!Number.isInteger(predictedHome) || !Number.isInteger(predictedAway) || predictedHome < 0 || predictedAway < 0) {
      setMessage('Ingresa marcadores válidos, sin negativos.');
      return;
    }

    setSaving(true);

    const payload = {
      predicted_home_score: predictedHome,
      predicted_away_score: predictedAway,
    };

    let result;
    if (prediction?.id) {
      result = await supabase.from('predictions').update(payload).eq('id', prediction.id);
    } else {
      result = await supabase.from('predictions').insert({
        user_id: user.id,
        match_id: match.id,
        ...payload,
      });

      if (result.error?.code === '23505') {
        result = await supabase
          .from('predictions')
          .update(payload)
          .eq('user_id', user.id)
          .eq('match_id', match.id);
      }
    }

    setSaving(false);

    if (result.error) {
      setMessage(result.error.message?.includes('row-level security') ? 'Este partido ya está bloqueado' : result.error.message);
      return;
    }

    setMessage('Pronóstico guardado');
    onSaved?.();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 rounded-2xl border border-white/10 bg-slate-950/30 p-4">
      <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
        <label className="block">
          <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">Local</span>
          <input
            type="number"
            min="0"
            inputMode="numeric"
            disabled={locked || saving}
            className="field text-center text-lg font-black"
            value={homeScore}
            onChange={(event) => setHomeScore(event.target.value)}
            placeholder="0"
          />
        </label>
        <span className="pb-3 text-xl font-black text-slate-400">-</span>
        <label className="block">
          <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">Visitante</span>
          <input
            type="number"
            min="0"
            inputMode="numeric"
            disabled={locked || saving}
            className="field text-center text-lg font-black"
            value={awayScore}
            onChange={(event) => setAwayScore(event.target.value)}
            placeholder="0"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-slate-300">
          {locked ? 'Este partido ya está bloqueado' : 'Puedes editar hasta el inicio del partido.'}
        </p>
        <button type="submit" className="btn-primary px-4 py-2" disabled={locked || saving}>
          <Save className="h-4 w-4" /> {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      {message && <p className="mt-3 rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-slate-100">{message}</p>}
    </form>
  );
}
