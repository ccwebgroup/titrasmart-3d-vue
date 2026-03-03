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
  const currentPH = ref(7.0);
  const slope = ref(0);

  // History for slope calculation (dpH/dV)
  const history = ref<{ vol: number; ph: number }[]>([]);

  /**
   * Updates the volume and calculates resulting pH/slope.
   */
  function addVolume(deltaV: number) {
    const oldVol = currentVolume.value;
    const oldPH = currentPH.value;

    currentVolume.value += deltaV;

    // Calculate new pH
    const newPH = TitrationEngine.calculatePH(
      currentVolume.value,
      massKHP.value,
      molarityNaOH.value,
      volInitial.value,
    );

    currentPH.value = newPH;

    // Calculate slope
    slope.value = TitrationEngine.calculateSlope(oldVol, oldPH, currentVolume.value, newPH);

    // Keep a small history for AI analysis
    history.value.push({ vol: currentVolume.value, ph: newPH });
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
    if (intensity < 0.1) return "#FBCFE8"; // Very pale pink
    if (intensity < 0.5) return "#F472B6"; // Standard pink
    return "#DB2777"; // Deep magenta (over-titrated)
  });

  return {
    massKHP,
    molarityNaOH,
    currentVolume,
    currentPH,
    slope,
    indicatorColor,
    addVolume,
  };
}
