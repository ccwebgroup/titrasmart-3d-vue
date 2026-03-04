<script setup lang="ts">
import { computed } from 'vue'
import * as THREE from 'three'
import { Html } from '@tresjs/cientos'
import { LabMaterials } from '@/assets/design/materials'
import graduationTextureUrl from '@/assets/design/textures/graduation_scale.png'

/**
 * LabBuret.vue Component
 * High-fidelity 3D titration buret with reactive stopcock and meniscus logic.
 *
 * Props:
 * - stopcockRotation: Rotation angle (0 to PI/2 radians). PI/2 is "Open".
 * - liquidLevel: Normalized value (0 to 1) where 1 is full.
 */
interface Props {
  stopcockRotation?: number
  liquidLevel?: number
}

const props = withDefaults(defineProps<Props>(), {
  stopcockRotation: 0,
  liquidLevel: 0.8
})

// Load graduation texture (Sync approach to avoid Suspense/Type issues)
const textureLoader = new THREE.TextureLoader()
const gradTexture = textureLoader.load(graduationTextureUrl)
gradTexture.repeat.set(1, 1)
gradTexture.wrapS = gradTexture.wrapT = THREE.RepeatWrapping

// Calculate liquid height based on body length (4 units)
const liquidHeight = computed(() => props.liquidLevel * 4)
const liquidY = computed(() => liquidHeight.value / 2)
const meniscusY = computed(() => liquidHeight.value)
const volumeInML = computed(() => (props.liquidLevel * 50).toFixed(2))
</script>

<template>
  <TresGroup :position="[0, 2, 0]" :rotation="[0, 0, 0]">
    <!-- Main Buret Body (Glass Tube) -->
    <TresMesh :position="[0, 2, 0]">
      <TresCylinderGeometry :args="[0.05, 0.05, 4, 32]" />
      <TresMeshPhysicalMaterial v-bind="LabMaterials.glass" />
    </TresMesh>

    <!-- Scale Markings (High Fidelity Texture) -->
    <TresMesh :position="[0, 2, 0]">
      <TresCylinderGeometry :args="[0.051, 0.051, 4, 32, 1, true]" />
      <TresMeshStandardMaterial :map="gradTexture" transparent :side="2" :opacity="0.8" />
    </TresMesh>

    <!-- Buret Tip (Inverted Cone) -->
    <TresMesh :position="[0, -0.2, 0]" :rotation="[Math.PI, 0, 0]">
      <TresConeGeometry :args="[0.05, 0.4, 32]" />
      <TresMeshPhysicalMaterial v-bind="LabMaterials.glass" />
    </TresMesh>

    <!-- Stopcock Assembly -->
    <TresGroup :position="[0, 0.1, 0]">
      <!-- Stopcock Housing -->
      <TresMesh :rotation="[0, 0, Math.PI / 2]">
        <TresCylinderGeometry :args="[0.03, 0.03, 0.12, 16]" />
        <TresMeshPhysicalMaterial v-bind="LabMaterials.glass" :opacity="0.6" />
      </TresMesh>

      <!-- Stopcock Handle (Valve) -->
      <TresMesh :rotation="[0, props.stopcockRotation, 0]">
        <TresCylinderGeometry :args="[0.015, 0.015, 0.25, 16]" />
        <TresMeshStandardMaterial v-bind="LabMaterials.stainlessSteel" />

        <!-- Handle Detail -->
        <TresMesh :position="[0, 0.12, 0]">
          <TresBoxGeometry :args="[0.04, 0.01, 0.08]" />
          <TresMeshStandardMaterial v-bind="LabMaterials.stainlessSteel" />
        </TresMesh>
      </TresMesh>
    </TresGroup>

    <!-- Liquid (Titrant) -->
    <TresGroup v-if="liquidLevel > 0">
      <!-- 1. Tip Liquid (Always full if level > 0) -->
      <TresMesh :position="[0, -0.2, 0]" :rotation="[Math.PI, 0, 0]">
        <TresConeGeometry :args="[0.042, 0.4, 32]" />
        <TresMeshStandardMaterial v-bind="LabMaterials.liquidBase" color="#3B82F6" :opacity="0.6" :transparent="true" />
      </TresMesh>

      <!-- 2. Main Liquid Body -->
      <TresMesh :position="[0, liquidY, 0]">
        <TresCylinderGeometry :args="[0.042, 0.042, liquidHeight, 32]" />
        <TresMeshStandardMaterial v-bind="LabMaterials.liquidBase" color="#3B82F6" :opacity="0.6" :transparent="true" />
      </TresMesh>

      <!-- 3. Meniscus (Concave Top Curve) -->
      <TresGroup :position="[0, meniscusY, 0]">
        <!-- Rim -->
        <TresMesh>
          <TresCylinderGeometry :args="[0.042, 0.042, 0.01, 32, 1, true]" />
          <TresMeshStandardMaterial v-bind="LabMaterials.liquidBase" color="#2563EB" :opacity="0.8"
            :transparent="true" />
        </TresMesh>
        <!-- Concave Dip (Inverted Cone) -->
        <TresMesh :position="[0, -0.005, 0]" :rotation="[Math.PI, 0, 0]">
          <TresConeGeometry :args="[0.042, 0.015, 32]" />
          <TresMeshStandardMaterial v-bind="LabMaterials.liquidBase" color="#1E40AF" :opacity="0.8"
            :transparent="true" />
        </TresMesh>

        <!-- Volume Label Overlay -->
        <Html center transform :position="[0.15, 0, 0]" :distance-factor="1">
        <div class="px-2 py-1 rounded bg-slate-900 shadow-xl border border-blue-500/50 backdrop-blur-md">
          <span class="text-[10px] text-blue-400 font-mono font-bold whitespace-nowrap">{{ volumeInML }} mL</span>
        </div>

        </Html>
      </TresGroup>
    </TresGroup>
  </TresGroup>
</template>
