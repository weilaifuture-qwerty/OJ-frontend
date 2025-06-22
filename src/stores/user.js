import { defineStore } from 'pinia'
import { USER_TYPE } from '@/utils/constants'
import storage from '@/utils/storage'
import { STORAGE_KEY } from '@/utils/constants'
import api from '@oj/api'

export const useUserStore = defineStore('user', {
  state: () => ({
    profile: {},
    modalStatus: {
      mode: 'login', // 'login' or 'register'
      visible: false
    },
    streak: {
      current_streak: 0,
      best_streak: 0,
      last_check_in: null,
      check_in_days: []
    }
  }),

  getters: {
    user: (state) => state.profile.user || {},
    
    isAuthenticated: (state) => !!state.profile.user,
    
    isAdminRole() {
      return this.user.admin_type === USER_TYPE.ADMIN || 
             this.user.admin_type === USER_TYPE.SUPER_ADMIN
    },
    
    isSuperAdmin() {
      return this.user.admin_type === USER_TYPE.SUPER_ADMIN
    },
    
    hasProblemPermission() {
      return this.user.problem_permission !== 'None'
    }
  },

  actions: {
    async getProfile() {
      try {
        const res = await api.getUserInfo()
        this.profile = res.data.data || {}
        storage.set(STORAGE_KEY.AUTHED, true)
      } catch (err) {
        console.error('Failed to get user profile:', err)
        throw err
      }
    },

    clearProfile() {
      this.profile = {}
      storage.clear()
    },
    
    async logout() {
      try {
        await api.logout()
      } catch (err) {
        console.error('Logout API failed:', err)
      }
      this.clearProfile()
    },

    changeModalStatus(payload) {
      if (payload.mode !== undefined) {
        this.modalStatus.mode = payload.mode
      }
      if (payload.visible !== undefined) {
        this.modalStatus.visible = payload.visible
      }
    },

    async getUserStreak() {
      try {
        const res = await api.getUserStreak()
        this.streak = res.data.data
        return res.data.data
      } catch (error) {
        console.error('Failed to get user streak:', error)
        return this.streak
      }
    },

    async dailyCheckIn() {
      try {
        const res = await api.dailyCheckIn()
        this.streak = res.data.data
        return res.data.data
      } catch (error) {
        console.error('Failed to check in:', error)
        throw error
      }
    },

    updateStreak(streakData) {
      this.streak = { ...this.streak, ...streakData }
    },

    updateProfile(profileData) {
      this.profile = { ...this.profile, ...profileData }
    }
  }
})