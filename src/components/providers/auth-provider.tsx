"use client";

import { createContext, type ReactNode, useCallback, useEffect, useMemo, useState } from "react";

import { iamApi } from "@/lib/iam/api";
import { ApiError } from "@/lib/http";
import type { ProfileResponse } from "@/types/api";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  user: ProfileResponse | null;
  status: AuthStatus;
  login: (payload: { email: string; password: string; mfaToken?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ProfileResponse | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const refresh = useCallback(async () => {
    try {
      const profile = await iamApi.me.profile();
      setUser(profile);
      setStatus("authenticated");
    } catch (error) {
      setUser(null);
      setStatus("unauthenticated");

      if (!(error instanceof ApiError && error.status === 401)) {
        console.error("Failed to load profile", error);
      }
      throw error;
    }
  }, []);

  useEffect(() => {
    refresh().catch(() => undefined);
  }, [refresh]);

  const login = useCallback(
    async (payload: { email: string; password: string; mfaToken?: string }) => {
      await iamApi.auth.login(payload);
      await refresh();
    },
    [refresh],
  );

  const logout = useCallback(async () => {
    try {
      await iamApi.auth.logout();
    } catch (error) {
      console.error("Failed to logout", error);
    } finally {
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      login,
      logout,
      refresh,
    }),
    [login, logout, refresh, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
