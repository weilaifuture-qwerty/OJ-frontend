import api from '@oj/api'
import ScreenFull from '@admin/components/ScreenFull.vue'
import { useContestStore } from '@/stores/contest'
import { CONTEST_STATUS } from '@/utils/constants'

export default {
  components: {
    ScreenFull
  },
  methods: {
    getContestRankData (page = 1, refresh = false) {
      let offset = (page - 1) * this.limit
      if (this.showChart && !refresh) {
        this.$refs.chart.showLoading({maskColor: 'rgba(250, 250, 250, 0.8)'})
      }
      let params = {
        offset,
        limit: this.limit,
        contest_id: this.$route.params.contestID,
        force_refresh: this.forceUpdate ? '1' : '0'
      }
      api.getContestRank(params).then(res => {
        if (this.showChart && !refresh) {
          this.$refs.chart.hideLoading()
        }
        this.total = res.data.data.total
        if (page === 1) {
          this.applyToChart(res.data.data.results.slice(0, 10))
        }
        this.applyToTable(res.data.data.results)
      })
    },
    handleAutoRefresh (status) {
      if (status === true) {
        this.refreshFunc = setInterval(() => {
          this.page = 1
          this.getContestRankData(1, true)
        }, 10000)
      } else {
        clearInterval(this.refreshFunc)
      }
    }
  },
  computed: {
    isContestAdmin () {
      const contestStore = useContestStore()
      return contestStore.isContestAdmin
    },
    contest () {
      const contestStore = useContestStore()
      return contestStore.contest
    },
    contestProblems () {
      const contestStore = useContestStore()
      return contestStore.contestProblems
    },
    showChart: {
      get () {
        const contestStore = useContestStore()
        return contestStore.itemVisible.chart
      },
      set (value) {
        const contestStore = useContestStore()
        contestStore.changeContestItemVisible({chart: value})
      }
    },
    showMenu: {
      get () {
        const contestStore = useContestStore()
        return contestStore.itemVisible.menu
      },
      set (value) {
        const contestStore = useContestStore()
        contestStore.changeContestItemVisible({menu: value})
        this.$nextTick(() => {
          if (this.showChart) {
            this.$refs.chart.resize()
          }
          this.$refs.tableRank.handleResize()
        })
      }
    },
    showRealName: {
      get () {
        const contestStore = useContestStore()
        return contestStore.itemVisible.realName
      },
      set (value) {
        const contestStore = useContestStore()
        contestStore.changeContestItemVisible({realName: value})
        if (value) {
          this.columns.splice(2, 0, {
            title: 'RealName',
            align: 'center',
            width: 150,
            render: (h, {row}) => {
              return h('span', row.user.real_name)
            }
          })
        } else {
          this.columns.splice(2, 1)
        }
      }
    },
    forceUpdate: {
      get () {
        const contestStore = useContestStore()
        return contestStore.forceUpdate
      },
      set (value) {
        const contestStore = useContestStore()
        contestStore.changeContestRankForceUpdate(value)
      }
    },
    limit: {
      get () {
        const contestStore = useContestStore()
        return contestStore.rankLimit
      },
      set (value) {
        const contestStore = useContestStore()
        contestStore.changeRankLimit({rankLimit: value})
      }
    },
    refreshDisabled () {
      return this.contest.status === CONTEST_STATUS.ENDED
    }
  },
  beforeUnmount () {
    clearInterval(this.refreshFunc)
  }
}