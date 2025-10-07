<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
    <div class="p-6">
      <!-- Категория -->
      <span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mb-2">
        {{ post.category?.name }}
      </span>

      <!-- Заголовок -->
      <h3 class="text-xl font-semibold mb-2">
        <router-link :to="`/posts/${post.id}`" class="hover:text-blue-600">
          {{ post.title }}
        </router-link>
      </h3>

      <!-- Краткое описание -->
      <p class="text-gray-600 mb-4 line-clamp-3">
        {{ post.short_description || truncateContent(post.content) }}
      </p>

      <!-- Мета-информация -->
      <div class="flex justify-between items-center text-sm text-gray-500 mb-4">
        <span>{{ post.user?.name }}</span>
        <span>{{ formatDate(post.created_at) }}</span>
      </div>

      <!-- Действия -->
      <div class="flex justify-between items-center">
        <router-link :to="`/posts/${post.id}`" class="btn-read">
          Читать далее →
        </router-link>

        <div v-if="isPostOwner" class="flex space-x-2">
          <router-link
            :to="`/posts/${post.id}/edit`"
            class="text-green-600 hover:text-green-800 text-sm"
          >
            Редактировать
          </router-link>
          <button
            @click="$emit('delete', post.id)"
            class="text-red-600 hover:text-red-800 text-sm"
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

defineEmits(['delete'])

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

const isPostOwner = computed(() => {
  return user.value && props.post.user?.id === user.value.id
})

const truncateContent = (content, length = 150) => {
  if (!content) return ''
  return content.length > length ? content.substring(0, length) + '...' : content
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ru-RU')
}
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
