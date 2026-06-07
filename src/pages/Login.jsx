import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { supabase } from '../lib/supabaseClient.js';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: form.email.trim(),
      password: form.password,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    navigate(location.state?.from || '/dashboard', { replace: true });
  }

  return (
    <div className="container-page flex min-h-[75vh] items-center justify-center pb-24 md:pb-10">
      <section className="panel w-full max-w-lg p-6 sm:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-gold text-navy shadow-glow">
            <LogIn className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-black text-white">Iniciar sesión</h1>
          <p className="mt-2 text-sm text-slate-300">Entra para completar pronósticos y ver la tabla.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="label">Correo</span>
            <input className="field mt-2" type="email" autoComplete="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </label>
          <label className="block">
            <span className="label">Contraseña</span>
            <input className="field mt-2" type="password" autoComplete="current-password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </label>
          <button type="submit" className="btn-primary w-full" disabled={loading}>{loading ? 'Ingresando...' : 'Iniciar sesión'}</button>
        </form>

        {message && <p className="mt-4 rounded-2xl bg-rose-500/15 px-4 py-3 text-sm font-semibold text-rose-100">{message}</p>}

        <p className="mt-6 text-center text-sm text-slate-300">
          ¿Aún no tienes cuenta? <Link to="/register" className="font-bold text-gold hover:underline">Participar</Link>
        </p>
      </section>
    </div>
  );
}
