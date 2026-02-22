import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { api } from "./api";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  dbUser: DbUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signInWithGithub: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

export interface DbUser {
  id: string;
  supabaseUserId: string;
  email: string;
  fullName: string | null;
  stripeCustomerId: string | null;
  fixCount: number;
  createdAt: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Register user in our database after Supabase auth
  const registerUser = useCallback(async (supabaseUser: User) => {
    try {
      const result = await api.post<DbUser>("/auth/register", {
        supabaseUserId: supabaseUser.id,
        email: supabaseUser.email,
        fullName: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || null,
      });
      setDbUser(result);
    } catch (err) {
      // User might already exist - try to fetch instead
      try {
        const existing = await api.get<DbUser>("/auth/me");
        setDbUser(existing);
      } catch {
        console.error("Failed to register/fetch user:", err);
      }
    }
  }, []);

  // Fetch existing DB user
  const fetchDbUser = useCallback(async () => {
    try {
      const existing = await api.get<DbUser>("/auth/me");
      setDbUser(existing);
    } catch {
      // User might not exist in DB yet - that's OK during initial load
      setDbUser(null);
    }
  }, []);

  useEffect(() => {
    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchDbUser();
      }
      setLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchDbUser();
      } else {
        setDbUser(null);
      }
      setLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, [fetchDbUser]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) return { error: error.message };
    if (data.user) {
      await registerUser(data.user);
    }
    return { error: null };
  };

  const signInWithGithub = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setDbUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ session, user, dbUser, loading, signIn, signUp, signInWithGithub, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
