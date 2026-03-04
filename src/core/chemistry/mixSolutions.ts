import type { Vessel, Chemical } from "@/types/sandbox";
import { getTotalVolume } from "@/types/sandbox";
import { KA_KHP, KW } from "./constants";

/**
 * mixSolutions
 *
 * Transfers `volume_mL` of liquid from `source` into `target`.
 * Handles stoichiometry of acid-base neutralization and updates
 * the target's pH and indicator color.
 *
 * Mutates both vessels in place.
 */
export function mixSolutions(source: Vessel, target: Vessel, volume_mL: number): void {
  const sourceTotal = getTotalVolume(source);
  if (sourceTotal <= 0 || volume_mL <= 0) return;

  // Clamp to available volume
  const actualVolume = Math.min(volume_mL, sourceTotal);
  const fraction = actualVolume / sourceTotal;

  // 1. Transfer chemicals proportionally
  for (const sourceChem of source.contents) {
    const transferMoles = sourceChem.moles * fraction;
    const transferVolume = sourceChem.volume_mL * fraction;

    // Subtract from source
    sourceChem.moles -= transferMoles;
    sourceChem.volume_mL -= transferVolume;

    // Add to target (merge if same chemical exists)
    const targetChem = target.contents.find((c) => c.name === sourceChem.name);
    if (targetChem) {
      targetChem.moles += transferMoles;
      targetChem.volume_mL += transferVolume;
    } else {
      target.contents.push({
        name: sourceChem.name,
        moles: transferMoles,
        volume_mL: transferVolume,
      });
    }
  }

  // Clean up near-zero chemicals in source
  source.contents = source.contents.filter((c) => c.moles > 1e-12);

  // 2. Perform acid-base neutralization in target
  neutralize(target);

  // 3. Calculate resulting pH
  target.pH = calculateMixturePH(target);

  // 4. Update indicator color based on pH
  target.indicatorColor = getIndicatorColor(target.pH);

  // 5. Update source pH too
  source.pH = calculateMixturePH(source);
  source.indicatorColor = getIndicatorColor(source.pH);
}

/**
 * Neutralizes acid-base pairs in a vessel.
 * Currently handles: NaOH + KHP -> NaKP + H2O
 */
function neutralize(vessel: Vessel): void {
  const acid = vessel.contents.find((c) => c.name === "KHP");
  const base = vessel.contents.find((c) => c.name === "NaOH");

  if (!acid || !base) return;

  // 1:1 stoichiometry
  const molesReacted = Math.min(acid.moles, base.moles);
  if (molesReacted <= 0) return;

  acid.moles -= molesReacted;
  base.moles -= molesReacted;

  // Add salt product
  const salt = vessel.contents.find((c) => c.name === "NaKP");
  if (salt) {
    salt.moles += molesReacted;
  } else {
    vessel.contents.push({
      name: "NaKP",
      moles: molesReacted,
      volume_mL: 0, // Salt is dissolved, doesn't add volume
    });
  }
}

/**
 * Calculates pH from a vessel's mixed contents.
 * Handles: pure acid, buffer region, equivalence, and excess base.
 */
function calculateMixturePH(vessel: Vessel): number {
  const totalVol = getTotalVolume(vessel);
  if (totalVol <= 0) return 7.0; // Empty vessel

  const acid = vessel.contents.find((c) => c.name === "KHP");
  const base = vessel.contents.find((c) => c.name === "NaOH");
  const salt = vessel.contents.find((c) => c.name === "NaKP");

  const molesAcid = acid?.moles ?? 0;
  const molesBase = base?.moles ?? 0;
  const molesSalt = salt?.moles ?? 0;
  const totalVol_L = totalVol / 1000;

  // Pure water
  if (molesAcid <= 1e-12 && molesBase <= 1e-12 && molesSalt <= 1e-12) {
    return 7.0;
  }

  // Excess base only
  if (molesAcid <= 1e-12 && molesBase > 1e-12) {
    const concOH = molesBase / totalVol_L;
    return 14 + Math.log10(concOH);
  }

  // Pure acid only (no salt yet)
  if (molesAcid > 1e-12 && molesSalt <= 1e-12 && molesBase <= 1e-12) {
    const concAcid = molesAcid / totalVol_L;
    const hPlus = Math.sqrt(KA_KHP * concAcid);
    return -Math.log10(hPlus);
  }

  // Buffer region: acid + salt present, no excess base
  if (molesAcid > 1e-12 && molesSalt > 1e-12 && molesBase <= 1e-12) {
    const pKa = -Math.log10(KA_KHP);
    return pKa + Math.log10(molesSalt / molesAcid);
  }

  // Equivalence: only salt
  if (molesAcid <= 1e-12 && molesBase <= 1e-12 && molesSalt > 1e-12) {
    const concSalt = molesSalt / totalVol_L;
    const ohMinus = Math.sqrt((KW / KA_KHP) * concSalt);
    const pOH = -Math.log10(ohMinus);
    return 14 - pOH;
  }

  // Fallback: use the engine for the standard KHP titration
  return 7.0;
}

/**
 * Phenolphthalein indicator color based on pH.
 */
function getIndicatorColor(pH: number): string {
  if (pH < 8.2) return "#FFFFFF";
  const intensity = Math.min(1, (pH - 8.2) / 1.8);
  if (intensity < 0.1) return "#FFC0CB";
  if (intensity < 0.5) return "#F472B6";
  return "#DB2777";
}
