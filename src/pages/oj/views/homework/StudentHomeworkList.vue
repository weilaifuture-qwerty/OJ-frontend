<template>
  <div class="student-homework-wrapper">
    <!-- Hero Section -->
    <div class="homework-hero">
      <div class="hero-content">
        <h1 class="hero-title">
          <Icon type="ios-book" />
          My Homework
        </h1>
        <p class="hero-subtitle">Track your assignments and progress</p>
      </div>
      <div class="hero-stats">
        <div class="stat-card">
          <div class="stat-value">{{ stats.pending }}</div>
          <div class="stat-label">Pending</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.inProgress }}</div>
          <div class="stat-label">In Progress</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.completed }}</div>
          <div class="stat-label">Completed</div>
        </div>
        <div class="stat-card success">
          <div class="stat-value">{{ stats.avgGrade }}%</div>
          <div class="stat-label">Avg Grade</div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="homework-content">
      <!-- Filters and Search -->
      <div class="homework-controls">
        <div class="filter-tabs">
          <div 
            v-for="tab in tabs" 
            :key="tab.value"
            class="filter-tab"
            :class="{ active: activeTab === tab.value }"
            @click="setActiveTab(tab.value)"
          >
            <span class="tab-label">{{ tab.label }}</span>
            <Badge v-if="tab.count > 0" :count="tab.count" />
          </div>
        </div>
        
        <div class="search-box">
          <Input 
            v-model="searchQuery"
            placeholder="Search homework..."
            prefix="ios-search"
            clearable
            @on-clear="onSearch"
            @on-enter="onSearch"
          />
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <Spin size="large" />
        <p>Loading your homework...</p>
      </div>

      <!-- Homework Grid -->
      <div v-else-if="filteredHomework.length > 0" class="homework-grid">
        <div 
          v-for="homework in paginatedHomework" 
          :key="homework.id"
          class="homework-card"
          @click="viewHomework(homework)"
        >
          <!-- Card Header -->
          <div class="card-header">
            <div class="card-status" :class="homework.status">
              <Icon :type="getStatusIcon(homework.status)" />
              {{ getStatusLabel(homework.status) }}
            </div>
            <Dropdown trigger="click" @click.stop>
              <Icon type="ios-more" class="card-menu" />
              <DropdownMenu slot="list">
                <DropdownItem @click.stop="viewHomework(homework)">
                  <Icon type="ios-eye" /> View Details
                </DropdownItem>
                <DropdownItem v-if="homework.status !== 'submitted'" @click.stop="startHomework(homework)">
                  <Icon type="ios-play" /> Start/Continue
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>

          <!-- Card Body -->
          <div class="card-body">
            <h3 class="homework-title">{{ homework.title }}</h3>
            <p class="homework-description">{{ homework.description || 'No description available' }}</p>
            
            <div class="homework-meta">
              <div class="meta-item">
                <Icon type="ios-calendar-outline" />
                <span>Due {{ formatRelativeTime(homework.due_date) }}</span>
              </div>
              <div class="meta-item">
                <Icon type="ios-list-box-outline" />
                <span>{{ homework.problem_count }} problems</span>
              </div>
              <div class="meta-item" v-if="homework.completed_count > 0">
                <Icon type="ios-checkmark-circle-outline" />
                <span>{{ homework.completed_count }} completed</span>
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="homework-progress">
              <div class="progress-header">
                <span class="progress-label">Progress</span>
                <span class="progress-value">{{ Math.round(homework.progress || 0) }}%</span>
              </div>
              <Progress 
                :percent="homework.progress || 0"
                :stroke-width="8"
                :show-info="false"
                :status="getProgressStatus(homework)"
              />
            </div>

            <!-- Grade Display -->
            <div v-if="homework.grade !== null && homework.grade !== undefined" class="homework-grade">
              <div class="grade-circle" :class="getGradeClass(homework.grade)">
                <span class="grade-value">{{ homework.grade }}</span>
                <span class="grade-label">%</span>
              </div>
              <span class="grade-text">Final Grade</span>
            </div>
          </div>

          <!-- Card Footer -->
          <div class="card-footer">
            <div class="teacher-info">
              <Avatar size="small" icon="ios-person" />
              <span>{{ homework.assigned_by }}</span>
            </div>
            <Button 
              type="primary" 
              size="small"
              @click.stop="viewHomework(homework)"
            >
              {{ homework.status === 'assigned' ? 'Start' : 'Continue' }}
              <Icon type="ios-arrow-forward" />
            </Button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <Icon type="ios-folder-open-outline" size="120" />
        <h3 class="empty-title">{{ getEmptyTitle() }}</h3>
        <p class="empty-description">{{ getEmptyDescription() }}</p>
        <Button v-if="activeTab !== 'all'" @click="setActiveTab('all')" type="primary" ghost>
          View All Homework
        </Button>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination-wrapper">
        <Page 
          :current="currentPage"
          :total="filteredHomework.length"
          :page-size="pageSize"
          @on-change="handlePageChange"
          show-total
          show-elevator
        />
      </div>
    </div>
  </div>
