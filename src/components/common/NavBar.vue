<template>
  <nav class="bg-white shadow-lg border-b border-gray-200">
    <div class="container">
      <div class="flex justify-between items-center py-4">
        <!-- Навигация -->
        <div class="flex items-center space-x-6">
          <!-- Основные ссылки -->
          <div class="flex items-center space-x-1">
            <router-link to="/" class="nav-link">
              Главная
            </router-link>
            <router-link to="/posts" class="nav-link">
              Статьи
            </router-link>
            <router-link to="/categories" class="nav-link">
              Категории
            </router-link>
          </div>

          <!-- Авторизация -->
          <div class="flex items-center space-x-4">
            <template v-if="isAuthenticated && user">
              <div class="flex items-center space-x-3 pl-3 border-l border-gray-200">
                <span class="text-gray-700 font-medium text-sm">
                  👋 {{ user.name || 'Пользователь' }}
                </span>
                <button
                  @click="handleLogout"
                  class="btn-secondary"
                >
                  <span class="mr-2">🚪</span>
                  Выйти
                </button>
              </div>
            </template>

            <template v-else>
              <router-link to="/login" class="btn-secondary">
                <span class="mr-2">🔑</span>
                Войти
              </router-link>
              <router-link to="/register" class="btn-primary">
                <span class="mr-2">📋</span>
                Регистрация
              </router-link>
            </template>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const { user, isAuthenticated } = storeToRefs(authStore)

const handleLogout = () => {
  authStore.logout()
}
</script>
