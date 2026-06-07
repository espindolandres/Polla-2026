import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { useAuth } from '../context/AuthContext.jsx';

export function useMatchesAndPredictions() {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    const [matchesResult, predictionsResult] = await Promise.all([
      supabase
        .from('matches')
        .select('*')
        .order('match_date', { ascending: true, nullsFirst: false })
        .order('match_number', { ascending: true, nullsFirst: false }),
      user
        ? supabase.from('predictions').select('*').eq('user_id', user.id)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (matchesResult.error || predictionsResult.error) {
      setError(matchesResult.error?.message || predictionsResult.error?.message || 'No se pudo cargar la información.');
    } else {
      setMatches(matchesResult.data || []);
      setPredictions(predictionsResult.data || []);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const predictionByMatchId = useMemo(() => {
    return Object.fromEntries(predictions.map((prediction) => [prediction.match_id, prediction]));
  }, [predictions]);

  return { matches, predictions, predictionByMatchId, loading, error, refetch: load };
}