</template>

<script>
import { Row, Col, Card, Button, Icon, Input, Badge, Tag, Progress, Spin, Page, Dropdown, DropdownMenu, DropdownItem, Avatar, Panel } from 'view-ui-plus'
import api from '@oj/api'
import time from '@/utils/time'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useUserStore } from '@/stores/user'

dayjs.extend(relativeTime)

export default {
  name: 'StudentHomeworkList',
  components: {
    Row, Col, Card, Button, Icon, Input, Badge, Tag, Progress, Spin, Page, 
    Dropdown, DropdownMenu, DropdownItem, Avatar, Panel
  },
  data() {
    return {
      loading: false,
      activeTab: 'all',
      searchQuery: '',
      homeworkList: [],
      currentPage: 1,
      pageSize: 9,
      total: 0,
      stats: {
        pending: 0,
        inProgress: 0,
        completed: 0,
        avgGrade: 0
      }
    }
  },
  computed: {
    userStore() {
      return useUserStore()
    },
    isAuthenticated() {
      return this.userStore.isAuthenticated
    },
    tabs() {
      return [
        { value: 'all', label: 'All', count: 0 },
        { value: 'assigned', label: 'Assigned', count: this.counts.assigned },
        { value: 'in_progress', label: 'In Progress', count: this.counts.in_progress },
        { value: 'submitted', label: 'Submitted', count: this.counts.submitted },
        { value: 'graded', label: 'Graded', count: this.counts.graded }
      ]
    },
    counts() {
      return {
        assigned: this.homeworkList.filter(h => h.status === 'assigned').length,
        in_progress: this.homeworkList.filter(h => h.status === 'in_progress').length,
        submitted: this.homeworkList.filter(h => h.status === 'submitted').length,
        graded: this.homeworkList.filter(h => h.status === 'graded').length
      }
    },
    filteredHomework() {
      let filtered = this.homeworkList

      // Filter by tab
      if (this.activeTab !== 'all') {
        filtered = filtered.filter(h => h.status === this.activeTab)
      }

      // Filter by search
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(h => 
          h.title.toLowerCase().includes(query) ||
          (h.description && h.description.toLowerCase().includes(query)) ||
          h.assigned_by.toLowerCase().includes(query)
        )
      }

      return filtered
    },
    paginatedHomework() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredHomework.slice(start, end)
    },
    totalPages() {
      return Math.ceil(this.filteredHomework.length / this.pageSize)
    }
  },
  mounted() {
    if (this.isAuthenticated) {
      this.loadHomework()
      this.loadCounts()
    }
  },
  methods: {
    async loadHomework() {
      this.loading = true
      try {
        const params = {
          page: this.currentPage,
          limit: 100 // Get all for client-side filtering
        }
        
        const res = await api.getStudentHomework(params)
        
        if (res && res.data && res.data.data) {
          this.homeworkList = res.data.data.results || []
          this.total = res.data.data.total || 0
          
          // Calculate progress for each homework
          this.homeworkList = this.homeworkList.map(h => ({
            ...h,
            progress: this.calculateProgress(h),
            completed_count: h.completed_count || 0,
            assigned_by: h.assigned_by || 'Unknown'
          }))
        } else {
          this.homeworkList = []
          this.total = 0
        }
      } catch (err) {
        // Don't show error for 404, just show empty list
        this.homeworkList = []
        this.total = 0
        
        if (err.response?.status !== 404 && this.$Message) {
          this.$Message.error('Failed to load homework')
        }
      } finally {
        this.loading = false
        this.calculateStats()
      }
    },
    
    async loadCounts() {
      try {
        const res = await api.getHomeworkProgress()
        if (res && res.data && res.data.data) {
          // Don't assign to this.counts as it's a computed property
          // The counts will be calculated from the homework list
        }
      } catch (err) {
        // Don't show error, just use counts from homework list
      }
    },
    
    calculateProgress(homework) {
      if (homework.problem_count === 0) return 0
      return Math.round((homework.completed_count / homework.problem_count) * 100)
    },
    
    calculateStats() {
      this.stats.pending = this.homeworkList.filter(h => h.status === 'assigned').length
      this.stats.inProgress = this.homeworkList.filter(h => h.status === 'in_progress').length
      this.stats.completed = this.homeworkList.filter(h => ['submitted', 'graded'].includes(h.status)).length
      
      const gradedHomework = this.homeworkList.filter(h => h.grade !== null && h.grade !== undefined)
      if (gradedHomework.length > 0) {
        const totalGrade = gradedHomework.reduce((sum, h) => sum + h.grade, 0)
        this.stats.avgGrade = Math.round(totalGrade / gradedHomework.length)
      }
    },
    
    setActiveTab(tab) {
      this.activeTab = tab
      this.currentPage = 1
    },
    
    onSearch() {
      this.currentPage = 1
    },
    
    handlePageChange(page) {
      this.currentPage = page
    },
    
    viewHomework(homework) {
      this.$router.push({
        name: 'student-homework-detail',
        params: { id: homework.id }
      })
    },
    
    startHomework(homework) {
      // Navigate to first unsolved problem
      this.viewHomework(homework)
    },
    
    isOverdue(homework) {
      return dayjs(homework.due_date).isBefore(dayjs()) && 
             homework.status !== 'submitted' && 
             homework.status !== 'graded'
    },
    
    getStatusIcon(status) {
      const icons = {
        assigned: 'ios-alert',
        in_progress: 'ios-time',
        submitted: 'ios-checkmark-circle',
        graded: 'ios-trophy'
      }
      return icons[status] || 'ios-help-circle'
    },
    
    getStatusLabel(status) {
      return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    },
    
    getStatusColor(status) {
      const colors = {
        assigned: 'default',
        in_progress: 'warning',
        submitted: 'primary',
        graded: 'success'
      }
      return colors[status] || 'default'
    },
    
    getStatusText(status) {
      return this.$t(`m.${status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}`)
    },
    
    getProgressStatus(homework) {
      if (homework.status === 'graded' && homework.grade >= 90) return 'success'
      if (homework.status === 'submitted') return 'success'
      if (this.isOverdue(homework)) return 'exception'
      return 'active'
    },
    
    getGradeClass(grade) {
      if (grade >= 90) return 'excellent'
      if (grade >= 80) return 'good'
      if (grade >= 70) return 'fair'
      if (grade >= 60) return 'pass'
      return 'fail'
    },
    
    formatDate(dateStr) {
      return time.utcToLocal(dateStr, 'YYYY-MM-DD HH:mm')
    },
    
    formatRelativeTime(date) {
      return dayjs(date).fromNow()
    },
    
    getEmptyTitle() {
      const titles = {
        all: 'No Homework Yet',
        assigned: 'No New Assignments',
        in_progress: 'No Homework In Progress',
        submitted: 'No Submitted Homework',
        graded: 'No Graded Homework'
      }
      return titles[this.activeTab] || 'No Homework Found'
    },
    
    getEmptyDescription() {
      const descriptions = {
        all: 'Your homework assignments will appear here',
        assigned: 'Check back later for new assignments',
        in_progress: 'Start working on your assigned homework',
        submitted: 'Complete and submit your homework to see them here',
        graded: 'Your graded homework will appear here'
      }
      return descriptions[this.activeTab] || 'No homework matches your criteria'
    }
  }
}
</script>

