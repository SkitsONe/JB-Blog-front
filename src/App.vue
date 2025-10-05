<template>
  <div id="app" class="min-h-screen">
    <!-- Индикатор загрузки при восстановлении сессии -->
    <div v-if="authStore.loading" class="fixed inset-0 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 bg-opacity-80 flex items-center justify-center z-50">
      <div class="text-center bg-white rounded-2xl p-8 shadow-2xl">
        <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-700 font-semibold">Восстановление сессии...</p>
      </div>
    </div>

    <NavBar />
    <main class="min-h-screen py-8">
      <div class="main-content">
        <router-view />
      </div>
    </main>
    <ApiStatus />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import NavBar from '@/components/common/NavBar.vue'
import ApiStatus from '@/components/common/ApiStatus.vue'

const authStore = useAuthStore()

onMounted(async () => {
  await authStore.initializeAuth()
})
</script>
