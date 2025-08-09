import { JUDGE_STATUS } from '@/utils/constants'

export const ProblemMixin = {
  methods: {
    getACRate(accepted, total) {
      if (!total) return '0.00%'
      return (accepted / total * 100).toFixed(2) + '%'
    },

    getJudgeStatus(status) {
      return JUDGE_STATUS[status] || {
        name: 'Unknown',
        short: 'UN',
        color: 'gray',
        type: 'info'
      }
    },

    getJudgeStatusColor(status) {
      return this.getJudgeStatus(status).color
    },

    getJudgeStatusType(status) {
      return this.getJudgeStatus(status).type
    },

    getJudgeStatusName(status) {
      return this.getJudgeStatus(status).name
    },

    getJudgeStatusShort(status) {
      return this.getJudgeStatus(status).short || this.getJudgeStatus(status).name
    },

    addStatusColumn(columns, problems) {
      columns.push({
        title: this.$i18n.t('m.Status'),
        align: 'center',
        render: (h, params) => {
          if (!params.row.my_status) {
            return h('span', '-')
          }
          return h('Tag', {
            props: {
              color: this.getJudgeStatusColor(params.row.my_status),
              type: this.getJudgeStatusType(params.row.my_status)
            }
          }, this.getJudgeStatusShort(params.row.my_status))
        }
      })
    }
  }
} 