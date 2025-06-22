import { defineStore } from 'pinia'
import dayjs from 'dayjs'
import { CONTEST_STATUS, USER_TYPE } from '@/utils/constants'
import api from '@oj/api'
import { useUserStore } from './user'

export const useContestStore = defineStore('contest', {
  state: () => ({
    now: dayjs(),
    access: false,
    rankLimit: 30,
    forceUpdate: false,
    contest: {
      created_by: {},
      contest_type: ''
    },
    contestProblems: [],
    itemVisible: {
      menu: true,
      chart: true,
      realName: false
    }
  }),

  getters: {
    contestStatus() {
      const now = dayjs()
      const startTime = dayjs(this.contest.start_time)
      const endTime = dayjs(this.contest.end_time)
      
      if (now.isBefore(startTime)) {
        return CONTEST_STATUS.NOT_START
      } else if (now.isAfter(endTime)) {
        return CONTEST_STATUS.ENDED
      } else {
        return CONTEST_STATUS.UNDERWAY
      }
    },

    contestRuleType() {
      return this.contest.rule_type || ''
    },

    isContestAdmin() {
      const userStore = useUserStore()
      return userStore.isAuthenticated && 
             (this.contest.created_by.id === userStore.user.id || userStore.isAdminRole)
    },

    contestMenuDisabled() {
      return !this.isContestAdmin && !this.access
    },

    OIContestRealTimePermission() {
      if (this.contestRuleType === 'ACM' || this.isContestAdmin) {
        return true
      }
      return this.contest.real_time_rank === true
    },

    countdown() {
      const now = dayjs()
      const startTime = dayjs(this.contest.start_time)
      const endTime = dayjs(this.contest.end_time)
      
      if (this.contestStatus === CONTEST_STATUS.NOT_START) {
        return startTime.diff(now, 'seconds')
      } else if (this.contestStatus === CONTEST_STATUS.UNDERWAY) {
        return endTime.diff(now, 'seconds')
      } else {
        return 0
      }
    },

    passwordFormVisible() {
      return this.contest.contest_type === 'Password Protected' && !this.access
    }
  },

  actions: {
    async getContest(id) {
      try {
        const res = await api.getContest(id)
        this.contest = res.data.data
      } catch (err) {
        console.error('Failed to get contest:', err)
        throw err
      }
    },

    async getContestProblems(id) {
      try {
        const params = this.isContestAdmin ? { contest_id: id } : { contest_id: id, visible: true }
        const res = await api.getContestProblemList(params)
        this.contestProblems = res.data.data
      } catch (err) {
        console.error('Failed to get contest problems:', err)
        throw err
      }
    },

    async getContestAccess(contestId) {
      try {
        const res = await api.getContestAccess(contestId)
        this.access = res.data.data.access
      } catch (err) {
        console.error('Failed to get contest access:', err)
        this.access = false
      }
    },

    changeDomTitle(payload) {
      if (payload && payload.title) {
        window.document.title = payload.title
      }
    },

    changeContestItemVisible(payload) {
      if (payload) {
        Object.assign(this.itemVisible, payload)
      }
    },

    changeRankLimit(payload) {
      if (payload && typeof payload.rankLimit === 'number') {
        this.rankLimit = payload.rankLimit
      }
    },

    changeContestRankForceUpdate(payload) {
      if (payload !== undefined) {
        this.forceUpdate = payload
      }
    },

    updateNow() {
      this.now = dayjs()
    },

    clearContest() {
      this.contest = { created_by: {}, contest_type: '' }
      this.contestProblems = []
      this.access = false
      this.itemVisible = {
        menu: true,
        chart: true,
        realName: false
      }
    }
  }
})