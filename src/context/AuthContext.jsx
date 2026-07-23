import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase.js";
import { getSessionUser, signOut as authSignOut } from "../lib/auth.js";

const AuthContext = createContext(null);

// Demo admin numbers (until an admin sets profiles.role = 'admin' in the DB).
const ADMIN_PHONES = new Set(["+919000000001", "+910000000000"]);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (uid) => {
    if (!uid || !isSupabaseConfigured || !supabase) return;
    const { data } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
    if (data) setProfile(data);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const u = await getSessionUser();
      if (!active) return;
      setUser(u);
      if (u?.id) await loadProfile(u.id);
      setLoading(false);
    })();

    // React to Supabase auth changes (login/logout/refresh).
    let sub;
    if (isSupabaseConfigured && supabase) {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        const u = session ? { id: session.user.id, phone: session.user.user_metadata?.phone || null } : null;
        setUser(u);
        setProfile(null);
        if (u?.id) loadProfile(u.id);
      });
      sub = data.subscription;
    }
    return () => { active = false; sub?.unsubscribe?.(); };
  }, [loadProfile]);

  const signOut = useCallback(async () => {
    await authSignOut();
    setUser(null);
    setProfile(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: profile?.role === "admin" || ADMIN_PHONES.has(user?.phone),
      setUser,
      setProfile,
      refreshProfile: () => user?.id && loadProfile(user.id),
      signOut,
    }),
    [user, profile, loading, signOut, loadProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
