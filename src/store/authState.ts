import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { authService } from "../services/auth.service";
import type { User, Session } from "@supabase/supabase-js";

export const useAuthState = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const session = ref<Session | null>(null);
  const isLoading = ref(true);

  const isAuthenticated = computed(() => !!session.value);
  const displayName = computed(() => {
    if (!user.value) return "Guest";
    return user.value.user_metadata?.full_name || user.value.email?.split("@")[0] || "Scientist";
  });

  /**
   * Initializes the auth state by checking the current session
   * and setting up a listener for future changes.
   */
  async function initialize() {
    if (!isLoading.value) return; // Already initialized or initializing

    try {
      // 1. Set up real-time listener FIRST so we don't miss any events
      authService.onAuthStateChange((event, newSession) => {
        console.log(`[Auth Store] Event: ${event}`, newSession?.user?.email);
        session.value = newSession;
        user.value = newSession?.user ?? null;
        isLoading.value = false; // Mark as done on first official event
      });

      // 2. Get initial session immediately
      const currentSession = await authService.getSession();
      if (currentSession) {
        session.value = currentSession;
        user.value = currentSession.user;
      }
    } catch (error) {
      console.error("Auth initialization failed:", error);
    } finally {
      // Small delay to ensure reactivity settles before we unblock navigation
      await new Promise((resolve) => setTimeout(resolve, 50));
      isLoading.value = false;
    }
  }

  async function signOut() {
    isLoading.value = true;
    try {
      await authService.signOut();
      user.value = null;
      session.value = null;
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      isLoading.value = false;
    }
  }

  return {
    user,
    session,
    isLoading,
    isAuthenticated,
    displayName,
    initialize,
    signOut,
  };
});
