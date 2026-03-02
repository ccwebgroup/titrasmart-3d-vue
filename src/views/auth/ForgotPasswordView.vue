<script vapor setup lang="ts">
import { Mail, RefreshCw } from 'lucide-vue-next'
</script>

<template>
    <div class="space-y-6">
        <div class="flex flex-col space-y-2 text-center">
            <h2 class="text-xl font-semibold tracking-tight text-white">Reset Chemical Key</h2>
            <p class="text-sm text-slate-400">We'll send a recovery link to your laboratory email</p>
        </div>

        <form class="grid gap-4">
            <div class="grid gap-2">
                <label class="text-xs font-medium uppercase tracking-wider text-slate-500 ml-1">Laboratory Email</label>
                <div class="relative">
                    <Mail class="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input type="email" placeholder="sc-001@titrasmart.edu"
                        class="h-10 w-full rounded-md border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white focus:border-blue-500/50 focus:outline-none transition-colors" />
                </div>
            </div>
            <button type="button"
                class="inline-flex h-10 w-full items-center justify-center rounded-md bg-white/10 px-4 text-sm font-semibold text-white transition-all hover:bg-white/20">
                <RefreshCw class="mr-2 h-4 w-4" />
                Send Recovery Link
            </button>
        </form>

        <p class="text-center text-sm text-slate-500">
            Wait, I remember!
            <a href="/login" class="underline underline-offset-4 hover:text-blue-400">Back to Terminal</a>
        </p>
    </div>
</template>
