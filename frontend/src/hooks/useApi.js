import { useState, useEffect, useCallback } from 'react';

export function useApi(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetcher()
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setIsDemo(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          const isNetworkError = err.message === 'Failed to fetch' || err.name === 'TypeError';
          if (isNetworkError) {
            setIsDemo(true);
          } else {
            setError(err.message);
          }
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, deps);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    fetcher()
      .then((d) => { setData(d); setIsDemo(false); })
      .catch((e) => {
        const isNetworkError = e.message === 'Failed to fetch' || e.name === 'TypeError';
        if (isNetworkError) setIsDemo(true);
        else setError(e.message);
      })
      .finally(() => setLoading(false));
  }, [fetcher]);

  return { data, loading, error, isDemo, refetch };
}
