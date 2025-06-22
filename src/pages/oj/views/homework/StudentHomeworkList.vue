<template>
  <div class="student-homework-list">
    <Row type="flex" :gutter="18">
      <Col :span="24">
        <Panel :padding="10">
          <div slot="title">
            <Icon type="ios-paper-outline" />
            {{ $t('m.My_Homework') }}
          </div>
          
          <!-- Filter Tabs -->
          <Tabs v-model="activeTab" @on-click="filterHomework">
            <TabPane :label="$t('m.All')" name="all" />
            <TabPane name="assigned">
              <template #label>
                <Badge :count="counts.assigned" :offset="[15, -5]">
                  {{ $t('m.Assigned') }}
                </Badge>
              </template>
            </TabPane>
            <TabPane name="in_progress">
              <template #label>
                <Badge :count="counts.in_progress" :offset="[15, -5]" type="warning">
                  {{ $t('m.In_Progress') }}
                </Badge>
              </template>
            </TabPane>
            <TabPane name="submitted">
              <template #label>
                <Badge :count="counts.submitted" :offset="[15, -5]" type="info">
                  {{ $t('m.Submitted') }}
                </Badge>
              </template>
            </TabPane>
            <TabPane name="graded">
              <template #label>
                <Badge :count="counts.graded" :offset="[15, -5]" type="success">
                  {{ $t('m.Graded') }}
                </Badge>
              </template>
            </TabPane>
          </Tabs>
          
          <!-- Homework List -->
          <div class="homework-list" v-loading="loading">
            <div
              v-for="homework in homeworkList"
              :key="homework.id"
              class="homework-item"
              @click="viewHomework(homework)"
            >
              <div class="homework-header">
                <h3 class="homework-title">{{ homework.title }}</h3>
                <Tag :color="getStatusColor(homework.status)">
                  {{ getStatusText(homework.status) }}
                </Tag>
              </div>
              
              <div class="homework-info">
                <div class="info-item">
                  <Icon type="md-calendar" />
                  <span>{{ $t('m.Due_Date') }}: </span>
                  <span :class="{ 'text-error': isOverdue(homework) }">
                    {{ formatDate(homework.due_date) }}
                  </span>
                </div>
                <div class="info-item">
                  <Icon type="md-list" />
                  <span>{{ $t('m.Problems') }}: {{ homework.problem_count }}</span>
                </div>
                <div class="info-item">
                  <Icon type="md-checkmark-circle" />
                  <span>{{ $t('m.Progress') }}: </span>
                  <Progress
                    :percent="homework.progress"
                    :status="homework.progress === 100 ? 'success' : 'active'"
                    :stroke-width="6"
                    style="width: 150px; display: inline-block;"
                  />
                </div>
                <div class="info-item" v-if="homework.grade !== null">
                  <Icon type="md-trophy" />
                  <span>{{ $t('m.Grade') }}: </span>
                  <span :class="getGradeClass(homework.grade)">
                    {{ homework.grade }}%
                  </span>
                </div>
              </div>
              
              <div class="homework-description">
                {{ homework.description }}
              </div>
              
              <div class="homework-footer">
                <div class="footer-left">
                  <span class="assigned-by">
                    {{ $t('m.Assigned_By') }}: {{ homework.assigned_by }}
                  </span>
                </div>
                <div class="footer-right">
                  <Button
                    type="primary"
                    size="small"
                    @click.stop="viewHomework(homework)"
                  >
                    {{ homework.status === 'assigned' ? $t('m.Start') : $t('m.Continue') }}
                    <Icon type="ios-arrow-forward" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div v-if="homeworkList.length === 0" class="no-homework">
              <Icon type="ios-folder-open-outline" size="64" />
              <p>{{ $t('m.No_Homework_Found') }}</p>
            </div>
          </div>
          
          <!-- Pagination -->
          <div class="pagination" v-if="total > pageSize">
            <Page
              :total="total"
              :current="currentPage"
              :page-size="pageSize"
              @on-change="handlePageChange"
              show-total
            />
          </div>
        </Panel>
      </Col>
    </Row>
  </div>
