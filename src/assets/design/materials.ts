import type { MeshStandardMaterialParameters } from "three";

export const LabMaterials: Record<string, MeshStandardMaterialParameters> = {
  glass: {
    color: "#ffffff",
    transparent: true,
    opacity: 0.4, // Increased from 0.2
    roughness: 0.01,
    metalness: 0.3, // Added some reflectivity
  },
  liquidBase: {
    color: "#ffffff",
    roughness: 0,
    metalness: 0.4,
  },
  stainlessSteel: {
    color: "#CBD5E1", // Brighter steel
    metalness: 0.9,
    roughness: 0.1,
  },
  phenolicResin: {
    color: "#334155", // Brighter Slate for bench top
    roughness: 0.2,
    metalness: 0.1,
  },
  benchStone: {
    color: "#E2E8F0", // Clean Off-White Lab Stone
    roughness: 0.05,
    metalness: 0.2,
  },
};
