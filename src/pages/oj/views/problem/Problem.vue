<template>
  <div class="flex-container">
    <div id="problem-main">
      <!--problem main-->
      <Panel :padding="40" shadow>
        <div slot="title">{{problem.title}}</div>
        <div id="problem-content" class="markdown-body" v-katex>
          <p class="title">{{$t('m.Description')}}</p>
          <p class="content" v-html=problem.description></p>
          <!-- {{$t('m.music')}} -->
          <p class="title">{{$t('m.Input')}} <span v-if="problem.io_mode.io_mode=='File IO'">({{$t('m.FromFile')}}: {{ problem.io_mode.input }})</span></p>
          <p class="content" v-html=problem.input_description></p>

          <p class="title">{{$t('m.Output')}} <span v-if="problem.io_mode.io_mode=='File IO'">({{$t('m.ToFile')}}: {{ problem.io_mode.output }})</span></p>
          <p class="content" v-html=problem.output_description></p>

          <div v-for="(sample, index) of problem.samples" :key="index">
            <div class="flex-container sample">
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

          <div v-if="problem.hint">
            <p class="title">{{$t('m.Hint')}}</p>
            <Card dis-hover>
              <div class="content" v-html=problem.hint></div>
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
        <CodeMirror :value.sync="code"
                    :languages="problem.languages"
                    :language="language"
                    :theme="theme"
                    @resetCode="onResetToTemplate"
                    @changeTheme="onChangeTheme"
                    @changeLang="onChangeLang"></CodeMirror>
        <Row type="flex" justify="space-between">
          <Col :span="10">
            <div class="status" v-if="statusVisible">
              <template v-if="!this.contestID || (this.contestID && OIContestRealTimePermission)">
                <span>{{$t('m.Status')}}</span>
                <Tag type="dot" :color="submissionStatus.color" @click.native="handleRoute('/status/'+submissionId)">
                  {{$t('m.' + submissionStatus.text.replace(/ /g, "_"))}}
                </Tag>
              </template>
              <template v-else-if="this.contestID && !OIContestRealTimePermission">
                <Alert type="success" show-icon>{{$t('m.Submitted_successfully')}}</Alert>
              </template>
            </div>
            <div v-else-if="problem.my_status === 0">
              <Alert type="success" show-icon>{{$t('m.You_have_solved_the_problem')}}</Alert>
            </div>
            <div v-else-if="this.contestID && !OIContestRealTimePermission && submissionExists">
              <Alert type="success" show-icon>{{$t('m.You_have_submitted_a_solution')}}</Alert>
            </div>
            <div v-if="contestEnded">
              <Alert type="warning" show-icon>{{$t('m.Contest_has_ended')}}</Alert>
            </div>
          </Col>

          <Col :span="12">
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
          </Col>
        </Row>
      </Card>
    </div>

    <div id="right-column">
      <VerticalMenu @on-click="handleRoute">
        <template v-if="this.contestID">
          <VerticalMenu-item :route="{name: 'contest-problem-list', params: {contestID: contestID}}">
            <Icon type="ios-photos"></Icon>
            {{$t('m.Problems')}}
          </VerticalMenu-item>

          <VerticalMenu-item :route="{name: 'contest-announcement-list', params: {contestID: contestID}}">
            <Icon type="chatbubble-working"></Icon>
            {{$t('m.Announcements')}}
          </VerticalMenu-item>
        </template>

        <VerticalMenu-item v-if="!this.contestID || OIContestRealTimePermission" :route="submissionRoute">
          <Icon type="navicon-round"></Icon>
           {{$t('m.Submissions')}}
        </VerticalMenu-item>

        <template v-if="this.contestID">
          <VerticalMenu-item v-if="!this.contestID || OIContestRealTimePermission"
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
        <div slot="title" class="header">
          <Icon type="information-circled"></Icon>
          <span class="card-title">{{$t('m.Information')}}</span>
        </div>
        <ul>
          <li><p>ID</p>
            <p>{{problem._id}}</p></li>
          <li>
            <p>{{$t('m.Time_Limit')}}</p>
            <p>{{problem.time_limit}}MS</p></li>
          <li>
            <p>{{$t('m.Memory_Limit')}}</p>
            <p>{{problem.memory_limit}}MB</p></li>
          <li>
          <li>
            <p>{{$t('m.IOMode')}}</p>
            <p>{{problem.io_mode.io_mode}}</p>
          </li>
          <li>
            <p>{{$t('m.Created')}}</p>
            <p>{{problem.created_by.username}}</p></li>
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
                <div slot="content">
                  <Tag v-for="tag in problem.tags" :key="tag">{{tag}}</Tag>
                </div>
              </Poptip>
            </p>
          </li>
        </ul>
      </Card>

      <Card id="pieChart" :padding="0" v-if="!this.contestID || OIContestRealTimePermission">
        <div slot="title">
          <Icon type="ios-analytics"></Icon>
          <span class="card-title">{{$t('m.Statistic')}}</span>
          <Button type="ghost" size="small" id="detail" @click="graphVisible = !graphVisible">Details</Button>
        </div>
        <div class="echarts">
          <ECharts :options="pie"></ECharts>
        </div>
      </Card>

      <LiveCode v-if="problem._id" :problem="problem" />
    </div>

    <Modal v-model="graphVisible">
      <div id="pieChart-detail">
        <ECharts :options="largePie" :initOptions="largePieInitOpts"></ECharts>
      </div>
      <div slot="footer">
        <Button type="ghost" @click="graphVisible=false">{{$t('m.Close')}}</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import api from '@/api'
