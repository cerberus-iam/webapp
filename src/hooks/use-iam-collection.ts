"use client";

import { useCallback, useEffect, useState } from "react";

import { getApiErrorMessage } from "@/lib/http";

type CollectionResponse<T> = {
  data: T[];
  total: number;
};

export function useIamCollection<T>(
  fetcher: () => Promise<CollectionResponse<T>>,
  enabled: boolean,
) {
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  const refresh = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;
    const run = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetcher();
        if (cancelled) return;
        setData(response.data);
        setTotal(response.total ?? response.data.length);
      } catch (err) {
        if (cancelled) return;
        setError(getApiErrorMessage(err, "Failed to load data"));
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [enabled, fetcher, reloadToken]);

  return {
    data,
    total,
    error,
    isLoading: enabled ? isLoading : false,
    refresh,
  };
}
