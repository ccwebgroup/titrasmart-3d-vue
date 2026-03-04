import { KA_KHP, KW, MW_KHP } from "./constants";

/**
 * TitrationEngine
 * Provides scientifically accurate pH calculations for KHP + NaOH reaction.
 */
export class TitrationEngine {
  /**
   * Calculates the current pH of the titration mixture.
   *
   * @param volNaOH_mL - Volume of NaOH added in mL
   * @param massKHP_g - Initial mass of KHP in grams
   * @param molarityNaOH - Molarity of the NaOH titrant (usually ~0.1 M)
   * @param volInitial_mL - Initial volume of water in the flask (usually ~50 mL)
   */
  static calculatePH(
    volNaOH_mL: number,
    massKHP_g: number,
    molarityNaOH: number = 0.1,
    volInitial_mL: number = 50,
  ): number {
    const molesKHP = massKHP_g / MW_KHP;
    const volNaOH_L = volNaOH_mL / 1000;
    const molesNaOH = volNaOH_L * molarityNaOH;

    const TotalVolume_L = (volInitial_mL + volNaOH_mL) / 1000;

    // 1. Initial State (No NaOH added)
    if (volNaOH_mL <= 0) {
      const concentrationKHP = molesKHP / (volInitial_mL / 1000);
      // Weak acid calculation: [H+] = sqrt(Ka * C)
      const hPlus = Math.sqrt(KA_KHP * concentrationKHP);
      return -Math.log10(hPlus);
    }

    // 2. Buffer Region (Before Equivalence)
    if (molesNaOH < molesKHP) {
      const molesAcid = molesKHP - molesNaOH;
      const molesSalt = molesNaOH;
      // Initial pH for capping
      const concentrationKHP_initial = molesKHP / (volInitial_mL / 1000);
      const initialPH = -Math.log10(Math.sqrt(KA_KHP * concentrationKHP_initial));

      // Henderson-Hasselbalch: pH = pKa + log([Salt]/[Acid])
      const hhPH = -Math.log10(KA_KHP) + Math.log10(molesSalt / molesAcid);

      // Ensure pH is never lower than initial state during addition of base
      return Math.max(initialPH, hhPH);
    }

    // 3. Equivalence Point
    if (Math.abs(molesNaOH - molesKHP) < 1e-9) {
      const concentrationSalt = molesKHP / TotalVolume_L;
      // Hydrolysis of salt (KP-): [OH-] = sqrt((Kw/Ka) * C)
      const ohMinus = Math.sqrt((KW / KA_KHP) * concentrationSalt);
      const pOH = -Math.log10(ohMinus);
      return 14 - pOH;
    }

    // 4. Post-Equivalence (Excess Base)
    const excessMolesBase = molesNaOH - molesKHP;
    const concentrationOH = excessMolesBase / TotalVolume_L;
    const pOH = -Math.log10(concentrationOH);
    return 14 - pOH;
  }

  /**
   * Calculates the slope of the titration curve (dpH/dV).
   */
  static calculateSlope(vol1: number, ph1: number, vol2: number, ph2: number): number {
    const dV = Math.abs(vol2 - vol1);
    if (dV < 1e-6) return 0;
    return Math.abs(ph2 - ph1) / dV;
  }
}
