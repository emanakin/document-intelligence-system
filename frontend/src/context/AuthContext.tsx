"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import authService, { User } from "@/services/auth";

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login(email: string, pw: string): Promise<void>;
  signup(email: string, pw: string, name: string): Promise<void>;
  logout(): void;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // bootstrap – try to restore session
  useEffect(() => {
    authService
      .fetchUserProfile()
      .then(setUser)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const login = async (e: string, p: string) => {
    setLoading(true);
    const u = await authService.login(e, p);
    setUser(u);
    setLoading(false);
  };

  const signup = async (e: string, p: string, n: string) => {
    setLoading(true);
    const u = await authService.signup(e, p, n);
    setUser(u);
    setLoading(false);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
