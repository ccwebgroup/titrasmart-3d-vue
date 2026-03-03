<script setup lang="ts">
import { ref } from 'vue'
import { Vector3 } from 'three'
import { useLoop } from '@tresjs/core'
import LabBuret from './LabBuret.vue'
import ErlenmeyerFlask from './ErlenmeyerFlask.vue'
import RingStand from './RingStand.vue'
import { DropEmitter } from '@/utils/lab/DropEmitter'
import { LabMaterials } from '@/assets/design/materials'

/**
 * TitrationStation.vue
 * High-fidelity container for the titration simulation logic.
 * Wraps buret, stand, and flask into a single logical unit.
 */
interface Props {
  buretVolume: number
  flaskVolume: number
  stopcockAngle: number
  indicatorColor: string
}

const props = defineProps<Props>()
const emit = defineEmits(['update:buretVolume', 'update:flaskVolume'])

// Titration Physics
const dropEmitter = new DropEmitter()
const spawnTimer = ref(0)
const spawnRate = 0.05 // Spawning every 0.05s when open

// This hook MUST be inside a child of TresCanvas
const { onBeforeRender } = useLoop()

onBeforeRender(({ delta }: { delta: number }) => {
  // 1. Update active drops
  const hits = dropEmitter.update(delta)

  // 2. Liquid transfer logic
  if (hits > 0 && props.buretVolume > 0) {
    const volumeTransfer = 0.001 // Small amount per drop
    const newBuretVolume = Math.max(0, props.buretVolume - volumeTransfer)
    const newFlaskVolume = Math.min(1, props.flaskVolume + volumeTransfer * 0.5)

    emit('update:buretVolume', newBuretVolume)
    emit('update:flaskVolume', newFlaskVolume)
  }

  // 3. Drop spawning logic
  if (props.stopcockAngle > 0.2 && props.buretVolume > 0) {
    spawnTimer.value += delta
    // Faster spawning as the valve opens more
    const actualRate = spawnRate / (props.stopcockAngle / (Math.PI / 2))

    if (spawnTimer.value >= actualRate) {
      // Spawn at the tip position (relative to the group)
      dropEmitter.spawn(new Vector3(0, 2.65, 0))
      spawnTimer.value = 0
    }
  }
})
</script>

<template>
  <TresGroup :position="[0, 0, 0]">
    <RingStand />
    <LabBuret :liquid-level="buretVolume" :stopcock-rotation="stopcockAngle" />

    <!-- Flask positioned on the stand base -->
    <ErlenmeyerFlask :liquid-level="flaskVolume" :position="[0, 0.051, 0]" :liquidColor="indicatorColor" />

    <!-- Falling Drops -->
    <TresGroup>
      <TresMesh v-for="drop in dropEmitter.drops" :key="drop.id" :position="drop.position">
        <TresSphereGeometry :args="[0.015, 8, 8]" />
        <TresMeshStandardMaterial v-bind="LabMaterials.liquidBase" color="#3B82F6" :opacity="0.8" :transparent="true" />
      </TresMesh>
    </TresGroup>
  </TresGroup>
</template>
