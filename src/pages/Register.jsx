import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { supabase } from '../lib/supabaseClient.js';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', alias: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState('');

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setSuccess('');

    if (!form.alias.trim()) {
      setMessage('El alias es obligatorio.');
      return;
    }

    if (form.password.length < 6) {
      setMessage('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        data: {
          full_name: form.full_name.trim(),
          alias: form.alias.trim(),
        },
      },
    });
    setLoading(false);

    if (error) {
      setMessage(error.message?.includes('duplicate') ? 'Ese alias ya está en uso.' : error.message);
      return;
    }

    if (data.session) {
      navigate('/dashboard', { replace: true });
    } else {
      setSuccess('Registro creado. Revisa tu correo si Supabase tiene confirmación de email activada.');
    }
  }

  return (
    <div className="container-page flex min-h-[75vh] items-center justify-center pb-24 md:pb-10">
      <section className="panel w-full max-w-2xl p-6 sm:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-gold text-navy shadow-glow">
            <UserPlus className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-black text-white">Participar</h1>
          <p className="mt-2 text-sm text-slate-300">Crea tu cuenta con correo, contraseña y alias único.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="label">Nombre completo</span>
            <input className="field mt-2" value={form.full_name} onChange={(e) => update('full_name', e.target.value)} placeholder="Tu nombre" />
          </label>
          <label className="block">
            <span className="label">Alias *</span>
            <input className="field mt-2" required value={form.alias} onChange={(e) => update('alias', e.target.value)} placeholder="Sin espacios raros" />
          </label>
          <label className="block sm:col-span-2">
            <span className="label">Correo</span>
            <input className="field mt-2" type="email" autoComplete="email" required value={form.email} onChange={(e) => update('email', e.target.value)} />
          </label>
          <label className="block sm:col-span-2">
            <span className="label">Contraseña</span>
            <input className="field mt-2" type="password" autoComplete="new-password" required value={form.password} onChange={(e) => update('password', e.target.value)} />
          </label>
          <button type="submit" className="btn-primary sm:col-span-2" disabled={loading}>{loading ? 'Creando...' : 'Crear cuenta'}</button>
        </form>

        {message && <p className="mt-4 rounded-2xl bg-rose-500/15 px-4 py-3 text-sm font-semibold text-rose-100">{message}</p>}
        {success && <p className="mt-4 rounded-2xl bg-emerald-500/15 px-4 py-3 text-sm font-semibold text-emerald-100">{success}</p>}

        <p className="mt-6 text-center text-sm text-slate-300">
          ¿Ya tienes cuenta? <Link to="/login" className="font-bold text-gold hover:underline">Iniciar sesión</Link>
        </p>
      </section>
    </div>
  );
}
