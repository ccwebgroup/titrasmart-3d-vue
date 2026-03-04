<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import {
    Scene,
    Vector3,
    MeshBuilder,
    ActionManager,
    ExecuteCodeAction,
    Animation,
    Mesh,
    PBRMaterial,
    Color3,
    ShadowGenerator
} from '@babylonjs/core'

interface Props {
    scene: Scene
    shadowGenerator?: ShadowGenerator | null
    capacity_ml?: number
    current_volume_ml?: number
    position?: [number, number, number]
}

const props = withDefaults(defineProps<Props>(), {
    capacity_ml: 250,
    current_volume_ml: 0,
    shadowGenerator: null,
    position: () => [0, 0, 0]
})

let beakerMesh: Mesh | null = null
let glassMaterial: PBRMaterial | null = null
const _defaultEmissive = new Color3(0, 0, 0)
const _hoverEmissive = new Color3(0.08, 0.15, 0.35)

// ── Geometry Profile ──
const radius = 0.35
const height = 0.8
const thickness = 0.02
const baseThickness = 0.03
const segments = 48

onMounted(() => {
    createBeaker()
})

function createBeaker() {
    const { scene } = props

    // Babylon CreateLathe: X = distance from Y-axis, Y = height
    // Profile draws the cross-section from bottom-center upward
    // We trace: outer base → outer wall → lip top → inner wall → inner base → inner center
    const profile = [
        new Vector3(0, 0, 0),                            // Outer base center
        new Vector3(radius, 0, 0),                       // Outer base edge
        new Vector3(radius, height, 0),                  // Outer wall top (lip)
        new Vector3(radius - thickness, height, 0),      // Inner wall top
        new Vector3(radius - thickness, baseThickness, 0), // Inner wall bottom
        new Vector3(0, baseThickness, 0),                // Inner base center
    ]

    beakerMesh = MeshBuilder.CreateLathe("beaker", {
        shape: profile,
        tessellation: segments,
        sideOrientation: Mesh.DOUBLESIDE
    }, scene)

    // Position so base sits on the bench surface
    beakerMesh.position = new Vector3(
        props.position[0],
        props.position[1],
        props.position[2]
    )

    // Set pivot at the lip for pouring animation
    beakerMesh.setPivotPoint(new Vector3(radius, height, 0))


    // ── Premium Glass Material (PBR + SubSurface) ──
    glassMaterial = new PBRMaterial("glassMaterial", scene)
    glassMaterial.albedoColor = new Color3(0.92, 0.94, 1.0)
    glassMaterial.metallic = 0
    glassMaterial.roughness = 0.05
    glassMaterial.alpha = 0.35
    glassMaterial.backFaceCulling = false

    // SubSurface: real glass refraction
    glassMaterial.subSurface.isRefractionEnabled = true
    glassMaterial.subSurface.refractionIntensity = 0.8
    glassMaterial.subSurface.indexOfRefraction = 1.52 // Borosilicate glass
    glassMaterial.subSurface.tintColor = new Color3(0.95, 0.97, 1.0)

    // Emissive (default off, used for hover glow)
    glassMaterial.emissiveColor = _defaultEmissive.clone()
    glassMaterial.emissiveIntensity = 1.0

    beakerMesh.material = glassMaterial

    // Register with shadow generator
    if (props.shadowGenerator) {
        props.shadowGenerator.addShadowCaster(beakerMesh)
    }
    beakerMesh.receiveShadows = true

    // ── ActionManager (Hover Highlight) ──
    beakerMesh.actionManager = new ActionManager(scene)

    beakerMesh.actionManager.registerAction(
        new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, () => {
            if (!glassMaterial) return
            glassMaterial.emissiveColor = _hoverEmissive
            glassMaterial.alpha = 0.45 // Slightly more visible on hover
            document.body.style.cursor = 'pointer'
        })
    )

    beakerMesh.actionManager.registerAction(
        new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, () => {
            if (!glassMaterial) return
            glassMaterial.emissiveColor = _defaultEmissive
            glassMaterial.alpha = 0.35
            document.body.style.cursor = 'default'
        })
    )
}

// ── Pouring Animation (Babylon Native) ──
function pour(targetAngle: number = -Math.PI / 3) {
    if (!beakerMesh) return

    const fps = 30
    const anim = new Animation(
        "pourAnim",
        "rotation.z",
        fps,
        Animation.ANIMATIONTYPE_FLOAT,
        Animation.ANIMATIONLOOPMODE_CONSTANT
    )

    anim.setKeys([
        { frame: 0, value: 0 },
        { frame: fps, value: targetAngle },
        { frame: fps * 3, value: targetAngle }, // Hold
        { frame: fps * 4, value: 0 },           // Return
    ])

    beakerMesh.animations = [anim]
    props.scene.beginAnimation(beakerMesh, 0, fps * 4, false)
}

onUnmounted(() => {
    beakerMesh?.dispose()
    glassMaterial?.dispose()
})

defineExpose({ pour })
</script>

<template>
    <slot />
</template>
