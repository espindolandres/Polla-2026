import { useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth();
  const [form, setForm] = useState({ full_name: profile?.full_name || '', alias: profile?.alias || '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function saveProfile(event) {
    event.preventDefault();
    setMessage('');

    if (!form.alias.trim()) {
      setMessage('El alias es obligatorio.');
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: form.full_name.trim(), alias: form.alias.trim() })
      .eq('id', user.id);
    setLoading(false);

    if (error) {
      setMessage(error.message?.includes('duplicate') ? 'Ese alias ya existe.' : error.message);
      return;
    }

    await refreshProfile();
    setMessage('Perfil actualizado');
  }

  return (
    <div className="container-page flex min-h-[75vh] items-start justify-center pb-24 md:pb-10">
      <section className="panel w-full max-w-2xl p-6 sm:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-gold">Perfil</p>
        <h1 className="mt-2 text-3xl font-black text-white">Mis datos</h1>
        <p className="mt-3 text-sm text-slate-300">Puedes cambiar tu nombre y alias. El rol no es editable por usuarios normales.</p>

        <form onSubmit={saveProfile} className="mt-6 grid gap-4">
          <label>
            <span className="label">Correo</span>
            <input className="field mt-2" disabled value={profile?.email || user?.email || ''} />
          </label>
          <label>
            <span className="label">Nombre completo</span>
            <input className="field mt-2" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          </label>
          <label>
            <span className="label">Alias *</span>
            <input className="field mt-2" value={form.alias} onChange={(e) => setForm({ ...form, alias: e.target.value })} />
          </label>
          <label>
            <span className="label">Rol</span>
            <input className="field mt-2" disabled value={profile?.role || 'user'} />
          </label>
          <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Guardando...' : 'Guardar cambios'}</button>
        </form>

        {message && <p className="mt-4 rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-slate-100">{message}</p>}
      </section>
    </div>
  );
}
