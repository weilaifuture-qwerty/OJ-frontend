<template>
  <div class="problem">

    <Panel :title="title">
      <el-form ref="form" :model="problem" :rules="rules" label-position="top" label-width="70px">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item prop="_id" :label="$t('m.Display_ID')"
                          :required="this.routeName === 'create-contest-problem' || this.routeName === 'edit-contest-problem'">
              <el-input :placeholder="$t('m.Display_ID')" v-model="problem._id"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="18">
            <el-form-item prop="title" :label="$t('m.Title')" required>
              <el-input :placeholder="$t('m.Title')" v-model="problem.title"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item prop="description" :label="$t('m.Description')" required>
              <Simditor v-model="problem.description"></Simditor>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item prop="input_description" :label="$t('m.Input_Description')" required>
              <Simditor v-model="problem.input_description"></Simditor>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item prop="output_description" :label="$t('m.Output_Description')" required>
              <Simditor v-model="problem.output_description"></Simditor>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item :label="$t('m.Time_Limit') + ' (ms)' " required>
              <el-input type="Number" :placeholder="$t('m.Time_Limit')" v-model="problem.time_limit"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="$t('m.Memory_limit') + ' (MB)' " required>
              <el-input type="Number" :placeholder="$t('m.Memory_limit')" v-model="problem.memory_limit"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="$t('m.Difficulty')">
              <el-select class="difficulty-select" size="small" :placeholder="$t('m.Difficulty')" v-model="problem.difficulty">
                <el-option :label="$t('m.Low')" value="Low"></el-option>
                <el-option :label="$t('m.Mid')" value="Mid"></el-option>
                <el-option :label="$t('m.High')" value="High"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="4">
            <el-form-item :label="$t('m.Visible')">
              <el-switch
                v-model="problem.visible"
                active-text=""
                inactive-text="">
              </el-switch>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item :label="$t('m.ShareSubmission')">
              <el-switch
                v-model="problem.share_submission"
                active-text=""
                inactive-text="">
              </el-switch>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="$t('m.Tag')" :error="error.tags" required>
              <span class="tags">
                <el-tag
                  v-for="tag in problem.tags"
                  :closable="true"
                  :close-transition="false"
                  :key="tag"
                  type="success"
                  @close="closeTag(tag)"
                >{{tag}}</el-tag>
              </span>
              <AITagSuggestion 
                :problem="problem" 
                :existingTags="problem.tags"
                @add-tag="addTag"
                v-if="!inputVisible"
              />
              <el-autocomplete
                v-if="inputVisible"
                size="mini"
                class="input-new-tag"
                popper-class="problem-tag-poper"
                v-model="tagInput"
                :trigger-on-focus="false"
                @keyup.enter.native="addTag()"
                @select="handleTagSelect"
                :fetch-suggestions="querySearch">
              </el-autocomplete>
              <el-button class="button-new-tag" v-else size="small" @click="inputVisible = true">+ {{$t('m.New_Tag')}}</el-button>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="$t('m.Languages')" :error="error.languages" required>
              <el-checkbox-group v-model="problem.languages">
                <el-tooltip class="spj-radio" v-for="lang in allLanguage.languages" :key="'spj'+lang.name" effect="dark"
                            :content="lang.description" placement="top-start">
                  <el-checkbox :label="lang.name"></el-checkbox>
                </el-tooltip>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
        </el-row>
        <div>
          <el-form-item v-for="(sample, index) in problem.samples" :key="'sample'+index">
            <Accordion :title="'Sample' + (index + 1)">
              <el-button type="warning" size="small" icon="el-icon-delete" slot="header" @click="deleteSample(index)">
                Delete
              </el-button>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item :label="$t('m.Input_Samples')" required>
                    <el-input
                      :rows="5"
                      type="textarea"
                      :placeholder="$t('m.Input_Samples')"
                      v-model="sample.input">
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item :label="$t('m.Output_Samples')" required>
                    <el-input
                      :rows="5"
                      type="textarea"
                      :placeholder="$t('m.Output_Samples')"
                      v-model="sample.output">
                    </el-input>
                  </el-form-item>
                </el-col>
              </el-row>
            </Accordion>
          </el-form-item>
        </div>
        <div class="add-sample-btn">
          <button type="button" class="add-samples" @click="addSample()"><i class="el-icon-plus"></i>{{$t('m.Add_Sample')}}
          </button>
        </div>
        <el-form-item style="margin-top: 20px" :label="$t('m.Hint')">
          <Simditor v-model="problem.hint" placeholder=""></Simditor>
        </el-form-item>
        <el-form-item :label="$t('m.Code_Template')">
          <el-row>
            <el-col :span="24" v-for="(v, k) in template" :key="'template'+k">
              <el-form-item>
                <el-checkbox v-model="v.checked">{{ k }}</el-checkbox>
                <div v-if="v.checked">
                  <code-mirror v-model="v.code" :mode="v.mode"></code-mirror>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item :label="$t('m.Special_Judge')" :error="error.spj">
          <el-col :span="24">
            <el-checkbox v-model="problem.spj" @click.native.prevent="switchSpj()">{{$t('m.Use_Special_Judge')}}</el-checkbox>
          </el-col>
        </el-form-item>
        <el-form-item v-if="problem.spj">
          <Accordion :title="$t('m.Special_Judge_Code')">
            <template slot="header">
              <span>{{$t('m.SPJ_language')}}</span>
              <el-radio-group v-model="problem.spj_language">
                <el-tooltip class="spj-radio" v-for="lang in allLanguage.spj_languages" :key="lang.name" effect="dark"
                            :content="lang.description" placement="top-start">
                  <el-radio :label="lang.name">{{ lang.name }}</el-radio>
                </el-tooltip>
              </el-radio-group>
              <el-button type="primary" size="small" icon="el-icon-fa-random" @click="compileSPJ"
                         :loading="loadingCompile">
                {{$t('m.Compile')}}
              </el-button>
            </template>
            <code-mirror v-model="problem.spj_code" :mode="spjMode"></code-mirror>
          </Accordion>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="4">
            <el-form-item :label="$t('m.Type')">
              <el-radio-group v-model="problem.rule_type" :disabled="disableRuleType">
                <el-radio label="ACM">ACM</el-radio>
                <el-radio label="OI">OI</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('m.TestCase')" :error="error.testCase">
              <div class="test-case-section">
                <el-tabs v-model="testCaseTab" class="test-case-tabs">
                  <el-tab-pane label="Upload File" name="upload">
                    <el-upload
                      ref="testCaseUpload"
                      :action="testCaseUploadUrl"
                      name="file"
                      :data="{spj: problem.spj}"
                      :headers="uploadHeaders"
                      :show-file-list="true"
                      :on-success="uploadSucceeded"
                      :on-error="uploadFailed"
                      :before-upload="beforeUpload"
                      :auto-upload="true"
                      drag
                      class="test-case-upload">
                      <i class="el-icon-upload"></i>
                      <div class="el-upload__text">Drop file here or <em>click to upload</em></div>
                      <template #tip>
                        <div class="el-upload__tip">Supports zip, rar, 7z files</div>
                      </template>
                    </el-upload>
                  </el-tab-pane>
                  <el-tab-pane label="Create Manually" name="manual">
                    <div class="manual-test-cases">
                      <div class="test-case-actions">
                        <el-button size="small" @click="addTestCase" icon="el-icon-plus">Add Test Case</el-button>
                        <el-button size="small" @click="generateTestCaseFile" type="primary" icon="el-icon-download" :disabled="!manualTestCases.length">Generate File</el-button>
                        <el-dropdown @command="applyTestCaseTemplate" style="margin-left: 10px;">
                          <el-button size="small" type="text">
                            Templates <i class="el-icon-arrow-down el-icon--right"></i>
                          </el-button>
                          <template #dropdown>
                            <el-dropdown-menu>
                            <el-dropdown-item command="samples">Copy from Samples</el-dropdown-item>
                            <el-dropdown-item command="simple">Simple (Single Number)</el-dropdown-item>
                            <el-dropdown-item command="array">Array Input</el-dropdown-item>
                            <el-dropdown-item command="matrix">Matrix Input</el-dropdown-item>
                            <el-dropdown-item command="string">String Processing</el-dropdown-item>
                            </el-dropdown-menu>
                          </template>
                        </el-dropdown>
                      </div>
                      <div v-for="(testCase, index) in manualTestCases" :key="index" class="manual-test-case">
                        <div class="test-case-header">
                          <h4>Test Case {{index + 1}}</h4>
                          <el-button size="mini" type="danger" icon="el-icon-delete" circle @click="removeTestCase(index)"></el-button>
                        </div>
                        <el-row :gutter="20">
                          <el-col :span="12">
                            <label>Input:</label>
                            <el-input
                              type="textarea"
                              v-model="testCase.input"
                              :rows="3"
                              placeholder="Enter input data">
                            </el-input>
                          </el-col>
                          <el-col :span="12">
                            <label>Output:</label>
                            <el-input
                              type="textarea"
                              v-model="testCase.output"
                              :rows="3"
                              placeholder="Enter expected output">
                            </el-input>
                          </el-col>
                        </el-row>
                      </div>
                    </div>
                  </el-tab-pane>
                </el-tabs>
                <div v-if="testCaseUploaded && problem.test_case_id" style="margin-top: 10px; color: #67C23A;">
                  <i class="el-icon-success"></i> Test case uploaded (ID: {{problem.test_case_id}})
                  <el-button size="mini" type="text" @click="downloadTestCase" icon="el-icon-download">Download</el-button>
                </div>
                <div v-else-if="mode === 'edit'" style="margin-top: 10px; color: #F56C6C;">
                  <i class="el-icon-warning"></i> No test case uploaded
                </div>
              </div>
            </el-form-item>
          </el-col>

          <el-col :span="6">
            <el-form-item :label="$t('m.IOMode')">
              <el-radio-group v-model="problem.io_mode.io_mode">
                <el-radio label="Standard IO">Standard IO</el-radio>
                <el-radio label="File IO">File IO</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>

          <el-col :span="4" v-if="problem.io_mode.io_mode == 'File IO'">
            <el-form-item :label="$t('m.InputFileName')" required>
              <el-input type="text" v-model="problem.io_mode.input"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="4" v-if="problem.io_mode.io_mode == 'File IO'">
            <el-form-item :label="$t('m.OutputFileName')" required>
              <el-input type="text" v-model="problem.io_mode.output"></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-table
              :data="problem.test_case_score"
              style="width: 100%">
              <el-table-column
                prop="input_name"
                :label="$t('m.Input')">
              </el-table-column>
              <el-table-column
                prop="output_name"
                :label="$t('m.Output')">
              </el-table-column>
              <el-table-column
                prop="score"
                :label="$t('m.Score')">
                <template #default="scope">
                  <el-input
                    size="small"
                    :placeholder="$t('m.Score')"
                    v-model="scope.row.score"
                    :disabled="problem.rule_type !== 'OI'">
                  </el-input>
                </template>
              </el-table-column>
            </el-table>
          </el-col>
        </el-row>

        <el-form-item :label="$t('m.Source')">
          <el-input :placeholder="$t('m.Source')" v-model="problem.source"></el-input>
        </el-form-item>
        <save @click.native="submit()">Save</save>
      </el-form>
    </Panel>
  </div>