<style lang="less" scoped>
.student-homework-wrapper {
  width: 100%;
  min-height: calc(100vh - 80px);
  background: #f0f2f5;
  overflow-x: hidden;
}

// Hero Section
.homework-hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px 0;
  margin-bottom: 30px;
  
  .hero-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 20px;
    
    .hero-title {
      font-size: 32px;
      font-weight: 600;
      margin: 0 0 10px 0;
      display: flex;
      align-items: center;
      gap: 10px;
      
      .ivu-icon {
        font-size: 36px;
      }
    }
    
    .hero-subtitle {
      font-size: 18px;
      opacity: 0.9;
      margin: 0;
    }
  }
  
  .hero-stats {
    max-width: 1400px;
    margin: 30px auto 0;
    padding: 0 20px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 20px;
    
    .stat-card {
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      transition: all 0.3s;
      
      &:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: translateY(-2px);
      }
      
      &.success {
        background: rgba(103, 194, 58, 0.3);
      }
      
      .stat-value {
        font-size: 28px;
        font-weight: 700;
        margin-bottom: 5px;
      }
      
      .stat-label {
        font-size: 14px;
        opacity: 0.9;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
    }
  }
}

// Main Container
.homework-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px 40px;
}

// Controls
.homework-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  
  .filter-tabs {
    display: flex;
    gap: 24px;
    
    .filter-tab {
      position: relative;
      padding: 8px 0;
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      gap: 8px;
      
      .tab-label {
        font-size: 15px;
        font-weight: 500;
        color: #606266;
      }
      
      &:hover .tab-label {
        color: #667eea;
      }
      
      &.active {
        .tab-label {
          color: #667eea;
        }
        
        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: #667eea;
        }
      }
      
      /deep/ .ivu-badge-count {
        background: #667eea;
        min-width: 20px;
        height: 20px;
        line-height: 20px;
        padding: 0 6px;
      }
    }
  }
  
  .search-box {
    width: 300px;
    
    /deep/ .ivu-input-prefix {
      color: #909399;
    }
  }
}

