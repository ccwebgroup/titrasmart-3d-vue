<script setup lang="ts">
import { LabMaterials } from '@/assets/design/materials'

/**
 * RingStand.vue Component
 * A mechanical metal stand to hold the buret in place.
 */
</script>

<template>
    <TresGroup>
        <!-- Base Plate -->
        <TresMesh :position="[0.15, 0.025, 0]">
            <TresBoxGeometry :args="[0.6, 0.05, 0.4]" />
            <TresMeshStandardMaterial v-bind="LabMaterials.stainlessSteel" color="#1E293B" :metalness="0.5" />
        </TresMesh>

        <!-- Vertical Rod -->
        <TresMesh :position="[0.4, 1.25, 0]">
            <TresCylinderGeometry :args="[0.02, 0.02, 2.5, 16]" />
            <TresMeshStandardMaterial v-bind="LabMaterials.stainlessSteel" />
        </TresMesh>

        <!-- Buret Clamp (The arm holding the buret) -->
        <TresGroup :position="[0.2, 2.2, 0]">
            <!-- Horizontal Extension -->
            <TresMesh :rotation="[0, 0, Math.PI / 2]">
                <TresCylinderGeometry :args="[0.015, 0.015, 0.4, 16]" />
                <TresMeshStandardMaterial v-bind="LabMaterials.stainlessSteel" />
            </TresMesh>

            <!-- Claw Hook (simplified) -->
            <TresMesh :position="[-0.2, 0, 0]">
                <TresTorusGeometry :args="[0.06, 0.01, 16, 32, Math.PI * 1.5]" :rotation="[0, Math.PI / 2, 0]" />
                <TresMeshStandardMaterial v-bind="LabMaterials.stainlessSteel" />
            </TresMesh>
        </TresGroup>
    </TresGroup>
</template>
