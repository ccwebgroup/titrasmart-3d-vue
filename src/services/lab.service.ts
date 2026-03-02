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
  async startSession(userId: string, experimentType: string): Promise<string | null> {
    const { data, error } = await supabase
      .from("sessions")
      .insert([
        {
          user_id: userId,
          experiment_type: experimentType,
          status: "active",
          lab_state: {},
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
  async completeSession(sessionId: string, finalState: any): Promise<boolean> {
    const { error } = await supabase
      .from("sessions")
      .update({
        status: "completed",
        lab_state: finalState,
        updated_at: new Date().toISOString(),
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
