<template>
  <div class="contest-list-container">
    <Panel shadow>
      <template #title>{{$t('m.Contest_List')}}</template>
      <template #extra>
        <ul class="filter">
          <li>
            <Dropdown @click="onRuleChange" transfer>
              <a href="javascript:void(0)">
                {{query.rule_type === '' ? this.$i18n.t('m.Rule') : this.$i18n.t('m.' + query.rule_type)}}
                <Icon type="ios-arrow-down"></Icon>
              </a>
              <template #list>
                <DropdownMenu>
                  <DropdownItem name="">{{$t('m.All')}}</DropdownItem>
                  <DropdownItem name="OI">{{$t('m.OI')}}</DropdownItem>
                  <DropdownItem name="ACM">{{$t('m.ACM')}}</DropdownItem>
                </DropdownMenu>
              </template>
            </Dropdown>
          </li>
          <li>
            <Dropdown @click="onStatusChange" transfer>
              <a href="javascript:void(0)">
                {{query.status === '' ? this.$i18n.t('m.Status') : this.$i18n.t('m.' + CONTEST_STATUS_REVERSE[query.status].name.replace(/ /g,'_'))}}
                <Icon type="ios-arrow-down"></Icon>
              </a>
              <template #list>
                <DropdownMenu>
                  <DropdownItem name="">{{$t('m.All')}}</DropdownItem>
                  <DropdownItem name="0">{{$t('m.Underway')}}</DropdownItem>
                  <DropdownItem name="1">{{$t('m.Not_Started')}}</DropdownItem>
                  <DropdownItem name="-1">{{$t('m.Ended')}}</DropdownItem>
                </DropdownMenu>
              </template>
            </Dropdown>
          </li>
          <li>
            <Input v-model="query.keyword"
                   @enter="changeRoute"
                   @click="changeRoute"
                   placeholder="Keyword"
                   icon="ios-search-strong"/>
          </li>
          <li>
            <Button type="info" @click="onReset">
              <Icon type="refresh"></Icon>
              {{$t('m.Reset')}}
            </Button>
          </li>
        </ul>
      </template>
      <Table style="width: 100%; font-size: 16px;"
             :columns="contestTableColumns"
             :data="contests"
             :loading="loading"
             disabled-hover
             @row-click="goContest"></Table>
    </Panel>
    <Pagination 
      :total="total" 
      v-model:page-size="limit" 
      @change="changeRoute" 
      v-model:current="page" 
      :show-sizer="true" 
      @page-size-change="changeRoute"
      style="margin-top: 20px;"></Pagination>
  </div>
</template>

