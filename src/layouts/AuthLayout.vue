<script setup lang="ts">
/**
 * AuthLayout: A premium, high-impact layout for authentication pages.
 * Features a digital twin laboratory background with a centered glassmorphic container.
 */
</script>

<template>
  <div class="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-950">
    <!-- Background Image with Overlay -->
    <div class="absolute inset-0 z-0">
      <img src="/images/auth-bg.png" alt="Lab Background"
        class="h-full w-full object-cover opacity-40 grayscale-[0.2]" />
      <!-- Radiant Gradient Overlay -->
      <div class="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-teal-500/10" />
      <div class="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px]" />
    </div>

    <!-- Content Area -->
    <div class="relative z-10 w-full max-w-md px-6">
      <div class="mb-8 flex flex-col items-center text-center">
        <!-- Logo Placeholder -->
        <div
          class="h-16 w-16 mb-4 rounded-xl bg-gradient-to-tr from-blue-600 to-teal-400 p-0.5 shadow-lg shadow-blue-500/20">
          <div class="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
            <span
              class="text-2xl font-bold bg-gradient-to-r from-blue-400 to-teal-300 bg-clip-text text-transparent italic">T</span>
          </div>
        </div>
        <h1 class="text-3xl font-bold tracking-tight text-white">TitraSmart 3D</h1>
        <p class="mt-2 text-sm text-slate-400 uppercase tracking-widest font-medium">Digital Twin Laboratory</p>
      </div>

      <!-- Glassmorphic Card -->
      <div
        class="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 p-8 shadow-2xl backdrop-blur-xl transition-all hover:border-white/20">
        <router-view />
      </div>

      <!-- Footer Info -->
      <div class="mt-8 text-center text-xs text-slate-500 uppercase tracking-tighter">
        © 2026 Titanium Stack Evolution • Vapor Mode Enabled
      </div>
    </div>
  </div>
</template>

<style scoped>
/* High-performance animations for the layout */
@keyframes pulse-subtle {

  0%,
  100% {
    opacity: 0.4;
  }

  50% {
    opacity: 0.6;
  }
}

img {
  animation: pulse-subtle 10s ease-in-out infinite;
}
</style>
