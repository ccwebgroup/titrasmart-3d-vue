/**
 * Chemistry Constants for NaOH-KHP Titration
 */

export const MW_KHP = 204.2212; // Molar Mass of Potassium Hydrogen Phthalate (g/mol)
export const PKA_KHP = 5.4; // pKa2 of phthalic acid (per requirement)
export const KA_KHP = Math.pow(10, -PKA_KHP);
export const KW = 1.0e-14; // Ionic product of water