<script>
  import api from '@oj/api'
  import { useUserStore } from '@/stores/user'
  import utils from '@/utils/utils'
  import Pagination from '@/pages/oj/components/Pagination'
  import Panel from '@/pages/oj/components/Panel.vue'
  import time from '@/utils/time'
  import { CONTEST_STATUS_REVERSE, CONTEST_TYPE } from '@/utils/constants'

  const limit = 10

  export default {
    name: 'contest-list',
    components: {
      Pagination,
      Panel
    },
    data () {
      return {
        page: 1,
        query: {
          status: '',
          keyword: '',
          rule_type: ''
        },
        limit: limit,
        total: 0,
        rows: '',
        contests: [],
        loading: false,
        CONTEST_STATUS_REVERSE: CONTEST_STATUS_REVERSE,
        cur_contest_id: '',
        contestTableColumns: [
          {
            title: this.$i18n.t('m.Title'),
            key: 'title',
            render: (h, params) => {
              return h('span', [
                h('a', {
                  style: {
                    color: '#2d8cf0',
                    cursor: 'pointer'
                  },
                  onClick: () => {
                    this.goContest(params.row)
                  }
                }, params.row.title),
                params.row.contest_type !== 'Public' ? h('Icon', {
                  type: 'ios-lock-outline',
                  size: 16,
                  style: {
                    marginLeft: '5px',
                    verticalAlign: 'middle'
                  }
                }) : null
              ])
            }
          },
          {
            title: this.$i18n.t('m.Rule'),
            key: 'rule_type',
            width: 100,
            align: 'center',
            render: (h, params) => {
              return h('Tag', {
                color: params.row.rule_type === 'ACM' ? 'blue' : 'green'
              }, params.row.rule_type)
            }
          },
          {
            title: this.$i18n.t('m.StartTime'),
            key: 'start_time',
            width: 170,
            render: (h, params) => {
              return h('span', time.utcToLocal(params.row.start_time, 'YYYY-MM-DD HH:mm'))
            }
          },
          {
            title: this.$i18n.t('m.Duration'),
            key: 'duration',
            width: 120,
            render: (h, params) => {
              return h('span', this.getDuration(params.row.start_time, params.row.end_time))
            }
          },
          {
            title: this.$i18n.t('m.Status'),
            key: 'status',
            align: 'center',
            width: 120,
            render: (h, params) => {
              return h('Tag', {
                type: 'dot',
                color: CONTEST_STATUS_REVERSE[params.row.status].color
              }, this.$i18n.t('m.' + CONTEST_STATUS_REVERSE[params.row.status].name.replace(/ /g, '_')))
            }
          }
        ]
      }
    },
    beforeRouteEnter (to, from, next) {
      api.getContestList(0, limit).then((res) => {
        next((vm) => {
          vm.contests = res.data.data.results
          vm.total = res.data.data.total
        })
      }, (res) => {
        next()
      })
    },
    methods: {
      init () {
        let route = this.$route.query
        this.query.status = route.status || ''
        this.query.rule_type = route.rule_type || ''
        this.query.keyword = route.keyword || ''
        this.page = parseInt(route.page) || 1
        this.limit = parseInt(route.limit) || 10
        this.getContestList(this.page)
      },
      getContestList (page = 1) {
        let offset = (page - 1) * this.limit
        this.loading = true
        api.getContestList(offset, this.limit, this.query).then((res) => {
          this.contests = res.data.data.results
          this.total = res.data.data.total
          this.loading = false
        }).catch(() => {
          this.loading = false
        })
      },
      changeRoute () {
        let query = Object.assign({}, this.query)
        query.page = this.page
        query.limit = this.limit

        this.$router.push({
          name: 'contest-list',
          query: utils.filterEmptyValue(query)
        })
      },
      onRuleChange (rule) {
        this.query.rule_type = rule
        this.page = 1
        this.changeRoute()
      },
      onStatusChange (status) {
        this.query.status = status
        this.page = 1
        this.changeRoute()
      },
      goContest (contest) {
        this.cur_contest_id = contest.id
        if (contest.contest_type !== CONTEST_TYPE.PUBLIC && !this.isAuthenticated) {
          this.$error(this.$i18n.t('m.Please_login_first'))
          const userStore = useUserStore()
          userStore.changeModalStatus({visible: true})
        } else {
          this.$router.push({name: 'contest-details', params: {contestID: contest.id}})
        }
      },

      getDuration (startTime, endTime) {
        return time.duration(startTime, endTime)
      },
      onReset () {
        this.query = {
          status: '',
          keyword: '',
          rule_type: ''
        }
        this.page = 1
        this.changeRoute()
      }
    },
    computed: {
      isAuthenticated () {
        const userStore = useUserStore()
        return userStore.isAuthenticated
      },
      user () {
        const userStore = useUserStore()
        return userStore.user
      }
    },
    watch: {
      '$route' (newVal, oldVal) {
        if (newVal !== oldVal) {
          this.init()
        }
      }
    }

  }
</script>
<style lang="less" scoped>
  .contest-list-container {
    width: 100%;
  }
  
  .filter {
    list-style: none;
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0;
    padding: 0;
    
    li {
      display: inline-block;
    }
    
    .ivu-input {
      width: 200px;
    }
  }

  /deep/ .ivu-table {
    td {
      height: 48px;
    }
    
    .ivu-table-cell {
      font-size: 14px;
    }
  }
</style>
