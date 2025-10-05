<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <!-- Загрузка -->
    <div v-if="postsStore.loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Ошибка -->
    <div v-else-if="postsStore.error" class="alert alert-error text-center py-8">
      <p class="text-lg font-semibold mb-2">Ошибка загрузки статьи</p>
      <p class="text-gray-600">{{ postsStore.error }}</p>
      <div class="flex justify-center space-x-4 mt-4">
        <button @click="loadPost" class="btn-primary">
          Попробовать снова
        </button>
        <router-link to="/posts" class="btn-secondary">
          К списку статей
        </router-link>
      </div>
    </div>

    <!-- Статья -->
    <div v-else-if="postsStore.currentPost" class="card">
      <div class="card-body">
        <!-- Категория и действия -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <span class="badge badge-blue text-sm">
            {{ postsStore.currentPost.category_name || postsStore.currentPost.category?.name }}
          </span>

          <div v-if="isPostOwner" class="flex space-x-2">
            <router-link
              :to="`/posts/${postsStore.currentPost.id}/edit`"
              class="btn-secondary text-sm inline-flex items-center space-x-1"
            >
              <span>✏️</span>
              <span>Редактировать</span>
            </router-link>
            <button
              @click="handleDeletePost"
              class="btn-danger text-sm inline-flex items-center space-x-1"
            >
              <span>🗑️</span>
              <span>Удалить</span>
            </button>
          </div>
        </div>

        <!-- Заголовок -->
        <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
          {{ postsStore.currentPost.title }}
        </h1>

        <!-- Мета-информация -->
        <div class="flex flex-col sm:flex-row sm:items-center text-gray-600 mb-6 gap-2">
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span class="text-blue-600 text-sm font-bold">
                {{ getInitials(postsStore.currentPost.user?.name || postsStore.currentPost.author_name) }}
              </span>
            </div>
            <span class="font-medium">{{ postsStore.currentPost.user?.name || postsStore.currentPost.author_name }}</span>
          </div>
          <span class="hidden sm:block">•</span>
          <span>Опубликовано: {{ formatDate(postsStore.currentPost.created_at) }}</span>
        </div>

        <!-- Краткое описание -->
        <div v-if="postsStore.currentPost.excerpt" class="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <p class="text-lg text-blue-800 leading-relaxed italic">
            {{ postsStore.currentPost.excerpt }}
          </p>
        </div>

        <!-- Содержание -->
        <article class="prose prose-lg max-w-none">
          <div class="text-gray-700 leading-8 whitespace-pre-line">
            {{ postsStore.currentPost.content }}
          </div>
        </article>

        <!-- Навигация -->
        <div class="mt-8 pt-6 border-t border-gray-200">
          <router-link to="/posts" class="btn-secondary inline-flex items-center space-x-2">
            <span>←</span>
            <span>Назад к списку статей</span>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Не найдено -->
    <div v-else class="text-center py-12">
      <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span class="text-3xl">🔍</span>
      </div>
      <h3 class="text-xl font-semibold text-gray-900 mb-2">Статья не найдена</h3>
      <p class="text-gray-600 mb-6">Возможно, статья была удалена или перемещена</p>
      <router-link to="/posts" class="btn-primary">
        Вернуться к статьям
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePostsStore } from '@/stores/posts'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

const route = useRoute()
const router = useRouter()
const postsStore = usePostsStore()
const authStore = useAuthStore()

const { user } = storeToRefs(authStore)

const isPostOwner = computed(() => {
  if (!user.value || !postsStore.currentPost) return false
  return postsStore.currentPost.user_id === user.value.id ||
    postsStore.currentPost.user?.id === user.value.id
})

const loadPost = () => {
  postsStore.fetchPost(route.params.id)
}

onMounted(() => {
  loadPost()
})

const handleDeletePost = async () => {
  if (!confirm('Вы уверены, что хотите удалить эту статью?')) return

  try {
    await postsStore.deletePost(postsStore.currentPost.id)
    router.push('/posts')
  } catch (error) {
    console.error('Ошибка удаления:', error)
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}
</script>
