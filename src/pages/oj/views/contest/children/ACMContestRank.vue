<template>
  <Panel shadow>
    <template #title>{{ contest.title }}</template>
    <template #extra>
      <screen-full :height="18" :width="18" class="screen-full"></screen-full>
      <Poptip trigger="hover" placement="left-start">
        <Icon type="android-settings" size="20"></Icon>
        <template #content>
          <div id="switches">
          <p>
            <span>{{$t('m.Menu')}}</span>
            <i-switch v-model="showMenu"></i-switch>
            <span>{{$t('m.Chart')}}</span>
            <i-switch v-model="showChart"></i-switch>
          </p>
          <p>
            <span>{{$t('m.Auto_Refresh')}}(10s)</span>
            <i-switch :disabled="refreshDisabled" @change="handleAutoRefresh"></i-switch>
          </p>
          <template v-if="isContestAdmin">
            <p>
              <span>{{$t('m.RealName')}}</span>
              <i-switch v-model="showRealName"></i-switch>
            </p>
            <p>
              <span>{{$t('m.Force_Update')}}</span>
              <i-switch :disabled="refreshDisabled" v-model="forceUpdate"></i-switch>
            </p>
          </template>
          <template>
            <Button type="primary" size="small" @click="downloadRankCSV">{{$t('m.download_csv')}}</Button>
          </template>
          </div>
        </template>
      </Poptip>
    </template>
    <div v-show="showChart" class="echarts">
      <ECharts :options="options" ref="chart" auto-resize></ECharts>
    </div>
    <Table ref="tableRank" :columns="columns" :data="dataRank" disabled-hover height="600"></Table>
    <Pagination :total="total"
                v-model:page-size="limit"
                v-model:current="page"
                @change="getContestRankData"
                @page-size-change="getContestRankData(1)"
                show-sizer></Pagination>
  </Panel>
