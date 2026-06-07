import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabaseClient.js';
import { useAuth } from '../context/AuthContext.jsx';
import { isBonusLocked, formatDateTime } from '../utils/dateLock.js';

const emptyBonus = {
  champion: '',
  runner_up: '',
  top_scorer: '',
  surprise_team: '',
};

export default function BonusPredictions() {
  const { user } = useAuth();
  const [bonus, setBonus] = useState(emptyBonus);
  const [lockAt, setLockAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const locked = isBonusLocked(lockAt);

  useEffect(() => {
    async function load() {
      if (!user) return;
      setLoading(true);

      const [{ data: existing }, { data: setting }] = await Promise.all([
        supabase.from('bonus_predictions').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('settings').select('value').eq('key', 'bonus_lock_at').maybeSingle(),
      ]);

      setBonus({ ...emptyBonus, ...(existing || {}) });
      setLockAt(setting?.value?.lock_at || null);
      setLoading(false);
    }

    load();
  }, [user]);

  async function saveBonus(event) {
    event.preventDefault();
    setMessage('');

    if (locked) {
      setMessage('Los pronósticos especiales ya están bloqueados.');
      return;
    }

    if (!bonus.champion || !bonus.runner_up) {
      setMessage('Campeón y subcampeón son obligatorios.');
      return;
    }

    setSaving(true);

    const payload = {
      champion: bonus.champion.trim(),
      runner_up: bonus.runner_up.trim(),
      top_scorer: bonus.top_scorer?.trim() || null,
      surprise_team: bonus.surprise_team?.trim() || null,
    };

    let result;
    if (bonus.id) {
      result = await supabase.from('bonus_predictions').update(payload).eq('id', bonus.id);
    } else {
      result = await supabase.from('bonus_predictions').insert({ user_id: user.id, ...payload });

      if (result.error?.code === '23505') {
        result = await supabase.from('bonus_predictions').update(payload).eq('user_id', user.id);
      }
    }

    setSaving(false);

    if (result.error) {
      setMessage(result.error.message?.includes('row-level security') ? 'Los pronósticos especiales ya están bloqueados.' : result.error.message);
      return;
    }

    setMessage('Pronósticos especiales guardados');
  }

  function update(field, value) {
    setBonus((current) => ({ ...current, [field]: value }));
  }

  if (loading) {
    return <div className="panel p-5 text-sm font-semibold text-slate-300">Cargando pronósticos especiales...</div>;
  }

  return (
    <section className="panel p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-gold">Bonus</p>
          <h2 className="text-2xl font-black text-white">Pronósticos especiales</h2>
          <p className="mt-2 text-sm text-slate-300">
            Se bloquean antes del primer partido. Fecha límite: {lockAt ? formatDateTime(lockAt) : 'por definir'}.
          </p>
        </div>
        <Sparkles className="h-7 w-7 text-gold" />
      </div>

      <form onSubmit={saveBonus} className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="label">Campeón *</span>
          <input className="field mt-2" disabled={locked || saving} value={bonus.champion || ''} onChange={(e) => update('champion', e.target.value)} placeholder="Ej: Colombia" />
        </label>
        <label>
          <span className="label">Subcampeón *</span>
          <input className="field mt-2" disabled={locked || saving} value={bonus.runner_up || ''} onChange={(e) => update('runner_up', e.target.value)} placeholder="Ej: Brasil" />
        </label>
        <label>
          <span className="label">Goleador, opcional</span>
          <input className="field mt-2" disabled={locked || saving} value={bonus.top_scorer || ''} onChange={(e) => update('top_scorer', e.target.value)} placeholder="Nombre del jugador" />
        </label>
        <label>
          <span className="label">Selección sorpresa, opcional</span>
          <input className="field mt-2" disabled={locked || saving} value={bonus.surprise_team || ''} onChange={(e) => update('surprise_team', e.target.value)} placeholder="Selección revelación" />
        </label>
        <div className="sm:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-300">{locked ? 'Bloqueado por fecha límite.' : 'Puedes editarlo hasta la fecha límite.'}</p>
          <button type="submit" className="btn-primary" disabled={locked || saving}>{saving ? 'Guardando...' : 'Guardar bonus'}</button>
        </div>
      </form>

      {message && <p className="mt-4 rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-slate-100">{message}</p>}
    </section>
  );
}
