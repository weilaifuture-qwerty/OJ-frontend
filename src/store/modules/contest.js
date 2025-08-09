import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api'
import { CONTEST_STATUS } from '@/utils/constants'
import { formatDate, formatDuration } from '@/utils/utils'

export const useContestStore = defineStore('contest', () => {
  const currentContest = ref(null)
  const now = ref(new Date())
  const passwordFormVisible = ref(false)
  const contestProblems = ref([])
  const contests = ref([])
  const total = ref(0)

  const contestStatus = computed(() => {
    if (!currentContest.value) return null
    
    const startTime = new Date(currentContest.value.start_time)
    const endTime = new Date(currentContest.value.end_time)
    
    if (now.value < startTime) {
      return CONTEST_STATUS.NOT_START
    } else if (now.value > endTime) {
      return CONTEST_STATUS.ENDED
    } else {
      return CONTEST_STATUS.UNDERWAY
    }
  })

  const countdown = computed(() => {
    if (!currentContest.value) return ''
    
    const startTime = new Date(currentContest.value.start_time)
    const endTime = new Date(currentContest.value.end_time)
    
    if (now.value < startTime) {
      const diff = startTime - now.value
      return `Starts in ${formatDuration(diff)}`
    } else if (now.value > endTime) {
      return 'Contest has ended'
    } else {
      const diff = endTime - now.value
      return `Ends in ${formatDuration(diff)}`
    }
  })

  async function fetchContests(params) {
    try {
      const response = await api.getContests(params)
      contests.value = response.data.data.results
      total.value = response.data.data.total
    } catch (error) {
      throw error
    }
  }

  async function fetchContest(contestId) {
    try {
      const response = await api.getContest(contestId)
      currentContest.value = response.data.data
      passwordFormVisible.value = currentContest.value.contest_type === 'Password Protected'
      await fetchContestProblems(contestId)
    } catch (error) {
      throw error
    }
  }

  async function fetchContestProblems(contestId) {
    try {
      const response = await api.getContestProblems(contestId)
      contestProblems.value = response.data.data
    } catch (error) {
      throw error
    }
  }

  async function joinContest(contestId, password) {
    try {
      await api.joinContest(contestId, password)
      passwordFormVisible.value = false
    } catch (error) {
      throw error
    }
  }

  function updateNow() {
    now.value = new Date()
  }

  return {
    currentContest,
    contestStatus,
    countdown,
    passwordFormVisible,
    contestProblems,
    contests,
    total,
    fetchContests,
    fetchContest,
    joinContest,
    updateNow
  }
})