import utils from '@/utils/utils'
import { ProblemMixin } from '@/pages/oj/components/mixins'
import CodeMirror from '@/pages/oj/components/CodeMirror.vue'
import LiveCode from './LiveCode.vue'
import { FormMixin } from '@/pages/oj/components/mixins'
import { JUDGE_STATUS, CONTEST_STATUS, buildProblemCodeKey } from '@/utils/constants'
import { pie, largePie } from './chartData'
import storage from '@/utils/storage'

export default {
  name: 'Problem',
  components: {
    CodeMirror,
    LiveCode
  },
  mixins: [FormMixin, ProblemMixin],
  data () {
    return {
      statusVisible: false,
      captchaRequired: false,
      captchaCode: '',
      captchaSrc: '',
      submissionExists: false,
      problem: {
        title: '',
        description: '',
        input_description: '',
        output_description: '',
        hint: '',
        source: '',
        samples: [],
        languages: [],
        tags: [],
        io_mode: {
          io_mode: 'Standard IO'
        }
      },
      code: '',
      language: '',
      theme: 'monokai',
      submissionId: '',
      submitted: false,
      submitting: false,
      contestID: '',
      contestEnded: false,
      graphVisible: false,
      largePieInitOpts: {
        renderer: 'canvas'
      }
    }
  },
  computed: {
    ...mapState({
      submissionStatus: state => state.submission.status,
      OIContestRealTimePermission: state => state.contest.OIContestRealTimePermission
    }),
    ...mapGetters(['isAuthenticated']),
    submissionRoute () {
      return {
        name: this.contestID ? 'contest-submission-list' : 'submission-list',
        query: { problemID: this.problem._id }
      }
    },
    problemSubmitDisabled () {
      return !this.isAuthenticated || this.contestEnded
    }
  },
  methods: {
    ...mapActions({
      getProblem: 'problem/getProblem',
      submit: 'submission/submit'
    }),
    async init () {
      this.contestID = this.$route.params.contestID
      const problemID = this.$route.params.problemID
      try {
        const res = await this.getProblem({
          problemID,
          contestID: this.contestID
        })
        this.problem = res.data.data
        this.code = storage.get(buildProblemCodeKey(problemID, this.contestID), '')
        this.language = storage.get(buildProblemCodeKey(problemID, this.contestID, 'language'), '')
        if (!this.language && this.problem.languages.length > 0) {
          this.language = this.problem.languages[0]
        }
      } catch (err) {
        this.$Message.error(err.message)
      }
    },
    onResetToTemplate () {
      this.code = this.problem.template || ''
    },
    onChangeTheme (newTheme) {
      this.theme = newTheme
    },
    onChangeLang (newLang) {
      this.language = newLang
      storage.set(buildProblemCodeKey(this.problem._id, this.contestID, 'language'), newLang)
    },
    async submitCode () {
      if (!this.isAuthenticated) {
        this.$Message.warning(this.$i18n.t('m.Please_login_first'))
        this.$router.push({
          name: 'login',
          query: { redirect: this.$route.fullPath }
        })
        return
      }
      if (this.contestEnded) {
        this.$Message.warning(this.$i18n.t('m.Contest_has_ended'))
        return
      }
      if (!this.code) {
        this.$Message.warning(this.$i18n.t('m.Please_write_code'))
        return
      }
      if (this.captchaRequired && !this.captchaCode) {
        this.$Message.warning(this.$i18n.t('m.Please_input_captcha'))
        return
      }
      this.submitting = true
      try {
        const data = {
          problem_id: this.problem._id,
          language: this.language,
          code: this.code,
          contest_id: this.contestID
        }
        if (this.captchaRequired) {
          data.captcha = this.captchaCode
        }
        const res = await this.submit(data)
        this.submissionId = res.data.data.submission_id
        this.submitted = true
        this.statusVisible = true
        this.submissionExists = true
        storage.set(buildProblemCodeKey(this.problem._id, this.contestID), this.code)
      } catch (err) {
        this.submitting = false
        if (err.response && err.response.data && err.response.data.error === 'captcha_required') {
          this.captchaRequired = true
          this.getCaptchaSrc()
        } else {
          this.$Message.error(err.message)
        }
      }
    },
    async getCaptchaSrc () {
      try {
        const res = await api.getCaptcha()
        this.captchaSrc = res.data.data
      } catch (err) {
        this.$Message.error(err.message)
      }
    },
    handleRoute (route) {
      this.$router.push(route)
    },
    onCopy () {
      this.$Message.success(this.$i18n.t('m.Copy_success'))
    },
    onCopyError () {
      this.$Message.error(this.$i18n.t('m.Copy_failed'))
    }
  },
  beforeDestroy () {
    storage.set(buildProblemCodeKey(this.problem._id, this.contestID), this.code)
  },
  created () {
    this.init()
  }
}
</script>