</template>
<script>
  import dayjs from 'dayjs'
  import { useContestStore } from '@/stores/contest'
  import Panel from '@/pages/oj/components/Panel.vue'
  import Pagination from '@oj/components/Pagination'
  import ContestRankMixin from './contestRankMixinVue3'
  import time from '@/utils/time'
  import utils from '@/utils/utils'
  import ECharts from 'vue-echarts'

  export default {
    name: 'acm-contest-rank',
    components: {
      Panel,
      Pagination,
      ECharts
    },
    mixins: [ContestRankMixin],
    data () {
      return {
        total: 0,
        page: 1,
        contestID: '',
        columns: [
          {
            align: 'center',
            width: 50,
            fixed: 'left',
            render: (h, params) => {
              return h('span', {}, params.index + (this.page - 1) * this.limit + 1)
            }
          },
          {
            title: this.$i18n.t('m.User_User'),
            align: 'center',
            fixed: 'left',
            width: 150,
            render: (h, params) => {
              return h('a', {
                style: {
                  display: 'inline-block',
                  'max-width': '150px'
                },
                onClick: () => {
                  this.$router.push(
                    {
                      name: 'user-home',
                      query: {username: params.row.user.username}
                    })
                }
              }, params.row.user.username)
            }
          },
          {
            title: 'AC / ' + this.$i18n.t('m.Total'),
            align: 'center',
            width: 100,
            render: (h, params) => {
              return h('span', {}, [
                h('span', {}, params.row.accepted_number + ' / '),
                // Hidden link to submission list
                h('span', {}, params.row.submission_number)
              ])
            }
          },
          {
            title: this.$i18n.t('m.TotalTime'),
            align: 'center',
            width: 100,
            render: (h, params) => {
              return h('span', this.parseTotalTime(params.row.total_time))
            }
          }
        ],
        dataRank: [],
        options: {
          title: {
            text: this.$i18n.t('m.Top_10_Teams'),
            left: 'center'
          },
          dataZoom: [
            {
              type: 'inside',
              filterMode: 'none',
              xAxisIndex: [0],
              start: 0,
              end: 100
            }
          ],
          toolbox: {
            show: true,
            feature: {
              saveAsImage: {show: true, title: this.$i18n.t('m.save_as_image')}
            },
            right: '5%'
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
              axis: 'x'
            }
          },
          legend: {
            orient: 'vertical',
            y: 'center',
            right: 0,
            data: [],
            formatter: (value) => {
              return utils.breakLongWords(value, 16)
            },
            textStyle: {
              fontSize: 12
            }
          },
          grid: {
            x: 80,
            x2: 200
          },
          xAxis: [{
            type: 'time',
            splitLine: false,
            axisPointer: {
              show: true,
              snap: true
            }
          }],
          yAxis: [
            {
              type: 'category',
              boundaryGap: false,
              data: [0]
            }],
          series: []
        }
      }
    },
    mounted () {
      this.contestID = this.$route.params.contestID
      this.getContestRankData(1)
      if (this.contestProblems.length === 0) {
        const contestStore = useContestStore()
        contestStore.getContestProblems(this.$route.params.contestID).then(() => {
          this.addTableColumns(contestStore.contestProblems)
          this.addChartCategory(contestStore.contestProblems)
        })
      } else {
        this.addTableColumns(this.contestProblems)
        this.addChartCategory(this.contestProblems)
      }
    },
    methods: {
      addChartCategory (contestProblems) {
        let category = []
        for (let i = 0; i <= contestProblems.length; ++i) {
          category.push(i)
        }
        this.options.yAxis[0].data = category
      },
      applyToChart (rankData) {
        let [users, seriesData] = [[], []]
        rankData.forEach(rank => {
          users.push(rank.user.username)
          let info = rank.submission_info
          // 提取出已AC题目的时间
          let timeData = []
          Object.keys(info).forEach(problemID => {
            if (info[problemID].is_ac) {
              timeData.push(info[problemID].ac_time)
            }
          })
          timeData.sort((a, b) => {
            return a - b
          })

          let data = []
          data.push([this.contest.start_time, 0])
          // index here can be regarded as stacked accepted number count.
          for (let [index, value] of timeData.entries()) {
            let realTime = dayjs(this.contest.start_time).add(value, 'seconds').format()
            data.push([realTime, index + 1])
          }
          seriesData.push({
            name: rank.user.username,
            type: 'line',
            data
          })
        })
        this.options.legend.data = users
        this.options.series = seriesData
      },
      applyToTable (data) {
        // deepcopy
        let dataRank = JSON.parse(JSON.stringify(data))
        // 从submission_info中取出相应的problem_id 放入到父object中,这么做主要是为了适应iview table的data格式
        // 见https://www.iviewui.com/components/table
        dataRank.forEach((rank, i) => {
          let info = rank.submission_info
          let cellClass = {}
          Object.keys(info).forEach(problemID => {
            dataRank[i][problemID] = info[problemID]
            dataRank[i][problemID].ac_time = time.secondFormat(dataRank[i][problemID].ac_time)
            let status = info[problemID]
            if (status.is_first_ac) {
              cellClass[problemID] = 'first-ac'
            } else if (status.is_ac) {
              cellClass[problemID] = 'ac'
            } else {
              cellClass[problemID] = 'wa'
            }
          })
          dataRank[i].cellClassName = cellClass
        })
        this.dataRank = dataRank
      },
      addTableColumns (problems) {
        // 根据题目添加table column
        problems.forEach(problem => {
          this.columns.push({
            align: 'center',
            key: problem.id,
            width: problems.length > 15 ? 80 : null,
            renderHeader: (h, params) => {
              return h('a', {
                'class': {
                  'emphasis': true
                },
                onClick: () => {
                  this.$router.push({
                    name: 'contest-problem-details',
                    params: {
                      contestID: this.contestID,
                      problemID: problem._id
                    }
                  })
                }
              }, problem._id)
            },
            render: (h, params) => {
              if (params.row[problem.id]) {
                let status = params.row[problem.id]
                let acTime, errorNumber
                if (status.is_ac) {
                  acTime = h('span', status.ac_time)
                }
                if (status.error_number !== 0) {
                  errorNumber = h('p', '(-' + status.error_number + ')')
                }
                return h('div', [acTime, errorNumber])
              }
            }
          })
        })
      },
      parseTotalTime (totalTime) {
        const hours = Math.floor(totalTime / 3600)
        const minutes = Math.floor((totalTime % 3600) / 60)
        const seconds = totalTime % 60
        return [hours, minutes, seconds].join(':')
      },
      downloadRankCSV () {
        utils.downloadFile(`contest_rank?download_csv=1&contest_id=${this.$route.params.contestID}&force_refrash=${this.forceUpdate ? '1' : '0'}`)
      }
    }
  }
</script>
<style scoped lang="less">
  .echarts {
    margin: 20px auto;
    height: 400px;
    width: 98%;
  }

  .screen-full {
    margin-right: 8px;
  }

  #switches {
    p {
      margin-top: 5px;
      &:first-child {
        margin-top: 0;
      }
      span {
        margin-left: 8px;
      }
    }
  }
</style>
