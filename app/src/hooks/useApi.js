// src/hooks/useApi.js
import { useState, useEffect, useCallback } from 'react';
import { extractError } from '../utils/errorHandler';

/**
 * useApi recibe una función que retorna una promesa Axios (fn)
 * y un array de dependencias (deps).
 * Devuelve { data, isLoading, error, refetch }.
 */
export function useApi(fn, deps = []) {
  const [data, setData]         = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError]       = useState(null);

  const callApi = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fn();
      setData(res.data);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    callApi();
  }, [callApi]);

  return { data, isLoading, error, refetch: callApi };
}
