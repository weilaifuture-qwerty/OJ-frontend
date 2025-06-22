import { defineStore } from 'pinia'
import api from '@oj/api'

export const useWebsiteStore = defineStore('website', {
  state: () => ({
    website: {}
  }),

  actions: {
    async getWebsiteConfig() {
      try {
        const res = await api.getWebsiteConf()
        this.website = res.data.data || {}
      } catch (err) {
        console.error('Failed to get website config:', err)
        throw err
      }
    }
  }
})