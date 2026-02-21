import { useState, useEffect } from 'react';

export function useApi(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetcher()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) {
          // Silently handle network errors so pages render with demo data
          const isNetworkError = err.message === 'Failed to fetch' || err.name === 'TypeError';
          if (!isNetworkError) setError(err.message);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, deps);

  return { data, loading, error, refetch: () => {
    setLoading(true);
    setError(null);
    fetcher()
      .then(setData)
      .catch((e) => {
        const isNetworkError = e.message === 'Failed to fetch' || e.name === 'TypeError';
        if (!isNetworkError) setError(e.message);
      })
      .finally(() => setLoading(false));
  }};
}
