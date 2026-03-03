<script setup lang="ts">
import { ref } from 'vue'
import { Mail, RefreshCw } from 'lucide-vue-next'
import { authService } from '../../services/auth.service'

const email = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const handleResetPassword = async () => {
    isLoading.value = true
    errorMessage.value = ''
    successMessage.value = ''
    try {
        await authService.resetPassword(email.value)
        successMessage.value = 'Recovery link sent! Please check your email inbox.'
    } catch (error: unknown) {
        console.error('Password reset failed:', error)
        errorMessage.value = error instanceof Error ? error.message : 'Failed to send recovery link.'
    } finally {
        isLoading.value = false
    }
}
</script>

<template>
    <div class="space-y-6">
        <div class="flex flex-col space-y-2 text-center">
            <h2 class="text-xl font-semibold tracking-tight text-white">Reset Password</h2>
            <p class="text-sm text-slate-400">Enter your email to receive a password reset link</p>
        </div>

        <form @submit.prevent="handleResetPassword" class="grid gap-4">
            <div v-if="errorMessage" class="rounded-md bg-red-500/10 p-3 text-xs text-red-500 border border-red-500/20">
                {{ errorMessage }}
            </div>
            <div v-if="successMessage" class="rounded-md bg-green-500/10 p-3 text-xs text-green-500 border border-green-500/20">
                {{ successMessage }}
            </div>

            <div class="grid gap-2">
                <label for="email" class="text-xs font-medium uppercase tracking-wider text-slate-500 ml-1">Email Address</label>
                <div class="relative">
                    <Mail class="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input v-model="email" id="email" type="email" placeholder="name@example.com"
                        class="h-10 w-full rounded-md border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white focus:border-blue-500/50 focus:outline-none transition-colors" required />
                </div>
            </div>
            <button type="submit" :disabled="isLoading"
                class="inline-flex h-10 w-full items-center justify-center rounded-md bg-white/10 px-4 text-sm font-semibold text-white transition-all hover:bg-white/20 disabled:opacity-50">
                <RefreshCw v-if="!isLoading" class="mr-2 h-4 w-4" />
                <span v-if="isLoading" class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                {{ isLoading ? 'Sending...' : 'Send Recovery Link' }}
            </button>
        </form>

        <p class="text-center text-sm text-slate-500">
            Wait, I remember!
            <a href="/login" class="underline underline-offset-4 hover:text-blue-400">Back to Login</a>
        </p>
    </div>
</template>
