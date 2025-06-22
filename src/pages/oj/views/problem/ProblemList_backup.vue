<template>
  <Row type="flex" :gutter="18">
    <Col :span=19>
    <Panel shadow>
      <template #title>{{$t('m.Problem_List')}}</template>
      <template #extra>
        <ul class="filter">
          <li>
            <Dropdown @on-click="filterByDifficulty">
              <span>{{query.difficulty === '' ? this.$i18n.t('m.Difficulty') : this.$i18n.t('m.' + query.difficulty)}}
                <Icon type="arrow-down-b"></Icon>
              </span>
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
              type="ghost"
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
              return h('Button', {
                props: {
                  type: 'text',
                  size: 'large'
                },
                on: {
                  click: () => {
                    this.$router.push({name: 'problem-details', params: {problemID: params.row._id}})
                  }
                },
                style: {
                  padding: '2px 0'
                }
              }, params.row._id)
            }
          },
          {
            title: this.$i18n.t('m.Title'),
            width: 400,
            render: (h, params) => {
              return h('Button', {
                props: {
                  type: 'text',
                  size: 'large'
                },
                on: {
                  click: () => {
                    this.$router.push({name: 'problem-details', params: {problemID: params.row._id}})
                  }
                },
                style: {
                  padding: '2px 0',
                  overflowX: 'auto',
                  textAlign: 'left',
                  width: '100%'
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
  // Fix ViewUI Plus component styling
  :deep(.ivu-card) {
    border: 1px solid #dcdee2;
    background-color: #fff;
    border-radius: 4px;
    font-size: 14px;
    position: relative;
    transition: all .2s ease-in-out;
    
    .ivu-card-head {
      padding: 14px 16px;
      border-bottom: 1px solid #e8eaec;
      background: #fff;
      border-radius: 4px 4px 0 0;
      
      .panel-title {
        font-size: 16px;
        font-weight: 500;
        color: #17233d;
        line-height: 22px;
      }
    }
    
    .ivu-card-body {
      padding: 16px;
    }
    
    .ivu-card-extra {
      position: absolute;
      right: 16px;
      top: 14px;
    }
  }

  :deep(.ivu-table-wrapper) {
    border: 1px solid #dcdee2;
    border-top: 0;
    border-bottom: 0;
  }

  :deep(.ivu-table) {
    font-size: 14px;
    
    th {
      background-color: #f8f8f9;
      border-bottom: 1px solid #e8eaec;
      height: 48px;
      color: #515a6e;
      font-weight: 500;
    }
    
    td {
      border-bottom: 1px solid #e8eaec;
      padding: 12px 16px;
    }
    
    .ivu-btn-text {
      color: #2d8cf0;
      padding: 0;
      background: transparent;
      border: none;
      font-size: 14px;
      
      &:hover {
        color: #57a3f3;
      }
    }
  }

  :deep(.ivu-tag) {
    font-size: 12px;
    border-radius: 2px;
    padding: 0 8px;
    height: 22px;
    line-height: 22px;
  }

  :deep(.ivu-input) {
    .ivu-input-inner {
      height: 32px;
      line-height: 32px;
    }
  }

  :deep(.ivu-btn) {
    height: 32px;
    padding: 0 15px;
    font-size: 14px;
    border-radius: 4px;
    
    &.ivu-btn-info {
      background-color: #2db7f5;
      border-color: #2db7f5;
      color: #fff;
      
      &:hover {
        background-color: #57c5f7;
        border-color: #57c5f7;
      }
    }
    
    &.ivu-btn-ghost {
      background-color: transparent;
      color: #515a6e;
      border: 1px solid #dcdee2;
      
      &:hover:not(:disabled) {
        color: #2d8cf0;
        border-color: #2d8cf0;
      }
      
      &:disabled {
        color: #c5c8ce;
        background-color: #f7f7f7;
        border-color: #dcdee2;
        cursor: not-allowed;
      }
    }
  }

  :deep(.ivu-dropdown) {
    .ivu-dropdown-rel {
      cursor: pointer;
      
      span {
        color: #515a6e;
        font-size: 14px;
      }
    }
  }

  :deep(.ivu-switch) {
    &.ivu-switch-large {
      width: 56px;
      height: 28px;
      line-height: 26px;
      border-radius: 14px;
      
      .ivu-switch-inner {
        font-size: 14px;
        
        & > span {
          padding: 0 8px;
        }
      }
    }
  }

  .filter {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 16px;
    
    li {
      display: inline-block;
    }
  }
  .taglist-title {
    margin-left: -10px;
    margin-bottom: -10px;
  }

  .tag-btn {
    margin-right: 5px;
    margin-bottom: 10px;
  }

  #pick-one {
    margin-top: 10px;
  }
  
  // Fix for ViewUI Plus table styling
  :deep(.ivu-table),
  :deep(.ivu-table) {
    font-size: 16px !important;
    
    th {
      background-color: #f8f8f9;
      font-weight: 600;
    }
    
    td {
      padding: 12px 18px;
    }
  }
  
  // Fix for Panel component styling
  :deep(.ivu-card),
  :deep(.ivu-card) {
    .ivu-card-head,
    .ivu-card-head {
      padding: 14px 16px;
      border-bottom: 1px solid #e8eaec;
    }
    
    .ivu-card-body,
    .ivu-card-body {
      padding: 16px;
    }
  }
  
  // Fix for filter list styling
  ul.filter {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    align-items: center;
    
    li {
      display: inline-flex;
      align-items: center;
      margin-right: 15px;
    }
  }
  
  // Fix for Input component styling
  :deep(.ivu-input-wrapper),
  :deep(.ivu-input-wrapper) {
    width: 200px;
  }
  
  // Fix for Button styling
  :deep(.ivu-btn),
  :deep(.ivu-btn) {
    &.ivu-btn-text,
    &.ivu-btn-text {
      padding: 5px 8px;
      &:hover {
        background-color: transparent;
      }
    }
  }
</style>
