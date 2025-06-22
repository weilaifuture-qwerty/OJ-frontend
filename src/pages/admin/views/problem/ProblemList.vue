<template>
  <div class="view">
    <Panel :title="contestId ? this.$i18n.t('m.Contest_Problem_List') : this.$i18n.t('m.Problem_List')">
      <div slot="header" style="display: flex; justify-content: space-between; align-items: center;">
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
      <el-table
        v-loading="loading"
        element-loading-text="Loading..."
        ref="table"
        :data="problemList"
        @row-dblclick="handleDblclick"
        style="width: 100%"
        :stripe="true"
        :border="true">
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
        addProblemDialogVisible: false
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
</style>
