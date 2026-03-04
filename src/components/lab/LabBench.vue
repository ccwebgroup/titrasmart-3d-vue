<script setup lang="ts">
import { LabMaterials } from '@/assets/design/materials'

/**
 * LabBench Component
 * Renders a simple 3D laboratory bench (table) using BoxGeometry.
 */
</script>

<template>
  <TresGroup>
    <!-- Bench Top -->
    <TresMesh :position="[0, 0.9, 0]" receive-shadow cast-shadow>
      <TresBoxGeometry :args="[4, 0.1, 2]" />
      <TresMeshStandardMaterial v-bind="LabMaterials.benchStone" :polygonOffset="true" :polygonOffsetFactor="4"
        :polygonOffsetUnits="4" />
    </TresMesh>

    <!-- Bench Legs -->
    <!-- Front Left -->
    <TresMesh :position="[-1.9, 0.45, 0.9]" cast-shadow>
      <TresBoxGeometry :args="[0.1, 0.9, 0.1]" />
      <TresMeshStandardMaterial v-bind="LabMaterials.stainlessSteel" />
    </TresMesh>
    <!-- Front Right -->
    <TresMesh :position="[1.9, 0.45, 0.9]" cast-shadow>
      <TresBoxGeometry :args="[0.1, 0.9, 0.1]" />
      <TresMeshStandardMaterial v-bind="LabMaterials.stainlessSteel" />
    </TresMesh>
    <!-- Back Left -->
    <TresMesh :position="[-1.9, 0.45, -0.9]" cast-shadow>
      <TresBoxGeometry :args="[0.1, 0.9, 0.1]" />
      <TresMeshStandardMaterial v-bind="LabMaterials.stainlessSteel" />
    </TresMesh>
    <!-- Back Right -->
    <TresMesh :position="[1.9, 0.45, -0.9]" cast-shadow>
      <TresBoxGeometry :args="[0.1, 0.9, 0.1]" />
      <TresMeshStandardMaterial v-bind="LabMaterials.stainlessSteel" />
    </TresMesh>

    <!-- Lab Floor (Visual Ground) -->
    <TresMesh :rotation="[-Math.PI / 2, 0, 0]" :position="[0, 0, 0]" receive-shadow>
      <TresPlaneGeometry :args="[20, 20]" />
      <TresMeshStandardMaterial color="#0F172A" :roughness="1" />
    </TresMesh>
  </TresGroup>
</template>
