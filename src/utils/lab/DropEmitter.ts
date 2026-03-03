import { ref, readonly } from "vue";
import * as THREE from "three";

export interface Drop {
  id: string;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
}

/**
 * DropEmitter Utility
 * Manages a pool of titration drops with simple gravity physics.
 */
export class DropEmitter {
  private _drops = ref<Drop[]>([]);
  public get drops() {
    return this._drops.value;
  }

  private gravity = -9.8;
  private floorY = 1.0; // Height of the liquid surface in the flask (approx)

  /**
   * Spawns a new drop at the given position.
   */
  spawn(position: THREE.Vector3) {
    const id = Math.random().toString(36).substring(7);
    this._drops.value.push({
      id,
      position: position.clone(),
      velocity: new THREE.Vector3(0, -1, 0), // Start with a slight downward velocity
    });
  }

  /**
   * Updates all active drops based on delta time.
   * @returns The number of drops that "hit" the floor this frame.
   */
  update(dt: number): number {
    let hits = 0;
    const activeDrops: Drop[] = [];

    for (const drop of this._drops.value) {
      // Apply gravity
      drop.velocity.y += this.gravity * dt;

      // Update position
      drop.position.add(drop.velocity.clone().multiplyScalar(dt));

      // Check collision/boundary
      if (drop.position.y > this.floorY) {
        activeDrops.push(drop);
      } else {
        hits++;
      }
    }

    this._drops.value = activeDrops;
    return hits;
  }

  reset() {
    this._drops.value = [];
  }
}
