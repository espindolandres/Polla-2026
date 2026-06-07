import { useEffect, useMemo, useState } from 'react';
import { Save, X } from 'lucide-react';
import { fromDateTimeLocalValue, toDateTimeLocalValue } from '../utils/dateLock.js';

const emptyMatch = {
  match_number: '',
  phase: 'Fase de grupos',
  group_name: '',
  home_team: '',
  away_team: '',
  match_date: '',
  stadium: '',
  city: '',
  home_score: '',
  away_score: '',
  status: 'scheduled',
};

export default function AdminMatchEditor({ match, onCancel, onSave, saving }) {
  const initialValue = useMemo(() => {
    if (!match) return emptyMatch;
    return {
      ...emptyMatch,
      ...match,
      match_date: toDateTimeLocalValue(match.match_date),
      home_score: match.home_score ?? '',
      away_score: match.away_score ?? '',
    };
  }, [match]);

  const [form, setForm] = useState(initialValue);

  useEffect(() => {
    setForm(initialValue);
  }, [initialValue]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const payload = {
      match_number: form.match_number === '' ? null : Number(form.match_number),
      phase: form.phase || null,
      group_name: form.group_name || null,
      home_team: form.home_team || null,
      away_team: form.away_team || null,
      match_date: fromDateTimeLocalValue(form.match_date),
      stadium: form.stadium || null,
      city: form.city || null,
      home_score: form.home_score === '' ? null : Number(form.home_score),
      away_score: form.away_score === '' ? null : Number(form.away_score),
      status: form.status,
    };
    onSave?.(payload, match?.id);
  }

  return (
    <form onSubmit={handleSubmit} className="panel p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-gold">Administrador</p>
          <h2 className="text-2xl font-black text-white">{match ? 'Editar partido' : 'Crear partido'}</h2>
        </div>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary px-3 py-2">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label>
          <span className="label">Número</span>
          <input className="field mt-2" type="number" value={form.match_number ?? ''} onChange={(e) => updateField('match_number', e.target.value)} />
        </label>
        <label>
          <span className="label">Fase</span>
          <select className="field mt-2" value={form.phase || ''} onChange={(e) => updateField('phase', e.target.value)}>
            <option>Fase de grupos</option>
            <option>Dieciseisavos</option>
            <option>Octavos</option>
            <option>Cuartos</option>
            <option>Semifinales</option>
            <option>Tercer puesto</option>
            <option>Final</option>
          </select>
        </label>
        <label>
          <span className="label">Grupo</span>
          <input className="field mt-2" value={form.group_name || ''} onChange={(e) => updateField('group_name', e.target.value)} placeholder="Grupo A" />
        </label>
        <label>
          <span className="label">Equipo local</span>
          <input className="field mt-2" value={form.home_team || ''} onChange={(e) => updateField('home_team', e.target.value)} />
        </label>
        <label>
          <span className="label">Equipo visitante</span>
          <input className="field mt-2" value={form.away_team || ''} onChange={(e) => updateField('away_team', e.target.value)} />
        </label>
        <label>
          <span className="label">Fecha y hora</span>
          <input className="field mt-2" type="datetime-local" value={form.match_date || ''} onChange={(e) => updateField('match_date', e.target.value)} />
        </label>
        <label>
          <span className="label">Estadio</span>
          <input className="field mt-2" value={form.stadium || ''} onChange={(e) => updateField('stadium', e.target.value)} />
        </label>
        <label>
          <span className="label">Ciudad</span>
          <input className="field mt-2" value={form.city || ''} onChange={(e) => updateField('city', e.target.value)} />
        </label>
        <label>
          <span className="label">Estado</span>
          <select className="field mt-2" value={form.status || 'scheduled'} onChange={(e) => updateField('status', e.target.value)}>
            <option value="scheduled">scheduled</option>
            <option value="live">live</option>
            <option value="finished">finished</option>
          </select>
        </label>
        <label>
          <span className="label">Goles local</span>
          <input className="field mt-2" type="number" min="0" value={form.home_score ?? ''} onChange={(e) => updateField('home_score', e.target.value)} />
        </label>
        <label>
          <span className="label">Goles visitante</span>
          <input className="field mt-2" type="number" min="0" value={form.away_score ?? ''} onChange={(e) => updateField('away_score', e.target.value)} />
        </label>
      </div>

      <div className="mt-5 flex justify-end">
        <button type="submit" className="btn-primary" disabled={saving}>
          <Save className="h-4 w-4" /> {saving ? 'Guardando...' : 'Guardar partido'}
        </button>
      </div>
    </form>
  );
}
