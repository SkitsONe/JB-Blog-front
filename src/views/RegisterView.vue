<template>
  <div class="max-w-md mx-auto mt-12">
    <div class="bg-white p-8 rounded-lg shadow-md">
      <h2 class="text-2xl font-bold text-center mb-6">Регистрация</h2>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label for="name" class="form-label">Имя</label>
          <input
            v-model="form.name"
            type="text"
            id="name"
            required
            class="form-input"
            :class="{ 'border-red-500': errors.name }"
          />
          <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name[0] }}</p>
        </div>

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
            minlength="8"
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
          {{ loading ? 'Регистрация...' : 'Зарегистрироваться' }}
        </button>

        <div v-if="message" class="p-3 rounded" :class="messageClass">
          {{ message }}
        </div>

        <p class="text-center text-sm text-gray-600">
          Уже есть аккаунт?
          <router-link to="/login" class="font-medium text-blue-600 hover:text-blue-500">
            Войдите
          </router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const errors = ref({})
const message = ref('')

const form = reactive({
  name: '',
  email: '',
  password: '',
})

const messageClass = computed(() => {
  return message.value.includes('успе')
    ? 'bg-green-100 text-green-700'
    : 'bg-blue-100 text-blue-700'
})

const handleRegister = async () => {
  loading.value = true
  errors.value = {}
  message.value = ''

  try {
    await authStore.register(form)
    message.value = 'Регистрация успешна! Теперь войдите в систему.'
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (error) {
    if (error.errors) {
      errors.value = error.errors
    } else {
      message.value = error.message || 'Ошибка регистрации'
    }
  } finally {
    loading.value = false
  }
}
</script>
