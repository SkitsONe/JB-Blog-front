<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Герой секция -->
    <section class="text-center mb-12">
      <div class="max-w-3xl mx-auto">
        <h1 class="custom-heading">
          Добро пожаловать в
          <span class="text-blue-600">наш блог</span>
        </h1>
        <p class="small-gray-text">
          Платформа для создания и публикации статей на различные темы.
          Делитесь знаниями, находите вдохновение и развивайтесь вместе с нами.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link
            to="/posts"
            class="btn-primary text-lg px-8 py-3 inline-flex items-center space-x-2"
          >
            <span>📚</span>
            <span>Читать статьи</span>
          </router-link>
          <router-link
            v-if="isAuthenticated"
            to="/posts/create"
            class="btn-primary"
          >
            <span class="mr-2">✏️</span>
            Новая статья
          </router-link>
          <router-link
            v-if="!isAuthenticated"
            to="/register"
            class="btn-secondary text-lg px-8 py-3 inline-flex items-center space-x-2"
          >
            <span>🚀</span>
            <span>Присоединиться</span>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Последние статьи -->
    <section>
      <div class="flex justify-between items-center mb-8">
        <div>
          <h2 class="custom-heading">Последние статьи</h2>
          <p class="custom-heading">Самые свежие публикации в нашем блоге</p>
        </div>
        <router-link
          to="/posts"
          class="btn-secondary inline-flex items-center space-x-2"
        >
          <span>📖</span>
          <span>Фильтр</span>
        </router-link>
      </div>

      <!-- Загрузка -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span class="ml-3 text-gray-600">Загрузка статей...</span>
      </div>

      <!-- Ошибка -->
      <div v-else-if="error" class="alert alert-error text-center py-8">
        <p class="text-lg font-semibold mb-2">Ошибка загрузки</p>
        <p class="text-gray-600">{{ error }}</p>
        <button @click="loadPosts" class="btn-primary mt-4">
          Попробовать снова
        </button>
      </div>

      <!-- Сетка статей -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <article
          v-for="post in posts"
          :key="post.id"
          class="card group cursor-pointer hover:shadow-lg transition-all duration-300"
          @click="$router.push(`/posts/${post.id}`)"
        >
          <div class="card-body h-full flex flex-col">
            <!-- Категория и дата -->
            <div class="flex items-center justify-between mb-3">
              <span class="badge badge-blue">
                {{ getCategoryName(post) }}
              </span>
              <span class="text-xs text-gray-500">
                {{ formatDate(post.created_at) }}
              </span>
            </div>

            <!-- Заголовок -->
            <h3 class="custom-element">
              {{ post.title }}
            </h3>

            <!-- Описание -->
            <p class="truncated-title">
              {{ getShortDescription(post) }}
            </p>

            <!-- Автор -->
            <div class="flex items-center justify-between pt-3 border-t border-gray-100">
              <div class="flex items-center space-x-2">
                <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span class="truncated-title">
                    {{ getInitials(getAuthorName(post)) }}
                  </span>
                </div>
                <span class="truncated-title">
                  {{ getAuthorName(post) }}
                </span>
              </div>
              <span class="btn-read">
                Читать →
              </span>
            </div>
          </div>
        </article>
      </div>

      <!-- Пустое состояние -->
      <div v-if="!loading && !error && posts.length === 0" class="text-center py-12">
        <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span class="text-2xl">📝</span>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Пока нет статей</h3>
        <p class="text-gray-600 mb-6">Будьте первым, кто поделится своими знаниями!</p>
        <router-link
          v-if="isAuthenticated"
          to="/posts/create"
          class="btn-primary inline-flex items-center space-x-2"
        >
          <span>✏️</span>
          <span>Создать первую статью</span>
        </router-link>
        <router-link
          v-else
          to="/register"
          class="btn-primary inline-flex items-center space-x-2"
        >
          <span>📋</span>
          <span>Зарегистрироваться</span>
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePostsStore } from '@/stores/posts'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

const postsStore = usePostsStore()
const authStore = useAuthStore()
const { isAuthenticated } = storeToRefs(authStore)

const posts = ref([])
const loading = ref(false)
const error = ref('')

const loadPosts = async () => {
  loading.value = true
  error.value = ''
  try {
    await postsStore.fetchPosts({ per_page: 6 })
    posts.value = postsStore.posts
  } catch (err) {
    error.value = err.message || 'Ошибка загрузки статей'
    console.error('Error loading posts:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadPosts()
})

const getCategoryName = (post) => {
  return post.category_name || post.category?.name || 'Без категории'
}

const getAuthorName = (post) => {
  return post.user?.name || post.author_name || 'Неизвестный автор'
}

const getShortDescription = (post) => {
  if (post.short_description) return post.short_description
  if (post.content) {
    return post.content.length > 100 ? post.content.substring(0, 100) + '...' : post.content
  }
  return 'Нет описания'
}

const truncateContent = (content, length = 100) => {
  if (!content) return 'Нет описания'
  return content.length > length ? content.substring(0, length) + '...' : content
}

const formatDate = (dateString) => {
  if (!dateString) return 'Нет даты'
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}
</script>
