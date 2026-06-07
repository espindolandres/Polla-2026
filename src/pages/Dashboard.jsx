import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Trophy } from 'lucide-react';
import BonusPredictions from '../components/BonusPredictions.jsx';
import EmptyState from '../components/EmptyState.jsx';
import LoadingState from '../components/LoadingState.jsx';
import MatchCard from '../components/MatchCard.jsx';
import StatCard from '../components/StatCard.jsx';
import { useMatchesAndPredictions } from '../hooks/useMatchesAndPredictions.js';
import { useAuth } from '../context/AuthContext.jsx';
import { isMatchLocked } from '../utils/dateLock.js';

export default function Dashboard() {
  const { profile } = useAuth();
  const { matches, predictions, predictionByMatchId, loading, error, refetch } = useMatchesAndPredictions();

  if (loading) return <LoadingState text="Cargando panel..." />;

  const openMatches = matches.filter((match) => !isMatchLocked(match));
  const missingPredictions = openMatches.filter((match) => !predictionByMatchId[match.id]).length;
  const nextMatches = matches.filter((match) => !isMatchLocked(match)).slice(0, 3);
  const totalPoints = predictions.reduce((sum, prediction) => sum + (prediction.points || 0), 0);
  const exactScores = predictions.filter((prediction) => prediction.exact_score).length;

  return (
    <div className="container-page space-y-6 pb-24 md:pb-10">
      <section className="panel p-6">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-gold">Panel del participante</p>
        <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">Hola, @{profile?.alias || 'participante'}</h1>
        <p className="mt-3 text-slate-300">Completa tus pronósticos antes de que cada partido se bloquee.</p>
      </section>

      {error && <p className="rounded-2xl bg-rose-500/15 px-4 py-3 text-sm font-semibold text-rose-100">{error}</p>}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon="📝" label="Pronósticos hechos" value={predictions.length} helper={`${matches.length} partidos cargados`} />
        <StatCard icon={<AlertTriangle />} label="Pendientes abiertos" value={missingPredictions} helper={missingPredictions ? 'Te faltan pronósticos por completar' : 'Vas al día'} />
        <StatCard icon={<Trophy />} label="Puntos actuales" value={totalPoints} helper="Incluye partidos finalizados" />
        <StatCard icon={<CheckCircle2 />} label="Marcadores exactos" value={exactScores} helper="Primer desempate" />
      </section>

      {missingPredictions > 0 && (
        <div className="rounded-3xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm font-semibold text-amber-100">
          Te faltan pronósticos por completar. Revisa los partidos abiertos antes de que empiecen.
        </div>
      )}

      <BonusPredictions />

      <section className="space-y-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-gold">Próximos</p>
            <h2 className="text-2xl font-black text-white">Partidos abiertos</h2>
          </div>
          <Link to="/predictions" className="btn-secondary">Ver todos los pronósticos</Link>
        </div>

        {nextMatches.length ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {nextMatches.map((match) => (
              <MatchCard key={match.id} match={match} prediction={predictionByMatchId[match.id]} showPredictionForm onPredictionSaved={refetch} />
            ))}
          </div>
        ) : (
          <EmptyState title="No hay partidos abiertos" description="Cuando el administrador cargue o habilite partidos, aparecerán aquí." />
        )}
      </section>
    </div>
  );
}
