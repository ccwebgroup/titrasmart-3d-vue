<script vapor setup lang="ts">
import { UserPlus, Mail } from 'lucide-vue-next'
</script>

<template>
    <div class="space-y-6">
        <div class="flex flex-col space-y-2 text-center">
            <h2 class="text-xl font-semibold tracking-tight text-white">Join the Institution</h2>
            <p class="text-sm text-slate-400">Create your scientific researcher account</p>
        </div>

        <form class="grid gap-4">
            <div class="grid gap-2">
                <label class="text-xs font-medium uppercase tracking-wider text-slate-500 ml-1">Full Name</label>
                <div class="relative">
                    <UserPlus class="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input type="text" placeholder="Dr. Marie Curie"
                        class="h-10 w-full rounded-md border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white focus:border-blue-500/50 focus:outline-none transition-colors" />
                </div>
            </div>
            <div class="grid gap-2">
                <label class="text-xs font-medium uppercase tracking-wider text-slate-500 ml-1">Laboratory Email</label>
                <div class="relative">
                    <Mail class="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input type="email" placeholder="m.curie@radium-lab.org"
                        class="h-10 w-full rounded-md border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white focus:border-blue-500/50 focus:outline-none transition-colors" />
                </div>
            </div>
            <button type="button"
                class="inline-flex h-10 w-full items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-semibold text-white transition-all hover:bg-blue-500">
                Initiate Enrollment
            </button>
        </form>

        <p class="text-center text-sm text-slate-500">
            Already registered?
            <a href="/login" class="underline underline-offset-4 hover:text-blue-400">Access Terminal</a>
        </p>
    </div>
</template>
