<template>
  <div>
    <div v-if="!problem.title" class="loading-container">
      <Spin size="large" fix></Spin>
    </div>
    <div v-else class="flex-container">
    <!-- Debug Panel -->
    <div v-if="debug" style="position: fixed; top: 80px; right: 10px; width: 400px; max-height: 600px; overflow-y: auto; background: white; border: 2px solid #333; padding: 10px; z-index: 9999; box-shadow: 0 2px 10px rgba(0,0,0,0.3);">
      <h3>Debug Panel</h3>
      <button @click="debug = false" style="position: absolute; top: 10px; right: 10px;">Close</button>
      <div style="margin-top: 20px;">
        <h4>Problem Data:</h4>
        <pre style="background: #f5f5f5; padding: 10px; overflow-x: auto; font-size: 11px;">{{ JSON.stringify(problem, null, 2) }}</pre>
      </div>
      <div style="margin-top: 10px;">
        <h4>Route Info:</h4>
        <p>Name: {{ $route.name }}</p>
        <p>Problem ID: {{ $route.params.problemID }}</p>
        <p>Contest ID: {{ $route.params.contestID }}</p>
      </div>
      <div style="margin-top: 10px;">
        <h4>Actions:</h4>
        <button @click="testAPICall" style="padding: 5px 10px;">Test API Call</button>
        <button @click="reloadProblem" style="padding: 5px 10px; margin-left: 5px;">Reload Problem</button>
      </div>
      <div v-if="apiTestResult" style="margin-top: 10px;">
        <h4>API Test Result:</h4>
        <pre style="background: #f5f5f5; padding: 10px; overflow-x: auto; font-size: 11px;">{{ apiTestResult }}</pre>
      </div>
    </div>
    
    <div id="problem-main">
      <!--problem main-->
      <Panel :padding="40" shadow>
        <template #title>
          <div>{{problem.title}}</div>
        </template>
        <div id="problem-content" class="markdown-body" v-katex>
          <p class="title">{{$t('m.Description')}}</p>
          <p class="content" v-html="problem.description || ''"></p>
          <!-- {{$t('m.music')}} -->
          <p class="title">{{$t('m.Input')}} <span v-if="problem.io_mode && problem.io_mode.io_mode=='File IO'">({{$t('m.FromFile')}}: {{ problem.io_mode.input }})</span></p>
          <p class="content" v-html="problem.input_description || ''"></p>

          <p class="title">{{$t('m.Output')}} <span v-if="problem.io_mode && problem.io_mode.io_mode=='File IO'">({{$t('m.ToFile')}}: {{ problem.io_mode.output }})</span></p>
          <p class="content" v-html="problem.output_description || ''"></p>

          <div v-if="problem.samples && problem.samples.length > 0">
            <div v-for="(sample, index) of problem.samples" :key="index">
              <div v-if="sample && (sample.input || sample.output)" class="flex-container sample">
                <div class="sample-input">
                  <p class="title">{{$t('m.Sample_Input')}} {{index + 1}}
                    <a class="copy"
                       v-clipboard:copy="sample.input"
                       v-clipboard:success="onCopy"
                       v-clipboard:error="onCopyError">
                      <Icon type="clipboard"></Icon>
                    </a>
                  </p>
                  <pre>{{sample.input}}</pre>
                </div>
                <div class="sample-output">
                  <p class="title">{{$t('m.Sample_Output')}} {{index + 1}}</p>
                  <pre>{{sample.output}}</pre>
                </div>
              </div>
            </div>
          </div>

          <div v-if="problem.hint">
            <p class="title">{{$t('m.Hint')}}</p>
            <Card dis-hover>
              <div class="content" v-html="problem.hint || ''"></div>
            </Card>
          </div>

          <div v-if="problem.source">
            <p class="title">{{$t('m.Source')}}</p>
            <p class="content">{{problem.source}}</p>
          </div>

        </div>
      </Panel>
      <!--problem main end-->
      <Card :padding="20" id="submit-code" dis-hover>
        <CodeMirror v-model="code"
                    :languages="problem.languages"
                    :language="language"
                    :theme="theme"
                    @resetCode="onResetToTemplate"
                    @changeTheme="onChangeTheme"
                    @changeLang="onChangeLang"></CodeMirror>
        <div class="submit-footer">
          <div class="status-section">
            <!-- Hidden Status Display
            <div class="status" v-if="statusVisible">
              <template v-if="!contestID || (contestID && OIContestRealTimePermission)">
                <span>{{$t('m.Status')}}</span>
                <Tag type="dot" :color="submissionStatus.color" @click="handleRoute('/status/'+submissionId)">
                  {{$t('m.' + submissionStatus.text.replace(/ /g, "_"))}}
                </Tag>
              </template>
              <template v-else-if="contestID && !OIContestRealTimePermission">
                <Alert type="success" show-icon>{{$t('m.Submitted_successfully')}}</Alert>
              </template>
            </div>
            -->
            <!-- Show only submission success message -->
            <div v-if="statusVisible && (!contestID || (contestID && !OIContestRealTimePermission))">
              <Alert type="success" show-icon>{{$t('m.Submitted_successfully')}}</Alert>
            </div>
            <div v-else-if="problem.my_status === 0">
              <Alert type="success" show-icon>{{$t('m.You_have_solved_the_problem')}}</Alert>
            </div>
            <div v-else-if="contestID && !OIContestRealTimePermission && submissionExists">
              <Alert type="success" show-icon>{{$t('m.You_have_submitted_a_solution')}}</Alert>
            </div>
            <div v-if="contestEnded">
              <Alert type="warning" show-icon>{{$t('m.Contest_has_ended')}}</Alert>
            </div>
          </div>

          <div class="submit-section">
            <template v-if="captchaRequired">
              <div class="captcha-container">
                <Tooltip v-if="captchaRequired" content="Click to refresh" placement="top">
                  <img :src="captchaSrc" @click="getCaptchaSrc"/>
                </Tooltip>
                <Input v-model="captchaCode" class="captcha-code"/>
              </div>
            </template>
            <Button type="warning" icon="edit" :loading="submitting" @click="submitCode"
                    :disabled="problemSubmitDisabled || submitted"
                    class="fl-right">
              <span v-if="submitting">{{$t('m.Submitting')}}</span>
              <span v-else>{{$t('m.Submit')}}</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>

    <div id="right-column">
      <VerticalMenu @on-click="handleRoute">
        <template v-if="contestID">
          <VerticalMenu-item :route="{name: 'contest-problem-list', params: {contestID: contestID}}">
            <Icon type="ios-photos"></Icon>
            {{$t('m.Problems')}}
          </VerticalMenu-item>

          <VerticalMenu-item :route="{name: 'contest-announcement-list', params: {contestID: contestID}}">
            <Icon type="chatbubble-working"></Icon>
            {{$t('m.Announcements')}}
          </VerticalMenu-item>
        </template>

        <!-- Hidden Submissions Menu Item
        <VerticalMenu-item v-if="!contestID || OIContestRealTimePermission" :route="submissionRoute">
          <Icon type="navicon-round"></Icon>
           {{$t('m.Submissions')}}
        </VerticalMenu-item>
        -->

        <template v-if="contestID">
          <VerticalMenu-item v-if="!contestID || OIContestRealTimePermission"
                             :route="{name: 'contest-rank', params: {contestID: contestID}}">
            <Icon type="stats-bars"></Icon>
            {{$t('m.Rankings')}}
          </VerticalMenu-item>
          <VerticalMenu-item :route="{name: 'contest-details', params: {contestID: contestID}}">
            <Icon type="home"></Icon>
            {{$t('m.View_Contest')}}
          </VerticalMenu-item>
        </template>
      </VerticalMenu>

      <Card id="info">
        <template #title>
          <div class="header">
            <Icon type="information-circled"></Icon>
            <span class="card-title">{{$t('m.Information')}}</span>
          </div>
        </template>
        <ul>
          <li><p>ID</p>
            <p>{{problem._id}}</p>
          </li>
          <li>
            <p>{{$t('m.Time_Limit')}}</p>
            <p>{{problem.time_limit}}MS</p>
          </li>
          <li>
            <p>{{$t('m.Memory_Limit')}}</p>
            <p>{{problem.memory_limit}}MB</p>
          </li>
          <li>
            <p>{{$t('m.IOMode')}}</p>
            <p>{{problem.io_mode.io_mode}}</p>
          </li>
          <li>
            <p>{{$t('m.Created')}}</p>
            <p>{{problem.created_by.username}}</p>
          </li>
          <li v-if="problem.difficulty">
            <p>{{$t('m.Level')}}</p>
            <p>{{$t('m.' + problem.difficulty)}}</p></li>
          <li v-if="problem.total_score">
            <p>{{$t('m.Score')}}</p>
            <p>{{problem.total_score}}</p>
          </li>
          <li>
            <p>{{$t('m.Tags')}}</p>
            <p>
              <Poptip trigger="hover" placement="left-end">
                <a>{{$t('m.Show')}}</a>
                <template #content>
                  <div>
                    <Tag v-for="tag in problem.tags" :key="tag">{{tag}}</Tag>
                  </div>
                </template>
              </Poptip>
            </p>
          </li>
        </ul>
      </Card>

      <Card id="pieChart" :padding="0" v-if="!contestID || OIContestRealTimePermission">
        <template #title>
          <div>
            <Icon type="ios-analytics"></Icon>
            <span class="card-title">{{$t('m.Statistic')}}</span>
            <Button type="text" size="small" id="detail" @click="graphVisible = !graphVisible">Details</Button>
          </div>
        </template>
        <div class="echarts">
          <ECharts :options="pie"></ECharts>
        </div>
      </Card>
    </div>

    <Modal v-model="graphVisible">
      <div id="pieChart-detail">
        <ECharts :options="largePie" :initOptions="largePieInitOpts"></ECharts>
      </div>
      <template #footer>
        <div>
          <Button @click="graphVisible=false">{{$t('m.Close')}}</Button>
        </div>
      </template>
    </Modal>
    </div>
  </div>
