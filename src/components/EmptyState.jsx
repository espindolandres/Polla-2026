import { CalendarClock } from 'lucide-react';

export default function EmptyState({ title = 'Sin información', description = 'Todavía no hay datos para mostrar.' }) {
  return (
    <div className="panel flex flex-col items-center justify-center px-6 py-12 text-center">
      <CalendarClock className="mb-4 h-10 w-10 text-gold" />
      <h3 className="text-xl font-black text-white">{title}</h3>
      <p className="mt-2 max-w-xl text-sm text-slate-300">{description}</p>
    </div>
  );
}
