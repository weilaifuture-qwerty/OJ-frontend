<template>
  <div>
    <Panel>
      <template #title>{{$t('m.Problems_List')}}</template>
      <Table v-if="contestRuleType == 'ACM' || OIContestRealTimePermission"
             :columns="ACMTableColumns"
             :data="problems"
             @row-click="goContestProblem"
             :no-data-text="$t('m.No_Problems')"></Table>
      <Table v-else
             :data="problems"
             :columns="OITableColumns"
             @row-click="goContestProblem"
             no-data-text="$t('m.No_Problems')"></Table>
    </Panel>
  </div>
</template>

<script>
  import { useContestStore } from '@/stores/contest'
  import { useUserStore } from '@/stores/user'
  import {ProblemMixin} from '@oj/components/mixins'
  import Panel from '@/pages/oj/components/Panel.vue'

  export default {
    name: 'ContestProblemList',
    mixins: [ProblemMixin],
    components: {
      Panel
    },
    data () {
      return {
        ACMTableColumns: [
          {
            title: '#',
            key: '_id',
            sortType: 'asc',
            width: 150
          },
          {
            title: this.$i18n.t('m.Title'),
            key: 'title'
          },
          {
            title: this.$i18n.t('m.Total'),
            key: 'submission_number'
          },
          {
            title: this.$i18n.t('m.AC_Rate'),
            render: (h, params) => {
              return h('span', this.getACRate(params.row.accepted_number, params.row.submission_number))
            }
          }
        ],
        OITableColumns: [
          {
            title: '#',
            key: '_id',
            width: 150
          },
          {
            title: this.$i18n.t('m.Title'),
            key: 'title'
          }
        ]
      }
    },
    mounted () {
      this.getContestProblems()
    },
    methods: {
      getContestProblems () {
        const contestStore = useContestStore()
        contestStore.getContestProblems(this.$route.params.contestID).then(() => {
          if (this.isAuthenticated) {
            if (this.contestRuleType === 'ACM') {
              this.addStatusColumn(this.ACMTableColumns, contestStore.contestProblems)
            } else if (this.OIContestRealTimePermission) {
              this.addStatusColumn(this.ACMTableColumns, contestStore.contestProblems)
            }
          }
        })
      },
      goContestProblem (row) {
        this.$router.push({
          name: 'contest-problem-details',
          params: {
            contestID: this.$route.params.contestID,
            problemID: row._id
          }
        })
      }
    },
    computed: {
      problems () {
        const contestStore = useContestStore()
        return contestStore.contestProblems
      },
      isAuthenticated () {
        const userStore = useUserStore()
        return userStore.isAuthenticated
      },
      contestRuleType () {
        const contestStore = useContestStore()
        return contestStore.contestRuleType
      },
      OIContestRealTimePermission () {
        const contestStore = useContestStore()
        return contestStore.OIContestRealTimePermission
      }
    }
  }
</script>

<style scoped lang="less">
</style>
