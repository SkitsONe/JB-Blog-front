<template>
  <div class="container mx-auto px-4 py-8">
    <div class="main-content p-8">
      <!-- Заголовок и управление -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 class="custom-heading">
            {{ selectedCategory ? `Категория: ${selectedCategory}` : showMyPosts ? 'Мои статьи' : 'Все статьи' }}
          </h1>
          <p class="custom-heading">
            {{ selectedCategory
            ? `Статьи в категории "${selectedCategory}"`
            : showMyPosts ? 'Статьи, которые вы создали' : 'Найдите интересующие вас материалы'
            }}
          </p>

          <!-- Бейдж активной категории -->
          <div v-if="selectedCategory" class="flex items-center gap-2 mt-2">
            <span class="badge badge-blue">
              📂 {{ selectedCategory }}
            </span>
            <button
              @click="clearCategoryFilter"
              class="btn-danger"
            >
              ✕ Сбросить
            </button>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center margin-left 10px">
          <!-- Переключатель Мои/Все статьи (скрываем при фильтрации по категории) -->
          <div v-if="isAuthenticated && user && !selectedCategory" class="posts-toggle">
            <button
              @click="showMyPosts = false"
              :class="!showMyPosts ? 'active' : ''"
            >
              Все статьи
            </button>
            <button
              @click="showMyPosts = true"
              :class="showMyPosts ? 'active' : ''"
            >
              Мои статьи
            </button>
          </div>
        <div class="posts-toggle">
          <router-link
            v-if="isAuthenticated && user"
            to="/posts/create"
            class="btn-primary"
          >
            <span class="mr-2">✏️</span>
            Новая статья
          </router-link>
        </div>
        </div>
      </div>
    </div>

    <!-- Индикатор загрузки -->
    <div v-if="postsStore.loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <span class="ml-3 text-gray-600">Загрузка статей...</span>
    </div>

    <!-- Сообщение об ошибке -->
    <div v-else-if="postsStore.error" class="alert alert-error text-center py-8">
      <p class="text-lg font-semibold mb-2">Ошибка загрузки статей</p>
      <p class="text-gray-600">{{ postsStore.error }}</p>
      <button @click="loadPosts()" class="btn-primary mt-4">
        Попробовать снова
      </button>
    </div>

    <!-- Сетка статей -->
    <div v-else-if="filteredPosts.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <article
        v-for="post in filteredPosts"
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

          <!-- Автор и действия -->
          <div class="flex items-center justify-between pt-4 border-t border-gray-100">
            <div class="flex items-center space-x-2 my-4">
              <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-4 mb-4">
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
    <div v-else class="text-center py-12">
      <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span class="text-3xl" :class="showMyPosts ? '📝' : '🔍'"></span>
      </div>
      <h3 class="text-xl font-semibold text-gray-900 mb-2">
        {{ showMyPosts ? 'У вас пока нет статей' : 'Статьи не найдены' }}
      </h3>
      <p class="text-gray-600 mb-6 max-w-md mx-auto">
        {{ showMyPosts
        ? 'Создайте свою первую статью и поделитесь знаниями с другими!'
        : 'Пока нет опубликованных статей. Будьте первым, кто поделится своими знаниями!'
        }}
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <router-link
          v-if="isAuthenticated && user"
          to="/posts/create"
          class="btn-primary inline-flex items-center space-x-2"
        >
          <span>✏️</span>
          <span>Создать {{ showMyPosts ? 'первую статью' : 'статью' }}</span>
        </router-link>
        <router-link
          v-if="!isAuthenticated && !showMyPosts"
          to="/register"
          class="btn-primary inline-flex items-center space-x-2"
        >
          <span>📋</span>
          <span>Зарегистрироваться</span>
        </router-link>
        <button
          v-if="showMyPosts && postsStore.posts.length > 0"
          @click="showMyPosts = false"
          class="btn-secondary inline-flex items-center space-x-2"
        >
          <span>📚</span>
          <span>Все статьи</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePostsStore } from '@/stores/posts'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

const route = useRoute()
const router = useRouter()
const postsStore = usePostsStore()
const authStore = useAuthStore()
const { user, isAuthenticated } = storeToRefs(authStore)

const showMyPosts = ref(false)
const selectedCategory = ref('')

// Инициализация фильтров из URL параметров
const initializeFiltersFromURL = () => {
  if (route.query.category) {
    selectedCategory.value = route.query.category
    showMyPosts.value = false // Отключаем "Мои статьи" при фильтрации по категории
  }
}

const filteredPosts = computed(() => {
  let posts = postsStore.posts

  // Фильтрация по категории (из URL или выбора)
  if (selectedCategory.value) {
    posts = posts.filter(post => {
      const categoryName = post.category_name || post.category?.name
      return categoryName?.toLowerCase().includes(selectedCategory.value.toLowerCase())
    })
  }

  // Фильтрация по автору (только если не выбрана категория)
  if (showMyPosts.value && user.value && !selectedCategory.value) {
    posts = posts.filter(post => {
      const postUserId = post.user_id || post.user?.id || post.author_id
      return postUserId === user.value.id
    })
  }

  return posts
})

const loadPosts = () => {
  postsStore.fetchPosts()
}

// Обработчик сброса фильтра категории
const clearCategoryFilter = () => {
  selectedCategory.value = ''
  // Обновляем URL без параметра категории
  router.replace({ query: {} })
}

onMounted(() => {
  initializeFiltersFromURL()
  loadPosts()
})

// Следим за изменением параметров URL
watch(() => route.query, (newQuery) => {
  if (newQuery.category) {
    selectedCategory.value = newQuery.category
    showMyPosts.value = false
  }
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
    return post.content.length > 120 ? post.content.substring(0, 120) + '...' : post.content
  }
  return 'Нет описания'
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
