import EmptyState from '../components/EmptyState.jsx';
import LoadingState from '../components/LoadingState.jsx';
import MatchCard from '../components/MatchCard.jsx';
import { useMatchesAndPredictions } from '../hooks/useMatchesAndPredictions.js';
import { groupMatchesByPhase } from '../utils/grouping.js';

export default function Predictions() {
  const { matches, predictionByMatchId, loading, error, refetch } = useMatchesAndPredictions();

  if (loading) return <LoadingState text="Cargando pronósticos..." />;

  const grouped = groupMatchesByPhase(matches);

  return (
    <div className="container-page space-y-6 pb-24 md:pb-10">
      <section className="panel p-6">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-gold">Pronósticos</p>
        <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">Mis marcadores</h1>
        <p className="mt-3 text-slate-300">Los partidos se bloquean automáticamente al llegar su hora de inicio.</p>
      </section>

      {error && <p className="rounded-2xl bg-rose-500/15 px-4 py-3 text-sm font-semibold text-rose-100">{error}</p>}

      {!matches.length && <EmptyState title="No hay partidos cargados" description="El administrador puede cargarlos manualmente o desde un JSON basado en FIFA." />}

      {grouped.map(([phase, phaseMatches]) => (
        <section key={phase} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-white">{phase}</h2>
            <span className="badge bg-white/10 text-slate-200">{phaseMatches.length} partidos</span>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {phaseMatches.map((match) => (
              <MatchCard key={match.id} match={match} prediction={predictionByMatchId[match.id]} showPredictionForm onPredictionSaved={refetch} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