<style lang="less" scoped>
.flex-container {
  #main {
    flex: auto;
    margin-right: 18px;
    #problem-content {
      margin-top: -20px;
      .title {
        font-size: 18px;
        font-weight: 500;
        margin: 20px 0 10px;
        color: #3091f2;
        &::before {
          content: '#';
          margin-right: 5px;
        }
      }
      .content {
        margin-left: 20px;
      }
    }
    .sample {
      flex-wrap: wrap;
      margin: 20px 0;
      .sample-input {
        flex: 1 1 300px;
        margin: 10px;
        border: 1px solid #eee;
        border-radius: 4px;
        .title {
          margin: 0;
          padding: 8px;
          border-bottom: 1px solid #eee;
          background-color: #f8f8f8;
        }
        pre {
          margin: 0;
          padding: 8px;
          white-space: pre-wrap;
          word-wrap: break-word;
        }
      }
      .sample-output {
        flex: 1 1 300px;
        margin: 10px;
        border: 1px solid #eee;
        border-radius: 4px;
        .title {
          margin: 0;
          padding: 8px;
          border-bottom: 1px solid #eee;
          background-color: #f8f8f8;
        }
        pre {
          margin: 0;
          padding: 8px;
          white-space: pre-wrap;
          word-wrap: break-word;
        }
      }
    }
  }
  #right-column {
    flex: none;
    width: 300px;
    #info {
      margin-bottom: 20px;
      .header {
        display: flex;
        align-items: center;
        .card-title {
          margin-left: 8px;
        }
      }
      ul {
        margin: 0;
        padding: 0;
        list-style: none;
        li {
          padding: 8px 0;
          border-bottom: 1px solid #eee;
          p {
            margin: 0;
            &:first-child {
              font-size: 14px;
              color: #999;
            }
            &:last-child {
              margin-top: 5px;
            }
          }
        }
      }
    }
    #pieChart {
      .echarts {
        width: 100%;
        height: 400px;
      }
      #detail {
        position: absolute;
        right: 10px;
        top: 10px;
      }
    }
  }
  #pieChart-detail {
    width: 700px;
    height: 400px;
  }
  .captcha-container {
    display: inline-block;
    .captcha-code {
      width: 110px;
      margin-left: 10px;
      vertical-align: middle;
    }
  }
  .fl-right {
    float: right;
  }
}
</style>

