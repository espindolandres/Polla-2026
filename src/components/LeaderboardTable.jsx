import { Medal, Search } from 'lucide-react';

function podiumClass(position) {
  if (position === 1) return 'border-gold/60 bg-gold/15';
  if (position === 2) return 'border-slate-200/50 bg-slate-200/10';
  if (position === 3) return 'border-amber-700/60 bg-amber-700/15';
  return 'border-white/10 bg-white/[0.04]';
}

export default function LeaderboardTable({ rows = [], search, onSearchChange }) {
  const normalizedSearch = search?.trim().toLowerCase() || '';
  const rankedRows = rows.map((row, index) => ({ ...row, position: index + 1 }));
  const filteredRows = rankedRows.filter((row) => row.alias?.toLowerCase().includes(normalizedSearch));

  return (
    <section className="panel overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-gold">Ranking deportivo</p>
          <h2 className="text-2xl font-black text-white">Tabla de posiciones</h2>
        </div>
        <label className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="field pl-11"
            placeholder="Buscar alias..."
            value={search}
            onChange={(event) => onSearchChange?.(event.target.value)}
          />
        </label>
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-slate-950/40 text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-5 py-4 text-left">Posición</th>
              <th className="px-5 py-4 text-left">Alias</th>
              <th className="px-5 py-4 text-right">Puntos</th>
              <th className="px-5 py-4 text-right">Exactos</th>
              <th className="px-5 py-4 text-right">Resultados</th>
              <th className="px-5 py-4 text-right">Bonos</th>
              <th className="px-5 py-4 text-left">Campeón</th>
              <th className="px-5 py-4 text-left">Última actualización</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filteredRows.map((row) => {
              const position = row.position;
              return (
                <tr key={row.user_id} className={position <= 3 ? 'bg-white/[0.04]' : ''}>
                  <td className="px-5 py-4 font-black text-white">
                    <span className="inline-flex items-center gap-2">
                      {position <= 3 && <Medal className="h-4 w-4 text-gold" />} #{position}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-bold text-white">@{row.alias}</td>
                  <td className="px-5 py-4 text-right text-xl font-black text-gold">{row.total_points || 0}</td>
                  <td className="px-5 py-4 text-right text-slate-200">{row.exact_scores || 0}</td>
                  <td className="px-5 py-4 text-right text-slate-200">{row.correct_results || 0}</td>
                  <td className="px-5 py-4 text-right text-slate-200">{row.bonus_points || 0}</td>
                  <td className="px-5 py-4 text-slate-200">{row.champion || '—'}</td>
                  <td className="px-5 py-4 text-slate-300">
                    {row.last_updated ? new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(row.last_updated)) : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 p-4 md:hidden">
        {filteredRows.map((row) => {
          const position = row.position;
          return (
            <article key={row.user_id} className={`rounded-3xl border p-4 ${podiumClass(position)}`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-gold">#{position}</p>
                  <h3 className="text-xl font-black text-white">@{row.alias}</h3>
                </div>
                <p className="text-3xl font-black text-gold">{row.total_points || 0}</p>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-bold text-slate-300">
                <span className="rounded-2xl bg-white/10 p-2">Exactos<br />{row.exact_scores || 0}</span>
                <span className="rounded-2xl bg-white/10 p-2">Resultados<br />{row.correct_results || 0}</span>
                <span className="rounded-2xl bg-white/10 p-2">Bonos<br />{row.bonus_points || 0}</span>
              </div>
              <p className="mt-3 text-sm text-slate-300">Campeón: {row.champion || '—'}</p>
            </article>
          );
        })}
      </div>

      {!filteredRows.length && (
        <div className="p-8 text-center text-sm font-semibold text-slate-300">No hay participantes que coincidan con la búsqueda.</div>
      )}
    </section>
  );
}
