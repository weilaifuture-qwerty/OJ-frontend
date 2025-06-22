<template>
  <Row type="flex" :gutter="18">
    <Col :span=19>
    <Panel shadow>
      <template #title>{{$t('m.Problem_List')}}</template>
      <template #extra>
        <ul class="filter">
          <li>
            <Dropdown @on-click="filterByDifficulty" transfer>
              <a href="javascript:void(0)">
                {{query.difficulty === '' ? this.$i18n.t('m.Difficulty') : this.$i18n.t('m.' + query.difficulty)}}
                <Icon type="ios-arrow-down"></Icon>
              </a>
              <template #list>
                <DropdownMenu>
                  <DropdownItem name="">{{$t('m.All')}}</DropdownItem>
                  <DropdownItem name="Low">{{$t('m.Low')}}</DropdownItem>
                  <DropdownItem name="Mid" >{{$t('m.Mid')}}</DropdownItem>
                  <DropdownItem name="High">{{$t('m.High')}}</DropdownItem>
                </DropdownMenu>
              </template>
            </Dropdown>
          </li>
          <li>
            <Switch size="large" @on-change="handleTagsVisible">
              <template #open>{{$t('m.Tags')}}</template>
              <template #close>{{$t('m.Tags')}}</template>
            </Switch>
          </li>
          <li>
            <Input v-model="query.keyword"
                   @on-enter="filterByKeyword"
                   @on-click="filterByKeyword"
                   placeholder="keyword"
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
             :columns="problemTableColumns"
             :data="problemList"
             :loading="loadings.table"
             disabled-hover></Table>
    </Panel>
    <pagination
      :total="total" v-model:page-size="query.limit" @on-change="pushRouter" @on-page-size-change="pushRouter" v-model:current="query.page" :show-sizer="true"></pagination>

    </Col>

    <Col :span="5">
    <Panel :padding="10">
      <template #title>
        <div class="taglist-title">{{$t('m.Tags')}}</div>
      </template>
      <Button v-for="tag in tagList"
              :key="tag.name"
              @click="filterByTag(tag.name)"
              type="default"
              :disabled="query.tag === tag.name"
              shape="circle"
              class="tag-btn">{{tag.name}}
      </Button>

      <Button long id="pick-one" @click="pickone">
        <Icon type="shuffle"></Icon>
        {{$t('m.Pick_One')}}
      </Button>
    </Panel>
    <Spin v-if="loadings.tag" fix size="large"></Spin>
    </Col>
  </Row>
</template>

