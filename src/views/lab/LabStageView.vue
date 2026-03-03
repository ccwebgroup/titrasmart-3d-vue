<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { PCFShadowMap } from 'three'
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import { useAuthState } from '@/store/authState'
import LabBench from '@/components/lab/LabBench.vue'
import TitrationStation from '@/components/lab/TitrationStation.vue'
import { LogOut, User, Beaker } from 'lucide-vue-next'

const router = useRouter()
const authState = useAuthState()
const labState = useLabState()

const userName = computed(() => authState.displayName)
const isLoading = ref(true)

// Simulation State (Partial local for UI/3D handles, Chemical state is in labState)
const stopcockAngle = ref(0) // Closed

// Sync local handles to labState titration if needed, or bind directly
const currentPH = computed(() => labState.currentChemData.ph)
const buretVolume = computed({
  get: () => labState.titration.currentVolume / 50, // Normalized for 3D/Slider
  set: (val) => {
    labState.titration.currentVolume = val * 50
  }
})
const flaskVolume = ref(0.1) // 3D Visual level, independent of chemistry volume for now

onMounted(async () => {
  // Simulate loading 3D assets
  setTimeout(() => {
    isLoading.value = false
  }, 1000)
})

const handleLogout = async () => {
  await authState.signOut()
  router.push('/login')
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

          <!-- Unified Titration Station Setup -->
          <TitrationStation :position="[0, 0.951, 0]" v-model:buretVolume="buretVolume"
            v-model:flaskVolume="flaskVolume" :stopcockAngle="stopcockAngle"
            :indicatorColor="labState.titration.indicatorColor" />
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

      <!-- Simulation State (Bottom Left) -->
      <div class="absolute bottom-6 left-6 pointer-events-auto space-y-4">
        <!-- Titration Progress -->
        <div class="p-4 rounded-xl bg-slate-900/60 border border-white/10 backdrop-blur-xl w-64">
          <p class="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-3">Titrant Volume</p>
          <div class="space-y-2">
            <div class="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0.00 mL</span>
              <span>50.00 mL</span>
            </div>
            <input type="range" v-model.number="buretVolume" min="0" max="1" step="0.01"
              class="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500" />
            <div class="flex justify-between items-center mt-1">
              <span class="text-xs text-blue-400 font-bold font-mono">{{ (buretVolume * 50).toFixed(2) }} mL</span>
              <span class="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Status: Stable</span>
            </div>
          </div>
        </div>

        <!-- Stopcock Control -->
        <div class="p-4 rounded-xl bg-slate-900/60 border border-white/10 backdrop-blur-xl w-64">
          <p class="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-3">Valve Control</p>
          <div class="space-y-3">
            <input type="range" v-model.number="stopcockAngle" min="0" :max="Math.PI / 2" step="0.01"
              class="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
            <div class="flex justify-between items-center">
              <span class="text-[10px] font-bold uppercase tracking-widest"
                :class="stopcockAngle > 0.1 ? 'text-indigo-400' : 'text-slate-500'">
                {{ stopcockAngle > 0.1 ? 'FLOW ACTIVE' : 'VALVE CLOSED' }}
              </span>
              <span class="text-xs text-slate-300 font-mono">{{ ((stopcockAngle / (Math.PI / 2)) * 100).toFixed(0)
                }}%</span>
            </div>
          </div>
        </div>

        <div class="p-4 rounded-xl bg-slate-900/60 border border-white/10 backdrop-blur-xl w-64">
          <p class="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Current Protocol</p>
          <h3 class="text-white font-semibold flex items-center justify-between">
            <span>NaOH + KHP</span>
            <span class="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono">pH {{ currentPH.toFixed(2)
            }}</span>
          </h3>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Standard animations or styles if needed */
</style>
