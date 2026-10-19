import type { User } from "@/types";

/**
 * Session storage for the bearer JWT.
 *
 * LIMITATION: the token lives in localStorage so the session survives reloads.
 * Any script running on this origin (e.g. via XSS) can read it — localStorage is
 * NOT a secure vault. The short 15-minute token lifetime limits exposure. A future
 * hardening step is httpOnly refresh cookies issued by the API.
 * Never log the token.
 */
const KEY = "devsphere.session";

export interface StoredSession {
  user: User;
  accessToken: string;
}

export function readSession(): StoredSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as StoredSession;
    if (!s.accessToken || isTokenExpired(s.accessToken)) {
      window.localStorage.removeItem(KEY);
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

export function writeSession(s: StoredSession) {
  window.localStorage.setItem(KEY, JSON.stringify(s));
}

export function clearSession() {
  if (typeof window !== "undefined") window.localStorage.removeItem(KEY);
}

export function getAccessToken(): string | null {
  return readSession()?.accessToken ?? null;
}

/** Reads the exp claim (seconds). Returns ms timestamp or null. Does not verify the signature. */
export function getTokenExpiry(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof json.exp === "number" ? json.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string, skewMs = 5000): boolean {
  const exp = getTokenExpiry(token);
  return exp !== null && Date.now() + skewMs >= exp;
}
