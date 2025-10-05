<template>
  <div class="container mx-auto px-4 py-8">
    <div class="main-content p-8">
      <!-- Заголовок и кнопка -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Категории</h1>
          <p class="text-gray-600">Исследуйте статьи по темам</p>
        </div>
        <button
          v-if="isAuthenticated"
          @click="showCreateForm = true"
          class="btn-primary inline-flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Добавить категорию</span>
        </button>
      </div>

      <!-- Форма создания -->
      <div v-if="showCreateForm" class="card mb-8">
        <div class="card-body">
          <h2 class="text-xl font-semibold mb-4">Создать новую категорию</h2>
          <form @submit.prevent="handleCreateCategory" class="space-y-4">
            <div>
              <label for="categoryName" class="form-label">Название категории</label>
              <input
                v-model="newCategory.name"
                type="text"
                id="categoryName"
                required
                class="form-input"
                :class="{ 'border-red-500': errors.name }"
                placeholder="Например: Технологии, Кулинария, Спорт..."
              />
              <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name[0] }}</p>
            </div>
            <div class="flex space-x-3">
              <button
                type="submit"
                :disabled="loading"
                class="btn-success inline-flex items-center space-x-2 disabled:opacity-50"
              >
                <span v-if="loading" class="animate-spin">⟳</span>
                <span v-else>✅</span>
                <span>{{ loading ? 'Создание...' : 'Создать' }}</span>
              </button>
              <button type="button" @click="cancelCreate" class="btn-secondary">
                Отмена
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Загрузка -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <!-- Ошибка -->
      <div v-else-if="error" class="alert alert-error text-center py-8">
        <p class="text-lg font-semibold mb-2">Ошибка загрузки категорий</p>
        <p class="text-gray-600">{{ error }}</p>
        <button @click="fetchCategories" class="btn-primary mt-4">
          Попробовать снова
        </button>
      </div>

      <!-- Сетка категорий -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div
          v-for="category in categories"
          :key="category.id"
          class="card group cursor-pointer hover:shadow-xl transition-all duration-300"
          @click="goToCategoryPosts(category)"
        >
          <div class="card-body text-center">
            <div class="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
              <span class="text-2xl">📂</span>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
              {{ category.name }}
            </h3>
            <p class="text-gray-600 text-sm mb-4 line-clamp-2">
              {{ category.description || `Статьи по теме "${category.name}"` }}
            </p>
            <div class="flex justify-center items-center space-x-4 text-sm text-gray-500">
              <span class="inline-flex items-center space-x-1">
                <span>📄</span>
                <span>{{ category.posts_count || 0 }} статей</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Пустое состояние -->
      <div v-if="!loading && !error && categories.length === 0" class="text-center py-12">
        <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span class="text-3xl">📂</span>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Категории не найдены</h3>
        <p class="text-gray-600 mb-6">Создайте первую категорию для организации статей</p>
        <button
          v-if="isAuthenticated"
          @click="showCreateForm = true"
          class="btn-primary inline-flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Создать первую категорию</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { categoriesAPI } from '@/services/api'
import { storeToRefs } from 'pinia'

const router = useRouter()
const authStore = useAuthStore()
const { isAuthenticated } = storeToRefs(authStore)

const showCreateForm = ref(false)
const categories = ref([])
const loading = ref(false)
const error = ref('')

const newCategory = reactive({
  name: ''
})

const errors = ref({})

// Загрузка категорий
const fetchCategories = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await categoriesAPI.getAll()
    categories.value = response.data.data || response.data
  } catch (err) {
    error.value = err.message || 'Ошибка загрузки категорий'
    console.error('Error fetching categories:', err)
  } finally {
    loading.value = false
  }
}

// Переход к статьям категории
const goToCategoryPosts = (category) => {
  // Переходим на страницу статей с параметром фильтрации
  router.push({
    path: '/posts',
    query: {
      category: category.name,
      category_id: category.id
    }
  })
}

// Создание категории
const handleCreateCategory = async () => {
  if (!newCategory.name.trim()) return

  loading.value = true
  errors.value = {}

  try {
    const response = await categoriesAPI.create(newCategory)
    const createdCategory = response.data.data || response.data

    categories.value.unshift(createdCategory)
    newCategory.name = ''
    showCreateForm.value = false
  } catch (err) {
    if (err.errors) {
      errors.value = err.errors
    } else {
      error.value = err.message || 'Ошибка создания категории'
    }
  } finally {
    loading.value = false
  }
}

const cancelCreate = () => {
  showCreateForm.value = false
  newCategory.name = ''
  errors.value = {}
}

onMounted(() => {
  fetchCategories()
})
</script>
