"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "@/services/api";
import { useLang } from "@/context/LangContext";
export interface User { id: string; email: string; first_name: string; last_name: string; company_name: string; role: string; lang: string; }
interface Ctx { user: User | null; accessToken: string | null; isLoading: boolean; login: (t: string, u: User) => void; logout: () => Promise<void>; updateUser: (u: User) => void; }
const AuthContext = createContext<Ctx>({ user: null, accessToken: null, isLoading: true, login: () => {}, logout: async () => {}, updateUser: () => {} });
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null); const [accessToken, setAccessToken] = useState<string | null>(null); const [isLoading, setIsLoading] = useState(true);
  const { setLang } = useLang();
  const apply = (u: User) => { if (u.lang === "en" || u.lang === "fr") setLang(u.lang); };
  useEffect(() => { const s = localStorage.getItem("nbk-pro-access-token"); if (s) { api.auth.getMe(s).then(r => { if (r.data?.user) { const u = r.data.user as User; setUser(u); setAccessToken(s); apply(u); } else { api.auth.refreshToken().then(rf => { if (rf.data?.accessToken) { const t = rf.data.accessToken; localStorage.setItem("nbk-pro-access-token", t); setAccessToken(t); api.auth.getMe(t).then(m => { if (m.data?.user) { const u = m.data.user as User; setUser(u); apply(u); } }); } else localStorage.removeItem("nbk-pro-access-token"); }); } setIsLoading(false); }); } else { api.auth.refreshToken().then(r => { if (r.data?.accessToken) { const t = r.data.accessToken; localStorage.setItem("nbk-pro-access-token", t); setAccessToken(t); api.auth.getMe(t).then(m => { if (m.data?.user) { const u = m.data.user as User; setUser(u); apply(u); } }); } setIsLoading(false); }); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const login = (t: string, u: User) => { localStorage.setItem("nbk-pro-access-token", t); setAccessToken(t); setUser(u); apply(u); };
  const logout = async () => { if (accessToken) await api.auth.logout(accessToken); localStorage.removeItem("nbk-pro-access-token"); setAccessToken(null); setUser(null); };
  return <AuthContext.Provider value={{ user, accessToken, isLoading, login, logout, updateUser: setUser }}>{children}</AuthContext.Provider>;
}
export function useAuth() { return useContext(AuthContext); }
