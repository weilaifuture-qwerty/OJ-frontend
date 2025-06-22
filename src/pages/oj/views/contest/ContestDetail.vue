<template>
  <div class="flex-container">
    <div id="contest-main">
      <!--children-->
      <transition name="fadeInUp">
        <router-view></router-view>
      </transition>
      <!--children end-->
      <div class="flex-container" v-if="route_name === 'contest-details'">
        <template>
          <div id="contest-desc">
            <Panel :padding="20" shadow>
              <template #title>
                {{contest.title}}
              </template>
              <template #extra>
                <Tag type="dot" :color="countdownColor">
                  <span id="countdown">{{countdownText}}</span>
                </Tag>
              </template>
              <div v-html="contest.description" class="markdown-body"></div>
              <div v-if="passwordFormVisible" class="contest-password">
                <Input v-model="contestPassword" type="password"
                       placeholder="contest password" class="contest-password-input"
                       @enter="checkPassword"/>
                <Button type="info" @click="checkPassword">Enter</Button>
              </div>
            </Panel>
            <Table :columns="columns" :data="contest_table" disabled-hover style="margin-bottom: 40px;"></Table>
          </div>
        </template>
      </div>

    </div>
    <div v-show="showMenu" id="contest-menu">
      <ContestMenu 
        :contest-i-d="contestID"
        :contest-menu-disabled="contestMenuDisabled"
        :o-i-contest-real-time-permission="OIContestRealTimePermission"
        :show-admin-helper="showAdminHelper"
      />
    </div>
  </div>
</template>

<script>
  import dayjs from 'dayjs'
  import api from '@oj/api'
  import { useContestStore } from '@/stores/contest'
  import { CONTEST_STATUS_REVERSE, CONTEST_STATUS } from '@/utils/constants'
  import time from '@/utils/time'
  import Panel from '@/pages/oj/components/Panel.vue'
  import ContestMenu from '@/pages/oj/components/ContestMenu.vue'
  import { Table, Tag, Input, Button } from 'view-ui-plus'

  export default {
    name: 'ContestDetail',
    components: {
      Panel,
      ContestMenu,
      Table,
      Tag,
      Input,
      Button
    },
    data () {
      return {
        CONTEST_STATUS: CONTEST_STATUS,
        route_name: '',
        btnLoading: false,
        contestID: '',
        contestPassword: '',
        columns: [
          {
            title: this.$i18n.t('m.StartAt'),
            render: (h, params) => {
              return h('span', time.utcToLocal(params.row.start_time))
            }
          },
          {
            title: this.$i18n.t('m.EndAt'),
            render: (h, params) => {
              return h('span', time.utcToLocal(params.row.end_time))
            }
          },
          {
            title: this.$i18n.t('m.ContestType'),
            render: (h, params) => {
              const type = params.row.contest_type || ''
              return h('span', type ? this.$i18n.t('m.' + type.replace(/ /g, '_')) : '')
            }
          },
          {
            title: this.$i18n.t('m.Rule'),
            render: (h, params) => {
              return h('span', this.$i18n.t('m.' + params.row.rule_type))
            }
          },
          {
            title: this.$i18n.t('m.Creator'),
            render: (h, data) => {
              return h('span', data.row.created_by.username)
            }
          }
        ]
      }
    },
    mounted () {
      this.contestID = this.$route.params.contestID
      this.route_name = this.$route.name
      this.loadContest()
      
      // If we're at the root contest route, redirect to the overview
      if (this.$route.name === 'contest-details' && this.$route.path.endsWith('/')) {
        // The overview is shown on the main contest-details route
      }
    },
    methods: {
      async loadContest () {
        const contestStore = useContestStore()
        try {
          await contestStore.getContest(this.contestID)
          contestStore.changeDomTitle({title: contestStore.contest.title})
          
          // Check if user has access
          if (contestStore.contest.contest_type !== 'Public') {
            await contestStore.getContestAccess(this.contestID)
          }
          
          // Set up countdown timer
          let endTime = dayjs(contestStore.contest.end_time)
          if (endTime.isAfter(dayjs())) {
            this.timer = setInterval(() => {
              contestStore.updateNow()
            }, 1000)
          }
        } catch (error) {
          console.error('Failed to load contest:', error)
        }
      },
      checkPassword () {
        if (this.contestPassword === '') {
          this.$error('Password can\'t be empty')
          return
        }
        this.btnLoading = true
        api.checkContestPassword(this.contestID, this.contestPassword).then((res) => {
          this.$success('Succeeded')
          const contestStore = useContestStore()
          contestStore.access = true
          this.btnLoading = false
        }, (res) => {
          this.btnLoading = false
        })
      }
    },
    computed: {
      showMenu () {
        const contestStore = useContestStore()
        return contestStore.itemVisible.menu
      },
      contest () {
        const contestStore = useContestStore()
        return contestStore.contest
      },
      contest_table () {
        const contestStore = useContestStore()
        return [contestStore.contest]
      },
      now () {
        const contestStore = useContestStore()
        return contestStore.now
      },
      contestMenuDisabled () {
        const contestStore = useContestStore()
        return contestStore.contestMenuDisabled
      },
      contestRuleType () {
        const contestStore = useContestStore()
        return contestStore.contestRuleType
      },
      contestStatus () {
        const contestStore = useContestStore()
        return contestStore.contestStatus
      },
      countdown () {
        const contestStore = useContestStore()
        return contestStore.countdown
      },
      countdownText () {
        const seconds = Math.abs(this.countdown)
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds - h * 3600) / 60)
        const s = seconds - h * 3600 - m * 60
        return `${h}:${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`
      },
      isContestAdmin () {
        const contestStore = useContestStore()
        return contestStore.isContestAdmin
      },
      OIContestRealTimePermission () {
        const contestStore = useContestStore()
        return contestStore.OIContestRealTimePermission
      },
      passwordFormVisible () {
        const contestStore = useContestStore()
        return contestStore.contest.contest_type === 'Password Protected' && !contestStore.access
      },
      countdownColor () {
        if (this.contestStatus) {
          return CONTEST_STATUS_REVERSE[this.contestStatus].color
        }
      },
      showAdminHelper () {
        return this.isContestAdmin && this.contestRuleType === 'ACM'
      }
    },
    watch: {
      '$route' (newVal) {
        this.route_name = newVal.name
        this.contestID = newVal.params.contestID
        const contestStore = useContestStore()
        contestStore.changeDomTitle({title: this.contest.title})
      }
    },
    beforeDestroy () {
      clearInterval(this.timer)
      const contestStore = useContestStore()
      contestStore.clearContest()
    }
  }
</script>

<style scoped lang="less">
  .flex-container {
    display: flex;
    
    #contest-main {
      flex: 1 1 auto;
      min-width: 0;
      
      #contest-desc {
        .markdown-body {
          margin: 20px 0;
          
          pre {
            display: inline-block;
          }
        }
      }
    }
    
    #contest-menu {
      flex: 0 0 250px;
      margin-left: 20px;
    }
    
    .contest-password {
      margin-top: 20px;
      margin-bottom: -10px;
      
      &-input {
        width: 200px;
        margin-right: 10px;
      }
    }
  }

  #countdown {
    font-size: 14px;
    font-weight: 500;
  }
  
  /deep/ .ivu-table {
    margin-top: 20px;
    
    td {
      padding: 12px 8px;
    }
  }
</style>
