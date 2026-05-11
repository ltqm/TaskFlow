import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Login from '@/views/Login.vue'
import Home from '@/views/Home.vue'
import Tasks from '@/views/Tasks.vue'
import Versions from '@/views/Versions.vue'
import Stats from '@/views/Stats.vue'
import Settings from '@/views/Settings.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/',
      name: 'Home',
      component: Home,
      meta: { requiresAuth: true }
    },
    {
      path: '/tasks',
      name: 'Tasks',
      component: Tasks,
      meta: { requiresAuth: true }
    },
    {
      path: '/versions',
      name: 'Versions',
      component: Versions,
      meta: { requiresAuth: true }
    },
    {
      path: '/stats',
      name: 'Stats',
      component: Stats,
      meta: { requiresAuth: true }
    },
    {
      path: '/settings',
      name: 'Settings',
      component: Settings,
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach(async (to, from) => {
  const authStore = useAuthStore()
  
  if (authStore.token && !authStore.user) {
    await authStore.loadUser()
  }
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { path: '/login' }
  }
  
  if (to.path === '/login' && authStore.isAuthenticated) {
    return { path: '/' }
  }
})

export default router