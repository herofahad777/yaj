import { create } from "zustand";
import { supabase, signInWithGoogle, signOut as supabaseSignOut } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types";

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: false,
  initialized: false,

  setUser: (user) => set({ user }),
  
  setProfile: (profile) => set({ profile }),

  signIn: async () => {
    set({ loading: true });
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    set({ loading: true });
    try {
      await supabaseSignOut();
      set({ user: null, profile: null });
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  initialize: async () => {
    set({ loading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        set({ user: session.user });
        
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        
        set({ profile: profile || null });
      }
    } catch (error) {
      console.error("Initialize error:", error);
    } finally {
      set({ loading: false, initialized: true });
    }
  },
}));

supabase.auth.onAuthStateChange(async (event, session) => {
  const store = useAuthStore.getState();
  
  if (event === "SIGNED_IN" && session?.user) {
    store.setUser(session.user);
    
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();
    
    store.setProfile(profile || null);
  } else if (event === "SIGNED_OUT") {
    store.setUser(null);
    store.setProfile(null);
  }
});
