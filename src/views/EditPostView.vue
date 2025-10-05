<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <div class="card">
      <div class="card-body">
        <h1 class="text-3xl font-bold mb-8">Редактировать статью</h1>

        <!-- Загрузка данных -->
        <div v-if="loadingData" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>

        <!-- Ошибка загрузки -->
        <div v-else-if="loadError" class="alert alert-error mb-6">
          <p class="font-semibold mb-2">Ошибка загрузки статьи</p>
          <p>{{ loadError }}</p>
          <div class="flex space-x-4 mt-4">
            <button @click="fetchPost" class="btn-primary">
              Попробовать снова
            </button>
            <router-link :to="`/posts/${$route.params.id}`" class="btn-secondary">
              Назад к статье
            </router-link>
          </div>
        </div>

        <!-- Форма редактирования -->
        <form v-else @submit.prevent="handleUpdatePost" class="space-y-6">
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
            <label for="category" class="form-label">Категория</label>
            <div class="flex gap-3">
              <select
                v-model="selectedCategory"
                @change="onCategorySelect"
                class="form-input flex-1"
                :class="{ 'border-red-500': errors.category_name }"
              >
                <option value="">Выберите категорию...</option>
                <option
                  v-for="category in categories"
                  :key="category.id"
                  :value="category.name"
                >
                  {{ category.name }}
                </option>
                <option value="new">+ Создать новую категорию</option>
              </select>

              <input
                v-if="showNewCategoryInput"
                v-model="form.category_name"
                type="text"
                class="form-input flex-1"
                :class="{ 'border-red-500': errors.category_name }"
                placeholder="Введите название новой категории"
              />
            </div>
            <p v-if="errors.category_name" class="mt-1 text-sm text-red-600">{{ errors.category_name[0] }}</p>
          </div>

          <div>
            <label for="excerpt" class="form-label">Краткое описание</label>
            <textarea
              v-model="form.excerpt"
              id="excerpt"
              rows="3"
              class="form-input"
              :class="{ 'border-red-500': errors.excerpt }"
              placeholder="Краткое описание статьи (необязательно)"
            ></textarea>
            <p v-if="errors.excerpt" class="mt-1 text-sm text-red-600">{{ errors.excerpt[0] }}</p>
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

          <div class="flex items-center">
            <input
              v-model="form.published"
              type="checkbox"
              id="published"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-5 w-5"
            />
            <label for="published" class="ml-3 text-sm font-medium text-gray-700">
              Опубликовать статью
            </label>
          </div>

          <div class="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              type="submit"
              :disabled="postsStore.loading"
              class="btn-primary flex-1 inline-flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span v-if="postsStore.loading" class="animate-spin">⟳</span>
              <span v-else>💾</span>
              <span>{{ postsStore.loading ? 'Сохранение...' : 'Сохранить изменения' }}</span>
            </button>

            <router-link :to="`/posts/${$route.params.id}`" class="btn-secondary text-center">
              Отмена
            </router-link>

            <button
              type="button"
              @click="handleDeletePost"
              :disabled="postsStore.loading"
              class="btn-danger inline-flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>🗑️</span>
              <span>Удалить статью</span>
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
import { usePostsStore } from '@/stores/posts'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { categoriesAPI } from '@/services/api'

const route = useRoute()
const router = useRouter()
const postsStore = usePostsStore()
const authStore = useAuthStore()

const { user } = storeToRefs(authStore) // Правильное использование storeToRefs

const categories = ref([])
const selectedCategory = ref('')
const showNewCategoryInput = ref(false)
const loadingData = ref(true)
const loadError = ref('')
const errors = ref({})
const message = ref('')

const form = reactive({
  title: '',
  category_name: '',
  excerpt: '',
  content: '',
  published: true
})

const messageClass = computed(() => {
  return message.value.includes('успе') || message.value.includes('Удалено')
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
  }
}

// Обработчик выбора категории
const onCategorySelect = () => {
  if (selectedCategory.value === 'new') {
    showNewCategoryInput.value = true
    form.category_name = ''
  } else if (selectedCategory.value) {
    showNewCategoryInput.value = false
    form.category_name = selectedCategory.value
  } else {
    showNewCategoryInput.value = false
    form.category_name = ''
  }
}

// Загрузка статьи
const fetchPost = async () => {
  loadingData.value = true
  loadError.value = ''

  try {
    const post = await postsStore.fetchPost(route.params.id)

    if (!user.value || (post.user_id !== user.value.id && post.user?.id !== user.value.id)) {
      throw new Error('У вас нет прав для редактирования этой статьи')
    }

    // Заполнение формы
    Object.assign(form, {
      title: post.title || '',
      category_name: post.category_name || post.category?.name || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      published: post.published !== undefined ? post.published : true
    })

    // Устанавливаем выбранную категорию
    selectedCategory.value = form.category_name

  } catch (error) {
    console.error('Ошибка загрузки статьи:', error)
    loadError.value = error.message || 'Не удалось загрузить статью'

    if (error.message.includes('прав')) {
      setTimeout(() => {
        router.push('/posts')
      }, 3000)
    }
  } finally {
    loadingData.value = false
  }
}

onMounted(async () => {
  await loadCategories()
  await fetchPost()
})

// Обновление статьи
const handleUpdatePost = async () => {
  errors.value = {}
  message.value = ''

  try {
    await postsStore.updatePost(route.params.id, form)
    message.value = 'Статья успешно обновлена!'
    setTimeout(() => {
      router.push(`/posts/${route.params.id}`)
    }, 1500)
  } catch (error) {
    if (error.errors) {
      errors.value = error.errors
    } else {
      message.value = error.message || 'Ошибка при обновлении статьи'
    }
  }
}

// Удаление статьи
const handleDeletePost = async () => {
  if (!confirm('Вы уверены, что хотите удалить эту статью?')) return

  try {
    await postsStore.deletePost(route.params.id)
    message.value = 'Статья удалена! Перенаправление...'
    setTimeout(() => {
      router.push('/posts')
    }, 1500)
  } catch (error) {
    message.value = error.message || 'Ошибка при удалении статьи'
  }
}
</script>
