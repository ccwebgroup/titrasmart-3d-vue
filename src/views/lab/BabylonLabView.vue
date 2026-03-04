<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import {
    Scene,
    Vector3,
    ArcRotateCamera,
    MeshBuilder,
    PBRMaterial,
    Color3,
    ShadowGenerator,
    HemisphericLight,
} from '@babylonjs/core'
import BabylonScene from '@/components/lab/BabylonScene.vue'
import BeakerBabylon from '@/components/lab/BeakerBabylon.vue'

const sceneRef = shallowRef<Scene | null>(null)
const shadowGenRef = shallowRef<ShadowGenerator | null>(null)
const beakerRef = ref<{ pour: (angle?: number) => void } | null>(null)
const isSceneReady = ref(false)

function onSceneReady({ scene, shadowGenerator }: {
    scene: Scene
    shadowGenerator: ShadowGenerator
}) {
    sceneRef.value = scene
    shadowGenRef.value = shadowGenerator

    // ── Camera ──
    const camera = new ArcRotateCamera(
        "camera",
        -Math.PI / 2,
        Math.PI / 3.2,
        4.5,
        new Vector3(0, 1.2, 0),
        scene
    )
    camera.attachControl(scene.getEngine().getRenderingCanvas(), true)
    camera.lowerRadiusLimit = 2
    camera.upperRadiusLimit = 12
    camera.upperBetaLimit = Math.PI / 2 - 0.05
    camera.wheelDeltaPercentage = 0.02
    camera.panningSensibility = 50

    // ── Fill Light (soft ambient from below) ──
    const fillLight = new HemisphericLight("fillLight", new Vector3(0, -1, 0), scene)
    fillLight.intensity = 0.3
    fillLight.diffuse = new Color3(0.7, 0.75, 0.85)
    fillLight.groundColor = new Color3(0.15, 0.12, 0.1)

    // ── Lab Bench (Dark stone counter) ──
    const bench = MeshBuilder.CreateBox("labBench", {
        width: 4,
        height: 0.12,
        depth: 2.4,
    }, scene)
    bench.position.y = 0.94
    bench.receiveShadows = true

    const benchMat = new PBRMaterial("benchMat", scene)
    benchMat.albedoColor = new Color3(0.12, 0.12, 0.14) // Dark charcoal
    benchMat.metallic = 0.1
    benchMat.roughness = 0.55
    benchMat.emissiveColor = new Color3(0.01, 0.01, 0.02)
    bench.material = benchMat

    // Bench edge strip (subtle accent line)
    const edgeStrip = MeshBuilder.CreateBox("edgeStrip", {
        width: 4.02,
        height: 0.008,
        depth: 2.42,
    }, scene)
    edgeStrip.position.y = 1.005
    const edgeMat = new PBRMaterial("edgeMat", scene)
    edgeMat.albedoColor = new Color3(0.18, 0.2, 0.28)
    edgeMat.metallic = 0.6
    edgeMat.roughness = 0.3
    edgeStrip.material = edgeMat

    // ── Bench Legs ──
    const legPositions = [
        [-1.8, 0.44, -1.0],
        [1.8, 0.44, -1.0],
        [-1.8, 0.44, 1.0],
        [1.8, 0.44, 1.0],
    ]
    const legMat = new PBRMaterial("legMat", scene)
    legMat.albedoColor = new Color3(0.08, 0.08, 0.09)
    legMat.metallic = 0.7
    legMat.roughness = 0.4

    legPositions.forEach((pos, i) => {
        const leg = MeshBuilder.CreateCylinder(`leg${i}`, {
            diameter: 0.08,
            height: 0.88,
        }, scene)
        leg.position = new Vector3(pos[0], pos[1], pos[2])
        leg.material = legMat
        leg.receiveShadows = true
    })

    // ── Ground plane (subtle, receives shadows) ──
    const ground = MeshBuilder.CreateGround("ground", {
        width: 20,
        height: 20,
    }, scene)
    ground.receiveShadows = true
    const groundMat = new PBRMaterial("groundMat", scene)
    groundMat.albedoColor = new Color3(0.06, 0.06, 0.08)
    groundMat.metallic = 0
    groundMat.roughness = 0.9
    ground.material = groundMat

    isSceneReady.value = true
}

function triggerPour() {
    beakerRef.value?.pour()
}
</script>

