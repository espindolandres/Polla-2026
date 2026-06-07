export default function LoadingState({ text = 'Cargando...' }) {
  return (
    <div className="flex min-h-[35vh] items-center justify-center">
      <div className="panel px-8 py-6 text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-gold" />
        <p className="text-sm font-semibold text-slate-200">{text}</p>
      </div>
    </div>
  );
}
