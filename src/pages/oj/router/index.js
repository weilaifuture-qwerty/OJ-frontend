import { createRouter, createWebHistory } from 'vue-router'
import routes from './routes'
import storage from '@/utils/storage'
import { STORAGE_KEY } from '@/utils/constants'
import { useUserStore } from '@/stores/user'
import { LoadingBar } from 'view-ui-plus'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior (to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { left: 0, top: 0 }
    }
  },
  routes
})

// 全局身份确认
router.beforeEach((to, from, next) => {
  LoadingBar.start()
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!storage.get(STORAGE_KEY.AUTHED)) {
      const userStore = useUserStore()
      userStore.changeModalStatus({ mode: 'login', visible: true })
      next({
        name: 'home'
      })
    } else {
      next()
    }
  } else {
    next()
  }
})

router.afterEach((to, from) => {
  LoadingBar.finish()
})

export default router
