// stores/posts.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { postsAPI } from '@/services/api' // ← правильный импорт

export const usePostsStore = defineStore('posts', () => {
  const posts = ref([])
  const currentPost = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const fetchPosts = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      console.log('Загрузка статей...')
      const response = await postsAPI.getAll(params)
      console.log('Ответ от API:', response)

      // Обрабатываем разные форматы ответа
      if (response.data) {
        posts.value = response.data.data || response.data || []
      } else {
        posts.value = response || []
      }

      console.log('Загружены статьи:', posts.value)
    } catch (err) {
      console.error('Ошибка загрузки статей:', err)
      error.value = err.message || 'Ошибка загрузки статей'
      posts.value = []
    } finally {
      loading.value = false
    }
  }

  // ... остальные методы (fetchPost, createPost, updatePost, deletePost)
  const fetchPost = async (id) => {
    loading.value = true
    error.value = null
    try {
      const response = await postsAPI.getById(id)
      currentPost.value = response.data.data || response.data
      return currentPost.value
    } catch (err) {
      error.value = err.message || 'Ошибка загрузки статьи'
      console.error('Error fetching post:', err)
      currentPost.value = null
      throw err
    } finally {
      loading.value = false
    }
  }

  const createPost = async (postData) => {
    loading.value = true
    error.value = null
    try {
      const response = await postsAPI.create(postData)
      const newPost = response.data.data || response.data
      posts.value.unshift(newPost)
      return newPost
    } catch (err) {
      error.value = err.message || 'Ошибка создания статьи'
      console.error('Error creating post:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updatePost = async (id, postData) => {
    loading.value = true
    error.value = null
    try {
      const response = await postsAPI.update(id, postData)
      const updatedPost = response.data.data || response.data

      // Обновляем в списке
      const index = posts.value.findIndex(post => post.id == id)
      if (index !== -1) {
        posts.value[index] = updatedPost
      }

      // Обновляем текущую статью если она открыта
      if (currentPost.value && currentPost.value.id == id) {
        currentPost.value = updatedPost
      }

      return updatedPost
    } catch (err) {
      error.value = err.message || 'Ошибка обновления статьи'
      console.error('Error updating post:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deletePost = async (id) => {
    loading.value = true
    error.value = null
    try {
      await postsAPI.delete(id)

      // Удаляем из списка
      posts.value = posts.value.filter(post => post.id != id)

      // Сбрасываем текущую статью если она удалена
      if (currentPost.value && currentPost.value.id == id) {
        currentPost.value = null
      }
    } catch (err) {
      error.value = err.message || 'Ошибка удаления статьи'
      console.error('Error deleting post:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    posts,
    currentPost,
    loading,
    error,
    fetchPosts,
    fetchPost,
    createPost,
    updatePost,
    deletePost,
  }
})
