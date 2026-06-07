export const DEFAULT_SCORING_RULES = {
  exactScore: 3,
  correctResult: 1,
  champion: 5,
  runnerUp: 3,
};

export function getMatchResult(homeScore, awayScore) {
  if (homeScore === null || homeScore === undefined || awayScore === null || awayScore === undefined) {
    return null;
  }

  const home = Number(homeScore);
  const away = Number(awayScore);

  if (Number.isNaN(home) || Number.isNaN(away)) return null;
  if (home > away) return 'home_win';
  if (away > home) return 'away_win';
  return 'draw';
}

export function calculateMatchPoints(prediction, match, rules = DEFAULT_SCORING_RULES) {
  const empty = { points: 0, exact_score: false, correct_result: false };

  if (!prediction || !match || match.status !== 'finished') return empty;

  const predictedHome = Number(prediction.predicted_home_score);
  const predictedAway = Number(prediction.predicted_away_score);
  const actualHome = Number(match.home_score);
  const actualAway = Number(match.away_score);

  if ([predictedHome, predictedAway, actualHome, actualAway].some(Number.isNaN)) return empty;

  const exactScore = predictedHome === actualHome && predictedAway === actualAway;
  if (exactScore) {
    return { points: rules.exactScore, exact_score: true, correct_result: true };
  }

  const predictedResult = getMatchResult(predictedHome, predictedAway);
  const actualResult = getMatchResult(actualHome, actualAway);
  const correctResult = predictedResult !== null && predictedResult === actualResult;

  return {
    points: correctResult ? rules.correctResult : 0,
    exact_score: false,
    correct_result: correctResult,
  };
}

export function calculateBonusPoints(bonusPrediction, officialResult, rules = DEFAULT_SCORING_RULES) {
  if (!bonusPrediction || !officialResult) return 0;

  let points = 0;
  const normalize = (value) => String(value || '').trim().toLowerCase();

  if (normalize(bonusPrediction.champion) && normalize(bonusPrediction.champion) === normalize(officialResult.champion)) {
    points += rules.champion;
  }

  if (normalize(bonusPrediction.runner_up) && normalize(bonusPrediction.runner_up) === normalize(officialResult.runner_up)) {
    points += rules.runnerUp;
  }

  return points;
}
