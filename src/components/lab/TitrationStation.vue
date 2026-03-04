<script setup lang="ts">
import { ref, computed } from 'vue'
import { Vector3 } from 'three'
import { useLoop } from '@tresjs/core'
import LabBuret from './LabBuret.vue'
import ErlenmeyerFlask from './ErlenmeyerFlask.vue'
import RingStand from './RingStand.vue'
import { DropEmitter } from '@/utils/lab/DropEmitter'
import { LabMaterials } from '@/assets/design/materials'
import { useLabState } from '@/store/labState'

const labState = useLabState()

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

const { onBeforeRender } = useLoop()
onBeforeRender(({ delta }: { delta: number }) => {
  // 1. Process continuous flow for chemical state
  if (props.stopcockAngle > 0.1) {
    labState.titration.applyValveFlow(delta, props.stopcockAngle)
  }

  // 2. Visual Liquid transfer (Flask level increase)
  const hits = dropEmitter.update(delta)
  if (hits > 0) {
    const volumeTransfer = 0.001 // Small amount per drop visual
    const newFlaskVolume = Math.min(1, props.flaskVolume + volumeTransfer * 0.5)
    emit('update:flaskVolume', newFlaskVolume)
  }

  // 3. Drop spawning logic
  if (props.stopcockAngle > 0.2 && props.buretVolume > 0) {
    spawnTimer.value += delta
    // Faster spawning as the valve opens more
    const actualRate = spawnRate / (props.stopcockAngle / (Math.PI / 2))

    if (spawnTimer.value >= actualRate) {
      // Spawn at the tip position (relative to the group)
      dropEmitter.spawn(new Vector3(0, 1.6, 0))
      spawnTimer.value = 0
    }
  }
})

// Dynamic Stream Visuals
const streamHeight = computed(() => {
  const buretTipY = 1.6
  const flaskLiquidTop = 0.06 + (props.flaskVolume * 0.5)
  return Math.max(0.1, buretTipY - flaskLiquidTop)
})
const streamY = computed(() => 1.6 - streamHeight.value / 2)
</script>

<template>
  <TresGroup :position="[0, 0, 0]">
    <RingStand />
    <LabBuret :liquid-level="buretVolume" :stopcock-rotation="stopcockAngle" />

    <!-- Flask positioned on the stand base -->
    <ErlenmeyerFlask :liquid-level="flaskVolume" :position="[0, 0.06, 0]" :liquidColor="indicatorColor" />

    <!-- titrant Stream (appears when valve is open) -->
    <TresMesh v-if="stopcockAngle > 0.1 && buretVolume > 0" :position="[0, streamY, 0]">
      <TresCylinderGeometry :args="[0.005, 0.005, streamHeight, 8]" />
      <TresMeshStandardMaterial v-bind="LabMaterials.liquidBase" color="#3B82F6" :opacity="0.4" :transparent="true" />
    </TresMesh>

    <!-- Falling Drops -->
    <TresGroup>
      <TresMesh v-for="drop in dropEmitter.drops" :key="drop.id" :position="drop.position">
        <TresSphereGeometry :args="[0.015, 8, 8]" />
        <TresMeshStandardMaterial v-bind="LabMaterials.liquidBase" color="#3B82F6" :opacity="0.8" :transparent="true" />
      </TresMesh>
    </TresGroup>
  </TresGroup>
</template>
