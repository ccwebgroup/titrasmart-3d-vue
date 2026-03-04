import type { MeshStandardMaterialParameters, MeshPhysicalMaterialParameters } from "three";

export const LabMaterials: Record<
  string,
  MeshStandardMaterialParameters | MeshPhysicalMaterialParameters
> = {
  glass: {
    color: "#ffffff",
    transparent: true,
    opacity: 0.2,
    roughness: 0.1,
    metalness: 0.1,
    transmission: 0.9,
    thickness: 0.5,
  } as MeshPhysicalMaterialParameters,
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