<template>
    <div class="lab-container">
        <!-- Babylon 3D Canvas -->
        <BabylonScene @scene-ready="onSceneReady" />

        <!-- Beaker (rendered when scene ready) -->
        <BeakerBabylon v-if="sceneRef" ref="beakerRef" :scene="sceneRef" :shadow-generator="shadowGenRef"
            :position="[0, 1, 0]" />

        <!-- ─── PREMIUM HUD OVERLAY ─── -->
        <div class="hud-overlay" v-if="isSceneReady">
            <!-- Top Bar -->
            <header class="top-bar">
                <div class="brand">
                    <div class="brand-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="icon">
                            <path
                                d="M9 3h6v5.586a1 1 0 0 1 .293.707l-1.5 1.5a1 1 0 0 0 0 1.414l1.5 1.5A1 1 0 0 1 15 14.414V20a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-5.586a1 1 0 0 1 .293-.707l1.5-1.5a1 1 0 0 0 0-1.414l-1.5-1.5A1 1 0 0 1 9 8.586V3z" />
                            <path d="M8 3h8" />
                        </svg>
                    </div>
                    <div class="brand-text">
                        <h1>TitraSmart 3D</h1>
                        <span class="badge">v2 · Sandbox</span>
                    </div>
                </div>

                <div class="status-group">
                    <div class="status-pill online">
                        <span class="dot"></span>
                        Engine Ready
                    </div>
                </div>
            </header>

            <!-- Bottom Toolbar -->
            <div class="bottom-toolbar">
                <div class="toolbar-inner">
                    <button @click="triggerPour" class="tool-btn primary" title="Pour Beaker">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="icon">
                            <path d="M12 2v6" />
                            <path d="m7 8 5 5 5-5" />
                            <path d="M7 17h10" />
                            <path d="M7 21h10" />
                        </svg>
                        <span>Pour</span>
                    </button>

                    <div class="toolbar-divider"></div>

                    <button class="tool-btn" title="Reset Camera" @click="() => { }">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="icon">
                            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                            <path d="M3 3v5h5" />
                            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                            <path d="M16 21h5v-5" />
                        </svg>
                        <span>Reset</span>
                    </button>

                    <button class="tool-btn" title="Add Beaker" @click="() => { }">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="icon">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M8 12h8" />
                            <path d="M12 8v8" />
                        </svg>
                        <span>Add</span>
                    </button>
                </div>
            </div>

            <!-- Beaker Info Panel (Bottom Left) -->
            <div class="info-panel">
                <div class="info-header">
                    <span class="info-label">Beaker Info</span>
                    <span class="info-badge">250 mL</span>
                </div>
                <div class="info-rows">
                    <div class="info-row">
                        <span>Volume</span>
                        <span class="info-value">0 mL</span>
                    </div>
                    <div class="info-row">
                        <span>pH</span>
                        <span class="info-value">7.00</span>
                    </div>
                    <div class="info-row">
                        <span>Status</span>
                        <span class="info-value accent">Empty</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* ── Layout ── */
.lab-container {
    position: relative;
    width: 100vw;
    height: 100vh;
    background: #0a0d14;
    overflow: hidden;
}

.hud-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 10;
    font-family: 'Inter', 'SF Pro Display', -apple-system, sans-serif;
}

/* ── Top Bar ── */
.top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    pointer-events: auto;
}

.brand {
    display: flex;
    align-items: center;
    gap: 12px;
}

.brand-icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: rgba(59, 130, 246, 0.12);
    border: 1px solid rgba(59, 130, 246, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(20px);
}

.brand-icon .icon {
    width: 20px;
    height: 20px;
    color: #60a5fa;
}

.brand-text h1 {
    font-size: 16px;
    font-weight: 700;
    color: #f1f5f9;
    letter-spacing: -0.02em;
    margin: 0;
    line-height: 1.2;
}

.badge {
    font-size: 10px;
    font-weight: 600;
    color: rgba(96, 165, 250, 0.7);
    letter-spacing: 0.12em;
    text-transform: uppercase;
}

.status-group {
    display: flex;
    gap: 8px;
    pointer-events: auto;
}

.status-pill {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 100px;
    font-size: 11px;
    font-weight: 500;
    backdrop-filter: blur(20px);
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.06);
    color: #94a3b8;
}

.status-pill.online {
    color: #34d399;
    border-color: rgba(52, 211, 153, 0.15);
}

.dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes pulse-dot {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.4;
    }
}

/* ── Bottom Toolbar ── */
.bottom-toolbar {
    position: absolute;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    pointer-events: auto;
}

.toolbar-inner {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px;
    border-radius: 16px;
    background: rgba(15, 23, 42, 0.65);
    backdrop-filter: blur(24px) saturate(1.2);
    border: 1px solid rgba(255, 255, 255, 0.06);
    box-shadow:
        0 8px 32px rgba(0, 0, 0, 0.4),
        0 0 0 1px rgba(255, 255, 255, 0.03) inset;
}

.tool-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 10px 18px;
    border-radius: 12px;
    border: none;
    background: transparent;
    color: #94a3b8;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    font-family: inherit;
}

.tool-btn .icon {
    width: 18px;
    height: 18px;
}

.tool-btn span {
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.02em;
}

.tool-btn:hover {
    background: rgba(255, 255, 255, 0.06);
    color: #e2e8f0;
    transform: translateY(-1px);
}

.tool-btn:active {
    transform: translateY(0) scale(0.97);
}

.tool-btn.primary {
    color: #60a5fa;
}

.tool-btn.primary:hover {
    background: rgba(59, 130, 246, 0.12);
    color: #93bbfd;
}

.toolbar-divider {
    width: 1px;
    height: 28px;
    background: rgba(255, 255, 255, 0.06);
    margin: 0 4px;
}

/* ── Info Panel ── */
.info-panel {
    position: absolute;
    bottom: 24px;
    left: 24px;
    width: 220px;
    padding: 16px;
    border-radius: 16px;
    background: rgba(15, 23, 42, 0.55);
    backdrop-filter: blur(24px) saturate(1.2);
    border: 1px solid rgba(255, 255, 255, 0.06);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    pointer-events: auto;
}

.info-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.info-label {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #64748b;
}

.info-badge {
    font-size: 10px;
    font-weight: 600;
    color: #60a5fa;
    padding: 2px 8px;
    border-radius: 100px;
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.15);
}

.info-rows {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: #64748b;
}

.info-value {
    color: #cbd5e1;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
}

.info-value.accent {
    color: #fbbf24;
}
</style>