</template>

<script>
  import Simditor from '../../components/Simditor'
  import Accordion from '../../components/Accordion'
  import CodeMirror from '../../components/CodeMirror'
  import AITagSuggestion from '../../components/AITagSuggestion'
  import api from '../../api'

  export default {
    name: 'Problem',
    components: {
      Simditor,
      Accordion,
      AITagSuggestion,
      CodeMirror
    },
    data () {
      return {
        rules: {
          _id: {required: true, message: 'Display ID is required', trigger: 'blur'},
          title: {required: true, message: 'Title is required', trigger: 'blur'},
          description: {required: true, message: 'Description is required', trigger: 'blur', validator: (rule, value, callback) => {
            if (!value || value.trim() === '') {
              callback(new Error('Description cannot be empty'))
            } else {
              callback()
            }
          }},
          input_description: {required: true, message: 'Input Description is required', trigger: 'blur', validator: (rule, value, callback) => {
            if (!value || value.trim() === '') {
              callback(new Error('Input Description cannot be empty'))
            } else {
              callback()
            }
          }},
          output_description: {required: true, message: 'Output Description is required', trigger: 'blur', validator: (rule, value, callback) => {
            if (!value || value.trim() === '') {
              callback(new Error('Output Description cannot be empty'))
            } else {
              callback()
            }
          }}
        },
        loadingCompile: false,
        mode: '',
        contest: {},
        problem: {
          languages: [],
          io_mode: {'io_mode': 'Standard IO', 'input': 'input.txt', 'output': 'output.txt'}
        },
        reProblem: {
          languages: [],
          io_mode: {'io_mode': 'Standard IO', 'input': 'input.txt', 'output': 'output.txt'}
        },
        testCaseUploaded: false,
        allLanguage: {},
        inputVisible: false,
        tagInput: '',
        template: {},
        title: '',
        spjMode: '',
        disableRuleType: false,
        routeName: '',
        testCaseTab: 'upload',
        manualTestCases: [],
        error: {
          tags: '',
          spj: '',
          languages: '',
          testCase: ''
        }
      }
    },
    mounted () {
      this.routeName = this.$route.name
      if (this.routeName === 'edit-problem' || this.routeName === 'edit-contest-problem') {
        this.mode = 'edit'
      } else {
        this.mode = 'add'
      }
      api.getLanguages().then(res => {
        this.problem = this.reProblem = {
          _id: '',
          title: '',
          description: '',
          input_description: '',
          output_description: '',
          time_limit: 1000,
          memory_limit: 256,
          difficulty: 'Low',
          visible: true,
          share_submission: false,
          tags: [],
          languages: [],
          template: {},
          samples: [{input: '', output: ''}],
          spj: false,
          spj_language: '',
          spj_code: '',
          spj_compile_ok: false,
          test_case_id: '',
          test_case_score: [],
          rule_type: 'ACM',
          hint: '',
          source: '',
          io_mode: {'io_mode': 'Standard IO', 'input': 'input.txt', 'output': 'output.txt'}
        }
        let contestID = this.$route.params.contestId
        if (contestID) {
          this.problem.contest_id = this.reProblem.contest_id = contestID
          this.disableRuleType = true
          api.getContest(contestID).then(res => {
            this.problem.rule_type = this.reProblem.rule_type = res.data.data.rule_type
            this.contest = res.data.data
          })
        }

        this.problem.spj_language = 'C'

        let allLanguage = res.data.data
        this.allLanguage = allLanguage

        // get problem after getting languages list to avoid find undefined value in `watch problem.languages`
        if (this.mode === 'edit') {
          this.title = this.$i18n.t('m.Edit_Problem')
          let funcName = {'edit-problem': 'getProblem', 'edit-contest-problem': 'getContestProblem'}[this.routeName]
          api[funcName](this.$route.params.problemId).then(problemRes => {
            let data = problemRes.data.data
            console.log('Loaded problem data:', data)
            if (!data.spj_code) {
              data.spj_code = ''
            }
            data.spj_language = data.spj_language || 'C'
            // Ensure test_case_id and test_case_score are present
            if (!data.test_case_id) {
              data.test_case_id = ''
            }
            if (!data.test_case_score) {
              data.test_case_score = []
            }
            this.problem = data
            // Only set testCaseUploaded to true if test_case_id exists
            this.testCaseUploaded = !!data.test_case_id
            console.log('Test case uploaded status:', this.testCaseUploaded, 'Test case ID:', data.test_case_id)
          }).catch(err => {
            console.error('Failed to load problem:', err)
            this.$error('Failed to load problem data')
          })
        } else {
          this.title = this.$i18n.t('m.Add_Problem')
          for (let item of allLanguage.languages) {
            this.problem.languages.push(item.name)
          }
        }
      })
    },
    computed: {
      testCaseUploadUrl() {
        return '/api/admin/test_case'
      },
      uploadHeaders() {
        const csrfToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('csrftoken='))
          ?.split('=')[1]
        return {
          'X-CSRFToken': csrfToken || ''
        }
      }
    },
    watch: {
      '$route' () {
        this.$refs.form.resetFields()
        this.problem = this.reProblem
      },
      'problem.languages' (newVal) {
        let data = {}
        // use deep copy to avoid infinite loop
        let languages = JSON.parse(JSON.stringify(newVal)).sort()
        for (let item of languages) {
          if (this.template[item] === undefined) {
            let langConfig = this.allLanguage.languages.find(lang => {
              return lang.name === item
            })
            if (this.problem.template[item] === undefined) {
              data[item] = {checked: false, code: langConfig.config.template, mode: langConfig.content_type}
            } else {
              data[item] = {checked: true, code: this.problem.template[item], mode: langConfig.content_type}
            }
          } else {
            data[item] = this.template[item]
          }
        }
        this.template = data
      },
      'problem.spj_language' (newVal) {
        this.spjMode = this.allLanguage.spj_languages.find(item => {
          return item.name === this.problem.spj_language
        }).content_type
      }
    },
    methods: {
      switchSpj () {
        if (this.testCaseUploaded) {
          this.$confirm('If you change problem judge method, you need to re-upload test cases', 'Warning', {
            confirmButtonText: 'Yes',
            cancelButtonText: 'Cancel',
            type: 'warning'
          }).then(() => {
            this.problem.spj = !this.problem.spj
            this.resetTestCase()
          }).catch(() => {
          })
        } else {
          this.problem.spj = !this.problem.spj
        }
      },
      querySearch (queryString, cb) {
        api.getProblemTagList({ keyword: queryString }).then(res => {
          let tagList = []
          for (let tag of res.data.data) {
            tagList.push({value: tag.name})
          }
          cb(tagList)
        }).catch(() => {
        })
      },
      resetTestCase () {
        this.testCaseUploaded = false
        this.problem.test_case_score = []
        this.problem.test_case_id = ''
      },
      addTag (tagName) {
        // If tagName is provided (from AI suggestion), use it
        // Otherwise use the input value
        let tag = ''
        
        // Check if tagName is a string (not an event object)
        if (typeof tagName === 'string') {
          tag = tagName
        } else {
          tag = this.tagInput
        }
        
        // Trim whitespace and validate
        tag = tag.trim()
        
        if (tag && !this.problem.tags.includes(tag)) {
          this.problem.tags.push(tag)
        }
        this.inputVisible = false
        this.tagInput = ''
      },
      closeTag (tag) {
        this.problem.tags.splice(this.problem.tags.indexOf(tag), 1)
      },
      handleTagSelect (item) {
        // el-autocomplete passes an object with 'value' property
        if (item && item.value) {
          this.addTag(item.value)
        }
      },
      addSample () {
        this.problem.samples.push({input: '', output: ''})
      },
      deleteSample (index) {
        this.problem.samples.splice(index, 1)
      },
      uploadSucceeded (response, file, fileList) {
        console.log('Upload response:', response)
        if (response.error) {
          this.$error(response.data || 'Upload failed')
          return
        }
        if (!response.data || !response.data.id) {
          console.error('Invalid response structure:', response)
          this.$error('Invalid response from server - please check console for details')
          return
        }
        let testCaseList = response.data.info || []
        
        // Log test case info for debugging
        console.log('Test case list:', testCaseList)
        
        for (let testCase of testCaseList) {
          testCase.score = (100 / testCaseList.length).toFixed(0)
          if (!testCase.output_name && this.problem.spj) {
            testCase.output_name = '-'
          }
        }
        this.problem.test_case_score = testCaseList
        this.problem.test_case_id = response.data.id
        this.testCaseUploaded = true
        // Clear any previous error
        this.error.testCase = ''
        this.$success('Test case uploaded successfully')
        
        // Clear manual test cases after successful upload
        if (this.testCaseTab === 'manual') {
          this.manualTestCases = []
        }
      },
      uploadFailed (err, file, fileList) {
        console.error('Upload failed:', err)
        this.$error('Upload failed: ' + (err.message || 'Unknown error'))
      },
      beforeUpload (file) {
        console.log('Uploading file:', file.name)
        // Check file extension
        const allowedExtensions = ['.zip', '.rar', '.7z']
        const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
        if (!allowedExtensions.includes(extension)) {
          this.$error('Only zip, rar, and 7z files are allowed')
          return false
        }
        return true
      },
      addTestCase () {
        this.manualTestCases.push({
          input: '',
          output: ''
        })
      },
      removeTestCase (index) {
        this.manualTestCases.splice(index, 1)
      },
      async generateTestCaseFile () {
        if (!this.manualTestCases.length) {
          this.$error('Please add at least one test case')
          return
        }
        
        // Validate test cases
        for (let i = 0; i < this.manualTestCases.length; i++) {
          const tc = this.manualTestCases[i]
          // Trim to check if actually empty (not just whitespace)
          if (!tc.input || !tc.output || tc.input.trim() === '' || tc.output.trim() === '') {
            this.$error(`Test case ${i + 1} is incomplete`)
            return
          }
        }
        
        try {
          // Create a zip file with test cases
          console.log('Manual test cases:', this.manualTestCases)
          const JSZip = (await import('jszip')).default
          const zip = new JSZip()
          
          this.manualTestCases.forEach((tc, index) => {
            const num = (index + 1).toString()
            console.log(`Adding test case ${num}: input="${tc.input}", output="${tc.output}"`)
            // Use the content as-is, the backend will handle line endings
            zip.file(`${num}.in`, tc.input)
            zip.file(`${num}.out`, tc.output)
          })
          
          const content = await zip.generateAsync({type: 'blob'})
          
          // Create a File object
          const file = new File([content], 'test_cases.zip', {
            type: 'application/x-zip-compressed'
          })
          
          console.log('Generated zip file:', file)
          console.log('File size:', file.size)
          console.log('File type:', file.type)
          
          // Download the file to verify it's correct (optional debug step)
          if (false) { // Set to true to debug
            const url = URL.createObjectURL(file)
            const a = document.createElement('a')
            a.href = url
            a.download = 'test_cases_debug.zip'
            a.click()
            URL.revokeObjectURL(url)
          }
          
          // Use the el-upload component's upload mechanism
          // This ensures we use the exact same upload process as the normal file upload
          this.testCaseTab = 'upload'
          await this.$nextTick()
          
          // Get the upload component
          const uploadComponent = this.$refs.testCaseUpload
          if (uploadComponent) {
            // Clear any existing files
            uploadComponent.clearFiles()
            
            // Manually trigger the upload with our generated file
            const fileList = [{
              name: file.name,
              size: file.size,
              type: file.type,
              uid: Date.now(),
              raw: file,
              status: 'ready'
            }]
            
            // Call the upload method
            uploadComponent.handleStart(file)
            uploadComponent.submit()
            
            this.$message('Uploading generated test cases...')
          } else {
            // Fallback to manual upload if component ref not available
            this.manualUpload(file)
          }
        } catch (err) {
          this.$error('Failed to generate test case file: ' + err.message)
        }
      },
      
      manualUpload(file) {
        // Fallback manual upload method
        const formData = new FormData()
        formData.append('file', file)
        formData.append('spj', this.problem.spj)
        
        const xhr = new XMLHttpRequest()
        
        xhr.onload = () => {
          try {
            const response = JSON.parse(xhr.responseText)
            console.log('Manual upload response:', response)
            this.uploadSucceeded(response, file, [file])
          } catch (e) {
            this.$error('Invalid response from server')
          }
        }
        
        xhr.onerror = () => {
          this.$error('Upload failed')
        }
        
        xhr.open('POST', '/api/admin/test_case')
        
        const csrfToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('csrftoken='))
          ?.split('=')[1]
        
        if (csrfToken) {
          xhr.setRequestHeader('X-CSRFToken', csrfToken)
        }
        
        xhr.send(formData)
      },
      downloadTestCase () {
        if (this.problem.test_case_id) {
          window.open(`/admin/test_case?problem_id=${this.problem.id}`)
        }
      },
      loadSampleAsTestCase () {
        if (this.problem.samples && this.problem.samples.length > 0) {
          // Clear existing manual test cases
          this.manualTestCases = []
          
          // Copy each sample as a test case
          this.problem.samples.forEach(sample => {
            if (sample.input && sample.output) {
              this.manualTestCases.push({
                input: sample.input,
                output: sample.output
              })
            }
          })
          
          this.$success(`Loaded ${this.manualTestCases.length} test case(s) from samples`)
          this.testCaseTab = 'manual'
        }
      },
      applyTestCaseTemplate (command) {
        switch (command) {
          case 'samples':
            this.loadSampleAsTestCase()
            break
          
          case 'simple':
            // Template for simple number input/output problems
            this.manualTestCases = [
              { input: '5', output: '25' },
              { input: '10', output: '100' },
              { input: '0', output: '0' },
              { input: '-5', output: '25' },
              { input: '1000', output: '1000000' }
            ]
            this.$success('Applied simple number template (modify outputs as needed)')
            break
          
          case 'array':
            // Template for array input problems
            this.manualTestCases = [
              { 
                input: '5\n1 2 3 4 5', 
                output: '15' 
              },
              { 
                input: '3\n10 20 30', 
                output: '60' 
              },
              { 
                input: '1\n100', 
                output: '100' 
              },
              { 
                input: '4\n-1 -2 -3 -4', 
                output: '-10' 
              }
            ]
            this.$success('Applied array input template (modify as needed)')
            break
          
          case 'matrix':
            // Template for matrix input problems
            this.manualTestCases = [
              { 
                input: '2 2\n1 2\n3 4', 
                output: '10' 
              },
              { 
                input: '3 3\n1 0 0\n0 1 0\n0 0 1', 
                output: '3' 
              }
            ]
            this.$success('Applied matrix input template (modify as needed)')
            break
          
          case 'string':
            // Template for string processing problems
            this.manualTestCases = [
              { input: 'hello', output: 'HELLO' },
              { input: 'world', output: 'WORLD' },
              { input: 'Hello World', output: 'HELLO WORLD' },
              { input: '123abc', output: '123ABC' },
              { input: '', output: '' }
            ]
            this.$success('Applied string processing template (modify as needed)')
            break
        }
        
        this.testCaseTab = 'manual'
      },
      compileSPJ () {
        let data = {
          id: this.problem.id,
          spj_code: this.problem.spj_code,
          spj_language: this.problem.spj_language
        }
        this.loadingCompile = true
        api.compileSPJ(data).then(res => {
          this.loadingCompile = false
          this.problem.spj_compile_ok = true
          this.error.spj = ''
        }, err => {
          this.loadingCompile = false
          this.problem.spj_compile_ok = false
          const h = this.$createElement
          this.$msgbox({
            title: 'Compile Error',
            type: 'error',
            message: h('pre', err.data.data),
            showCancelButton: false,
            closeOnClickModal: false,
            customClass: 'dialog-compile-error'
          })
        })
      },
      submit () {
        if (!this.problem.samples.length) {
          this.$error('Sample is required')
          return
        }
        for (let sample of this.problem.samples) {
          if (!sample.input || !sample.output) {
            this.$error('Sample input and output is required')
            return
          }
        }
        if (!this.problem.tags.length) {
          this.error.tags = 'Please add at least one tag'
          this.$error(this.error.tags)
          return
        }
        if (this.problem.spj) {
          if (!this.problem.spj_code) {
            this.error.spj = 'Spj code is required'
            this.$error(this.error.spj)
          } else if (!this.problem.spj_compile_ok) {
            this.error.spj = 'SPJ code has not been successfully compiled'
          }
          if (this.error.spj) {
            this.$error(this.error.spj)
            return
          }
        }
        if (!this.problem.languages.length) {
          this.error.languages = 'Please choose at least one language for problem'
          this.$error(this.error.languages)
          return
        }
        if (!this.testCaseUploaded || !this.problem.test_case_id) {
          this.error.testCase = 'Test case is not uploaded yet'
          this.$error(this.error.testCase)
          return
        }
        if (this.problem.rule_type === 'OI') {
          for (let item of this.problem.test_case_score) {
            try {
              if (parseInt(item.score) <= 0) {
                this.$error('Invalid test case score')
                return
              }
            } catch (e) {
              this.$error('Test case score must be an integer')
              return
            }
          }
        }
        this.problem.languages = this.problem.languages.sort()
        this.problem.template = {}
        for (let k in this.template) {
          if (this.template[k].checked) {
            this.problem.template[k] = this.template[k].code
          }
        }
        let funcName = {
          'create-problem': 'createProblem',
          'edit-problem': 'editProblem',
          'create-contest-problem': 'createContestProblem',
          'edit-contest-problem': 'editContestProblem'
        }[this.routeName]
        // edit contest problem 时, contest_id会被后来的请求覆盖掉
        if (funcName === 'editContestProblem') {
          this.problem.contest_id = this.contest.id
        }
        console.log('Submitting problem data:', this.problem)
        console.log('Test case ID:', this.problem.test_case_id)
        console.log('Test case scores:', this.problem.test_case_score)
        api[funcName](this.problem).then(res => {
          if (this.routeName === 'create-contest-problem' || this.routeName === 'edit-contest-problem') {
            this.$router.push({name: 'contest-problem-list', params: {contestId: this.$route.params.contestId}})
          } else {
            this.$router.push({name: 'problem-list'})
          }
        }).catch(err => {
          console.error('Failed to save problem:', err)
        })
      }
    }
  }
