<template>
  <div class="view">
    <!-- Problem List Tab -->
    <el-tabs v-if="!contestId" v-model="activeTab" type="card" class="problem-tabs">
      <el-tab-pane label="Problem List" name="list">
        <Panel :title="contestId ? this.$i18n.t('m.Contest_Problem_List') : this.$i18n.t('m.Problem_List')">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <el-input
                v-model="keyword"
                prefix-icon="el-icon-search"
                placeholder="Search by title, ID, or author..."
                style="width: 300px;"
                @input="getProblemList(1)"
                clearable>
              </el-input>
              <div style="font-size: 14px; color: #909399;">
                Total: <span style="font-weight: 600; color: #409EFF;">{{ total }}</span> problems
              </div>
            </div>
          </template>
      <el-table
        v-loading="loading"
        element-loading-text="Loading..."
        ref="table"
        :data="problemList"
        @row-dblclick="handleDblclick"
        @selection-change="handleSelectionChange"
        style="width: 100%"
        :stripe="true"
        :border="true">
        <el-table-column
          type="selection"
          width="55"
          align="center">
        </el-table-column>
        <el-table-column
          width="80"
          prop="id"
          label="ID"
          align="center">
        </el-table-column>
        <el-table-column
          width="120"
          label="Display ID"
          align="center">
          <template #default="{row}">
            <span v-show="!row.isEditing" style="font-weight: 600; color: #409EFF;">{{row._id}}</span>
            <el-input v-show="row.isEditing" v-model="row._id"
                      size="small"
                      @keyup.enter.native="handleInlineEdit(row)">
            </el-input>
          </template>
        </el-table-column>
        <el-table-column
          prop="title"
          label="Title"
          min-width="200">
          <template #default="{row}">
            <span v-show="!row.isEditing" style="font-weight: 500;">{{row.title}}</span>
            <el-input v-show="row.isEditing" v-model="row.title"
                      size="small"
                      @keyup.enter.native="handleInlineEdit(row)">
            </el-input>
          </template>
        </el-table-column>
        <el-table-column
          prop="created_by.username"
          label="Author"
          width="120"
          align="center">
        </el-table-column>
        <el-table-column
          width="180"
          prop="create_time"
          label="Created"
          align="center">
          <template #default="scope">
            {{$filters.localtime(scope.row.create_time)}}
          </template>
        </el-table-column>
        <el-table-column
          width="80"
          prop="visible"
          label="Visible"
          align="center">
          <template #default="scope">
            <el-switch v-model="scope.row.visible"
                       active-text=""
                       inactive-text=""
                       @change="updateProblem(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column
          fixed="right"
          label="Actions"
          width="280"
          align="center">
          <template #default="scope">
            <div style="display: flex; justify-content: center; gap: 8px;">
              <el-button type="primary" size="small" link
                         @click="goEdit(scope.row.id)">Edit</el-button>
              <el-button v-if="contestId" type="info" size="small" link
                         @click="makeContestProblemPublic(scope.row.id)">Public</el-button>
              <el-button type="warning" size="small" link
                         @click="downloadTestCase(scope.row.id)">Download</el-button>
              <el-button type="danger" size="small" link
                         @click="deleteProblem(scope.row.id)">Delete</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="panel-options" style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px;">
        <div>
          <el-button type="primary" size="default"
                     @click="goCreateProblem" icon="el-icon-plus">Create Problem
          </el-button>
          <el-button v-if="contestId" type="success"
                     size="default" icon="el-icon-document-add"
                     @click="addProblemDialogVisible = true">Add From Public
          </el-button>
          <el-button v-if="selectedProblems.length > 0" type="warning" size="default"
                     @click="exportProblems" icon="el-icon-download">Export Selected ({{ selectedProblems.length }})
          </el-button>
        </div>
        <el-pagination
          class="page"
          layout="total, prev, pager, next, jumper"
          @current-change="currentChange"
          :page-size="pageSize"
          :current-page="currentPage"
          :total="total">
        </el-pagination>
      </div>
    </Panel>
      </el-tab-pane>
      
      <!-- Import/Export Tab -->
      <el-tab-pane label="Import/Export" name="import-export" v-if="!contestId">
        <div class="import-export-container">
          <!-- Export Section -->
          <Panel title="Export Problems" class="export-panel">
            <el-alert
              title="Export Instructions"
              type="info"
              description="Select problems from the Problem List tab to export them. You can export multiple problems at once."
              show-icon
              :closable="false"
              style="margin-bottom: 20px;">
            </el-alert>
            <div v-if="selectedProblems.length > 0" class="selected-problems">
              <h4>Selected Problems for Export ({{ selectedProblems.length }}):</h4>
              <el-tag
                v-for="problem in selectedProblems"
                :key="problem.id"
                closable
                @close="removeFromSelection(problem)"
                style="margin: 0 10px 10px 0;">
                {{ problem._id }} - {{ problem.title }}
              </el-tag>
              <div style="margin-top: 20px;">
                <el-button type="primary" @click="exportProblems" icon="el-icon-download">
                  Export {{ selectedProblems.length }} Problem{{ selectedProblems.length > 1 ? 's' : '' }}
                </el-button>
              </div>
            </div>
            <div v-else>
              <p style="color: #909399;">No problems selected. Go to the Problem List tab and select problems to export.</p>
            </div>
          </Panel>
          
          <!-- Import QDUOJ Section -->
          <Panel title="Import QDUOJ Problems" class="import-panel">
            <el-upload
              ref="QDU"
              action="/api/admin/import_problem"
              name="file"
              :file-list="fileListQDU"
              :show-file-list="true"
              :with-credentials="true"
              :limit="1"
              :on-change="onFileQDUChange"
              :auto-upload="false"
              :on-success="uploadSucceeded"
              :on-error="uploadFailed"
              :before-upload="beforeUpload">
              <template #trigger>
                <el-button size="small" type="primary" icon="el-icon-upload">Choose File</el-button>
              </template>
              <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload('QDU')" 
                         :disabled="!fileListQDU.length">Upload</el-button>
              <template #tip>
                <div class="el-upload__tip">Upload QDUOJ format problem files</div>
              </template>
            </el-upload>
          </Panel>
          
          <!-- Import FPS Section -->
          <Panel title="Import FPS Problems" class="import-panel">
            <el-upload
              ref="FPS"
              action="/api/admin/import_fps"
              name="file"
              :file-list="fileListFPS"
              :show-file-list="true"
              :with-credentials="true"
              :limit="1"
              :on-change="onFileFPSChange"
              :auto-upload="false"
              :on-success="uploadSucceeded"
              :on-error="uploadFailed"
              :before-upload="beforeUpload">
              <template #trigger>
                <el-button size="small" type="primary" icon="el-icon-upload">Choose File</el-button>
              </template>
              <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload('FPS')" 
                         :disabled="!fileListFPS.length">Upload</el-button>
              <template #tip>
                <div class="el-upload__tip">Upload FPS (Free Problem Set) format files</div>
              </template>
            </el-upload>
          </Panel>
        </div>
      </el-tab-pane>
    </el-tabs>
    
    <!-- For contest problems, show without tabs -->
    <Panel v-if="contestId" :title="contestId ? this.$i18n.t('m.Contest_Problem_List') : this.$i18n.t('m.Problem_List')">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <el-input
            v-model="keyword"
            prefix-icon="el-icon-search"
            placeholder="Search by title, ID, or author..."
            style="width: 300px;"
            @input="getProblemList(1)"
            clearable>
          </el-input>
          <div style="font-size: 14px; color: #909399;">
            Total: <span style="font-weight: 600; color: #409EFF;">{{ total }}</span> problems
          </div>
        </div>
      </template>
      <el-table
        v-loading="loading"
        element-loading-text="Loading..."
        ref="table"
        :data="problemList"
        @row-dblclick="handleDblclick"
        @selection-change="handleSelectionChange"
        style="width: 100%"
        :stripe="true"
        :border="true">
        <el-table-column
          type="selection"
          width="55"
          align="center">
        </el-table-column>
        <el-table-column
          width="80"
          prop="id"
          label="ID"
          align="center">
        </el-table-column>
        <el-table-column
          width="120"
          label="Display ID"
          align="center">
          <template #default="{row}">
            <span v-show="!row.isEditing" style="font-weight: 600; color: #409EFF;">{{row._id}}</span>
            <el-input v-show="row.isEditing" v-model="row._id"
                      size="small"
                      @keyup.enter.native="handleInlineEdit(row)">
            </el-input>
          </template>
        </el-table-column>
        <el-table-column
          prop="title"
          label="Title"
          min-width="200">
          <template #default="{row}">
            <span v-show="!row.isEditing" style="font-weight: 500;">{{row.title}}</span>
            <el-input v-show="row.isEditing" v-model="row.title"
                      size="small"
                      @keyup.enter.native="handleInlineEdit(row)">
            </el-input>
          </template>
        </el-table-column>
        <el-table-column
          prop="created_by.username"
          label="Author"
          width="120"
          align="center">
        </el-table-column>
        <el-table-column
          width="180"
          prop="create_time"
          label="Created"
          align="center">
          <template #default="scope">
            {{$filters.localtime(scope.row.create_time)}}
          </template>
        </el-table-column>
        <el-table-column
          width="80"
          prop="visible"
          label="Visible"
          align="center">
          <template #default="scope">
            <el-switch v-model="scope.row.visible"
                       active-text=""
                       inactive-text=""
                       @change="updateProblem(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column
          fixed="right"
          label="Actions"
          width="280"
          align="center">
          <template #default="scope">
            <div style="display: flex; justify-content: center; gap: 8px;">
              <el-button type="primary" size="small" link
                         @click="goEdit(scope.row.id)">Edit</el-button>
              <el-button v-if="contestId" type="info" size="small" link
                         @click="makeContestProblemPublic(scope.row.id)">Public</el-button>
              <el-button type="warning" size="small" link
                         @click="downloadTestCase(scope.row.id)">Download</el-button>
              <el-button type="danger" size="small" link
                         @click="deleteProblem(scope.row.id)">Delete</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="panel-options" style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px;">
        <div>
          <el-button type="primary" size="default"
                     @click="goCreateProblem" icon="el-icon-plus">Create Problem
          </el-button>
          <el-button v-if="contestId" type="success"
                     size="default" icon="el-icon-document-add"
                     @click="addProblemDialogVisible = true">Add From Public
          </el-button>
          <el-button v-if="selectedProblems.length > 0" type="warning" size="default"
                     @click="exportProblems" icon="el-icon-download">Export Selected ({{ selectedProblems.length }})
          </el-button>
        </div>
        <el-pagination
          class="page"
          layout="total, prev, pager, next, jumper"
          @current-change="currentChange"
          :page-size="pageSize"
          :current-page="currentPage"
          :total="total">
        </el-pagination>
      </div>
    </Panel>
    <el-dialog title="Sure to update the problem? "
               width="20%"
               v-model="InlineEditDialogVisible"
               :close-on-click-modal="false">
      <div>
        <p>DisplayID: {{currentRow._id}}</p>
        <p>Title: {{currentRow.title}}</p>
      </div>
      <template #footer>
        <cancel @click.native="InlineEditDialogVisible = false; getProblemList(currentPage)"></cancel>
        <save @click.native="updateProblem(currentRow)"></save>
      </template>
    </el-dialog>
    <el-dialog title="Add Contest Problem"
               v-if="contestId"
               width="80%"
               v-model="addProblemDialogVisible"
               :close-on-click-modal="false">
      <add-problem-component :contestID="contestId" @on-change="getProblemList"></add-problem-component>
    </el-dialog>
  </div>
