import axios from 'axios'
import { handleApiError } from '@/utils/errorHandler'

const API_BASE_URL = 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  console.log(`📡 ${config.method?.toUpperCase()} ${config.url}`, {
    token: token ? 'exists' : 'none',
    data: config.data
  })
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}:`, response.data)
    return response
  },
  (error) => {
    console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, error.response?.data || error.message)

    const handledError = handleApiError(error)

    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
    }

    return Promise.reject(handledError)
  }
)

export const authAPI = {
  login: (credentials) => api.post('/login', credentials),
  register: (userData) => api.post('/register', userData),
  logout: () => api.post('/logout'),
  getMe: () => api.get('/me'),
}

export const postsAPI = {
  getAll: (params = {}) => api.get('/posts', { params }),
  getById: (id) => api.get(`/posts/${id}`),
  create: (postData) => api.post('/posts', postData),
  update: (id, postData) => api.put(`/posts/${id}`, postData),
  delete: (id) => api.delete(`/posts/${id}`),
}

export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (categoryData) => api.post('/categories', categoryData),
  update: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
  delete: (id) => api.delete(`/categories/${id}`),
}

export default api
