export const PHASE_ORDER = [
  'Fase de grupos',
  'Dieciseisavos',
  'Octavos',
  'Cuartos',
  'Semifinales',
  'Tercer puesto',
  'Final',
];

export function groupMatchesByPhase(matches = []) {
  const groups = matches.reduce((acc, match) => {
    const phase = match.phase || 'Sin fase';
    acc[phase] = acc[phase] || [];
    acc[phase].push(match);
    return acc;
  }, {});

  return Object.entries(groups).sort(([phaseA], [phaseB]) => {
    const indexA = PHASE_ORDER.indexOf(phaseA);
    const indexB = PHASE_ORDER.indexOf(phaseB);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });
}
