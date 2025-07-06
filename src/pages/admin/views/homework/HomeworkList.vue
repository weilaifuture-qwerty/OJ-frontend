<template>
  <div class="homework-list">
    <!-- Modern Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">
            <i class="el-icon-notebook-2"></i>
            Homework Management
          </h1>
          <p class="page-subtitle">Create and manage homework assignments for students</p>
        </div>
        <div class="stats-section">
          <div class="stat-card">
            <div class="stat-value">{{ total }}</div>
            <div class="stat-label">Total Assignments</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ activeCount }}</div>
            <div class="stat-label">Active</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ completedCount }}</div>
            <div class="stat-label">Completed</div>
          </div>
        </div>
      </div>
    </div>
    
    <Panel :title="$t('m.Homework_Management')" v-if="!showCreateForm">
      
      <!-- Action Bar -->
      <div class="action-bar">
        <div class="action-left">
          <el-button 
            type="primary" 
            size="large"
            @click="showCreateForm = true" 
            icon="el-icon-plus">
            Create New Homework
          </el-button>
        </div>
        <div class="action-right">
          <el-select
            v-model="filterStatus"
            placeholder="Filter by Status"
            size="large"
            clearable
            @change="loadHomeworkList"
            style="width: 180px; margin-right: 15px;"
          >
            <el-option label="All Status" value=""></el-option>
            <el-option label="Active" value="active">
              <span style="display: flex; align-items: center;">
                <span style="width: 8px; height: 8px; background: #67c23a; border-radius: 50%; margin-right: 8px;"></span>
                Active
              </span>
            </el-option>
            <el-option label="Ended" value="ended">
              <span style="display: flex; align-items: center;">
                <span style="width: 8px; height: 8px; background: #909399; border-radius: 50%; margin-right: 8px;"></span>
                Ended
              </span>
            </el-option>
          </el-select>
          <el-input
            v-model="searchKeyword"
            placeholder="Search by title or description..."
            prefix-icon="el-icon-search"
            size="large"
            clearable
            @keyup.enter.native="loadHomeworkList"
            style="width: 300px;"
          >
          </el-input>
        </div>
      </div>
      
      <!-- Homework Table -->
      <el-table
        :data="homeworkList"
        v-loading="loading"
        style="width: 100%"
        class="modern-table"
        :row-class-name="getRowClassName"
      >
        <el-table-column
          prop="title"
          label="Assignment"
          min-width="300"
        >
          <template #default="scope">
            <div class="homework-info">
              <router-link
                :to="{ name: 'admin-homework-detail', params: { id: scope.row.id } }"
                class="homework-title"
              >
                {{ scope.row.title }}
              </router-link>
              <div class="homework-meta">
                <span class="meta-item">
                  <i class="el-icon-document"></i>
                  {{ scope.row.problem_count || 0 }} problems
                </span>
                <span class="meta-item">
                  <i class="el-icon-user"></i>
                  {{ scope.row.assigned_count || 0 }} students
                </span>
                <span class="meta-item" v-if="scope.row.description">
                  <el-tooltip :content="scope.row.description" placement="top">
                    <i class="el-icon-info"></i>
                  </el-tooltip>
                </span>
              </div>
            </div>
          </template>
        </el-table-column>
        
        
        <el-table-column
          prop="due_date"
          label="Due Date"
          width="200"
        >
          <template #default="scope">
            <div class="due-date-cell">
              <i :class="isOverdue(scope.row.due_date) ? 'el-icon-warning' : 'el-icon-time'"
                 :style="{ color: isOverdue(scope.row.due_date) ? '#f56c6c' : '#909399' }"></i>
              <span :class="{ 'overdue': isOverdue(scope.row.due_date) }">
                {{ formatDate(scope.row.due_date) }}
              </span>
              <el-tag 
                v-if="getDaysUntilDue(scope.row.due_date) >= 0 && getDaysUntilDue(scope.row.due_date) <= 3"
                type="warning" 
                size="mini" 
                style="margin-left: 8px;">
                {{ getDaysUntilDue(scope.row.due_date) }} days left
              </el-tag>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column
          prop="status"
          label="Status"
          width="120"
          align="center"
        >
          <template #default="scope">
            <el-tag 
              :type="getStatusType(scope.row)"
              effect="dark">
              <span style="display: flex; align-items: center; gap: 4px;">
                <span 
                  style="width: 6px; height: 6px; border-radius: 50%;"
                  :style="{ background: getStatusType(scope.row) === 'success' ? '#fff' : getStatusType(scope.row) === 'info' ? '#fff' : '#fff' }"
                ></span>
                {{ getStatusText(scope.row) }}
              </span>
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column
          prop="completion_rate"
          label="Progress"
          width="180"
          align="center"
        >
          <template #default="scope">
            <div class="progress-cell">
              <el-progress
                :percentage="scope.row.completion_rate || 0"
                :status="scope.row.completion_rate === 100 ? 'success' : ''"
                :stroke-width="8"
              />
              <span class="progress-text">{{ scope.row.completed_count || 0 }}/{{ scope.row.assigned_count || 0 }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column
          label="Actions"
          width="200"
          align="center"
          fixed="right"
        >
          <template #default="scope">
            <div class="action-buttons">
              <el-tooltip content="View Details" placement="top">
                <el-button
                  type="primary"
                  size="small"
                  circle
                  @click="viewDetails(scope.row)"
                >
                  <i class="el-icon-view"></i>
                </el-button>
              </el-tooltip>
              <el-tooltip content="Edit" placement="top">
                <el-button
                  type="warning"
                  size="small"
                  circle
                  @click="editHomework(scope.row)"
                >
                  <i class="el-icon-edit"></i>
                </el-button>
              </el-tooltip>
              <el-tooltip content="View Progress" placement="top">
                <el-button
                  type="success"
                  size="small"
                  circle
                  @click="viewProgress(scope.row)"
                >
                  <i class="el-icon-data-line"></i>
                </el-button>
              </el-tooltip>
              <el-popconfirm
                title="Are you sure you want to delete this homework?"
                @confirm="deleteHomework(scope.row)"
              >
                <template #reference>
                  <el-tooltip content="Delete" placement="top">
                    <el-button 
                      type="danger" 
                      size="small" 
                      circle>
                      <i class="el-icon-delete"></i>
                    </el-button>
                  </el-tooltip>
                </template>
              </el-popconfirm>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- Pagination -->
      <div class="pagination">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 50]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next"
          :total="total"
        />
      </div>
    </Panel>
    
    <!-- Create Homework Form -->
    <Panel :title="isEditing ? 'Edit Homework' : 'Create New Homework'" v-else>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
          <span>{{ isEditing ? 'Edit Homework' : 'Create New Homework' }}</span>
          <el-button 
            type="text" 
            @click="cancelCreate"
            style="padding: 0;">
            <i class="el-icon-close" style="font-size: 18px;"></i>
          </el-button>
        </div>
      </template>
      
      <el-form
        ref="homeworkForm"
        :model="homework"
        :rules="rules"
        label-width="150px"
        class="homework-form"
      >
        <!-- Basic Information -->
        <el-card class="form-section">
          <div class="section-header">
            <i class="el-icon-document"></i>
            <span>Basic Information</span>
          </div>
          
          <el-form-item label="Title" prop="title">
            <el-input
              v-model="homework.title"
              placeholder="Enter homework title"
              maxlength="100"
              show-word-limit
            />
          </el-form-item>
          
          <el-form-item label="Description">
            <el-input
              type="textarea"
              v-model="homework.description"
              placeholder="Enter homework description (optional)"
              :rows="4"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
          
          <el-form-item label="Due Date" prop="due_date">
            <el-date-picker
              v-model="homework.due_date"
              type="datetime"
              placeholder="Select due date and time"
              :disabled-date="disabledDate"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DDTHH:mm:ss"
              style="width: 100%;"
            />
          </el-form-item>
        </el-card>
        
        <!-- Quick Actions for Problem and Student Selection -->
        <div class="quick-actions">
          <el-card class="action-card" @click.native="showProblemSelector = true">
            <div class="action-icon">
              <i class="el-icon-collection"></i>
            </div>
            <div class="action-content">
              <h4>Add Problems</h4>
              <p>{{ homework.problems.length }} problems selected</p>
            </div>
            <i class="el-icon-arrow-right"></i>
          </el-card>
          
          <el-card class="action-card" @click.native="showStudentSelector = true">
            <div class="action-icon">
              <i class="el-icon-user"></i>
            </div>
            <div class="action-content">
              <h4>Assign Students</h4>
              <p>{{ homework.student_ids.length }} students selected</p>
            </div>
            <i class="el-icon-arrow-right"></i>
          </el-card>
        </div>
        
        <!-- Selected Problems Preview -->
        <el-card class="form-section" v-if="homework.problems.length > 0">
          <div class="section-header">
            <i class="el-icon-collection"></i>
            <span>Selected Problems ({{ homework.problems.length }})</span>
          </div>
          
          <el-table
            :data="homework.problems"
            style="width: 100%"
          >
            <el-table-column type="index" label="#" width="50" />
            <el-table-column prop="_id" label="ID" width="100" />
            <el-table-column prop="title" label="Title" min-width="200" />
            <el-table-column prop="difficulty" label="Difficulty" width="100">
              <template #default="scope">
                <el-tag
                  :type="scope.row.difficulty === 'Low' ? 'success' : scope.row.difficulty === 'Mid' ? 'warning' : 'danger'"
                  size="small"
                >
                  {{ scope.row.difficulty }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="Actions" width="80" align="center">
              <template #default="scope">
                <el-button
                  type="text"
                  size="small"
                  @click="removeProblem(scope.$index)"
                  style="color: #f56c6c;"
                >
                  Remove
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
        
        <!-- Form Actions -->
        <div class="form-actions">
          <el-button size="large" @click="cancelCreate">Cancel</el-button>
          <el-button type="primary" size="large" @click="saveHomework" :loading="saving">
            {{ isEditing ? 'Update Homework' : 'Create Homework' }}
          </el-button>
        </div>
      </el-form>
    </Panel>
    
    <!-- Problem Selector Dialog -->
    <el-dialog
      title="Select Problems"
      v-model="showProblemSelector"
      width="80%"
      custom-class="problem-selector-dialog"
    >
      <ProblemSelector
        v-if="showProblemSelector"
        :selected-problems="homework.problems"
        @confirm="handleProblemSelection"
        @cancel="showProblemSelector = false"
      />
    </el-dialog>
    
    <!-- Student Selector Dialog -->
    <el-dialog
      title="Assign Students"
      v-model="showStudentSelector"
      width="70%"
      custom-class="student-selector-dialog"
    >
      <StudentSelector
        v-if="showStudentSelector"
        :value="homework.student_ids"
        @change="handleStudentSelection"
      />
      <template #footer>
        <el-button @click="showStudentSelector = false">Cancel</el-button>
        <el-button type="primary" @click="showStudentSelector = false">Confirm</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import api from '@admin/api'
import time from '@/utils/time'
import dayjs from 'dayjs'
import ProblemSelector from './ProblemSelector.vue'
import StudentSelector from './components/StudentSelector.vue'

export default {
  name: 'HomeworkList',
  components: {
    ProblemSelector,
    StudentSelector
  },
  data() {
    return {
      loading: false,
      homeworkList: [],
      searchKeyword: '',
      filterStatus: '',
      currentPage: 1,
      pageSize: 20,
      total: 0,
      showCreateForm: false,
      isEditing: false,
      saving: false,
      showProblemSelector: false,
      showStudentSelector: false,
      homework: {
        title: '',
        description: '',
        due_date: '',
        problems: [],
        student_ids: [],
        settings: {
          late_submission_allowed: false,
          late_penalty_percentage: 10,
          show_solution_after_due: true
        }
      },
      rules: {
        title: [
          { required: true, message: 'Please enter homework title', trigger: 'blur' },
          { min: 3, max: 100, message: 'Title must be between 3 and 100 characters', trigger: 'blur' }
        ],
        due_date: [
          { required: true, message: 'Please select due date', trigger: 'change' }
        ]
      },
    }
  },
  mounted() {
    this.loadHomeworkList()
  },
  computed: {
    activeCount() {
      return this.homeworkList.filter(h => !this.isEnded(h) && h.assigned_count > 0).length
    },
    completedCount() {
      return this.homeworkList.filter(h => h.completion_rate === 100).length
    }
  },
  methods: {
    async loadHomeworkList() {
      this.loading = true
      try {
        const params = {
          page: this.currentPage,
          limit: this.pageSize
        }
        
        if (this.searchKeyword) {
          params.keyword = this.searchKeyword
        }
        if (this.filterStatus) {
          params.status = this.filterStatus
        }
        
        const res = await api.getHomeworkList(params)
        this.homeworkList = res.data.data.results || []
        this.total = res.data.data.total || 0
      } catch (err) {
        this.$error(err.data?.data || 'Failed to load homework list')
      } finally {
        this.loading = false
      }
    },
    
    createHomework() {
      this.showCreateForm = true
      this.isEditing = false
      this.resetHomeworkForm()
    },
    
    editHomework(homework) {
      this.showCreateForm = true
      this.isEditing = true
      this.loadHomeworkForEdit(homework.id)
    },
    
    viewProgress(homework) {
      this.$router.push({
        name: 'admin-homework-progress',
        params: { id: homework.id }
      })
    },
    
    viewStudents(homework) {
      // TODO: Implement student view
      this.$message.info('Student view coming soon')
    },
    
    disabledDate(time) {
      // Disable dates before today
      return time.getTime() < Date.now() - 24 * 60 * 60 * 1000
    },
    
    async deleteHomework(homework) {
      try {
        await api.deleteHomework(homework.id)
        this.$success(this.$t('m.Homework_Deleted'))
        this.loadHomeworkList()
      } catch (err) {
        this.$error(err.data?.data || 'Failed to delete homework')
      }
    },
    
    isOverdue(dueDate) {
      return dayjs(dueDate).isBefore(dayjs())
    },
    
    isEnded(homework) {
      return this.isOverdue(homework.due_date)
    },
    
    getStatusType(homework) {
      if (this.isEnded(homework)) return 'info'
      if (homework.assigned_count === 0) return 'warning'
      return 'success'
    },
    
    getStatusText(homework) {
      if (this.isEnded(homework)) return this.$t('m.Ended')
      if (homework.assigned_count === 0) return this.$t('m.Not_Assigned')
      return this.$t('m.Active')
    },
    
    formatDate(dateStr) {
      if (!dateStr) return 'No due date'
      // Handle both ISO format and other formats
      return time.utcToLocal(dateStr, 'YYYY-MM-DD HH:mm')
    },
    
    handleSizeChange(size) {
      this.pageSize = size
      this.loadHomeworkList()
    },
    
    handlePageChange(page) {
      this.currentPage = page
      this.loadHomeworkList()
    },
    
    viewDetails(homework) {
      this.$router.push({
        name: 'admin-homework-detail',
        params: { id: homework.id }
      })
    },
    
    getDaysUntilDue(dueDate) {
      const days = dayjs(dueDate).diff(dayjs(), 'day')
      return days
    },
    
    getRowClassName({ row }) {
      if (this.isOverdue(row.due_date)) return 'overdue-row'
      if (this.getDaysUntilDue(row.due_date) <= 3) return 'warning-row'
      return ''
    },
    
    cancelCreate() {
      this.showCreateForm = false
      this.resetHomeworkForm()
    },
    
    resetHomeworkForm() {
      this.homework = {
        title: '',
        description: '',
        due_date: '',
        problems: [],
        student_ids: [], // Ensure this is always an array
        settings: {
          late_submission_allowed: false,
          late_penalty_percentage: 10,
          show_solution_after_due: true
        }
      }
      if (this.$refs.homeworkForm) {
        this.$refs.homeworkForm.clearValidate()
      }
      console.log('Reset homework form, student_ids:', this.homework.student_ids)
    },
    
    async loadHomeworkForEdit(id) {
      try {
        const res = await api.getHomework(id)
        const homeworkData = res.data.data
        
        // Convert the due date to the format expected by the date picker
        const dueDate = homeworkData.due_date ? 
          new Date(homeworkData.due_date).toISOString().slice(0, 19) : ''
        
        this.homework = {
          ...homeworkData,
          due_date: dueDate,
          student_ids: homeworkData.assigned_students || []
        }
      } catch (err) {
        this.$error('Failed to load homework')
        this.showCreateForm = false
      }
    },
    
    handleProblemSelection(problems) {
      this.homework.problems = problems
      this.showProblemSelector = false
    },
    
    handleStudentSelection(studentIds) {
      console.log('handleStudentSelection received:', studentIds)
      // Ensure it's an array
      this.homework.student_ids = Array.isArray(studentIds) ? studentIds : []
    },
    
    removeProblem(index) {
      this.homework.problems.splice(index, 1)
    },
    
    async saveHomework() {
      this.$refs.homeworkForm.validate(async (valid) => {
        if (!valid) return
        
        if (this.homework.problems.length === 0) {
          this.$error('Please select at least one problem')
          return
        }
        
        if (this.homework.student_ids.length === 0) {
          this.$error('Please assign at least one student')
          return
        }
        
        this.saving = true
        try {
          console.log('student_ids before save:', this.homework.student_ids)
          console.log('student_ids type:', typeof this.homework.student_ids)
          console.log('is array?', Array.isArray(this.homework.student_ids))
          
          // Format the due date to include timezone
          const formattedDueDate = this.homework.due_date ? 
            new Date(this.homework.due_date).toISOString() : ''
          
          const data = {
            title: this.homework.title,
            description: this.homework.description || 'No description provided',
            due_date: formattedDueDate,
            // Format problems as expected by backend
            problems: this.homework.problems.map(p => ({
              problem_id: p.id,
              score: p.score || 10  // Default score if not set
            })),
            // Ensure student_ids is an array
            student_ids: Array.isArray(this.homework.student_ids) ? this.homework.student_ids : [],
            settings: this.homework.settings
          }
          
          if (this.isEditing) {
            await api.updateHomework(this.homework.id, data)
            this.$success('Homework updated successfully')
          } else {
            await api.createHomework(data)
            this.$success('Homework created successfully')
          }
          
          this.showCreateForm = false
          this.resetHomeworkForm()
          this.loadHomeworkList()
        } catch (err) {
          this.$error(err.data?.data || 'Failed to save homework')
        } finally {
          this.saving = false
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.homework-list {
  // Modern Header Styles
  .page-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 40px;
    margin: -30px -30px 30px;
    color: white;
    border-radius: 0 0 20px 20px;
    
    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .title-section {
      .page-title {
        margin: 0;
        font-size: 32px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 15px;
        
        i {
          font-size: 36px;
        }
      }
      
      .page-subtitle {
        margin: 10px 0 0;
        opacity: 0.9;
        font-size: 16px;
      }
    }
    
    .stats-section {
      display: flex;
      gap: 30px;
      
      .stat-card {
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
        padding: 20px 30px;
        border-radius: 15px;
        text-align: center;
        min-width: 120px;
        
        .stat-value {
          font-size: 36px;
          font-weight: 700;
          margin-bottom: 5px;
        }
        
        .stat-label {
          font-size: 14px;
          opacity: 0.9;
        }
      }
    }
  }
  
  // Action Bar
  .action-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
    
    .action-left {
      display: flex;
      gap: 10px;
    }
    
    .action-right {
      display: flex;
      align-items: center;
      gap: 15px;
    }
  }
  
  // Modern Table
  .modern-table {
    ::v-deep .el-table__header th {
      background-color: #f8f9fb;
      font-weight: 600;
      color: #303133;
      padding: 16px 0;
    }
    
    ::v-deep .el-table__body td {
      padding: 20px 0;
    }
    
    ::v-deep .overdue-row {
      background-color: #fef0f0;
    }
    
    ::v-deep .warning-row {
      background-color: #fdf6ec;
    }
  }
  
  .homework-info {
    .homework-title {
      color: #303133;
      text-decoration: none;
      font-weight: 600;
      font-size: 16px;
      display: block;
      margin-bottom: 8px;
      
      &:hover {
        color: #409eff;
      }
    }
    
    .homework-meta {
      display: flex;
      gap: 20px;
      font-size: 13px;
      color: #909399;
      
      .meta-item {
        display: flex;
        align-items: center;
        gap: 5px;
        
        i {
          font-size: 14px;
        }
      }
    }
  }
  
  .due-date-cell {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .overdue {
      color: #f56c6c;
      font-weight: 500;
    }
  }
  
  .progress-cell {
    .progress-text {
      display: block;
      margin-top: 5px;
      font-size: 12px;
      color: #909399;
    }
  }
  
  .action-buttons {
    display: flex;
    justify-content: center;
    gap: 8px;
  }
  
  .pagination {
    margin-top: 25px;
    text-align: right;
  }
  
  // Create Form Styles
  .homework-form {
    .form-section {
      margin-bottom: 25px;
      
      .section-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 1px solid #ebeef5;
        
        i {
          font-size: 20px;
          color: #409eff;
        }
        
        span {
          font-size: 18px;
          font-weight: 600;
          color: #303133;
        }
      }
    }
    
    .quick-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 25px;
      
      .action-card {
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        ::v-deep .el-card__body {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 25px;
        }
        
        .action-icon {
          width: 60px;
          height: 60px;
          background: #f0f2f5;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          
          i {
            font-size: 28px;
            color: #409eff;
          }
        }
        
        .action-content {
          flex: 1;
          
          h4 {
            margin: 0 0 5px;
            font-size: 16px;
            color: #303133;
          }
          
          p {
            margin: 0;
            color: #909399;
            font-size: 14px;
          }
        }
        
        .el-icon-arrow-right {
          font-size: 20px;
          color: #c0c4cc;
        }
      }
    }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 15px;
      margin-top: 30px;
      padding-top: 30px;
      border-top: 1px solid #ebeef5;
    }
  }
}

// Dialog Styles
.problem-selector-dialog,
.student-selector-dialog {
  ::v-deep .el-dialog__header {
    padding: 20px;
    border-bottom: 1px solid #ebeef5;
  }
  
  ::v-deep .el-dialog__body {
    padding: 20px;
  }
}
</style>