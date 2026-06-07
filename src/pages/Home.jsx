import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Trophy, UsersRound } from 'lucide-react';
import { supabase } from '../lib/supabaseClient.js';
import { getCountdownParts, formatDateTime } from '../utils/dateLock.js';
import StatCard from '../components/StatCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ participants: '—', matches: '—', leader: '—', nextMatch: '—' });
  const [countdown, setCountdown] = useState(getCountdownParts());

  useEffect(() => {
    const timer = window.setInterval(() => setCountdown(getCountdownParts()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadStats() {
      const [profilesCount, matchesCount, leaderResult, nextMatchResult] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('matches').select('*', { count: 'exact', head: true }),
        supabase
          .from('leaderboard_view')
          .select('alias,total_points,exact_scores,correct_results')
          .order('total_points', { ascending: false })
          .order('exact_scores', { ascending: false })
          .order('correct_results', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('matches')
          .select('*')
          .gte('match_date', new Date().toISOString())
          .order('match_date', { ascending: true })
          .limit(1)
          .maybeSingle(),
      ]);

      setStats({
        participants: profilesCount.count ?? '—',
        matches: matchesCount.count ?? '—',
        leader: leaderResult.data?.alias ? `@${leaderResult.data.alias}` : 'Sin líder',
        nextMatch: nextMatchResult.data
          ? `${nextMatchResult.data.home_team || 'TBD'} vs ${nextMatchResult.data.away_team || 'TBD'} · ${formatDateTime(nextMatchResult.data.match_date)}`
          : user
            ? 'Sin partidos próximos'
            : 'Inicia sesión para verlo',
      });
    }

    loadStats();
  }, [user]);

  return (
    <div className="container-page space-y-8 pb-24 md:pb-10">
      <section className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="panel p-6 sm:p-8 lg:p-10">
          <p className="mb-4 inline-flex rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-sm font-black uppercase tracking-[0.25em] text-gold">
            Mundial 2026
          </p>
          <h1 className="max-w-4xl text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
            Polla Mundial 2026
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">
            Haz tus pronósticos, compite con tus amigos y sigue la tabla en vivo.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to={user ? '/predictions' : '/register'} className="btn-primary">
              Participar <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/login" className="btn-secondary">Iniciar sesión</Link>
            <Link to="/leaderboard" className="btn-secondary">Ver tabla</Link>
            <Link to="/rules" className="btn-secondary">Ver reglas</Link>
          </div>
        </div>

        <div className="panel p-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-gold">Cuenta regresiva</p>
              <h2 className="text-2xl font-black text-white">Inicio del Mundial</h2>
            </div>
            <CalendarDays className="h-8 w-8 text-gold" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ['Días', countdown.days],
              ['Horas', countdown.hours],
              ['Min', countdown.minutes],
              ['Seg', countdown.seconds],
            ].map(([label, value]) => (
              <div key={label} className="rounded-3xl border border-white/10 bg-slate-950/40 p-4 text-center">
                <p className="text-4xl font-black text-gold">{String(value).padStart(2, '0')}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm text-slate-300">
            La fecha de inicio se deja editable desde configuración si FIFA actualiza hora exacta o calendario.
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<UsersRound />} label="Participantes registrados" value={stats.participants} helper="Usuarios con perfil creado" />
        <StatCard icon="📅" label="Partidos cargados" value={stats.matches} helper="Cargados desde admin o JSON" />
        <StatCard icon={<Trophy />} label="Líder actual" value={stats.leader} helper="Según tabla automática" />
        <StatCard icon="⚽" label="Próximo partido" value={stats.nextMatch} helper="Ordenado por fecha de inicio" />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {[
          ['Sin dinero dentro de la app', 'Pensada para diversión entre conocidos. No procesa pagos ni apuestas.'],
          ['Bloqueo automático', 'Cada partido se bloquea al llegar su hora de inicio, reforzado por políticas RLS.'],
          ['Admin completo', 'Carga partidos, actualiza resultados, recalcula puntos y exporta CSV.'],
        ].map(([title, description]) => (
          <article key={title} className="panel p-5">
            <h3 className="text-xl font-black text-white">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
