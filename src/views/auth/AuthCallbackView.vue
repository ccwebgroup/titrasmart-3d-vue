<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '../../services/auth.service';

const router = useRouter();

onMounted(async () => {
    // Supabase automatically handles the hash/query params and session establishment.
    // We just need to wait a moment or check if a session exists, then redirect.
    const session = await authService.getSession();
    if (session) {
        router.push('/lab');
    } else {
        // If no session is found after a short delay, redirect to login
        setTimeout(async () => {
            const retrySession = await authService.getSession();
            if (retrySession) {
                router.push('/lab');
            } else {
                router.push('/login');
            }
        }, 1000);
    }
});
</script>

<template>
    <div class="flex flex-col items-center justify-center space-y-4 py-12">
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500" />
        <p class="text-sm font-medium text-slate-400">Finalizing secure connection...</p>
    </div>
</template>
