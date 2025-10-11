import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/RegisterView.vue'),
  },
  {
    path: '/posts',
    name: 'Posts',
    component: () => import('@/views/PostsView.vue'),
  },
  {
    path: '/posts/create',
    name: 'CreatePost',
    component: () => import('@/views/CreatePostView.vue'),
  },
  {
    path: '/posts/:id',
    name: 'PostDetail',
    component: () => import('@/views/PostDetailView.vue'),
  },
  {
    path: '/posts/:id/edit',
    name: 'EditPost',
    component: () => import('@/views/EditPostView.vue'),
  },
  {
    path: '/categories',
    name: 'Categories',
    component: () => import('@/views/CategoriesView.vue'),
  },
  {
    path: '/categories/:id/edit',
    name: 'EditCategory',
    component: () => import('@/views/EditCategoryView.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
