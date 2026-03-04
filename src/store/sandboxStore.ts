import { defineStore } from "pinia";
import { ref } from "vue";
import type { Vessel, VesselType, Chemical } from "@/types/sandbox";
import { mixSolutions } from "@/core/chemistry/mixSolutions";

/**
 * Sandbox Store
 *
 * Manages the modular "ChemCollective-style" open sandbox.
 * Each vessel is independently positioned, mixed, and rendered.
 */
export const useSandboxStore = defineStore("sandbox", () => {
  const activeVessels = ref<Vessel[]>([]);

  let vesselCounter = 0;

  // --- Preset chemical templates ---
  const PRESETS: Record<string, { contents: Chemical[]; pH: number }> = {
    "NaOH 0.1M": {
      contents: [
        { name: "NaOH", moles: 0.005, volume_mL: 50 },
        { name: "H2O", moles: 2.78, volume_mL: 50 },
      ],
      pH: 13.0,
    },
    "KHP 0.5g": {
      contents: [
        { name: "KHP", moles: 0.5 / 204.2212, volume_mL: 50 },
        { name: "H2O", moles: 2.78, volume_mL: 50 },
      ],
      pH: 3.35,
    },
    "HCl 0.1M": {
      contents: [
        { name: "HCl", moles: 0.005, volume_mL: 50 },
        { name: "H2O", moles: 2.78, volume_mL: 50 },
      ],
      pH: 1.3,
    },
    "Distilled Water": {
      contents: [{ name: "H2O", moles: 2.78, volume_mL: 50 }],
      pH: 7.0,
    },
  };

  const CAPACITY: Record<VesselType, number> = {
    Beaker: 250,
    Flask: 125,
    Buret: 50,
  };

  // --- Grid placement logic ---
  function getNextPosition(): [number, number, number] {
    const col = vesselCounter % 4;
    const row = Math.floor(vesselCounter / 4);
    // Spread across the bench: X from -1.2 to +1.2, Z from -0.4 to +0.4
    const x = -1.2 + col * 0.8;
    const z = -0.4 + row * 0.8;
    return [x, 0, z];
  }

  // --- Actions ---

  /**
   * Adds a new vessel to the sandbox.
   * @param type      - Beaker, Flask, or Buret
   * @param presetKey - Optional preset chemical fill
   */
  function addVessel(type: VesselType, presetKey?: string): Vessel {
    vesselCounter++;
    const preset = presetKey ? PRESETS[presetKey] : undefined;
    const id = `vessel-${vesselCounter}-${Date.now()}`;

    const vessel: Vessel = {
      id,
      type,
      label: `${type} #${vesselCounter}`,
      position: getNextPosition(),
      contents: preset ? JSON.parse(JSON.stringify(preset.contents)) : [],
      pH: preset?.pH ?? 7.0,
      indicatorColor: "#FFFFFF",
      capacity_mL: CAPACITY[type],
    };

    activeVessels.value.push(vessel);
    return vessel;
  }

  /** Remove a vessel by ID */
  function removeVessel(id: string): void {
    activeVessels.value = activeVessels.value.filter((v) => v.id !== id);
  }

  /** Update the 3D position after a drag */
  function updateVesselPosition(id: string, position: [number, number, number]): void {
    const vessel = activeVessels.value.find((v) => v.id === id);
    if (vessel) vessel.position = position;
  }

  /** Transfer contents from one vessel to another */
  function transferContents(sourceId: string, targetId: string, volume_mL: number): void {
    const source = activeVessels.value.find((v) => v.id === sourceId);
    const target = activeVessels.value.find((v) => v.id === targetId);
    if (!source || !target) return;

    mixSolutions(source, target, volume_mL);
  }

  /** Find a vessel by ID */
  function getVessel(id: string): Vessel | undefined {
    return activeVessels.value.find((v) => v.id === id);
  }

  return {
    activeVessels,
    addVessel,
    removeVessel,
    updateVesselPosition,
    transferContents,
    getVessel,
  };
});
