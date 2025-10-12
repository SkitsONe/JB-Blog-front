<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <div class="card">
      <div class="card-body">
        <h1 class="custom-heading">Создать новую статью</h1>

        <div v-if="showCategoryModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div class="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 class="text-lg font-semibold mb-4">Создать новую категорию</h3>

            <div class="space-y-4">
              <div>
                <label class="form-label">Название категории</label>
                <input
                  v-model="newCategoryName"
                  type="text"
                  class="form-input"
                  placeholder="Введите название категории"
                />
              </div>

              <div class="flex space-x-3">
                <button
                  @click="createCategory"
                  class="btn-primary flex-1"
                  :disabled="!newCategoryName"
                >
                  Создать
                </button>
                <button
                  @click="showCategoryModal = false"
                  class="btn-secondary"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Сообщение об отсутствии категорий -->
        <div v-if="categories.length === 0 && !loadingCategories" class="alert-warning mb-6">
          <div class="flex items-start">
            <span class="text-lg mr-3 mt-1">⚠️</span>
            <div class="flex-1">
              <p class="font-medium ml-0">Категории не найдены</p>
              <p class="text-sm mt-1 mb-3 ml-0">Для создания статьи необходимо сначала создать категории.</p>
              <button
                @click="showCategoryModal = true"
                class="btn-primary inline-flex items-center space-x-2 ml-0"
              >
                <span>📁</span>
                <span>Создать категорию</span>
              </button>
            </div>
          </div>
        </div>
        <form @submit.prevent="handleCreatePost" class="space-y-6" v-else>
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
              :disabled="categories.length === 0"
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
              :disabled="postsStore.loading || categories.length === 0"
              class="btn-primary flex-1 inline-flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="postsStore.loading" class="animate-spin">⟳</span>
              <span v-else>📝</span>
              <span>
                {{ postsStore.loading ? 'Создание...' :
                categories.length === 0 ? 'Нет категорий' : 'Создать статью' }}
              </span>
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

        <!-- Индикатор загрузки категорий -->
        <div v-if="loadingCategories" class="text-center py-8">
          <div class="animate-spin text-2xl mb-2">⟳</div>
          <p class="text-gray-600">Загрузка категорий...</p>
        </div>
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

const showCategoryModal = ref(false)
const newCategoryName = ref('')
const router = useRouter()
const postsStore = usePostsStore()
const authStore = useAuthStore()
const categories = ref([])
const errors = ref({})
const message = ref('')
const loadingCategories = ref(true)

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
    loadingCategories.value = true
    const response = await categoriesAPI.getAll()
    categories.value = response.data.data || response.data || []
  } catch (error) {
    console.error('Ошибка загрузки категорий:', error)
    categories.value = []
  } finally {
    loadingCategories.value = false
  }
}

const createCategory = async () => {
  try {
    const response = await categoriesAPI.create({
      name: newCategoryName.value
    })

    categories.value.push(response.data)

    showCategoryModal.value = false
    newCategoryName.value = ''

    message.value = 'Категория успешно создана!'
  } catch (error) {
    message.value = 'Ошибка при создании категории: ' + error.message
  }
}

const handleCreatePost = async () => {
  if (!authStore.isAuthenticated) {
    message.value = 'Для создания статьи необходимо войти в систему'
    return
  }

  if (categories.value.length === 0) {
    message.value = 'Необходимо создать хотя бы одну категорию'
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
