<script setup lang="ts">
import { watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthState } from '@/store/authState'

const router = useRouter()
const route = useRoute()
const authState = useAuthState()

// Global watcher to handle deferred session recovery
// If the user ends up on /login but the session is found shortly after,
// move them back to the lab.
watch(() => authState.isAuthenticated, (isAuth) => {
  if (isAuth && route.meta.isGuestOnly) {
    console.log('[App] Auth detected on guest-only page. Redirecting to lab...')
    router.push('/lab')
  }
}, { immediate: true })
</script>

<template>
  <router-view />
</template>

<style scoped></style>
