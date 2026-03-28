import { create } from "zustand";
import { supabase } from "@/lib/supabaseClient";
import type { Problem, Donation, ProblemUpdate, ProblemHelper, ProblemReview } from "@/types";

interface ProblemsState {
  problems: Problem[];
  currentProblem: Problem | null;
  donations: Donation[];
  updates: ProblemUpdate[];
  helpers: ProblemHelper[];
  reviews: ProblemReview[];
  loading: boolean;
  error: string | null;
  fetchProblems: (category?: "public" | "disaster") => Promise<void>;
  fetchProblem: (id: string) => Promise<void>;
  fetchDonations: (problemId: string) => Promise<void>;
  fetchUpdates: (problemId: string) => Promise<void>;
  fetchHelpers: (problemId: string) => Promise<void>;
  fetchReviews: (problemId: string) => Promise<void>;
  createProblem: (problem: Partial<Problem>) => Promise<Problem>;
  updateProblem: (id: string, updates: Partial<Problem>) => Promise<void>;
  addDonation: (donation: Partial<Donation>) => Promise<Donation>;
  addUpdate: (update: Partial<ProblemUpdate>) => Promise<void>;
  addHelper: (helper: Partial<ProblemHelper>) => Promise<void>;
  addReview: (review: Partial<ProblemReview>) => Promise<void>;
}

export const useProblemsStore = create<ProblemsState>((set, get) => ({
  problems: [],
  currentProblem: null,
  donations: [],
  updates: [],
  helpers: [],
  reviews: [],
  loading: false,
  error: null,

  fetchProblems: async (category) => {
    set({ loading: true, error: null });
    try {
      let query = supabase
        .from("problems")
        .select("*, profile:profiles(*)")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (category) {
        query = query.eq("category", category);
      }

      const { data, error } = await query;
      if (error) throw error;
      set({ problems: data || [] });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  fetchProblem: async (id) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("problems")
        .select("*, profile:profiles(*)")
        .eq("id", id)
        .single();
      if (error) throw error;
      set({ currentProblem: data });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  fetchDonations: async (problemId) => {
    try {
      const { data, error } = await supabase
        .from("donations")
        .select("*, profile:profiles(*)")
        .eq("problem_id", problemId)
        .eq("status", "completed")
        .order("created_at", { ascending: false });
      if (error) throw error;
      set({ donations: data || [] });
    } catch (error) {
      console.error("Fetch donations error:", error);
    }
  },

  fetchUpdates: async (problemId) => {
    try {
      const { data, error } = await supabase
        .from("problem_updates")
        .select("*, profile:profiles(*)")
        .eq("problem_id", problemId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      set({ updates: data || [] });
    } catch (error) {
      console.error("Fetch updates error:", error);
    }
  },

  fetchHelpers: async (problemId) => {
    try {
      const { data, error } = await supabase
        .from("problem_helpers")
        .select("*, profile:profiles(*)")
        .eq("problem_id", problemId);
      if (error) throw error;
      set({ helpers: data || [] });
    } catch (error) {
      console.error("Fetch helpers error:", error);
    }
  },

  fetchReviews: async (problemId) => {
    try {
      const { data, error } = await supabase
        .from("problem_reviews")
        .select("*, profile:profiles(*)")
        .eq("problem_id", problemId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      set({ reviews: data || [] });
    } catch (error) {
      console.error("Fetch reviews error:", error);
    }
  },

  createProblem: async (problem) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("problems")
        .insert(problem)
        .select()
        .single();
      if (error) throw error;
      set((state) => ({ problems: [data, ...state.problems] }));
      return data;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateProblem: async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from("problems")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      set((state) => ({
        problems: state.problems.map((p) => (p.id === id ? data : p)),
        currentProblem: state.currentProblem?.id === id ? data : state.currentProblem,
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  addDonation: async (donation) => {
    try {
      const { data, error } = await supabase
        .from("donations")
        .insert(donation)
        .select()
        .single();
      if (error) throw error;
      
      const problem = get().currentProblem;
      if (problem && donation.problem_id === problem.id) {
        const newAmount = problem.amount_raised + (donation.amount || 0);
        const newDonors = problem.donors_count + 1;
        await get().updateProblem(problem.id, {
          amount_raised: newAmount,
          donors_count: newDonors,
        });
      }
      
      return data;
    } catch (error) {
      console.error("Add donation error:", error);
      throw error;
    }
  },

  addUpdate: async (update) => {
    try {
      const { data, error } = await supabase
        .from("problem_updates")
        .insert(update)
        .select("*, profile:profiles(*)")
        .single();
      if (error) throw error;
      set((state) => ({ updates: [data, ...state.updates] }));
    } catch (error) {
      console.error("Add update error:", error);
      throw error;
    }
  },

  addHelper: async (helper) => {
    try {
      const { data, error } = await supabase
        .from("problem_helpers")
        .insert(helper)
        .select("*, profile:profiles(*)")
        .single();
      if (error) throw error;
      set((state) => ({ helpers: [...state.helpers, data] }));
    } catch (error) {
      console.error("Add helper error:", error);
      throw error;
    }
  },

  addReview: async (review) => {
    try {
      const { data, error } = await supabase
        .from("problem_reviews")
        .insert(review)
        .select("*, profile:profiles(*)")
        .single();
      if (error) throw error;
      set((state) => ({ reviews: [data, ...state.reviews] }));
    } catch (error) {
      console.error("Add review error:", error);
      throw error;
    }
  },
}));
