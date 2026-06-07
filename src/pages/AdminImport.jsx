import { useState } from 'react';
import { Download, UploadCloud } from 'lucide-react';
import { supabase } from '../lib/supabaseClient.js';
import sampleMatches from '../data/matches.example.json';

const allowedFields = [
  'match_number',
  'phase',
  'group_name',
  'home_team',
  'away_team',
  'match_date',
  'stadium',
  'city',
  'home_score',
  'away_score',
  'status',
];

function normalizeMatch(row) {
  return Object.fromEntries(allowedFields.map((field) => [field, row[field] ?? null]));
}

export default function AdminImport() {
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleFile(event) {
    setMessage('');
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) throw new Error('El JSON debe ser un arreglo de partidos.');
      setRows(parsed.map(normalizeMatch));
      setMessage(`${parsed.length} partidos listos para importar.`);
    } catch (error) {
      setRows([]);
      setMessage(error.message);
    }
  }

  async function importRows() {
    if (!rows.length) {
      setMessage('Primero carga un archivo JSON.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('matches').upsert(rows, { onConflict: 'match_number' });
    setLoading(false);
    setMessage(error ? error.message : `${rows.length} partidos importados o actualizados.`);
  }

  function downloadTemplate() {
    const blob = new Blob([JSON.stringify(sampleMatches, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'matches.example.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="container-page space-y-6 pb-24 md:pb-10">
      <section className="panel p-6">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-gold">Admin</p>
        <h1 className="mt-2 text-3xl font-black text-white">Importar partidos desde JSON</h1>
        <p className="mt-3 text-slate-300">Usa datos oficiales de FIFA como referencia y evita inventar fixtures no confirmados.</p>
      </section>

      <section className="panel p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-white/20 bg-white/5 p-8 text-center transition hover:border-gold/60">
            <UploadCloud className="mb-3 h-10 w-10 text-gold" />
            <span className="font-black text-white">Seleccionar JSON</span>
            <span className="mt-2 text-sm text-slate-300">Debe ser un arreglo de objetos con los campos de matches.</span>
            <input type="file" accept="application/json,.json" className="sr-only" onChange={handleFile} />
          </label>

          <div className="rounded-3xl border border-white/10 bg-slate-950/30 p-6">
            <h2 className="text-xl font-black text-white">Plantilla editable</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Descarga el ejemplo, completa los 104 partidos con la fuente oficial y vuelve a importarlo.
            </p>
            <button onClick={downloadTemplate} className="btn-secondary mt-5"><Download className="h-4 w-4" /> Descargar plantilla</button>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-slate-300">Partidos detectados: {rows.length}</p>
          <button onClick={importRows} className="btn-primary" disabled={loading || !rows.length}>{loading ? 'Importando...' : 'Importar / actualizar'}</button>
        </div>

        {message && <p className="mt-4 rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-slate-100">{message}</p>}
      </section>

      {rows.length > 0 && (
        <section className="panel overflow-hidden">
          <div className="max-h-[28rem] overflow-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="sticky top-0 bg-slate-950 text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Partido</th>
                  <th className="px-4 py-3 text-left">Fase</th>
                  <th className="px-4 py-3 text-left">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {rows.slice(0, 120).map((row, index) => (
                  <tr key={`${row.match_number}-${index}`}>
                    <td className="px-4 py-3 text-slate-300">{row.match_number}</td>
                    <td className="px-4 py-3 font-bold text-white">{row.home_team || 'TBD'} vs {row.away_team || 'TBD'}</td>
                    <td className="px-4 py-3 text-slate-300">{row.phase}</td>
                    <td className="px-4 py-3 text-slate-300">{row.match_date || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
