import { defineStore } from 'pinia'
import axios from 'axios'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    currentUser: (state) => state.user
  },

  actions: {
    async register(userData) {
      try {
        const response = await axios.post('/api/register', userData)
        return response.data
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Registration failed')
      }
    },

    async login(credentials) {
      try {
        const response = await axios.post('/api/login', credentials)
        this.token = response.data.token
        localStorage.setItem('token', this.token)
        await this.fetchUser()
        return response.data
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Login failed')
      }
    },

    async fetchUser() {
      try {
        const response = await axios.get('/api/user/profile')
        this.user = response.data
        return response.data
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch user profile')
      }
    },

    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
    }
  }
}) 