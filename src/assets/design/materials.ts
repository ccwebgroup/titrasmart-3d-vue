import { MeshStandardMaterialParameters } from "three";

export const LabMaterials: Record<string, MeshStandardMaterialParameters> = {
  glass: {
    color: "#ffffff",
    transparent: true,
    opacity: 0.2,
    roughness: 0.05,
    metalness: 0.1,
  },
  liquidBase: {
    color: "#ffffff", // Transparent initially
    roughness: 0,
    metalness: 0.2,
  },
  stainlessSteel: {
    color: "#94A3B8",
    metalness: 0.8,
    roughness: 0.2,
  },
};
