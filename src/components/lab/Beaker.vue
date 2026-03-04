<script setup lang="ts">
import { computed, shallowRef, ref } from 'vue'
import { Vector2, Group, MeshPhysicalMaterial } from 'three'
import gsap from 'gsap'
import { LabMaterials } from '@/assets/design/materials'

/**
 * Beaker.vue
 * Smart Procedural Beaker with thickness, selection effects, and lip-pivot logic.
 */
interface Props {
  capacity_ml?: number
  current_volume_ml?: number
  liquidColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  capacity_ml: 250,
  current_volume_ml: 0,
  liquidColor: '#FFFFFF',
})

// --- Geometry Profile (Lathe) ---
const radius = 0.2
const height = 0.5
const thickness = 0.015
const innerRadius = radius - thickness
const baseThickness = 0.02

// Points defining the cross-section (Thickness included)
// Path: center inner -> radius inner -> wall top inner -> wall top outer -> wall bottom outer -> center outer
const points = [
  new Vector2(0, baseThickness),              // Inner center bottom
  new Vector2(innerRadius, baseThickness),    // Inner radius bottom
  new Vector2(innerRadius, height),           // Inner wall top
  new Vector2(radius, height),                // Outer wall top (Lip)
  new Vector2(radius, 0),                     // Outer radius bottom
  new Vector2(0, 0),                          // Outer center bottom
]

// --- State & Refs ---
const beakerGroupRef = shallowRef<Group | null>(null)
const glassMaterialRef = shallowRef<MeshPhysicalMaterial | null>(null)
const isHovered = ref(false)

// --- Selection / Hover Effects ---
function onPointerEnter() {
  isHovered.value = true
  document.body.style.cursor = 'grab'
  if (glassMaterialRef.value) {
    gsap.to(glassMaterialRef.value, {
      emissiveIntensity: 0.4,
      duration: 0.3,
      ease: 'power2.out'
    })
  }
}

function onPointerLeave() {
  isHovered.value = false
  document.body.style.cursor = 'auto'
  if (glassMaterialRef.value) {
    gsap.to(glassMaterialRef.value, {
      emissiveIntensity: 0,
      duration: 0.3,
      ease: 'power2.in'
    })
  }
}

function onPointerDown() {
  document.body.style.cursor = 'grabbing'
}

function onPointerUp() {
  document.body.style.cursor = isHovered.value ? 'grab' : 'auto'
}

// --- Liquid Level Calculation ---
const liquidLevelRatio = computed(() => {
  if (!props.capacity_ml) return 0
  return Math.min(1, props.current_volume_ml / props.capacity_ml)
})

const maxLiquidHeight = height - baseThickness - 0.005
const currentLiquidHeight = computed(() => maxLiquidHeight * liquidLevelRatio.value)

/**
 * tiltTo
 * Uses GSAP to rotate the beaker around its lip (top edge).
 */
function tiltTo(angle: number, duration: number = 1) {
  if (!beakerGroupRef.value) return
  gsap.to(beakerGroupRef.value.rotation, {
    z: -angle,
    duration,
    ease: 'power2.inOut',
  })
}

defineExpose({ tiltTo })
</script>

<template>
  <TresGroup ref="beakerGroupRef">
    <!--
      Pivot Offset: The group origin [0,0,0] is the pouring lip.
      The geometry is rotated around its Y axis, so the "lip" is any point
      at [radius, height, 0]. We offset by [-radius, -height, 0].
    -->
    <TresGroup :position="[-radius, -height, 0]" @pointer-enter="onPointerEnter" @pointer-leave="onPointerLeave"
      @pointer-down="onPointerDown" @pointer-up="onPointerUp">

      <!-- Glass Geometry with Thickness -->
      <TresMesh :cast-shadow="true">
        <TresLatheGeometry :args="[points, 48]" />
        <TresMeshPhysicalMaterial ref="glassMaterialRef" v-bind="LabMaterials.glass" :transmission="0.9"
          :thickness="1.5" :roughness="0.1" :transparent="true" color="#ffffff" emissive="#6366F1"
          :emissiveIntensity="0" />
      </TresMesh>

      <!-- Internal Liquid -->
      <TresGroup v-if="liquidLevelRatio > 0" :position="[0, baseThickness, 0]" :scale="[1, currentLiquidHeight, 1]">
        <!--
          Cylinder is centered by default. We position it at [0, 0.5, 0]
          so that scaling y happens from the base [0, 0, 0] up.
        -->
        <TresMesh :receive-shadow="true" :position="[0, 0.5, 0]">
          <TresCylinderGeometry :args="[innerRadius - 0.002, innerRadius - 0.002, 1, 32]" />
          <TresMeshStandardMaterial :color="liquidColor" :transparent="true" :opacity="0.6" :roughness="0"
            :metalness="0.2" />
        </TresMesh>
      </TresGroup>
    </TresGroup>
  </TresGroup>
</template>
