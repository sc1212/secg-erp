import { useState, useEffect } from 'react';

const NETWORK_EVENT = 'secg-network-status';

function publishNetworkStatus(offline) {
  window.dispatchEvent(new CustomEvent(NETWORK_EVENT, { detail: { offline } }));
}

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
        if (!cancelled) {
          setData(result);
          publishNetworkStatus(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          const isNetworkError = err.message === 'Failed to fetch' || err.name === 'TypeError';
          setError(isNetworkError ? 'Network unavailable. Showing fallback/demo data.' : err.message);
          publishNetworkStatus(isNetworkError);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, deps);

  return {
    data,
    loading,
    error,
    refetch: () => {
      setLoading(true);
      setError(null);
      fetcher()
        .then((result) => {
          setData(result);
          publishNetworkStatus(false);
        })
        .catch((e) => {
          const isNetworkError = e.message === 'Failed to fetch' || e.name === 'TypeError';
          setError(isNetworkError ? 'Network unavailable. Showing fallback/demo data.' : e.message);
          publishNetworkStatus(isNetworkError);
        })
        .finally(() => setLoading(false));
    },
  };
}

export { NETWORK_EVENT };
