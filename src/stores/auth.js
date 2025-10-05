import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('auth_token'))
  const loading = ref(false)

  const isAuthenticated = computed(() => {
    const hasToken = !!token.value
    const hasUser = !!user.value
    console.log('🔐 Auth check - Token:', hasToken, 'User:', hasUser)
    return hasToken && hasUser
  })

  // ✅ ДОБАВЛЯЕМ МЕТОД REGISTER
  const register = async (userData) => {
    loading.value = true
    try {
      console.log('👤 Attempting registration...', userData)
      const response = await authAPI.register(userData)
      console.log('📨 Registration response:', response.data)

      // ✅ ПРАВИЛЬНО: используем другое имя для деструктуризации
      const { access_token, user: newUser } = response.data

      token.value = access_token
      user.value = newUser

      localStorage.setItem('auth_token', access_token)
      console.log('✅ Registration successful, user:', user.value)

      return response.data
    } catch (error) {
      console.error('❌ Registration failed:', error)

      // Более детальная обработка ошибок
      const errorData = error.response?.data || { message: 'Ошибка регистрации' }
      throw errorData
    } finally {
      loading.value = false
    }
  }

  // Восстановление данных пользователя при инициализации
  const initializeAuth = async () => {
    console.log('🔄 Initializing auth...')
    if (token.value) {
      try {
        loading.value = true
        console.log('📡 Restoring session with token:', token.value)
        await getMe()
        console.log('✅ Session restored, user:', user.value)
      } catch (error) {
        console.error('❌ Session restoration failed:', error)
        logout()
      } finally {
        loading.value = false
      }
    } else {
      console.log('ℹ️ No token found, user remains anonymous')
    }
  }

  const login = async (credentials) => {
    loading.value = true
    try {
      console.log('🔐 Attempting login...')
      const response = await authAPI.login(credentials)
      console.log('📨 Login response:', response.data)

      const { access_token, user: userData } = response.data

      token.value = access_token
      user.value = userData

      localStorage.setItem('auth_token', access_token)
      console.log('✅ Login successful, user:', user.value)

      return response.data
    } catch (error) {
      console.error('❌ Login failed:', error)
      throw error.response?.data || error
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    console.log('🚪 Logging out...')
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout API error:', error)
    } finally {
      token.value = null
      user.value = null
      localStorage.removeItem('auth_token')
      console.log('✅ Logout completed')
    }
  }

  const getMe = async () => {
    if (!token.value) {
      console.log('ℹ️ No token, skipping getMe')
      return
    }

    try {
      const response = await authAPI.getMe()

      // Обрабатываем разные форматы ответа
      user.value = response.data.user || response.data

      return user.value
    } catch (error) {
      logout()
      throw error
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    loading,
    initializeAuth,
    login,
    logout,
    getMe,
    register,
  }
})
