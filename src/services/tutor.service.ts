/**
 * TutorService: Heuristic "AI" tutor that evaluates titration state
 * and provides slope-based guidance labels.
 *
 * No ML model required — uses deterministic rules from the StochiometryLogic skill.
 */

export type TutorLevel = "stable" | "caution" | "warning" | "error";

export interface TutorFeedback {
  level: TutorLevel;
  message: string;
  icon: string; // Emoji shorthand for the HUD
}

/**
 * Evaluates the current titration state and returns guidance feedback.
 *
 * @param slope - Current ΔpH/ΔV from the titration engine.
 * @param ph - Current pH value.
 * @param prevPh - Previous pH value (for over-titration detection).
 */
export function evaluateTitrationState(slope: number, ph: number, prevPh: number): TutorFeedback {
  // Rule 1: Over-titration jump (pH jumps from acidic to very alkaline in one move)
  if (ph > 10 && prevPh < 5) {
    return {
      level: "error",
      message: "Over-titrated! Check your logs to see exactly where the pH spike occurred.",
      icon: "🚨",
    };
  }

  // Rule 2: Endpoint imminent (very steep slope)
  if (slope >= 8.0) {
    return {
      level: "warning",
      message: "Endpoint near! Switch to dropwise addition immediately.",
      icon: "⚠️",
    };
  }

  // Rule 3: Approaching equivalence (moderate slope)
  if (slope >= 1.0) {
    return {
      level: "caution",
      message: "The pH is rising fast! You are near the equivalence point. Small drops only!",
      icon: "⚡",
    };
  }

  // Rule 4: Stable region
  return {
    level: "stable",
    message: "Steady flow: Continue titration at normal rate.",
    icon: "✅",
  };
}
