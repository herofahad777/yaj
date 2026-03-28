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

// Helper to fetch profile consistently
async function fetchProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    
    if (error && error.code !== "PGRST116") { // PGRST116 is "no rows returned"
      console.error("Error fetching profile:", error);
    }
    return data || null;
  } catch (err) {
    console.error("Unexpected error fetching profile:", err);
    return null;
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
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
    // Only initialize once
    if (get().initialized) return;

    set({ loading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const user = session.user;
        set({ user });
        const profile = await fetchProfile(user.id);
        set({ profile });
      }
    } catch (error) {
      console.error("Initialize error:", error);
    } finally {
      set({ loading: false, initialized: true });
    }
  },
}));

// Listen for auth state changes
supabase.auth.onAuthStateChange(async (event, session) => {
  const store = useAuthStore.getState();
  
  console.log("Auth Event:", event);

  if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") && session?.user) {
    const user = session.user;
    store.setUser(user);
    const profile = await fetchProfile(user.id);
    store.setProfile(profile);
  } else if (event === "SIGNED_OUT") {
    store.setUser(null);
    store.setProfile(null);
  } else if (event === "INITIAL_SESSION") {
    // initialize() handles this, but we can sync here too if needed
    if (session?.user) {
      const user = session.user;
      store.setUser(user);
      const profile = await fetchProfile(user.id);
      store.setProfile(profile);
    }
    // Set initialized true if it wasn't already (happens if onAuthStateChange fires before initialize promise resolves)
    if (!store.initialized) {
      useAuthStore.setState({ initialized: true });
    }
  }
});
