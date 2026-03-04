import { ref, computed, watch } from "vue";
import { TitrationEngine } from "../core/chemistry/titrationEngine";

/**
 * useTitration Composable
 * Manages the reactive chemical state of the titration experiment.
 */
export function useTitration() {
  // --- Simulation Parameters ---
  const massKHP = ref(0.5105); // Standard mass in grams for 0.1M NaOH titration
  const molarityNaOH = ref(0.1);
  const volInitial = ref(50); // mL of water added to dissolving KHP

  const currentVolume = ref(0); // mL of NaOH added

  const currentPH = computed(() => {
    return TitrationEngine.calculatePH(
      currentVolume.value,
      massKHP.value,
      molarityNaOH.value,
      volInitial.value,
    );
  });

  // For slope, we still want to track the "previous" state to calculate deltaPH/deltaV
  const slope = ref(0);
  const history = ref<{ vol: number; ph: number }[]>([]);

  /**
   * Updates the volume. pH and slope will update reactively.
   */
  function addVolume(deltaV: number) {
    const oldVol = currentVolume.value;
    const oldPH = currentPH.value;

    currentVolume.value += deltaV;

    // Update slope manually here for discrete additions (drops)
    slope.value = TitrationEngine.calculateSlope(
      oldVol,
      oldPH,
      currentVolume.value,
      currentPH.value,
    );

    // Keep a small history for AI analysis
    history.value.push({ vol: currentVolume.value, ph: currentPH.value });
    if (history.value.length > 20) history.value.shift();
  }

  /**
   * Returns a hex color for the phenolphthalein indicator.
   * Region: 8.2 (Transparent) to 10.0 (Deep Pink/Magenta)
   */
  const indicatorColor = computed(() => {
    const ph = currentPH.value;
    if (ph < 8.2) return "#FFFFFF"; // Transparent (rendered as clear water)

    // Calculate intensity of pink (0 to 1)
    const intensity = Math.min(1, (ph - 8.2) / 1.8);

    // Transition from white to deep pink (#F472B6 -> #DB2777)
    // For simplicity, we interpolate between transparent/white and a target pink
    if (intensity < 0.1) return "#FFC0CB"; // Pale pink (Endpoint flip)
    if (intensity < 0.5) return "#F472B6"; // Standard pink
    return "#DB2777"; // Deep magenta (over-titrated)
  });

  /**
   * Applies continuous flow from the buret based on valve state.
   * @param delta - Frame delta time in seconds.
   * @param valveAngle - Current stopcock angle (0 to PI/2).
   */
  function applyValveFlow(delta: number, valveAngle: number) {
    if (valveAngle < 0.01) return; // Closed or jitter

    // Max flow rate: 0.5 mL/s at full open (approx 10 drops/sec)
    const MAX_FLOW = 0.5;
    const openRatio = valveAngle / (Math.PI / 2);
    const deltaV = MAX_FLOW * openRatio * delta;

    if (currentVolume.value + deltaV <= 50) {
      addVolume(deltaV);
    }
  }

  return {
    massKHP,
    molarityNaOH,
    currentVolume,
    currentPH,
    slope,
    indicatorColor,
    addVolume,
    applyValveFlow,
  };
}