<script>
  import { useUserStore } from '@/stores/user'
  import api from '@oj/api'
  import utils from '@/utils/utils'
  import { ProblemMixin } from '@oj/components/mixins'
  import Pagination from '@oj/components/Pagination'
  import Panel from '@oj/components/Panel.vue'

  export default {
    name: 'ProblemList',
    mixins: [ProblemMixin],
    components: {
      Pagination,
      Panel
    },
    data () {
      return {
        tagList: [],
        problemTableColumns: [
          {
            title: '#',
            key: '_id',
            width: 80,
            render: (h, params) => {
              return h('a', {
                style: {
                  color: '#2d8cf0',
                  cursor: 'pointer',
                  textDecoration: 'none'
                },
                onClick: (e) => {
                  e.preventDefault()
                  this.$router.push({name: 'problem-details', params: {problemID: params.row._id}})
                }
              }, params.row._id)
            }
          },
          {
            title: this.$i18n.t('m.Title'),
            width: 400,
            render: (h, params) => {
              return h('a', {
                style: {
                  color: '#2d8cf0',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  display: 'block',
                  width: '100%'
                },
                onClick: (e) => {
                  e.preventDefault()
                  this.$router.push({name: 'problem-details', params: {problemID: params.row._id}})
                }
              }, params.row.title)
            }
          },
          {
            title: this.$i18n.t('m.Level'),
            render: (h, params) => {
              let t = params.row.difficulty
              let color = 'blue'
              if (t === 'Low') color = 'green'
              else if (t === 'High') color = 'yellow'
              return h('Tag', {
                props: {
                  color: color
                }
              }, this.$i18n.t('m.' + params.row.difficulty))
            }
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
        problemList: [],
        limit: 20,
        total: 0,
        loadings: {
          table: true,
          tag: true
        },
        routeName: '',
        query: {
          keyword: '',
          difficulty: '',
          tag: '',
          page: 1,
          limit: 10
        }
      }
    },
    mounted () {
      this.init()
    },
    methods: {
      init (simulate = false) {
        this.routeName = this.$route.name
        let query = this.$route.query
        this.query.difficulty = query.difficulty || ''
        this.query.keyword = query.keyword || ''
        this.query.tag = query.tag || ''
        this.query.page = parseInt(query.page) || 1
        if (this.query.page < 1) {
          this.query.page = 1
        }
        this.query.limit = parseInt(query.limit) || 10
        if (!simulate) {
          this.getTagList()
        }
        this.getProblemList()
      },
      pushRouter () {
        this.$router.push({
          name: 'problem-list',
          query: utils.filterEmptyValue(this.query)
        })
      },
      getProblemList () {
        let offset = (this.query.page - 1) * this.query.limit
        this.loadings.table = true
        api.getProblemList(offset, this.limit, this.query).then(res => {
          this.loadings.table = false
          this.total = res.data.data.total
          this.problemList = res.data.data.results
          if (this.isAuthenticated) {
            this.addStatusColumn(this.problemTableColumns, res.data.data.results)
          }
        }, res => {
          this.loadings.table = false
        })
      },
      getTagList () {
        api.getProblemTagList().then(res => {
          this.tagList = res.data.data
          this.loadings.tag = false
        }, res => {
          this.loadings.tag = false
        })
      },
      filterByTag (tagName) {
        this.query.tag = tagName
        this.query.page = 1
        this.pushRouter()
      },
      filterByDifficulty (difficulty) {
        this.query.difficulty = difficulty
        this.query.page = 1
        this.pushRouter()
      },
      filterByKeyword () {
        this.query.page = 1
        this.pushRouter()
      },
      handleTagsVisible (value) {
        if (value) {
          this.problemTableColumns.push(
            {
              title: this.$i18n.t('m.Tags'),
              align: 'center',
              render: (h, params) => {
                let tags = []
                params.row.tags.forEach(tag => {
                  tags.push(h('Tag', {}, tag))
                })
                return h('div', {
                  style: {
                    margin: '8px 0'
                  }
                }, tags)
              }
            })
        } else {
          this.problemTableColumns.splice(this.problemTableColumns.length - 1, 1)
        }
      },
      onReset () {
        this.$router.push({name: 'problem-list'})
      },
      pickone () {
        api.pickone().then(res => {
          this.$success('Good Luck')
          this.$router.push({name: 'problem-details', params: {problemID: res.data.data}})
        })
      }
    },
    computed: {
      isAuthenticated() {
        const userStore = useUserStore()
        return userStore.isAuthenticated
      }
    },
    watch: {
      '$route' (newVal, oldVal) {
        if (newVal !== oldVal) {
          this.init(true)
        }
      },
      'isAuthenticated' (newVal) {
        if (newVal === true) {
          this.init()
        }
      }
    }
  }
</script>

<style scoped lang="less">
  .taglist-title {
    margin-left: -10px;
    margin-bottom: -10px;
  }

  .tag-btn {
    margin-right: 5px;
    margin-bottom: 10px;
    
    &:not(:disabled) {
      border-color: #dcdfe6;
      color: #606266;
      
      &:hover {
        color: #409eff;
        border-color: #c6e2ff;
        background-color: #ecf5ff;
      }
    }
    
    &:disabled {
      background-color: #409eff !important;
      color: #fff !important;
      border-color: #409eff !important;
    }
  }

  #pick-one {
    margin-top: 10px;
  }

  // Style for problem links in table
  :deep(.ivu-table) {
    a {
      &:hover {
        color: #57a3f3;
      }
    }
  }
</style>