import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import { labService } from "../services/lab.service";
import { useAuthState } from "./authState";
import { useTitration } from "../composables/useTitration";
import { useDebounceFn } from "@vueuse/core";
import type { ChemData, Log } from "../types";

/**
 * LabState: The central "Source of Truth" for the titration simulation.
 */
export const useLabState = defineStore("lab", () => {
  const authState = useAuthState();
  const titration = useTitration();

  // --- Persistent State ---
  const sessionId = ref<string | null>(null);

  // The userId is derived from the auth current state
  const userId = computed(() => authState.user?.id || "guest_user");

  const isSaving = ref<boolean>(false);
  const titrationLogs = ref<Log[]>([]);

  // --- Real-time Simulation State ---
  const currentChemData = computed<ChemData>(() => ({
    volume: titration.currentVolume.value,
    ph: titration.currentPH.value,
    slope: titration.slope.value,
    isEndEndpoint: titration.currentPH.value >= 8.2,
  }));

  const flaskColor = computed(() => titration.indicatorColor.value);

  // --- Persistence & Logging ---
  const logToSupabase = useDebounceFn(async () => {
    if (!sessionId.value) return;
    await addTitrantDrop(0, titration.currentPH.value, titration.slope.value);
  }, 500);

  watch(
    () => titration.currentVolume.value,
    () => {
      logToSupabase();
    },
  );

  // --- Actions ---
  /**
   * Initializes a session for the user when they enter the lab.
   */
  async function initializeLabSession() {
    const id = await labService.getOrCreateSession(
      titration.massKHP.value,
      titration.molarityNaOH.value,
    );
    if (id) {
      sessionId.value = id;
      console.log(`[TitraSmart] Session ${id} initialized.`);
    }
  }

  /**
   * Updates the simulation data and periodically persists to Supabase.
   */
  async function addTitrantDrop(deltaV: number, newPh: number, slope: number) {
    // 1. Update Reactive State (UI Reflects immediately)
    // titration.currentVolume.value += deltaV; // No need, slider/addVolume does this
    // We just ensure currentChemData (which is computed) has latest ph/slope
    // Actually, titration is already updating these.
    // This method should mainly focus on the logging part as it's the bridge to persistence.

    // Check for "Endpoint" transition (Placeholder logic)
    if (newPh >= 8.2 && currentChemData.value.ph < 8.2) {
      currentChemData.value.isEndEndpoint = true;
    }

    // 2. Add to Pending Logs
    if (sessionId.value) {
      titrationLogs.value.push({
        session_id: sessionId.value,
        user_id: userId.value,
        vol_added_ml: currentChemData.value.volume,
        ph_value: newPh,
        slope_value: slope,
      });

      // 3. Batch Persistence strategy (Every 0.1 mL or every significant transition)
      // For demonstration, we save every 10 steps.
      if (titrationLogs.value.length >= 10) {
        await persistLogs();
      }
    }
  }

  /**
   * Flushes pending logs to Supabase via LabService.
   */
  async function persistLogs() {
    if (titrationLogs.value.length === 0 || !sessionId.value) return;

    isSaving.value = true;
    const batch = [...titrationLogs.value];
    titrationLogs.value = []; // Optimistically clear

    const success = await labService.logTitrationStep(batch);
    if (!success) {
      console.error("[TitraSmart] Failed to persist titration data.");
      // Fallback: Return logs to the queue?
      titrationLogs.value = [...batch, ...titrationLogs.value];
    }
    isSaving.value = false;
  }

  /**
   * Finalizes the session data.
   */
  async function endSession() {
    if (!sessionId.value) return;

    await persistLogs(); // Flush remaining
    await labService.completeSession(sessionId.value);
    console.log(`[TitraSmart] Session ${sessionId.value} completed.`);
  }

  return {
    titration,
    sessionId,
    userId,
    isSaving,
    currentChemData,
    flaskColor,
    initializeLabSession,
    addTitrantDrop,
    persistLogs,
    endSession,
  };
});
