<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { PCFShadowMap } from 'three'
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import { useAuthState } from '@/store/authState'
import { useLabState } from '@/store/labState'
import LabBench from '@/components/lab/LabBench.vue'
import { LogOut, User, Beaker, Brain } from 'lucide-vue-next'
import { evaluateTitrationState } from '@/services/tutor.service'
import { useSandboxStore } from '@/store/sandboxStore'
import StockroomSidebar from '@/components/hud/StockroomSidebar.vue'
import DraggableVessel from '@/components/lab/DraggableVessel.vue'
// GSAP animation wired for future mesh-level pour integration
// import { animatePour } from '@/utils/animations'

const router = useRouter()
const authState = useAuthState()
const labState = useLabState()
const sandbox = useSandboxStore()

const userName = computed(() => authState.displayName)
const isLoading = ref(true)

// --- Tutor AI Feedback ---
const prevPH = ref(7.0)
const tutorFeedback = computed(() => {
  return evaluateTitrationState(
    labState.currentChemData.slope,
    labState.currentChemData.ph,
    prevPH.value,
  )
})

// Track previous pH separately to avoid side-effects in computed

watch(() => labState.currentChemData.ph, (_, oldPh) => {
  prevPH.value = oldPh ?? 7.0
})

const tutorColorMap: Record<string, string> = {
  stable: 'border-emerald-500/30 text-emerald-400',
  caution: 'border-amber-500/30 text-amber-400',
  warning: 'border-red-500/40 text-red-400 animate-pulse',
  error: 'border-red-600/60 text-red-500 animate-pulse',
}

onMounted(async () => {
  // Initialize Simulation Session
  await labState.initializeLabSession()

  // Simulate loading 3D assets
  setTimeout(() => {
    isLoading.value = false
  }, 1000)
})

const handleLogout = async () => {
  await authState.signOut()
  router.push('/login')
}

// --- Sandbox Transfer ---
function handleTransfer(sourceId: string, targetId: string) {
  sandbox.transferContents(sourceId, targetId, 10) // Default 10mL pour
}
</script>

<template>
  <div class="relative h-screen w-screen bg-[#0F172A] overflow-hidden">
    <!-- 3D Scene -->
    <Suspense>
      <template #default>
        <TresCanvas alpha shadows :shadow-map-type="PCFShadowMap">
          <TresPerspectiveCamera :position="[3, 3, 3]" :look-at="[0, 1.5, 0]" />
          <OrbitControls :enable-damping="true" :max-polar-angle="Math.PI / 2 - 0.1" :min-distance="2"
            :max-distance="10" />

          <TresAmbientLight :intensity="0.8" />
          <TresHemisphereLight :intensity="0.4" ground-color="#0F172A" />
          <TresDirectionalLight :position="[5, 10, 5]" :intensity="1.5" cast-shadow />
          <TresDirectionalLight :position="[-5, 5, -5]" :intensity="0.5" />

          <!-- Specular Highlight SpotLight -->
          <TresSpotLight :position="[2, 4, 2]" :intensity="2" :angle="0.5" :penumbra="0.5" cast-shadow
            :look-at="[0, 1.5, 0]" />

          <LabBench />

          <!-- Sandbox Vessels (Dynamic) -->
          <DraggableVessel v-for="vessel in sandbox.activeVessels" :key="vessel.id" :vessel="vessel"
            :position="[vessel.position[0], 0.951, vessel.position[2]]" @triggerTransfer="handleTransfer" />
        </TresCanvas>
      </template>
      <template #fallback>
        <div class="absolute inset-0 flex flex-col items-center justify-center text-white bg-slate-900 z-50">
          <Beaker class="h-12 w-12 text-blue-500 animate-pulse mb-4" />
          <p class="text-lg font-medium tracking-widest animate-pulse">PREPARING GLASSWARE...</p>
        </div>
      </template>
    </Suspense>

    <!-- HUD Overlay -->
    <div class="absolute inset-0 pointer-events-none p-6">
      <!-- Top Bar -->
      <div class="flex justify-between items-start w-full">
        <!-- Logo / Title -->
        <div class="flex items-center space-x-3 pointer-events-auto">
          <div
            class="h-10 w-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center backdrop-blur-md">
            <Beaker class="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h1 class="text-white font-bold tracking-tight text-lg">TitraSmart 3D</h1>
            <p class="text-blue-400/60 text-[10px] uppercase font-bold tracking-[0.2em]">Digital Twin Environment</p>
          </div>
        </div>

        <!-- User Actions -->
        <div class="flex items-center space-x-4 pointer-events-auto">
          <div
            class="flex items-center space-x-3 px-4 py-2 rounded-full bg-slate-900/40 border border-white/5 backdrop-blur-md">
            <User class="h-4 w-4 text-slate-400" />
            <span class="text-sm font-medium text-slate-200">{{ userName }}</span>
          </div>
          <button @click="handleLogout"
            class="p-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all active:scale-95">
            <LogOut class="h-5 w-5" />
          </button>
        </div>
      </div>

      <div class="absolute bottom-6 left-6 pointer-events-auto space-y-4">
        <!-- Sandbox Info/Status placeholder if needed -->
        <div class="p-4 rounded-xl bg-slate-900/60 border border-white/10 backdrop-blur-xl w-64 shadow-2xl">
          <p class="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Sandbox Mode</p>
          <p class="text-xs text-slate-300">Drag glassware together to mix chemicals. Use the Stockroom to add more
            equipment.</p>
        </div>
      </div>

      <!-- AI Tutor Feedback (Bottom Right) -->
      <div class="absolute bottom-6 right-6 pointer-events-auto w-72">
        <div class="p-4 rounded-xl bg-slate-900/70 border backdrop-blur-xl transition-all duration-500"
          :class="tutorColorMap[tutorFeedback.level]">
          <div class="flex items-center space-x-2 mb-2">
            <Brain class="h-4 w-4" />
            <p class="text-[10px] uppercase font-bold tracking-widest">AI Tutor</p>
          </div>
          <p class="text-sm font-medium text-white/90 leading-relaxed">
            <span class="mr-1">{{ tutorFeedback.icon }}</span>
            {{ tutorFeedback.message }}
          </p>
        </div>
      </div>

      <!-- Stockroom Sidebar (Top Right) -->
      <div class="absolute top-20 right-6">
        <StockroomSidebar />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Standard animations or styles if needed */
</style>
