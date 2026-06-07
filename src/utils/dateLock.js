export const WORLD_CUP_START_AT = '2026-06-11T00:00:00.000Z';

export function isMatchLocked(match, now = new Date()) {
  if (!match) return false;
  if (match.status === 'finished' || match.status === 'live') return true;
  if (!match.match_date) return false;
  return new Date(match.match_date).getTime() <= now.getTime();
}

export function getMatchUiStatus(match, now = new Date()) {
  if (!match) return { label: 'Sin datos', color: 'bg-slate-500/20 text-slate-200' };
  if (match.status === 'finished') return { label: 'Finalizado', color: 'bg-slate-200/15 text-slate-100' };
  if (match.status === 'live') return { label: 'En vivo', color: 'bg-scarlet/20 text-rose-200' };
  if (isMatchLocked(match, now)) return { label: 'Bloqueado', color: 'bg-amber-400/20 text-amber-100' };
  return { label: 'Abierto', color: 'bg-emerald-400/20 text-emerald-100' };
}

export function isBonusLocked(lockAt, now = new Date()) {
  if (!lockAt) return false;
  return new Date(lockAt).getTime() <= now.getTime();
}

export function formatDateTime(value, options = {}) {
  if (!value) return 'Por definir';
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: options.dateStyle || 'medium',
    timeStyle: options.timeStyle || 'short',
  }).format(new Date(value));
}

export function toDateTimeLocalValue(value) {
  if (!value) return '';
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export function fromDateTimeLocalValue(value) {
  if (!value) return null;
  return new Date(value).toISOString();
}

export function getCountdownParts(target = WORLD_CUP_START_AT) {
  const distance = new Date(target).getTime() - Date.now();
  const safeDistance = Math.max(distance, 0);

  return {
    days: Math.floor(safeDistance / (1000 * 60 * 60 * 24)),
    hours: Math.floor((safeDistance / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((safeDistance / (1000 * 60)) % 60),
    seconds: Math.floor((safeDistance / 1000) % 60),
    finished: distance <= 0,
  };
}
