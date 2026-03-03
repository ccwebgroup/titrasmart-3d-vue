<script setup lang="ts">
import { ref } from 'vue'
import { UserPlus, Mail, Lock } from 'lucide-vue-next'
import { authService } from '../../services/auth.service'
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const fullName = ref('')
const email = ref('')
const password = ref('')

const handleRegister = async () => {
    isLoading.value = true
    errorMessage.value = ''
    successMessage.value = ''
    try {
        await authService.signUpWithEmail(email.value, password.value, fullName.value)
        successMessage.value = 'Registration successful! Please check your email for a confirmation link.'
        // Optional: Redirect after a delay
        // setTimeout(() => router.push('/login'), 3000)
    } catch (error: unknown) {
        console.error('Registration failed:', error)
        errorMessage.value = error instanceof Error ? error.message : 'Enrollment failed. Please verify your details.'
    } finally {
        isLoading.value = false
    }
}
</script>

<template>
    <div class="space-y-6">
        <div class="flex flex-col space-y-2 text-center">
            <h2 class="text-xl font-semibold tracking-tight text-white">Create an Account</h2>
            <p class="text-sm text-slate-400">Get started with your virtual lab</p>
        </div>

        <form @submit.prevent="handleRegister" class="grid gap-4">
            <div v-if="errorMessage" class="rounded-md bg-red-500/10 p-3 text-xs text-red-500 border border-red-500/20">
                {{ errorMessage }}
            </div>
            <div v-if="successMessage" class="rounded-md bg-green-500/10 p-3 text-xs text-green-500 border border-green-500/20">
                {{ successMessage }}
            </div>

            <div class="grid gap-2">
                <label for="fullName" class="text-xs font-medium uppercase tracking-wider text-slate-500 ml-1">Full Name</label>
                <div class="relative">
                    <UserPlus class="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input v-model="fullName" id="fullName" type="text" placeholder="Marie Curie"
                        class="h-10 w-full rounded-md border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white focus:border-blue-500/50 focus:outline-none transition-colors" required />
                </div>
            </div>
            <div class="grid gap-2">
                <label for="email" class="text-xs font-medium uppercase tracking-wider text-slate-500 ml-1">Email Address</label>
                <div class="relative">
                    <Mail class="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input v-model="email" id="email" type="email" placeholder="m.curie@radium-lab.org"
                        class="h-10 w-full rounded-md border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white focus:border-blue-500/50 focus:outline-none transition-colors" required />
                </div>
            </div>
            <div class="grid gap-2">
                <label for="password" class="text-xs font-medium uppercase tracking-wider text-slate-500 ml-1">Password</label>
                <div class="relative">
                    <Lock class="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input v-model="password" id="password" type="password" placeholder="••••••••"
                        class="h-10 w-full rounded-md border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white focus:border-blue-500/50 focus:outline-none transition-colors" required />
                </div>
            </div>

            <button type="submit" :disabled="isLoading"
                class="inline-flex h-10 w-full items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-semibold text-white transition-all hover:bg-blue-500 disabled:opacity-50">
                <span v-if="isLoading" class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                {{ isLoading ? 'Signing up...' : 'Sign Up' }}
            </button>
        </form>

        <p class="text-center text-sm text-slate-500">
            Already registered?
            <a href="/login" class="underline underline-offset-4 hover:text-blue-400">Sign In</a>
        </p>
    </div>
</template>