// Loading State
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: white;
  border-radius: 12px;
  
  p {
    margin-top: 20px;
    color: #909399;
    font-size: 16px;
  }
}

// Homework Grid
.homework-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 24px;
  margin-bottom: 30px;
}

// Homework Card
.homework-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
  cursor: pointer;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #f0f0f0;
    
    .card-status {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 500;
      padding: 4px 12px;
      border-radius: 20px;
      
      &.assigned {
        background: #fef0f0;
        color: #f56c6c;
      }
      
      &.in_progress {
        background: #fdf6ec;
        color: #e6a23c;
      }
      
      &.submitted {
        background: #ecf5ff;
        color: #409eff;
      }
      
      &.graded {
        background: #f0f9ff;
        color: #67c23a;
      }
    }
    
    .card-menu {
      font-size: 20px;
      color: #909399;
      cursor: pointer;
      
      &:hover {
        color: #606266;
      }
    }
  }
  
  .card-body {
    padding: 20px;
    flex: 1;
    
    .homework-title {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 10px 0;
      line-height: 1.4;
    }
    
    .homework-description {
      font-size: 14px;
      color: #909399;
      line-height: 1.6;
      margin-bottom: 16px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .homework-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 20px;
      
      .meta-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        color: #606266;
        
        .ivu-icon {
          font-size: 16px;
          color: #909399;
        }
      }
    }
    
    .homework-progress {
      margin-bottom: 20px;
      
      .progress-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        
        .progress-label {
          font-size: 13px;
          color: #909399;
        }
        
        .progress-value {
          font-size: 14px;
          font-weight: 600;
          color: #303133;
        }
      }
      
      /deep/ .ivu-progress-bg {
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      }
      
      /deep/ .ivu-progress-success-bg {
        background: linear-gradient(90deg, #67c23a 0%, #4caf50 100%);
      }
      
      /deep/ .ivu-progress-exception-bg {
        background: linear-gradient(90deg, #f56c6c 0%, #e53e3e 100%);
      }
    }
    
    .homework-grade {
      display: flex;
      align-items: center;
      gap: 16px;
      
      .grade-circle {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        position: relative;
        
        .grade-value {
          font-size: 22px;
        }
        
        .grade-label {
          font-size: 14px;
          position: absolute;
          top: 12px;
          right: 8px;
        }
        
        &.excellent {
          background: linear-gradient(135deg, #67c23a 0%, #4caf50 100%);
          color: white;
        }
        
        &.good {
          background: linear-gradient(135deg, #409eff 0%, #2196f3 100%);
          color: white;
        }
        
        &.fair {
          background: linear-gradient(135deg, #e6a23c 0%, #ff9800 100%);
          color: white;
        }
        
        &.pass {
          background: linear-gradient(135deg, #909399 0%, #606266 100%);
          color: white;
        }
        
        &.fail {
          background: linear-gradient(135deg, #f56c6c 0%, #e53e3e 100%);
          color: white;
        }
      }
      
      .grade-text {
        font-size: 14px;
        color: #606266;
        font-weight: 500;
      }
    }
  }
  
  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-top: 1px solid #f0f0f0;
    background: #fafafa;
    
    .teacher-info {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #909399;
      
      /deep/ .ivu-avatar {
        background: #667eea;
      }
    }
    
    /deep/ .ivu-btn {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
}

// Empty State
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 500px;
  background: white;
  border-radius: 12px;
  padding: 40px;
  
  .ivu-icon {
    color: #c0c4cc;
    margin-bottom: 24px;
  }
  
  .empty-title {
    font-size: 20px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 12px 0;
  }
  
  .empty-description {
    font-size: 16px;
    color: #909399;
    margin: 0 0 24px 0;
  }
}

// Pagination
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  
  /deep/ .ivu-page {
    .ivu-page-item-active {
      background: #667eea;
      border-color: #667eea;
    }
    
    .ivu-page-item:hover {
      border-color: #667eea;
      
      a {
        color: #667eea;
      }
    }
  }
}

// Responsive
@media (max-width: 768px) {
  .homework-hero {
    padding: 30px 0;
    
    .hero-content {
      .hero-title {
        font-size: 24px;
      }
      
      .hero-subtitle {
        font-size: 16px;
      }
    }
  }
  
  .homework-controls {
    flex-direction: column;
    gap: 20px;
    
    .filter-tabs {
      width: 100%;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }
    
    .search-box {
      width: 100%;
    }
  }
  
  .homework-grid {
    grid-template-columns: 1fr;
  }
}

// Legacy styles for compatibility
.text-error {
  color: #f56c6c;
}

.text-success {
  color: #67c23a;
}

.text-primary {
  color: #409eff;
}

.text-warning {
  color: #e6a23c;
}

.text-info {
  color: #909399;
}
</style>