</template>

<script>
  import { defineAsyncComponent } from 'vue'
  import { useUserStore } from '@/stores/user'
  import { useContestStore } from '@/stores/contest'
  import CodeMirror from '@oj/components/CodeMirror.vue'
  import Panel from '@oj/components/Panel.vue'
  import storage from '@/utils/storage'
  import {FormMixin} from '@oj/components/mixins'
  import {JUDGE_STATUS, CONTEST_STATUS, buildProblemCodeKey} from '@/utils/constants'
  import api from '@oj/api'
  import {pie, largePie} from './chartData'

  // 只显示这些状态的图形占用
  const filtedStatus = ['-1', '-2', '0', '1', '2', '3', '4', '8']

  export default {
    name: 'Problem',
    components: {
      CodeMirror,
      Panel,
      ECharts: defineAsyncComponent(() => import('vue-echarts'))
    },
    mixins: [FormMixin],
    data () {
      return {
        debug: false, // Enable debug mode
        statusVisible: false,
        captchaRequired: false,
        graphVisible: false,
        submissionExists: false,
        captchaCode: '',
        captchaSrc: '',
        contestID: '',
        problemID: '',
        submitting: false,
        code: '',
        language: 'C++',
        theme: 'solarized',
        submissionId: '',
        submitted: false,
        result: {
          result: 9
        },
        apiTestResult: null,
        problem: {
          title: '',
          description: '',
          hint: '',
          my_status: '',
          template: {},
          languages: [],
          created_by: {
            username: ''
          },
          tags: [],
          io_mode: {'io_mode': 'Standard IO'}
        },
        pie: pie,
        largePie: largePie,
        // echarts 无法获取隐藏dom的大小，需手动指定
        largePieInitOpts: {
          width: '500',
          height: '480'
        }
      }
    },
    beforeRouteEnter (to, from, next) {
      let problemCode = storage.get(buildProblemCodeKey(to.params.problemID, to.params.contestID))
      if (problemCode) {
        next(vm => {
          vm.language = problemCode.language
          vm.code = problemCode.code
          vm.theme = problemCode.theme
        })
      } else {
        next()
      }
    },
    mounted () {
      if (this.contestStore && this.contestStore.changeContestItemVisible) {
        this.contestStore.changeContestItemVisible({menu: false})
      }
      this.init()
    },
    setup() {
      const userStore = useUserStore()
      const contestStore = useContestStore()
      
      return {
        userStore,
        contestStore
      }
    },
    methods: {
      init () {
        this.$Loading.start()
        this.contestID = this.$route.params.contestID
        this.problemID = this.$route.params.problemID
        let func = this.$route.name === 'problem-details' ? 'getProblem' : 'getContestProblem'
        api[func](this.problemID, this.contestID).then(res => {
          this.$Loading.finish()
          let problem = res.data.data
          document.title = problem.title
          api.submissionExists(problem.id).then(res => {
            this.submissionExists = res.data.data
          })
          problem.languages = Array.isArray(problem.languages) ? problem.languages.sort() : []
          // Filter out empty samples
          if (problem.samples && Array.isArray(problem.samples)) {
            problem.samples = problem.samples.filter(sample => 
              sample && (sample.input || sample.output)
            )
          } else {
            problem.samples = []
          }
          this.problem = problem
          if (problem.statistic_info) {
            this.changePie(problem)
          }

          // 在beforeRouteEnter中修改了, 说明本地有code，无需加载template
          if (this.code !== '') {
            return
          }
          // try to load problem template
          this.language = this.problem.languages[0]
          let template = this.problem.template
          if (template && template[this.language]) {
            this.code = template[this.language]
          }
        }, () => {
          this.$Loading.error()
        })
      },
      changePie (problemData) {
        // Ensure statistic_info is an object
        if (!problemData.statistic_info || typeof problemData.statistic_info !== 'object') {
          // This is normal for new problems without submissions yet
          return
        }
        
        // Create a copy to avoid mutating the original data
        let statistic_info = {...problemData.statistic_info}
        
        // 只显示特定的一些状态
        for (let k in statistic_info) {
          if (filtedStatus.indexOf(k) === -1) {
            delete statistic_info[k]
          }
        }
        
        // Update problemData with the filtered copy
        problemData = {...problemData, statistic_info}
        let acNum = problemData.accepted_number
        let data = [
          {name: 'WA', value: problemData.submission_number - acNum},
          {name: 'AC', value: acNum}
        ]
        this.pie.series[0].data = data
        // 只把大图的AC selected下，这里需要做一下deepcopy
        let data2 = JSON.parse(JSON.stringify(data))
        data2[1].selected = true
        this.largePie.series[1].data = data2

        // 根据结果设置legend,没有提交过的legend不显示
        let legend = Object.keys(problemData.statistic_info).map(ele => JUDGE_STATUS[ele].short)
        if (legend.length === 0) {
          legend.push('AC', 'WA')
        }
        this.largePie.legend.data = legend

        // 把ac的数据提取出来放在最后
        let acCount = statistic_info['0'] || 0
        delete statistic_info['0']

        let largePieData = []
        Object.keys(statistic_info).forEach(ele => {
          largePieData.push({name: JUDGE_STATUS[ele].short, value: statistic_info[ele]})
        })
        largePieData.push({name: 'AC', value: acCount})
        this.largePie.series[0].data = largePieData
      },
      handleRoute (route) {
        this.$router.push(route)
      },
      onChangeLang (newLang) {
        console.log('[Problem] onChangeLang called with:', newLang, 'current:', this.language)
        if (this.problem.template && this.problem.template[newLang]) {
          if (this.code.trim() === '') {
            this.code = this.problem.template[newLang]
          }
        }
        this.language = newLang
        console.log('[Problem] Language updated to:', this.language)
      },
      onChangeTheme (newTheme) {
        this.theme = newTheme
      },
      onResetToTemplate () {
        this.$Modal.confirm({
          content: this.$i18n.t('m.Are_you_sure_you_want_to_reset_your_code'),
          onOk: () => {
            let template = this.problem.template
            if (template && template[this.language]) {
              this.code = template[this.language]
            } else {
              this.code = ''
            }
          }
        })
      },
      checkSubmissionStatus () {
        // 使用setTimeout避免一些问题
        if (this.refreshStatus) {
          // 如果之前的提交状态检查还没有停止,则停止,否则将会失去timeout的引用造成无限请求
          clearTimeout(this.refreshStatus)
        }
        const checkStatus = () => {
          let id = this.submissionId
          api.getSubmission(id).then(res => {
            this.result = res.data.data
            if (Object.keys(res.data.data.statistic_info).length !== 0) {
              this.submitting = false
              this.submitted = false
              clearTimeout(this.refreshStatus)
              this.init()
            } else {
              this.refreshStatus = setTimeout(checkStatus, 2000)
            }
          }, res => {
            this.submitting = false
            clearTimeout(this.refreshStatus)
          })
        }
        this.refreshStatus = setTimeout(checkStatus, 2000)
      },
      submitCode () {
        if (this.code.trim() === '') {
          this.$error(this.$i18n.t('m.Code_can_not_be_empty'))
          return
        }
        this.submissionId = ''
        this.result = {result: 9}
        this.submitting = true
        let data = {
          problem_id: this.problem.id,
          language: this.language,
          code: this.code,
          contest_id: this.contestID
        }
        if (this.captchaRequired) {
          data.captcha = this.captchaCode
        }
        const submitFunc = (data, detailsVisible) => {
          this.statusVisible = true
          api.submitCode(data).then(res => {
            this.submissionId = res.data.data && res.data.data.submission_id
            // 定时检查状态
            this.submitting = false
            this.submissionExists = true
            if (!detailsVisible) {
              this.$Modal.success({
                title: this.$i18n.t('m.Success'),
                content: this.$i18n.t('m.Submit_code_successfully')
              })
              return
            }
            this.submitted = true
            this.checkSubmissionStatus()
          }, res => {
            this.getCaptchaSrc()
            if (res.data.data.startsWith('Captcha is required')) {
              this.captchaRequired = true
            }
            this.submitting = false
            this.statusVisible = false
          })
        }

        if (this.contestRuleType === 'OI' && !this.OIContestRealTimePermission) {
          if (this.submissionExists) {
            this.$Modal.confirm({
              title: '',
              content: '<h3>' + this.$i18n.t('m.You_have_submission_in_this_problem_sure_to_cover_it') + '<h3>',
              onOk: () => {
                // 暂时解决对话框与后面提示对话框冲突的问题(否则一闪而过）
                setTimeout(() => {
                  submitFunc(data, false)
                }, 1000)
              },
              onCancel: () => {
                this.submitting = false
              }
            })
          } else {
            submitFunc(data, false)
          }
        } else {
          submitFunc(data, true)
        }
      },
      onCopy (event) {
        this.$success('Code copied')
      },
      onCopyError (e) {
        this.$error('Failed to copy code')
      },
      testAPICall() {
        console.log('=== Manual API Test ===')
        const problemID = this.$route.params.problemID || '001'
        console.log('Testing with problem ID:', problemID)
        
        // Direct API call
        this.$Loading.start()
        api.getProblem(problemID).then(res => {
          this.$Loading.finish()
          console.log('Test API Response:', res)
          this.apiTestResult = JSON.stringify({
            status: res.status,
            data: res.data,
            problem: res.data.data
          }, null, 2)
        }).catch(err => {
          this.$Loading.error()
          console.error('Test API Error:', err)
          this.apiTestResult = JSON.stringify({
            error: err.message,
            response: err.response?.data,
            status: err.response?.status
          }, null, 2)
        })
      },
      reloadProblem() {
        console.log('=== Reloading Problem ===')
        this.init()
      }
    },
    computed: {
      problemSubmitDisabled() {
        if (this.contestID) {
          return this.contestStore.contestStatus === CONTEST_STATUS.ENDED
        }
        return false
      },
      contestRuleType() {
        return this.contestStore.contestRuleType || ''
      },
      OIContestRealTimePermission() {
        return this.contestStore.OIContestRealTimePermission || false
      },
      contestStatus() {
        return this.contestStore.contestStatus || ''
      },
      contest () {
        return this.contestStore.contest || {}
      },
      contestEnded () {
        return this.contestStatus === CONTEST_STATUS.ENDED
      },
      submissionStatus () {
        return {
          text: JUDGE_STATUS[this.result.result]['name'],
          color: JUDGE_STATUS[this.result.result]['color']
        }
      },
      submissionRoute () {
        if (this.contestID) {
          return {name: 'contest-submission-list', query: {problemID: this.problemID}}
        } else {
          return {name: 'submission-list', query: {problemID: this.problemID}}
        }
      }
    },
    beforeRouteLeave (to, from, next) {
      // 防止切换组件后仍然不断请求
      clearInterval(this.refreshStatus)

      if (this.contestStore && this.contestStore.changeContestItemVisible) {
        this.contestStore.changeContestItemVisible({menu: true})
      }
      storage.set(buildProblemCodeKey(this.problem._id, from.params.contestID), {
        code: this.code,
        language: this.language,
        theme: this.theme
      })
      next()
    },
    watch: {
      '$route' () {
        this.init()
      }
    }
  }
