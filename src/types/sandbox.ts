/**
 * Modular Sandbox Domain Types
 * Defines the contracts for a ChemCollective-style sandbox lab.
 */

export interface Chemical {
  name: string; // e.g. 'NaOH', 'KHP', 'HCl', 'H2O'
  moles: number;
  volume_mL: number;
}

export type VesselType = "Beaker" | "Buret" | "Flask";

export interface Vessel {
  id: string;
  type: VesselType;
  label: string;
  position: [number, number, number];
  contents: Chemical[];
  pH: number;
  indicatorColor: string;
  capacity_mL: number; // Max capacity for this vessel type
}

/** Get total volume of all contents in a vessel */
export function getTotalVolume(vessel: Vessel): number {
  return vessel.contents.reduce((sum, c) => sum + c.volume_mL, 0);
}

/** Get concentration (molarity) of a specific chemical in a vessel */
export function getMolarity(vessel: Vessel, chemName: string): number {
  const chem = vessel.contents.find((c) => c.name === chemName);
  if (!chem || chem.volume_mL <= 0) return 0;
  return chem.moles / (chem.volume_mL / 1000);
}
