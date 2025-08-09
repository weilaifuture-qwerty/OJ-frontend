import { defineStore } from 'pinia'
import api from '@/api'
import { getToken, setToken, removeToken } from '@/utils/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken(),
    userInfo: null,
    loading: false,
    error: null
  }),

  actions: {
    async login(userInfo) {
      this.loading = true
      try {
        const response = await api.login(userInfo)
        const { token } = response.data.data
        setToken(token)
        this.token = token
      } catch (error) {
        this.error = error
        throw error
      } finally {
        this.loading = false
      }
    },

    async getUserInfo() {
      this.loading = true
      try {
        const response = await api.getUserInfo()
        this.userInfo = response.data.data
      } catch (error) {
        this.error = error
        throw error
      } finally {
        this.loading = false
      }
    },

    logout() {
      removeToken()
      this.token = ''
      this.userInfo = null
    }
  }
})
