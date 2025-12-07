'use client';

import { useState, useEffect, useCallback } from 'react';
export function useAPI(apiFunction, dependencies = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const fetchData = useCallback(async () => {
    let isMounted = true
    try {
      setLoading(true)
      setError(null)
      const result = await apiFunction()
      // result mungkin berisi { data: [...] } atau langsung [...]
      const payload = result?.data ?? result
      if (isMounted) setData(payload)
      return payload
    } catch (err) {
      if (isMounted) setError(err?.message ?? String(err))
      throw err
    } finally {
      if (isMounted) setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiFunction])

  // panggil sekali saat mount / saat dependencies berubah
  useEffect(() => {
    let isMounted = true
    fetchData().catch(() => {
      /* error sudah diset di fetchData */
    })
    return () => {
      isMounted = false
    }
    // dependencies disediakan oleh pemanggil hook
  }, dependencies) // jangan tambahkan fetchData di deps kecuali kamu ingin behaviour berbeda

  // refetch: panggil ulang fetchData dan kembalikan hasilnya
  const refetch = useCallback(async () => {
    return await fetchData()
  }, [fetchData])

  return { data, loading, error, refetch }
}

export function useAPICall(defaultApiFunction) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (maybeApiFnOrArg, ...restArgs) => {
      // Determine apiFn and args:
      let apiFn, args;

      if (typeof maybeApiFnOrArg === "function") {
        // Called as execute(apiFn, ...args)
        apiFn = maybeApiFnOrArg;
        args = restArgs;
      } else if (defaultApiFunction) {
        // Called as execute(...args) and we have a default API function
        apiFn = defaultApiFunction;
        // maybeApiFnOrArg is actually the first arg for apiFn (e.g. formData)
        args = typeof maybeApiFnOrArg === "undefined" ? restArgs : [maybeApiFnOrArg, ...restArgs];
      } else {
        throw new Error("No API function provided to execute and no default was set in useAPICall.");
      }

      try {
        setLoading(true);
        setError(null);
        const result = await apiFn(...args);
        return result;
      } catch (err) {
        const message = err?.message ?? String(err);
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [defaultApiFunction]
  );

  return { execute, loading, error };
}
