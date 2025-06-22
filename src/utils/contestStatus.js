import api from '@oj/api'
import { useUserStore } from '@/stores/user'

/**
 * Automatically update user status when joining/leaving contests
 */
export const contestStatusManager = {
  /**
   * Set status to "In Contest" when joining a contest
   * @param {string} contestName - Name of the contest
   */
  async setInContestStatus(contestName) {
    try {
      const userStore = useUserStore()
      if (!userStore.isAuthenticated) return
      
      await api.updateProfile({
        status: 'competing',
        mood: `Competing in ${contestName}`,
        mood_emoji: '🏆',
        mood_clear_at: null, // Will be cleared when contest ends
        status_color: '#f5222d'
      })
      
      await userStore.getProfile()
    } catch (error) {
      console.error('Failed to update contest status:', error)
    }
  },
  
  /**
   * Clear contest status when leaving or contest ends
   */
  async clearContestStatus() {
    try {
      const userStore = useUserStore()
      if (!userStore.isAuthenticated) return
      
      const profile = userStore.profile
      // Only clear if currently in contest status
      if (profile?.status === 'competing') {
        await api.updateProfile({
          status: 'practicing',
          mood: '',
          mood_emoji: '',
          mood_clear_at: null,
          status_color: '#52c41a'
        })
        
        await userStore.getProfile()
      }
    } catch (error) {
      console.error('Failed to clear contest status:', error)
    }
  },
  
  /**
   * Update status based on problem submission
   * @param {string} problemTitle - Title of the problem
   * @param {string} result - Submission result (AC, WA, TLE, etc)
   */
  async updateSubmissionStatus(problemTitle, result) {
    try {
      const userStore = useUserStore()
      if (!userStore.isAuthenticated) return
      
      const profile = userStore.profile
      // Don't override contest status
      if (profile?.status === 'competing') return
      
      let status, emoji, message
      
      if (result === 'Accepted') {
        status = 'practicing'
        emoji = '✅'
        message = `Just solved ${problemTitle}!`
      } else if (result === 'Wrong Answer') {
        status = 'debugging'
        emoji = '🔍'
        message = `Working on ${problemTitle}`
      } else if (result === 'Time Limit Exceeded') {
        status = 'debugging'
        emoji = '⏰'
        message = `Optimizing solution for ${problemTitle}`
      } else {
        status = 'practicing'
        emoji = '💻'
        message = `Solving ${problemTitle}`
      }
      
      // Auto-clear after 30 minutes
      const clearAt = new Date()
      clearAt.setMinutes(clearAt.getMinutes() + 30)
      
      await api.updateProfile({
        status,
        mood: message,
        mood_emoji: emoji,
        mood_clear_at: clearAt.toISOString(),
        status_color: profile?.status_color || '#52c41a'
      })
      
      await userStore.getProfile()
    } catch (error) {
      console.error('Failed to update submission status:', error)
    }
  }
}

export default contestStatusManager