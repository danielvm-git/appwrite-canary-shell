import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Models } from "appwrite";
import { appwriteConfigured, createAccount } from "../lib/appwrite";

export type SessionState = {
  loading: boolean;
  user: Models.User<Models.Preferences> | null;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionState | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);

  const refresh = useCallback(async () => {
    if (!appwriteConfigured()) {
      setUser(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setUser(await createAccount().get());
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await createAccount().deleteSession("current");
    } finally {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <SessionContext.Provider value={{ loading, user, refresh, signOut }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionState {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return ctx;
}