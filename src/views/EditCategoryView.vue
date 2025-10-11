<template>
  <div class="max-w-2xl mx-auto px-4 py-8">
    <div class="card">
      <div class="card-body">
        <h1 class="text-3xl font-bold mb-8">Редактировать категорию</h1>

        <!-- Загрузка данных -->
        <div v-if="loadingData" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>

        <!-- Ошибка загрузки -->
        <div v-else-if="loadError" class="alert alert-error mb-6">
          <p class="font-semibold mb-2">Ошибка загрузки категории</p>
          <p>{{ loadError }}</p>
          <div class="flex space-x-4 mt-4">
            <button @click="fetchCategory" class="btn-primary">
              Попробовать снова
            </button>
            <router-link to="/categories" class="btn-secondary">
              Назад к категориям
            </router-link>
          </div>
        </div>

        <!-- Форма редактирования -->
        <form v-else @submit.prevent="handleUpdateCategory" class="space-y-6">
          <div>
            <label for="name" class="form-label">Название категории</label>
            <input
              v-model="form.name"
              type="text"
              id="name"
              required
              class="form-input"
              :class="{ 'border-red-500': errors.name }"
              placeholder="Введите название категории"
            />
            <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name[0] }}</p>
          </div>

          <div>
            <label for="description" class="form-label">Описание</label>
            <textarea
              v-model="form.description"
              id="description"
              rows="3"
              class="form-input"
              :class="{ 'border-red-500': errors.description }"
              placeholder="Описание категории (необязательно)"
            ></textarea>
            <p v-if="errors.description" class="mt-1 text-sm text-red-600">{{ errors.description[0] }}</p>
          </div>

          <div class="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              type="submit"
              :disabled="loading"
              class="btn-primary flex-1 inline-flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span v-if="loading" class="animate-spin">⟳</span>
              <span v-else>💾</span>
              <span>{{ loading ? 'Сохранение...' : 'Сохранить изменения' }}</span>
            </button>

            <router-link to="/categories" class="btn-secondary text-center">
              Отмена
            </router-link>

            <button
              type="button"
              @click="handleDeleteCategory"
              :disabled="category?.posts_count > 0"
              class="btn-danger inline-flex items-center justify-center space-x-2 disabled:opacity-50"
              :title="category?.posts_count > 0 ? 'Нельзя удалить категорию со статьями' : ''"
            >
              <span>🗑️</span>
              <span>Удалить категорию</span>
            </button>
          </div>

          <div v-if="message" class="p-4 rounded-lg" :class="messageClass">
            <p class="font-medium">{{ message }}</p>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { categoriesAPI } from '@/services/api'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const category = ref(null)
const loadingData = ref(true)
const loading = ref(false)
const loadError = ref('')
const errors = ref({})
const message = ref('')

const form = reactive({
  name: '',
  description: ''
})

const messageClass = computed(() => {
  return message.value.includes('успе') || message.value.includes('Удалено')
    ? 'alert-success'
    : 'alert-error'
})

// Загрузка категории
const fetchCategory = async () => {
  loadingData.value = true
  loadError.value = ''

  try {
    const response = await categoriesAPI.getById(route.params.id)
    category.value = response.data.data || response.data

    // Заполнение формы
    Object.assign(form, {
      name: category.value.name || '',
      description: category.value.description || ''
    })

  } catch (error) {
    console.error('Ошибка загрузки категории:', error)
    loadError.value = error.message || 'Не удалось загрузить категорию'
  } finally {
    loadingData.value = false
  }
}

onMounted(async () => {
  await fetchCategory()
})

// Обновление категории
const handleUpdateCategory = async () => {
  errors.value = {}
  message.value = ''
  loading.value = true

  try {
    await categoriesAPI.update(route.params.id, form)
    message.value = 'Категория успешно обновлена!'
    setTimeout(() => {
      router.push('/categories')
    }, 1500)
  } catch (error) {
    if (error.errors) {
      errors.value = error.errors
    } else {
      message.value = error.message || 'Ошибка при обновлении категории'
    }
  } finally {
    loading.value = false
  }
}

// Удаление категории
const handleDeleteCategory = async () => {
  if (category.value.posts_count > 0) {
    alert('Нельзя удалить категорию, в которой есть статьи')
    return
  }

  if (!confirm(`Вы уверены, что хотите удалить категорию "${category.value.name}"?`)) return

  try {
    await categoriesAPI.delete(route.params.id)
    message.value = 'Категория удалена! Перенаправление...'
    setTimeout(() => {
      router.push('/categories')
    }, 1500)
  } catch (error) {
    message.value = error.message || 'Ошибка при удалении категории'
  }
}
</script>
