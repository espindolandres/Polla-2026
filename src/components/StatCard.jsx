export default function StatCard({ icon, label, value, helper }) {
  return (
    <div className="panel p-5">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-2xl">
        {icon}
      </div>
      <p className="text-sm font-semibold text-slate-300">{label}</p>
      <p className="mt-1 text-3xl font-black text-white">{value}</p>
      {helper && <p className="mt-2 text-xs text-slate-400">{helper}</p>}
    </div>
  );
}
