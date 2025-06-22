<template>
  <div>
    <component :is="currentView"></component>
  </div>
</template>

<script>
  import { useContestStore } from '@/stores/contest'
  import ACMContestRank from './ACMContestRank.vue'
  import OIContestRank from './OIContestRank.vue'

  const NullComponent = {
    name: 'null-component',
    template: '<div></div>'
  }

  export default {
    name: 'contest-rank',
    components: {
      ACMContestRank,
      OIContestRank,
      NullComponent
    },
    computed: {
      contestRuleType () {
        const contestStore = useContestStore()
        return contestStore.contestRuleType
      },
      currentView () {
        if (this.contestRuleType === null) {
          return 'NullComponent'
        }
        return this.contestRuleType === 'ACM' ? 'ACMContestRank' : 'OIContestRank'
      }
    },
    beforeRouteLeave (to, from, next) {
      const contestStore = useContestStore()
      contestStore.changeContestItemVisible({menu: true})
      next()
    }
  }
</script>
<style lang="less" scoped>
</style>
