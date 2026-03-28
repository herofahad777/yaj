import { create } from "zustand";
import { supabase, signInWithGoogle, signOut as supabaseSignOut } from "@/lib/supabaseClient";
import type { User, Session } from "@supabase/supabase-js";
import type { Profile } from "@/types";

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  signIn: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  fetchProfile: (userId: string) => Promise<Profile | null>;
  syncSession: (session: Session | null) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: false,
  initialized: false,

  setUser: (user) => set({ user }),
  
  setProfile: (profile) => set({ profile }),

  fetchProfile: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      
      if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile:", error);
      }
      return data || null;
    } catch (err) {
      console.error("Unexpected error fetching profile:", err);
      return null;
    }
  },

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

  signInWithEmail: async (email, password) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      set({ user: data.user });
      if (data.user) {
        const profile = await get().fetchProfile(data.user.id);
        set({ profile });
      }
    } catch (error) {
      console.error("Email sign in error:", error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signUp: async (email, password, fullName) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      if (error) throw error;
      set({ user: data.user });
      if (data.user) {
        const profile = await get().fetchProfile(data.user.id);
        set({ profile });
      }
    } catch (error) {
      console.error("Sign up error:", error);
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

  syncSession: async (session) => {
    if (!session) {
      set({ user: null, profile: null, initialized: true });
      return;
    }

    const { user } = session;
    const sameUser = get().user?.id === user.id;

    if (!sameUser) {
      set({ user, initialized: true }); // Proceed to UI immediately
      // Fetch profile in background
      get().fetchProfile(user.id).then(profile => {
        set({ profile });
      });
    } else {
      set({ initialized: true });
    }
  },

  initialize: async () => {
    if (get().initialized) return;

    try {
      // Faster response by checking session immediately
      const { data: { session } } = await supabase.auth.getSession();
      await get().syncSession(session);
    } catch (error) {
      console.error("Initialize error:", error);
      set({ initialized: true }); // Always clear loading screen
    }
  },
}));

// Global listener with deduplication logic
supabase.auth.onAuthStateChange(async (event, session) => {
  const store = useAuthStore.getState();
  
  if (event === "SIGNED_OUT") {
    store.setUser(null);
    store.setProfile(null);
    useAuthStore.setState({ initialized: true });
  } else if (session?.user) {
    if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION") {
      // syncSession handles initialization and profile fetching
      await store.syncSession(session);
    }
  } else if (event === "INITIAL_SESSION") {
    // If no user on initial check, still must initialize
    useAuthStore.setState({ initialized: true });
  }
});
