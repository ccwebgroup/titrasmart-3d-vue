<script setup lang="ts">
import { ref, computed, shallowRef } from 'vue'
import type { Vessel } from '@/types/sandbox'
import { getTotalVolume } from '@/types/sandbox'
import { useSandboxStore } from '@/store/sandboxStore'
import { LabMaterials } from '@/assets/design/materials'
import ErlenmeyerFlask from './ErlenmeyerFlask.vue'
import Beaker from './Beaker.vue'
import { animatePickUp, animateDrop, animateSwirl } from '@/utils/animations'

/**
 * DraggableVessel.vue
 *
 * Renders a vessel by type and supports pointer-based dragging
 * on the bench plane. When dragged onto another vessel, emits
 * a transfer event.
 */
interface Props {
  vessel: Vessel
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'triggerTransfer', sourceId: string, targetId: string): void
}>()

const sandbox = useSandboxStore()

// Local drag state
const isDragging = ref(false)
const isHovered = ref(false)
const meshRef = shallowRef<THREE.Object3D | null>(null)

// Computed visual properties
const liquidLevel = computed(() => {
  const vol = getTotalVolume(props.vessel)
  return Math.min(1, vol / props.vessel.capacity_mL)
})

const vesselColor = computed(() => props.vessel.indicatorColor)


// Drag handlers (pointer-based on the bench XZ plane)
function onPointerDown(event: PointerEvent) {
  event.stopPropagation?.()
  isDragging.value = true
  if (meshRef.value) {
    animatePickUp(meshRef.value, 0.2)
  }
}

function onPointerMove(event: { point?: { x: number; z: number } }) {
  if (!isDragging.value) return
  if (!event.point) return

  // Update vessel position (Y is locked to bench surface)
  sandbox.updateVesselPosition(props.vessel.id, [
    event.point.x,
    props.vessel.position[1],
    event.point.z,
  ])
}

function onPointerUp() {
  if (!isDragging.value) return
  isDragging.value = false

  if (meshRef.value) {
    animateDrop(meshRef.value, props.vessel.position[1])
  }

  // Check for overlap with another vessel
  for (const other of sandbox.activeVessels) {
    if (other.id === props.vessel.id) continue
    const dx = other.position[0] - props.vessel.position[0]
    const dz = other.position[2] - props.vessel.position[2]
    const dist = Math.sqrt(dx * dx + dz * dz)

    // Collision threshold
    if (dist < 0.3) {
      emit('triggerTransfer', props.vessel.id, other.id)
      if (meshRef.value) animateSwirl(meshRef.value)
      break
    }
  }
}
</script>

<template>
  <TresGroup :position="vessel.position" @pointer-down="onPointerDown" @pointer-move="onPointerMove"
    @pointer-up="onPointerUp" @pointer-enter="isHovered = true" @pointer-leave="isHovered = false" ref="meshRef">

    <!-- Beaker -->
    <template v-if="vessel.type === 'Beaker'">
      <Beaker :capacity_ml="vessel.capacity_mL" :current_volume_ml="getTotalVolume(vessel)"
        :liquidColor="vesselColor" />
    </template>

    <!-- Flask -->
    <template v-else-if="vessel.type === 'Flask'">
      <ErlenmeyerFlask :liquid-level="liquidLevel" :liquidColor="vesselColor" />
    </template>

    <!-- Buret -->
    <template v-else-if="vessel.type === 'Buret'">
      <TresMesh :position="[0, 0.5, 0]">
        <TresCylinderGeometry :args="[0.03, 0.03, 1.0, 16]" />
        <TresMeshPhysicalMaterial v-bind="LabMaterials.glass" />
      </TresMesh>
      <TresMesh v-if="liquidLevel > 0" :position="[0, (liquidLevel * 1.0) / 2, 0]">
        <TresCylinderGeometry :args="[0.025, 0.025, liquidLevel * 1.0, 16]" />
        <TresMeshStandardMaterial :color="vesselColor" :opacity="0.6" :transparent="true" />
      </TresMesh>
    </template>

    <!-- Selection / Hover Glow -->
    <TresMesh :scale="[1.1, 1.1, 1.1]" v-if="(isHovered || isDragging) && vessel.type !== 'Beaker'">
      <template v-if="vessel.type === 'Flask'">
        <TresCylinderGeometry :args="[0.18, 0.3, 0.52, 32]" />
      </template>
      <template v-else-if="vessel.type === 'Buret'">
        <TresCylinderGeometry :args="[0.035, 0.035, 1.02, 16]" />
      </template>
      <TresMeshBasicMaterial color="#6366F1" :opacity="0.2" :transparent="true" />
    </TresMesh>

    <!-- Label sprite (always faces camera) -->
    <TresMesh :position="[0, vessel.type === 'Buret' ? 1.2 : 0.7, 0]">
      <TresPlaneGeometry :args="[0.4, 0.12]" />
      <TresMeshBasicMaterial color="#1E293B" :opacity="0.8" :transparent="true" />
    </TresMesh>
  </TresGroup>
</template>
