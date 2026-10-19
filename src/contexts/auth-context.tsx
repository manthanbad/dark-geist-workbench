import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { authService } from "@/services/auth";
import { setUnauthorizedHandler } from "@/services/api";
import { clearSession, getTokenExpiry, readSession, writeSession } from "@/services/session";
import type { LoginInput, RegisterInput, User } from "@/types";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: (reason?: "expired") => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState(() => readSession());
  const queryClient = useQueryClient();
  const router = useRouter();

  // Hydrate after mount (SSR has no localStorage)
  useEffect(() => setSession(readSession()), []);

  const logout = useCallback(
    (reason?: "expired") => {
      clearSession();
      setSession(null);
      queryClient.cancelQueries();
      queryClient.clear();
      if (reason === "expired") toast.error("Your session expired. Please sign in again.");
      router.navigate({ to: "/login", replace: true });
    },
    [queryClient, router],
  );

  // 401 from the API → sign out
  useEffect(() => {
    setUnauthorizedHandler(() => logout("expired"));
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  // Auto-logout when the 15-minute JWT expires
  useEffect(() => {
    if (!session) return;
    const exp = getTokenExpiry(session.accessToken);
    if (!exp) return;
    const t = window.setTimeout(() => logout("expired"), Math.max(0, exp - Date.now()));
    return () => window.clearTimeout(t);
  }, [session, logout]);

  const persist = useCallback((user: User, accessToken: string) => {
    const s = { user, accessToken };
    writeSession(s);
    setSession(s);
  }, []);

  const login = useCallback(
    async (input: LoginInput) => {
      const res = await authService.login(input);
      persist(res.user, res.accessToken);
    },
    [persist],
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const res = await authService.register(input);
      persist(res.user, res.accessToken);
    },
    [persist],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ user: session?.user ?? null, isAuthenticated: !!session, login, register, logout }),
    [session, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