</template>

<script>
import { Row, Col, Panel, Tabs, TabPane, Badge, Tag, Icon, Progress, Button, Page } from 'view-ui-plus'
import api from '@oj/api'
import time from '@/utils/time'
import dayjs from 'dayjs'

export default {
  name: 'StudentHomeworkList',
  components: {
    Row, Col, Panel, Tabs, TabPane, Badge, Tag, Icon, Progress, Button, Page
  },
  data() {
    return {
      loading: false,
      activeTab: 'all',
      homeworkList: [],
      counts: {
        assigned: 0,
        in_progress: 0,
        submitted: 0,
        graded: 0
      },
      currentPage: 1,
      pageSize: 10,
      total: 0
    }
  },
  mounted() {
    this.loadHomework()
    this.loadCounts()
  },
  methods: {
    async loadHomework() {
      this.loading = true
      try {
        const params = {
          page: this.currentPage,
          limit: this.pageSize
        }
        
        if (this.activeTab !== 'all') {
          params.status = this.activeTab
        }
        
        const res = await api.getStudentHomework(params)
        this.homeworkList = res.data.data.results || []
        this.total = res.data.data.total || 0
      } catch (err) {
        this.$error(err.data?.data || 'Failed to load homework')
      } finally {
        this.loading = false
      }
    },
    
    async loadCounts() {
      try {
        const res = await api.getHomeworkProgress()
        this.counts = res.data.data.counts || {
          assigned: 0,
          in_progress: 0,
          submitted: 0,
          graded: 0
        }
      } catch (err) {
        console.error('Failed to load counts:', err)
      }
    },
    
    filterHomework(tab) {
      this.activeTab = tab
      this.currentPage = 1
      this.loadHomework()
    },
    
    handlePageChange(page) {
      this.currentPage = page
      this.loadHomework()
    },
    
    viewHomework(homework) {
      this.$router.push({
        name: 'student-homework-detail',
        params: { id: homework.id }
      })
    },
    
    isOverdue(homework) {
      return dayjs(homework.due_date).isBefore(dayjs()) && 
             homework.status !== 'submitted' && 
             homework.status !== 'graded'
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
      return this.$t(`m.${status.charAt(0).toUpperCase() + status.slice(1)}`)
    },
    
    getGradeClass(grade) {
      if (grade >= 90) return 'text-success'
      if (grade >= 80) return 'text-primary'
      if (grade >= 70) return 'text-warning'
      if (grade >= 60) return 'text-info'
      return 'text-error'
    },
    
    formatDate(dateStr) {
      return time.utcToLocal(dateStr, 'YYYY-MM-DD HH:mm')
    }
  }
}
</script>

<style lang="less" scoped>
.student-homework-list {
  margin-top: 20px;
  
  .homework-list {
    min-height: 400px;
  }
  
  .homework-item {
    padding: 20px;
    margin-bottom: 15px;
    background: #fff;
    border: 1px solid #e8e8e8;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s;
    
    &:hover {
      border-color: #409eff;
      box-shadow: 0 2px 12px rgba(64, 158, 255, 0.1);
    }
    
    .homework-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      
      .homework-title {
        margin: 0;
        font-size: 18px;
        font-weight: 500;
        color: #303133;
      }
    }
    
    .homework-info {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      margin-bottom: 15px;
      
      .info-item {
        display: flex;
        align-items: center;
        font-size: 14px;
        color: #606266;
        
        .ivu-icon {
          margin-right: 5px;
        }
      }
    }
    
    .homework-description {
      font-size: 14px;
      color: #909399;
      margin-bottom: 15px;
      line-height: 1.6;
    }
    
    .homework-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .assigned-by {
        font-size: 13px;
        color: #909399;
      }
    }
  }
  
  .no-homework {
    text-align: center;
    padding: 80px 0;
    color: #909399;
    
    p {
      margin-top: 15px;
      font-size: 16px;
    }
  }
  
  .pagination {
    margin-top: 20px;
    text-align: right;
  }
  
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
}
</style>