</template>

<script>
  import api from '../../api.js'
  import utils from '@/utils/utils'
  import Panel from '../../components/Panel.vue'
  import AddProblemComponent from './AddPublicProblem.vue'
  import IconBtn from '../../components/btn/IconBtn.vue'
  import Cancel from '../../components/btn/Cancel.vue'
  import Save from '../../components/btn/Save.vue'

  export default {
    name: 'ProblemList',
    components: {
      Panel,
      AddProblemComponent,
      IconBtn,
      Cancel,
      Save
    },
    data () {
      return {
        pageSize: 10,
        total: 0,
        problemList: [],
        keyword: '',
        loading: false,
        currentPage: 1,
        routeName: '',
        contestId: '',
        // for make public use
        currentProblemID: '',
        currentRow: {},
        InlineEditDialogVisible: false,
        makePublicDialogVisible: false,
        addProblemDialogVisible: false,
        activeTab: 'list',
        selectedProblems: [],
        fileListQDU: [],
        fileListFPS: []
      }
    },
    mounted () {
      this.routeName = this.$route.name
      this.contestId = this.$route.params.contestId
      this.getProblemList(this.currentPage)
    },
    methods: {
      handleDblclick (row) {
        row.isEditing = true
      },
      goEdit (problemId) {
        if (this.routeName === 'problem-list') {
          this.$router.push({name: 'edit-problem', params: {problemId}})
        } else if (this.routeName === 'contest-problem-list') {
          this.$router.push({name: 'edit-contest-problem', params: {problemId: problemId, contestId: this.contestId}})
        }
      },
      goCreateProblem () {
        if (this.routeName === 'problem-list') {
          this.$router.push({name: 'create-problem'})
        } else if (this.routeName === 'contest-problem-list') {
          this.$router.push({name: 'create-contest-problem', params: {contestId: this.contestId}})
        }
      },
      // 切换页码回调
      currentChange (page) {
        this.currentPage = page
        this.getProblemList(page)
      },
      getProblemList (page = 1) {
        this.loading = true
        let funcName = this.routeName === 'problem-list' ? 'getProblemList' : 'getContestProblemList'
        let params = {
          limit: this.pageSize,
          offset: (page - 1) * this.pageSize,
          keyword: this.keyword,
          contest_id: this.contestId
        }
        console.log('Loading problems with:', { funcName, params, routeName: this.routeName })
        api[funcName](params).then(res => {
          this.loading = false
          this.total = res.data.data.total
          for (let problem of res.data.data.results) {
            problem.isEditing = false
          }
          this.problemList = res.data.data.results
        }, err => {
          this.loading = false
          console.error('Failed to load problem list:', err)
          this.$message.error('Failed to load problems: ' + (err.message || 'Unknown error'))
        })
      },
      deleteProblem (id) {
        this.$confirm('Sure to delete this problem? The associated submissions will be deleted as well.', 'Delete Problem', {
          type: 'warning'
        }).then(() => {
          let funcName = this.routeName === 'problem-list' ? 'deleteProblem' : 'deleteContestProblem'
          api[funcName](id).then(() => [
            this.getProblemList(this.currentPage - 1)
          ]).catch(() => {
          })
        }, () => {
        })
      },
      makeContestProblemPublic (problemID) {
        this.$prompt('Please input display id for the public problem', 'confirm').then(({value}) => {
          api.makeContestProblemPublic({id: problemID, display_id: value}).catch()
        }, () => {
        })
      },
      updateProblem (row) {
        let data = Object.assign({}, row)
        let funcName = ''
        if (this.contestId) {
          data.contest_id = this.contestId
          funcName = 'editContestProblem'
        } else {
          funcName = 'editProblem'
        }
        api[funcName](data).then(res => {
          this.InlineEditDialogVisible = false
          this.getProblemList(this.currentPage)
        }).catch(() => {
          this.InlineEditDialogVisible = false
        })
      },
      handleInlineEdit (row) {
        this.currentRow = row
        this.InlineEditDialogVisible = true
      },
      downloadTestCase (problemID) {
        let url = '/admin/test_case?problem_id=' + problemID
        utils.downloadFile(url)
      },
      getPublicProblem () {
        api.getProblemList()
      },
      handleSelectionChange (val) {
        this.selectedProblems = val
      },
      removeFromSelection (problem) {
        const index = this.selectedProblems.findIndex(p => p.id === problem.id)
        if (index > -1) {
          this.selectedProblems.splice(index, 1)
          this.$refs.table.toggleRowSelection(problem, false)
        }
      },
      exportProblems () {
        let params = []
        for (let p of this.selectedProblems) {
          params.push('problem_id=' + p.id)
        }
        let url = '/admin/export_problem?' + params.join('&')
        utils.downloadFile(url)
        this.$message.success(`Exporting ${this.selectedProblems.length} problem(s)...`)
      },
      submitUpload (ref) {
        this.$refs[ref].submit()
      },
      onFileQDUChange (file, fileList) {
        this.fileListQDU = fileList.slice(-1)
      },
      onFileFPSChange (file, fileList) {
        this.fileListFPS = fileList.slice(-1)
      },
      beforeUpload (file) {
        // Add file validation if needed
        return true
      },
      uploadSucceeded (response) {
        if (response.error) {
          this.$error(response.data)
        } else {
          this.$success('Successfully imported ' + response.data.import_count + ' problems')
          this.getProblemList()
          // Clear file lists
          this.fileListQDU = []
          this.fileListFPS = []
        }
      },
      uploadFailed () {
        this.$error('Upload failed')
      }
    },
    watch: {
      '$route' (newVal, oldVal) {
        this.contestId = newVal.params.contestId
        this.routeName = newVal.name
        this.getProblemList(this.currentPage)
      },
      'keyword' () {
        this.currentChange(1)
      }
    }
  }
</script>

<style scoped lang="less">
.problem-tabs {
  ::v-deep .el-tabs__header {
    margin-bottom: 0;
  }
  
  ::v-deep .el-tabs__content {
    padding: 0;
  }
}

.import-export-container {
  display: grid;
  gap: 20px;
  
  .export-panel {
    ::v-deep .ivu-card-body {
      padding: 25px;
    }
    
    .selected-problems {
      h4 {
        margin-bottom: 15px;
        color: #303133;
      }
    }
  }
  
  .import-panel {
    ::v-deep .ivu-card-body {
      padding: 25px;
    }
    
    ::v-deep .el-upload {
      width: 100%;
      
      .el-upload__tip {
        margin-top: 10px;
        color: #909399;
      }
    }
  }
}
</style>
