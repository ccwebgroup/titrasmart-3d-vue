<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLoop } from '@tresjs/core'
import { LabMaterials } from '@/assets/design/materials'

/**
 * ErlenmeyerFlask.vue Component
 * A conical titration flask with volume-reactive liquid.
 *
 * Props:
 * - liquidLevel: Normalized value (0 to 1) representing the volume.
 */
interface Props {
    liquidLevel?: number
}

const props = withDefaults(defineProps<Props>(), {
    liquidLevel: 0.1
})

// Stirrer Rotation
const stirrerRotation = ref(0)
const { onBeforeRender } = useLoop()

onBeforeRender(({ delta }) => {
    // Spin at a realistic rate (approx 1000 RPM / 60 = 16.6 RPS -> 16.6 * 2PI rad/s)
    stirrerRotation.value += delta * 15
})

// Liquid geometry calculations
const liquidHeight = computed(() => props.liquidLevel * 0.5) // Max 0.5 units
const liquidY = computed(() => 0.05 + liquidHeight.value / 2) // Shifted up from base
const liquidRadiusBottom = 0.35
const liquidRadiusTop = computed(() => 0.35 - (props.liquidLevel * 0.25)) // Narrower as it goes up
</script>

<template>
    <TresGroup>
        <!-- Flask Body (Conical) -->
        <TresMesh :position="[0, 0.3, 0]">
            <TresCylinderGeometry :args="[0.1, 0.4, 0.6, 32]" />
            <TresMeshStandardMaterial v-bind="LabMaterials.glass" />
        </TresMesh>

        <!-- Flask Neck -->
        <TresMesh :position="[0, 0.75, 0]">
            <TresCylinderGeometry :args="[0.1, 0.1, 0.3, 32]" />
            <TresMeshStandardMaterial v-bind="LabMaterials.glass" />
        </TresMesh>

        <!-- Magnetic Stirrer (Capsule) -->
        <TresMesh :position="[0, 0.02, 0]" :rotation="[0, stirrerRotation, Math.PI / 2]">
            <TresCapsuleGeometry :args="[0.015, 0.1, 8, 16]" />
            <TresMeshStandardMaterial color="#FFFFFF" :roughness="0.1" :metalness="0" />
        </TresMesh>

        <!-- Liquid inside -->
        <TresGroup v-if="liquidLevel > 0">
            <TresMesh :position="[0, liquidY, 0]">
                <TresCylinderGeometry :args="[liquidRadiusTop, liquidRadiusBottom, liquidHeight, 32]" />
                <TresMeshStandardMaterial v-bind="LabMaterials.liquidBase" color="#F472B6" :opacity="0.6"
                    :transparent="true" />
            </TresMesh>

            <!-- Liquid Surface (Meniscus) -->
            <TresMesh :position="[0, 0.05 + liquidHeight, 0]">
                <TresCylinderGeometry :args="[liquidRadiusTop + 0.01, liquidRadiusTop, 0.01, 32]" />
                <TresMeshStandardMaterial v-bind="LabMaterials.liquidBase" color="#DB2777" :opacity="0.8"
                    :transparent="true" />
            </TresMesh>
        </TresGroup>
    </TresGroup>
</template>
