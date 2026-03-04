<script setup lang="ts">
import { Beaker, FlaskConical, TestTubes, Plus, Droplets, X } from 'lucide-vue-next'
import { useSandboxStore } from '@/store/sandboxStore'
import type { VesselType } from '@/types/sandbox'

const sandbox = useSandboxStore()

interface StockItem {
    label: string
    type: VesselType
    preset?: string
    icon: typeof Beaker
    color: string
}

const glassware: StockItem[] = [
    { label: 'Empty Beaker', type: 'Beaker', icon: Beaker, color: 'text-sky-400' },
    { label: 'Empty Flask', type: 'Flask', icon: FlaskConical, color: 'text-emerald-400' },
]

const chemicals: StockItem[] = [
    { label: 'NaOH (0.1M)', type: 'Beaker', preset: 'NaOH 0.1M', icon: Droplets, color: 'text-blue-400' },
    { label: 'KHP (0.5g)', type: 'Flask', preset: 'KHP 0.5g', icon: TestTubes, color: 'text-amber-400' },
    { label: 'HCl (0.1M)', type: 'Beaker', preset: 'HCl 0.1M', icon: Droplets, color: 'text-red-400' },
    { label: 'Distilled H₂O', type: 'Beaker', preset: 'Distilled Water', icon: Droplets, color: 'text-cyan-300' },
]

function handleAdd(item: StockItem) {
    sandbox.addVessel(item.type, item.preset)
}
</script>

<template>
    <div class="w-64 flex flex-col gap-4 pointer-events-auto select-none">
        <!-- Header -->
        <div class="p-4 rounded-xl bg-slate-900/70 border border-white/10 backdrop-blur-xl">
            <h2 class="text-white font-bold text-sm tracking-widest uppercase flex items-center gap-2">
                <TestTubes class="h-4 w-4 text-indigo-400" />
                Stockroom
            </h2>
            <p class="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">
                {{ sandbox.activeVessels.length }} vessels on bench
            </p>
        </div>

        <!-- Glassware Section -->
        <div class="p-4 rounded-xl bg-slate-900/70 border border-white/10 backdrop-blur-xl space-y-2">
            <p class="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2">Glassware</p>
            <button v-for="item in glassware" :key="item.label" @click="handleAdd(item)" class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5 border border-white/5
               hover:bg-white/10 hover:border-white/15 transition-all duration-200 active:scale-[0.97] group">
                <div
                    class="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-slate-700 transition-colors">
                    <component :is="item.icon" class="h-4 w-4" :class="item.color" />
                </div>
                <span class="text-xs text-slate-300 font-medium flex-1 text-left">{{ item.label }}</span>
                <Plus class="h-3.5 w-3.5 text-slate-600 group-hover:text-white transition-colors" />
            </button>
        </div>

        <!-- Chemicals Section -->
        <div class="p-4 rounded-xl bg-slate-900/70 border border-white/10 backdrop-blur-xl space-y-2">
            <p class="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2">Chemicals</p>
            <button v-for="item in chemicals" :key="item.label" @click="handleAdd(item)" class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5 border border-white/5
               hover:bg-white/10 hover:border-white/15 transition-all duration-200 active:scale-[0.97] group">
                <div
                    class="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-slate-700 transition-colors">
                    <component :is="item.icon" class="h-4 w-4" :class="item.color" />
                </div>
                <div class="flex-1 text-left">
                    <span class="text-xs text-slate-300 font-medium block">{{ item.label }}</span>
                </div>
                <Plus class="h-3.5 w-3.5 text-slate-600 group-hover:text-white transition-colors" />
            </button>
        </div>

        <!-- Active Vessels List -->
        <div v-if="sandbox.activeVessels.length > 0"
            class="p-4 rounded-xl bg-slate-900/70 border border-white/10 backdrop-blur-xl space-y-2 max-h-48 overflow-y-auto">
            <p class="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2">On Bench</p>
            <div v-for="vessel in sandbox.activeVessels" :key="vessel.id"
                class="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-white/5">
                <div class="flex items-center gap-2">
                    <div class="h-3 w-3 rounded-full" :style="{ backgroundColor: vessel.indicatorColor }" />
                    <span class="text-[11px] text-slate-300 font-mono">{{ vessel.label }}</span>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-[10px] text-slate-500 font-mono">pH {{ vessel.pH.toFixed(1) }}</span>
                    <button @click="sandbox.removeVessel(vessel.id)"
                        class="text-slate-600 hover:text-red-400 transition-colors">
                        <X class="h-3 w-3" />
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
