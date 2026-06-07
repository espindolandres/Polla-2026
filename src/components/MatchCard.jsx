import { CalendarDays, MapPin, Trophy } from 'lucide-react';
import PredictionForm from './PredictionForm.jsx';
import { formatDateTime, getMatchUiStatus } from '../utils/dateLock.js';

export default function MatchCard({ match, prediction, showPredictionForm = false, onPredictionSaved }) {
  const status = getMatchUiStatus(match);
  const home = match.home_team || 'Equipo local por definir';
  const away = match.away_team || 'Equipo visitante por definir';
  const resultVisible = match.status === 'finished' && match.home_score !== null && match.away_score !== null;

  return (
    <article className="panel overflow-hidden p-5 transition hover:-translate-y-1 hover:border-gold/30">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-2 flex flex-wrap gap-2">
            <span className="badge bg-white/10 text-slate-200">#{match.match_number || match.id}</span>
            <span className={`badge ${status.color}`}>{status.label}</span>
            {match.group_name && <span className="badge bg-blue-400/15 text-blue-100">{match.group_name}</span>}
          </div>
          <h3 className="text-lg font-black text-white">{match.phase || 'Fase por definir'}</h3>
        </div>
        <Trophy className="h-6 w-6 text-gold" />
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-3xl border border-white/10 bg-slate-950/30 p-4">
        <div className="text-left">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Local</p>
          <p className="mt-1 text-base font-black text-white sm:text-xl">{home}</p>
        </div>
        <div className="text-center">
          {resultVisible ? (
            <p className="rounded-2xl bg-white/10 px-4 py-2 text-2xl font-black text-gold">
              {match.home_score} - {match.away_score}
            </p>
          ) : (
            <p className="rounded-2xl bg-white/10 px-4 py-2 text-lg font-black text-slate-300">VS</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Visitante</p>
          <p className="mt-1 text-base font-black text-white sm:text-xl">{away}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
        <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-gold" /> {formatDateTime(match.match_date)}</p>
        <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gold" /> {[match.stadium, match.city].filter(Boolean).join(', ') || 'Sede por definir'}</p>
      </div>

      {prediction && (
        <div className="mt-4 rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-slate-200">
          Tu pronóstico: {prediction.predicted_home_score} - {prediction.predicted_away_score}
          {match.status === 'finished' && <span className="ml-2 text-gold">+{prediction.points || 0} pts</span>}
        </div>
      )}

      {showPredictionForm && (
        <PredictionForm match={match} prediction={prediction} onSaved={onPredictionSaved} />
      )}
    </article>
  );
}
