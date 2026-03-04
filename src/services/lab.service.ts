import { supabase } from "../api/supabase";
import type { Session, Log } from "../types";

/**
 * LabService: Handles all interactions with the TitraSmart Supabase Database.
 * This class ensures that all titration-related data is persisted asynchronously.
 */
export class LabService {
  private readonly SESSION_KEY = "titrasmart_session_id";

  /**
   * Gets an existing incomplete session or creates a new one.
   * Persists the session_id in localStorage to survive page reloads.
   */
  async getOrCreateSession(khpMass: number, targetMolarity: number): Promise<string | null> {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId) {
      console.error("[LabService] No active auth session.");
      return null;
    }

    // 1. Check localStorage for a persisted session
    const cachedId = localStorage.getItem(this.SESSION_KEY);
    if (cachedId) {
      const { data: existing } = await supabase
        .from("lab_sessions")
        .select("id, is_completed")
        .eq("id", cachedId)
        .eq("user_id", userId)
        .single();

      if (existing && !existing.is_completed) {
        console.log(`[LabService] Reusing session ${cachedId}`);
        return existing.id;
      }
      // Stale or completed — clear it
      localStorage.removeItem(this.SESSION_KEY);
    }

    // 2. Fallback: Create a new session
    const { data, error } = await supabase
      .from("lab_sessions")
      .insert([
        {
          user_id: userId,
          khp_mass_g: khpMass,
          target_molarity_naoh: targetMolarity,
          is_completed: false,
        },
      ])
      .select("id")
      .single();

    if (error) {
      console.error("[LabService] Failed to start session:", error);
      return null;
    }

    localStorage.setItem(this.SESSION_KEY, data.id);
    return data.id;
  }

  /**
   * Persists a batch of titration logs efficiently.
   */
  async logTitrationStep(logs: Log[]): Promise<boolean> {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId) {
      console.error("[LabService] Cannot log steps without an auth session.");
      return false;
    }

    // Ensure all logs have the correct userId before inserting
    const logsWithUser = logs.map((l) => ({ ...l, user_id: userId }));

    const { error } = await supabase.from("titration_logs").insert(logsWithUser);

    if (error) {
      console.error("[LabService] Failed to log titration steps:", error);
      return false;
    }

    return true;
  }

  /**
   * Records the final result and completes the session.
   */
  async completeSession(sessionId: string): Promise<boolean> {
    const { error } = await supabase
      .from("lab_sessions")
      .update({ is_completed: true })
      .eq("id", sessionId);

    if (error) {
      console.error("[LabService] Failed to complete session:", error);
      return false;
    }

    // Clear localStorage so next visit creates a fresh session
    localStorage.removeItem(this.SESSION_KEY);
    return true;
  }

  /**
   * Retrieves historical logs for a specific session.
   */
  async getSessionLogs(sessionId: string): Promise<Log[]> {
    const { data, error } = await supabase
      .from("titration_logs")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[LabService] Failed to fetch session logs:", error);
      return [];
    }

    return data as Log[];
  }
}

export const labService = new LabService();
