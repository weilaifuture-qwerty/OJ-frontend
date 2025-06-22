import { defineStore } from 'pinia'
import api from '@admin/api'

export const useAdminStore = defineStore('admin', {
  state: () => ({
    user: null,
    profile: {},
    isAuthenticated: false,
    websiteConfig: {},
    contestId: null
  }),

  getters: {
    isAdminRole: (state) => {
      // Check both possible locations for admin_type
      const adminType = state.user?.admin_type || state.user?.user?.admin_type
      return adminType === 'Super Admin' || adminType === 'Admin'
    },
    isSuperAdmin: (state) => {
      // Check both possible locations for admin_type
      return state.user?.admin_type === 'Super Admin' || 
             state.user?.user?.admin_type === 'Super Admin'
    }
  },

  actions: {
    async login(username, password) {
      try {
        const res = await api.login(username, password)
        this.isAuthenticated = true
        await this.getProfile()
        return res
      } catch (error) {
        throw error
      }
    },

    async logout() {
      try {
        await api.logout()
        this.user = null
        this.profile = {}
        this.isAuthenticated = false
      } catch (error) {
        console.error('Logout error:', error)
      }
    },

    async getProfile() {
      try {
        const res = await api.getProfile()
        this.user = res.data.data
        this.profile = res.data.data
        this.isAuthenticated = true
        return res
      } catch (error) {
        this.isAuthenticated = false
        throw error
      }
    },

    setContestId(id) {
      this.contestId = id
    },

    async getWebsiteConfig() {
      try {
        const res = await api.getWebsiteConfig()
        this.websiteConfig = res.data.data
        return res
      } catch (error) {
        console.error('Failed to get website config:', error)
        throw error
      }
    }
  }
})