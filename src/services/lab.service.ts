import { supabase } from "../api/supabase";
import type { Session, Log } from "../types";

/**
 * LabService: Handles all interactions with the TitraSmart Supabase Database.
 * This class ensures that all titration-related data is persisted asynchronously.
 */
export class LabService {
  /**
   * Initializes a new session for a user.
   */
  async startSession(
    userId: string,
    khpMass: number,
    targetMolarity: number,
  ): Promise<string | null> {
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
      console.error("Failed to start session:", error);
      return null;
    }

    return data.id;
  }

  /**
   * Persists a batch of titration logs efficiently.
   */
  async logTitrationStep(logs: Log[]): Promise<boolean> {
    const { error } = await supabase.from("titration_logs").insert(logs);

    if (error) {
      console.error("Failed to log titration steps:", error);
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
      .update({
        is_completed: true,
      })
      .eq("id", sessionId);

    if (error) {
      console.error("Failed to complete session:", error);
      return false;
    }

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
      console.error("Failed to fetch session logs:", error);
      return [];
    }

    return data as Log[];
  }
}

export const labService = new LabService();
