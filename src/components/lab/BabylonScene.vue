<script setup lang="ts">
import { onMounted, onUnmounted, ref, shallowRef } from 'vue'
import {
    Engine,
    Scene,
    Color4,
    Color3,
    Vector3,
    DirectionalLight,
    ShadowGenerator,
    DefaultRenderingPipeline,
    ImageProcessingConfiguration,
    CubeTexture
} from '@babylonjs/core'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const engine = shallowRef<Engine | null>(null)
const scene = shallowRef<Scene | null>(null)

const emit = defineEmits<{
    (e: 'scene-ready', payload: {
        scene: Scene
        engine: Engine
        canvas: HTMLCanvasElement
        shadowGenerator: ShadowGenerator
    }): void
}>()

onMounted(() => {
    if (!canvasRef.value) return

    // ── Engine ──
    engine.value = new Engine(canvasRef.value, true, {
        preserveDrawingBuffer: true,
        stencil: true,
        antialias: true
    })

    // ── Scene ──
    scene.value = new Scene(engine.value)
    scene.value.clearColor = new Color4(0.04, 0.06, 0.10, 1)

    // ── HDR Environment (built-in) ──
    // Creates skybox + environment probe for PBR reflections
    const envHelper = scene.value.createDefaultEnvironment({
        createGround: false,
        createSkybox: true,
        skyboxSize: 150,
        skyboxColor: new Color3(0.04, 0.06, 0.10),
        environmentTexture: CubeTexture.CreateFromPrefilteredData(
            "https://assets.babylonjs.com/environments/environmentSpecular.env",
            scene.value
        ),
    })

    if (envHelper?.skybox) {
        envHelper.skybox.isPickable = false
    }

    // ── Key Light (Directional — casts shadows) ──
    const keyLight = new DirectionalLight(
        "keyLight",
        new Vector3(-1, -2, -1).normalize(),
        scene.value
    )
    keyLight.position = new Vector3(4, 8, 4)
    keyLight.intensity = 2.2
    keyLight.diffuse = new Color3(1, 0.98, 0.95) // Warm white

    // ── Shadow Generator ──
    const shadowGen = new ShadowGenerator(1024, keyLight)
    shadowGen.useBlurExponentialShadowMap = true
    shadowGen.blurKernel = 32
    shadowGen.setDarkness(0.4)

    // ── Post-Processing Pipeline ──
    const pipeline = new DefaultRenderingPipeline(
        "defaultPipeline",
        true,
        scene.value,
        scene.value.cameras
    )

    // Bloom
    pipeline.bloomEnabled = true
    pipeline.bloomThreshold = 0.7
    pipeline.bloomWeight = 0.3
    pipeline.bloomKernel = 64
    pipeline.bloomScale = 0.5

    // Tone Mapping (ACES for cinematic look)
    scene.value.imageProcessingConfiguration.toneMappingEnabled = true
    scene.value.imageProcessingConfiguration.toneMappingType =
        ImageProcessingConfiguration.TONEMAPPING_ACES
    scene.value.imageProcessingConfiguration.exposure = 1.3
    scene.value.imageProcessingConfiguration.contrast = 1.5

    // Anti-aliasing
    pipeline.fxaaEnabled = true

    // ── Resize ──
    window.addEventListener('resize', onResize)

    // ── Emit Ready ──
    emit('scene-ready', {
        scene: scene.value,
        engine: engine.value,
        canvas: canvasRef.value,
        shadowGenerator: shadowGen
    })

    // ── Render Loop ──
    engine.value.runRenderLoop(() => {
        scene.value?.render()
    })
})

const onResize = () => {
    engine.value?.resize()
}

onUnmounted(() => {
    window.removeEventListener('resize', onResize)
    engine.value?.dispose()
})

defineExpose({ scene, engine })
</script>

<template>
    <canvas ref="canvasRef" class="babylon-canvas" />
</template>

<style scoped>
.babylon-canvas {
    width: 100%;
    height: 100%;
    display: block;
    outline: none;
    touch-action: none;
}
</style>
