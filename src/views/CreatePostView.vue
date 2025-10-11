<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <div class="card">
      <div class="card-body">
        <h1 class="custom-heading">Создать новую статью</h1>

        <form @submit.prevent="handleCreatePost" class="space-y-6">
          <div>
            <label for="title" class="form-label">Заголовок статьи</label>
            <input
              v-model="form.title"
              type="text"
              id="title"
              required
              class="form-input"
              :class="{ 'border-red-500': errors.title }"
              placeholder="Введите заголовок статьи"
            />
            <p v-if="errors.title" class="mt-1 text-sm text-red-600">{{ errors.title[0] }}</p>
          </div>

          <div>
            <label for="category_id" class="form-label">Категория</label>
            <select
              v-model="form.category_id"
              id="category_id"
              class="form-input"
              :class="{ 'border-red-500': errors.category_id }"
            >
              <option value="">Выберите категорию...</option>
              <option
                v-for="category in categories"
                :key="category.id"
                :value="category.id"
              >
                {{ category.name }}
              </option>
            </select>
            <p v-if="errors.category_id" class="mt-1 text-sm text-red-600">{{ errors.category_id[0] }}</p>
            <p class="small-gray-text">
              Выберите категорию для статьи
            </p>
          </div>

          <div>
            <label for="short_description" class="form-label">Краткое описание</label>
            <textarea
              v-model="form.short_description"
              id="short_description"
              rows="3"
              class="form-input"
              :class="{ 'border-red-500': errors.short_description }"
              placeholder="Краткое описание статьи (необязательно)"
            ></textarea>
            <p v-if="errors.short_description" class="mt-1 text-sm text-red-600">{{ errors.short_description[0] }}</p>
          </div>

          <div>
            <label for="content" class="form-label">Содержание статьи</label>
            <textarea
              v-model="form.content"
              id="content"
              rows="12"
              required
              class="form-input"
              :class="{ 'border-red-500': errors.content }"
              placeholder="Напишите содержимое вашей статьи..."
            ></textarea>
            <p v-if="errors.content" class="mt-1 text-sm text-red-600">{{ errors.content[0] }}</p>
          </div>

          <div class="flex-container">
            <input
              v-model="form.published"
              type="checkbox"
              id="published"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-5 w-5"
            />
            <label for="published" class="ml-3 text-sm font-medium text-gray-700">
              Опубликовать сразу
            </label>
          </div>

          <div class="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              type="submit"
              :disabled="postsStore.loading"
              class="btn-primary flex-1 inline-flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span v-if="postsStore.loading" class="animate-spin">⟳</span>
              <span v-else>📝</span>
              <span>{{ postsStore.loading ? 'Создание...' : 'Создать статью' }}</span>
            </button>
            <router-link to="/posts" class="btn-secondary text-center">
              Отмена
            </router-link>
          </div>

          <!-- Сообщения -->
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
import { useRouter } from 'vue-router'
import { usePostsStore } from '@/stores/posts'
import { useAuthStore } from '@/stores/auth'
import { categoriesAPI } from '@/services/api'

const router = useRouter()
const postsStore = usePostsStore()
const authStore = useAuthStore()

const categories = ref([])
const errors = ref({})
const message = ref('')

const form = reactive({
  title: '',
  category_id: '',
  short_description: '',
  content: '',
  published: true
})

const messageClass = computed(() => {
  return message.value.includes('успе')
    ? 'alert-success'
    : 'alert-error'
})

// Загрузка категорий
const loadCategories = async () => {
  try {
    const response = await categoriesAPI.getAll()
    categories.value = response.data.data || response.data || []
  } catch (error) {
    console.error('Ошибка загрузки категорий:', error)
    // Fallback категории
    categories.value = [
      { id: 1, name: 'Технологии' },
      { id: 2, name: 'Путешествия' },
      { id: 3, name: 'Еда' },
      { id: 4, name: 'Спорт' },
      { id: 5, name: 'Здоровье' },
      { id: 6, name: 'Образование' }
    ]
  }
}

const handleCreatePost = async () => {
  if (!authStore.isAuthenticated) {
    message.value = 'Для создания статьи необходимо войти в систему'
    return
  }

  errors.value = {}
  message.value = ''

  try {
    await postsStore.createPost(form)
    message.value = 'Статья успешно создана! Перенаправление...'
    setTimeout(() => {
      router.push('/posts')
    }, 1500)
  } catch (error) {
    if (error.errors) {
      errors.value = error.errors
    } else {
      message.value = error.message || 'Ошибка при создании статьи'
    }
  }
}

onMounted(() => {
  loadCategories()
})
</script>
