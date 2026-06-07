import { Link, NavLink } from 'react-router-dom';
import { CalendarDays, Home, LayoutDashboard, ListChecks, LogOut, Shield, Trophy, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const mainLinks = [
  { to: '/', label: 'Inicio', icon: Home, public: true },
  { to: '/dashboard', label: 'Panel', icon: LayoutDashboard, protected: true },
  { to: '/predictions', label: 'Pronósticos', icon: ListChecks, protected: true },
  { to: '/leaderboard', label: 'Tabla', icon: Trophy, protected: true },
  { to: '/profile', label: 'Perfil', icon: UserRound, protected: true },
  { to: '/rules', label: 'Reglas', icon: CalendarDays, public: true },
];

function linkClass({ isActive }) {
  return [
    'inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold transition',
    isActive ? 'bg-gold text-navy shadow-glow' : 'text-slate-200 hover:bg-white/10 hover:text-white',
  ].join(' ');
}

export default function Navbar() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const visibleLinks = mainLinks.filter((link) => link.public || (link.protected && user));

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-navy/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold text-2xl shadow-glow">⚽</span>
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-gold">Polla</p>
              <h1 className="text-lg font-black leading-none text-white">Mundial 2026</h1>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {visibleLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink key={link.to} to={link.to} className={linkClass} end={link.to === '/'}>
                  <Icon className="h-4 w-4" />
                  {link.label}
                </NavLink>
              );
            })}
            {isAdmin && (
              <NavLink to="/admin" className={linkClass}>
                <Shield className="h-4 w-4" /> Admin
              </NavLink>
            )}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <>
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold text-slate-200">
                  @{profile?.alias || 'usuario'}
                </span>
                <button type="button" onClick={signOut} className="btn-secondary px-4 py-2">
                  <LogOut className="h-4 w-4" /> Salir
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary px-4 py-2">Iniciar sesión</Link>
                <Link to="/register" className="btn-primary px-4 py-2">Participar</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <nav className="fixed bottom-3 left-1/2 z-50 flex w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 items-center justify-around rounded-3xl border border-white/10 bg-navy/90 p-2 shadow-card backdrop-blur-xl md:hidden">
        {visibleLinks.slice(0, 5).map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[11px] font-bold transition ${
                  isActive ? 'bg-gold text-navy' : 'text-slate-300'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {link.label}
            </NavLink>
          );
        })}
      </nav>
    </>
  );
}
