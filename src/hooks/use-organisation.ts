"use client";

import { useCallback, useEffect, useState } from "react";

import { iamApi } from "@/lib/iam/api";
import type { OrganisationDetails } from "@/types/api";
import { useAuth } from "./use-auth";

export function useOrganisation() {
  const { status } = useAuth();
  const [organisation, setOrganisation] = useState<OrganisationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const refresh = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await iamApi.admin.organisation.get();
        if (!cancelled) {
          setOrganisation(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load organisation");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [reloadToken, status]);

  return {
    organisation,
    isLoading: status === "authenticated" ? isLoading : false,
    error,
    refresh,
  };
}
