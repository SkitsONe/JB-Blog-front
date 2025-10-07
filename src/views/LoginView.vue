<template>
  <div class="max-w-md mx-auto mt-12">
    <div class="bg-white p-8 rounded-lg shadow-md">
      <h2 class="custom-heading">Вход в систему</h2>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label for="email" class="form-label">Email</label>
          <input
            v-model="form.email"
            type="email"
            id="email"
            required
            class="form-input"
            :class="{ 'border-red-500': errors.email }"
          />
          <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email[0] }}</p>
        </div>

        <div>
          <label for="password" class="form-label">Пароль</label>
          <input
            v-model="form.password"
            type="password"
            id="password"
            required
            class="form-input"
            :class="{ 'border-red-500': errors.password }"
          />
          <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password[0] }}</p>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full btn-primary disabled:opacity-50"
        >
          {{ loading ? 'Вход...' : 'Войти' }}
        </button>

        <div v-if="message" class="p-3 rounded bg-blue-100 text-blue-700">
          {{ message }}
        </div>

        <p class="small-gray-text">
          Нет аккаунта?
          <router-link to="/register" class="font-medium text-blue-600 hover:text-blue-500">
            Зарегистрируйтесь
          </router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const errors = ref({})
const message = ref('')

const form = reactive({
  email: '',
  password: '',
})

const handleLogin = async () => {
  loading.value = true
  errors.value = {}
  message.value = ''

  try {
    await authStore.login(form)
    message.value = 'Успешный вход! Перенаправление...'
    setTimeout(() => {
      router.push('/')
    }, 1000)
  } catch (error) {
    if (error.errors) {
      errors.value = error.errors
    } else {
      message.value = error.message || 'Ошибка входа. Проверьте email и пароль.'
    }
  } finally {
    loading.value = false
  }
}
</script>
