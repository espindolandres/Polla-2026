import { Link } from 'react-router-dom';

const rules = [
  ['Marcador exacto', '3 puntos por acertar goles local y visitante.'],
  ['Resultado acertado', '1 punto por acertar ganador o empate, sin marcador exacto.'],
  ['Sin acierto', '0 puntos si el resultado no coincide.'],
  ['Campeón', '5 puntos extra por acertar el campeón.'],
  ['Subcampeón', '3 puntos extra por acertar el subcampeón.'],
  ['Desempate', 'Primero más marcadores exactos; después más resultados acertados.'],
];

export default function Rules() {
  return (
    <div className="container-page space-y-6 pb-24 md:pb-10">
      <section className="panel p-6 sm:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-gold">Reglas</p>
        <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">Sistema de puntuación</h1>
        <p className="mt-3 max-w-3xl text-slate-300">
          La app no maneja pagos, apuestas ni dinero. Solo guarda pronósticos, calcula puntos y muestra ranking entre participantes.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rules.map(([title, description]) => (
          <article key={title} className="panel p-5">
            <h2 className="text-xl font-black text-white">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
          </article>
        ))}
      </section>

      <section className="panel p-6">
        <h2 className="text-2xl font-black text-white">Ejemplo</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-white/10 p-4">
            <p className="font-bold text-slate-200">Resultado real</p>
            <p className="mt-2 text-2xl font-black text-gold">Colombia 2 - 1 Brasil</p>
          </div>
          <div className="rounded-3xl bg-white/10 p-4">
            <p className="font-bold text-slate-200">Usuario A: 2 - 1</p>
            <p className="mt-2 text-2xl font-black text-emerald-300">3 puntos</p>
          </div>
          <div className="rounded-3xl bg-white/10 p-4">
            <p className="font-bold text-slate-200">Usuario B: 1 - 0</p>
            <p className="mt-2 text-2xl font-black text-amber-200">1 punto</p>
          </div>
        </div>
      </section>

      <div className="flex justify-center">
        <Link to="/predictions" className="btn-primary">Ir a pronósticos</Link>
      </div>
    </div>
  );
}
