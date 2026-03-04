import gsap from "gsap";
import type { Object3D } from "three";
import type { Vessel } from "@/types/sandbox";
import { mixSolutions } from "@/core/chemistry/mixSolutions";

/**
 * Lab Animation Utilities
 * Uses GSAP timelines for coordinated 3D lab movements.
 */

/** Reactive proxy for tweening — GSAP tweens this, onUpdate syncs to vessel */
interface TweenProxy {
  sourceVolume: number;
  targetVolume: number;
}

/**
 * animatePour
 *
 * Master GSAP timeline that orchestrates a full pour sequence:
 *   1. Pick up & tilt source vessel to 90°
 *   2. Tween liquid levels while calling chemistry updates
 *   3. Return source to upright position
 *
 * @param sourceMesh   - The Three.js Object3D for the source vessel
 * @param targetMesh   - The Three.js Object3D for the target vessel
 * @param sourceVessel - Reactive Vessel data (from sandboxStore)
 * @param targetVessel - Reactive Vessel data (from sandboxStore)
 * @param volume_mL    - Amount to pour
 * @param onUpdate     - Callback fired every frame with current volumes for 3D sync
 * @returns The GSAP timeline (can be chained or reversed)
 */
export function animatePour(
  sourceMesh: Object3D,
  targetMesh: Object3D,
  sourceVessel: Vessel,
  targetVessel: Vessel,
  volume_mL: number,
  onUpdate?: (sourceVol: number, targetVol: number, progress: number) => void,
): gsap.core.Timeline {
  const startSourceVol = sourceVessel.contents.reduce((s, c) => s + c.volume_mL, 0);
  const startTargetVol = targetVessel.contents.reduce((s, c) => s + c.volume_mL, 0);
  const actualPour = Math.min(volume_mL, startSourceVol);

  // Proxy object that GSAP tweens; onUpdate syncs to Three.js
  const proxy: TweenProxy = {
    sourceVolume: startSourceVol,
    targetVolume: startTargetVol,
  };

  const tl = gsap.timeline({
    defaults: { ease: "power2.inOut" },
  });

  // Step 1: Pick Up — lift source slightly
  tl.to(sourceMesh.position, {
    y: sourceMesh.position.y + 0.3,
    duration: 0.4,
  });

  // Step 2: Tilt — rotate source Z-axis to 90° (pour angle)
  tl.to(sourceMesh.rotation, {
    z: Math.PI / 2,
    duration: 0.6,
  });

  // Step 3: Transfer — tween volumes simultaneously
  tl.to(proxy, {
    sourceVolume: startSourceVol - actualPour,
    targetVolume: startTargetVol + actualPour,
    duration: 1.2,
    ease: "power1.inOut",
    onUpdate: () => {
      // Calculate progress (0 to 1)
      const poured = startSourceVol - proxy.sourceVolume;
      const progress = actualPour > 0 ? poured / actualPour : 1;

      // Fire the callback so 3D meshes can update liquid heights
      onUpdate?.(proxy.sourceVolume, proxy.targetVolume, progress);
    },
    onComplete: () => {
      // Perform actual chemistry when transfer is done
      mixSolutions(sourceVessel, targetVessel, actualPour);
    },
  });

  // Step 4: Return — tilt back to upright
  tl.to(sourceMesh.rotation, {
    z: 0,
    duration: 0.6,
  });

  // Step 5: Set Down — lower back to table height
  tl.to(sourceMesh.position, {
    y: sourceMesh.position.y,
    duration: 0.4,
  });

  return tl;
}

/**
 * animatePickUp
 *
 * Lifts a vessel off the bench with a natural arc.
 */
export function animatePickUp(mesh: Object3D, targetY: number = 0.5): gsap.core.Timeline {
  const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

  tl.to(mesh.position, {
    y: mesh.position.y + targetY,
    duration: 0.35,
  });

  return tl;
}

/**
 * animateDrop
 *
 * Sets a vessel down onto the bench with a slight bounce.
 */
export function animateDrop(mesh: Object3D, restY: number): gsap.core.Timeline {
  const tl = gsap.timeline({ defaults: { ease: "bounce.out" } });

  tl.to(mesh.position, {
    y: restY,
    duration: 0.5,
  });

  return tl;
}

/**
 * animateSwirl
 *
 * Gentle swirling motion to simulate mixing after a pour.
 */
export function animateSwirl(mesh: Object3D, intensity: number = 0.05): gsap.core.Timeline {
  const tl = gsap.timeline({ defaults: { ease: "sine.inOut" } });
  const baseX = mesh.rotation.x;
  const baseZ = mesh.rotation.z;

  tl.to(mesh.rotation, { x: baseX + intensity, z: baseZ + intensity, duration: 0.15 })
    .to(mesh.rotation, { x: baseX - intensity, z: baseZ - intensity, duration: 0.15 })
    .to(mesh.rotation, { x: baseX + intensity * 0.5, z: baseZ - intensity * 0.5, duration: 0.15 })
    .to(mesh.rotation, { x: baseX, z: baseZ, duration: 0.2 });

  return tl;
}
