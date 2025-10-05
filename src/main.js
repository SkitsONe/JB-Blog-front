import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './styles.css'

import { useAuthStore } from '@/stores/auth'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

const initializeApp = async () => {
  const authStore = useAuthStore()

  try {
    await authStore.initializeAuth()
  } catch (error) {
    console.error('Ошибка инициализации приложения:', error)
  } finally {
    app.mount('#app')
  }
}

initializeApp()