</script>

<style lang="less" scoped>
  .problem {
    .difficulty-select {
      width: 120px;
    }
    .spj-radio {
      margin-left: 10px;
      &:last-child {
        margin-right: 20px;
      }
    }
    .input-new-tag {
      width: 78px;
    }
    .button-new-tag {
      height: 24px;
      line-height: 22px;
      padding-top: 0;
      padding-bottom: 0;
    }
    .tags {
      .el-tag {
        margin-right: 10px;
      }
    }
    .accordion {
      margin-bottom: 10px;
    }
    .add-samples {
      width: 100%;
      background-color: #fff;
      border: 1px dashed #aaa;
      outline: none;
      cursor: pointer;
      color: #666;
      height: 35px;
      font-size: 14px;
      &:hover {
        background-color: #f9fafc;
      }
      i {
        margin-right: 10px;
      }
    }
    .add-sample-btn {
      margin-bottom: 10px;
    }

  }
  .test-case-section {
    width: 100%;
    
    .test-case-tabs {
      margin-top: 10px;
    }
    
    .test-case-upload {
      width: 100%;
      
      /deep/ .el-upload-dragger {
        width: 100%;
        height: 120px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        
        .el-icon-upload {
          font-size: 40px;
          color: #C0C4CC;
          margin-bottom: 10px;
        }
      }
    }
    
    .manual-test-cases {
      max-height: 400px;
      overflow-y: auto;
      
      .test-case-actions {
        margin-bottom: 15px;
        display: flex;
        gap: 10px;
      }
      
      .manual-test-case {
        background: #f5f7fa;
        padding: 15px;
        margin-bottom: 15px;
        border-radius: 4px;
        border: 1px solid #e4e7ed;
        
        .test-case-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          
          h4 {
            margin: 0;
            font-size: 14px;
            font-weight: 600;
          }
        }
        
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
          font-size: 13px;
          color: #606266;
        }
      }
    }
  }
</style>

<style>
  .problem-tag-poper {
    width: 200px !important;
  }
  .dialog-compile-error {
    width: auto;
    max-width: 80%;
    overflow-x: scroll;
  }
</style>

