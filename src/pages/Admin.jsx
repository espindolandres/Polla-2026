import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Database, FileDown, RefreshCcw, Settings, Shield, Trophy } from 'lucide-react';
import StatCard from '../components/StatCard.jsx';
import { supabase } from '../lib/supabaseClient.js';
import { downloadCsv } from '../utils/csv.js';

const adminLinks = [
  { to: '/admin/matches', title: 'Partidos', description: 'Crear, editar o eliminar partidos.', icon: '📅' },
  { to: '/admin/results', title: 'Resultados', description: 'Actualizar marcadores reales y estados.', icon: '🥅' },
  { to: '/admin/import', title: 'Importar JSON', description: 'Carga masiva desde archivo editable.', icon: '📥' },
  { to: '/admin/settings', title: 'Configuración', description: 'Reglas de puntos y fechas límite.', icon: '⚙️' },
];

export default function Admin() {
  const [stats, setStats] = useState({ matches: '—', predictions: '—', users: '—' });
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function loadStats() {
    const [matchesResult, predictionsResult, usersResult] = await Promise.all([
      supabase.from('matches').select('*', { count: 'exact', head: true }),
      supabase.from('predictions').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
    ]);

    setStats({
      matches: matchesResult.count ?? '—',
      predictions: predictionsResult.count ?? '—',
      users: usersResult.count ?? '—',
    });
  }

  useEffect(() => {
    loadStats();
  }, []);

  async function recalculate() {
    setBusy(true);
    setMessage('');
    const { error } = await supabase.rpc('recalculate_all_points');
    setBusy(false);
    setMessage(error ? error.message : 'Tabla de posiciones recalculada');
  }

  async function exportLeaderboard() {
    const { data, error } = await supabase
      .from('leaderboard_view')
      .select('*')
      .order('total_points', { ascending: false })
      .order('exact_scores', { ascending: false })
      .order('correct_results', { ascending: false });

    if (error) {
      setMessage(error.message);
      return;
    }

    downloadCsv('tabla-posiciones.csv', data || []);
  }

  async function exportPredictions() {
    const { data, error } = await supabase
      .from('predictions_export_view')
      .select('*')
      .order('match_number', { ascending: true })
      .order('alias', { ascending: true });

    if (error) {
      setMessage(error.message);
      return;
    }

    downloadCsv('pronosticos.csv', data || []);
  }

  return (
    <div className="container-page space-y-6 pb-24 md:pb-10">
      <section className="panel p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-gold">Panel protegido</p>
            <h1 className="mt-2 flex items-center gap-3 text-3xl font-black text-white sm:text-4xl"><Shield className="h-8 w-8 text-gold" /> Administrador</h1>
            <p className="mt-3 text-slate-300">Gestiona calendario, resultados, puntuación y exportaciones.</p>
          </div>
          <button onClick={recalculate} className="btn-primary" disabled={busy}><RefreshCcw className="h-4 w-4" /> {busy ? 'Recalculando...' : 'Recalcular tabla'}</button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={<Database />} label="Partidos" value={stats.matches} helper="Registros cargados" />
        <StatCard icon={<Trophy />} label="Pronósticos" value={stats.predictions} helper="Marcadores guardados" />
        <StatCard icon="👥" label="Usuarios" value={stats.users} helper="Perfiles registrados" />
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {adminLinks.map((item) => (
          <Link key={item.to} to={item.to} className="panel p-5 transition hover:-translate-y-1 hover:border-gold/40">
            <div className="mb-4 text-3xl">{item.icon}</div>
            <h2 className="text-xl font-black text-white">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">{item.description}</p>
          </Link>
        ))}
      </section>

      <section className="panel p-5">
        <div className="flex flex-wrap gap-3">
          <button onClick={exportPredictions} className="btn-secondary"><FileDown className="h-4 w-4" /> Exportar pronósticos CSV</button>
          <button onClick={exportLeaderboard} className="btn-secondary"><FileDown className="h-4 w-4" /> Exportar tabla CSV</button>
          <Link to="/admin/settings" className="btn-secondary"><Settings className="h-4 w-4" /> Configuración</Link>
        </div>
        {message && <p className="mt-4 rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-slate-100">{message}</p>}
      </section>
    </div>
  );
}