</script>

<style lang="less" scoped>
  .loading-container {
    min-height: 500px;
    position: relative;
  }

  .card-title {
    margin-left: 8px;
  }

  .flex-container {
    #problem-main {
      flex: auto;
      margin-right: 18px;
    }
    #right-column {
      flex: none;
      width: 220px;
    }
  }

  #problem-content {
    margin-top: -50px;
    .title {
      font-size: 20px;
      font-weight: 400;
      margin: 25px 0 8px 0;
      color: #3091f2;
      .copy {
        padding-left: 8px;
      }
    }
    p.content {
      margin-left: 25px;
      margin-right: 20px;
      font-size: 15px
    }
    .sample {
      align-items: stretch;
      &-input, &-output {
        width: 50%;
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        margin-right: 5%;
      }
      pre {
        flex: 1 1 auto;
        align-self: stretch;
        border-style: solid;
        background: transparent;
      }
    }
  }

  #submit-code {
    margin-top: 20px;
    margin-bottom: 20px;
    
    .submit-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 15px;
      
      .status-section {
        flex: 1;
      }
      
      .submit-section {
        display: flex;
        align-items: center;
        gap: 10px;
      }
    }
    
    .status {
      float: left;
      span {
        margin-right: 10px;
        margin-left: 10px;
      }
    }
    .captcha-container {
      display: inline-block;
      .captcha-code {
        width: auto;
        margin-top: -20px;
        margin-left: 20px;
      }
    }
  }

  #info {
    margin-bottom: 20px;
    margin-top: 20px;
    ul {
      list-style-type: none;
      li {
        border-bottom: 1px dotted #e9eaec;
        margin-bottom: 10px;
        p {
          display: inline-block;
        }
        p:first-child {
          width: 90px;
        }
        p:last-child {
          float: right;
        }
      }
    }
  }

  .fl-right {
    float: right;
  }

  #pieChart {
    .echarts {
      height: 250px;
      width: 210px;
    }
    #detail {
      position: absolute;
      right: 10px;
      top: 10px;
    }
  }

  #pieChart-detail {
    margin-top: 20px;
    width: 500px;
    height: 480px;
  }
</style>

