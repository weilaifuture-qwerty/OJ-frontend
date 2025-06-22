<template>
  <div class="student-homework-detail" v-loading="loading">
    <Row type="flex" :gutter="18">
      <!-- Main Content -->
      <Col :span="18">
        <Panel>
          <div slot="title">
            <Button
              type="text"
              @click="$router.back()"
              style="padding: 0; margin-right: 10px;"
            >
              <Icon type="ios-arrow-back" size="20" />
            </Button>
            {{ homework.title }}
          </div>
          
          <!-- Homework Info -->
          <Card class="homework-info-card">
            <div class="info-header">
              <div class="info-item">
                <span class="label">{{ $t('m.Status') }}:</span>
                <Tag :color="getStatusColor(homework.status)">
                  {{ getStatusText(homework.status) }}
                </Tag>
              </div>
              <div class="info-item">
                <span class="label">{{ $t('m.Due_Date') }}:</span>
                <span :class="{ 'text-error': isOverdue }">
                  {{ formatDate(homework.due_date) }}
                  <span v-if="isOverdue"> ({{ $t('m.Overdue') }})</span>
                </span>
              </div>
              <div class="info-item">
                <span class="label">{{ $t('m.Progress') }}:</span>
                <Progress
                  :percent="progressPercent"
                  :status="progressPercent === 100 ? 'success' : 'active'"
                />
              </div>
            </div>
            <div class="description">
              {{ homework.description }}
            </div>
          </Card>
          
          <!-- Problem List -->
          <Card class="problems-card">
            <div slot="title">
              <Icon type="md-list" />
              {{ $t('m.Problems') }} ({{ completedProblems }}/{{ homework.problems.length }})
            </div>
            
            <Table
              :columns="problemColumns"
              :data="homework.problems"
              :loading="loading"
            />
          </Card>
          
          <!-- Comments Section -->
          <Card class="comments-card">
            <div slot="title">
              <Icon type="md-chatboxes" />
              {{ $t('m.Discussion') }}
            </div>
            
            <div class="comment-input">
              <Input
                v-model="newComment"
                type="textarea"
                :rows="3"
                :placeholder="$t('m.Ask_Question_Or_Comment')"
                :maxlength="500"
                show-word-limit
              />
              <Button
                type="primary"
                @click="submitComment"
                :loading="submittingComment"
                style="margin-top: 10px;"
              >
                {{ $t('m.Submit_Comment') }}
              </Button>
            </div>
            
            <div class="comments-list">
              <div
                v-for="comment in comments"
                :key="comment.id"
                class="comment-item"
              >
                <div class="comment-header">
                  <span class="author">{{ comment.author }}</span>
                  <span class="time">{{ formatTime(comment.created_at) }}</span>
                  <Button
                    v-if="comment.can_delete"
                    type="text"
                    size="small"
                    @click="deleteComment(comment.id)"
                    class="delete-btn"
                  >
                    {{ $t('m.Delete') }}
                  </Button>
                </div>
                <div class="comment-content">
                  {{ comment.content }}
                </div>
              </div>
              
              <div v-if="comments.length === 0" class="no-comments">
                {{ $t('m.No_Comments_Yet') }}
              </div>
            </div>
          </Card>
        </Panel>
      </Col>
      
      <!-- Sidebar -->
      <Col :span="6">
        <Panel :padding="15">
          <div slot="title">
            <Icon type="md-information-circle" />
            {{ $t('m.Information') }}
          </div>
          
          <div class="info-list">
            <div class="info-row">
              <span class="label">{{ $t('m.Assigned_By') }}:</span>
              <span class="value">{{ homework.assigned_by }}</span>
            </div>
            <div class="info-row">
              <span class="label">{{ $t('m.Assigned_Date') }}:</span>
              <span class="value">{{ formatDate(homework.assigned_at) }}</span>
            </div>
            <div class="info-row">
              <span class="label">{{ $t('m.Max_Attempts') }}:</span>
              <span class="value">{{ homework.max_attempts || $t('m.Unlimited') }}</span>
            </div>
            <div class="info-row" v-if="homework.allow_late_submit">
              <span class="label">{{ $t('m.Late_Penalty') }}:</span>
              <span class="value">{{ homework.late_penalty_percent }}%</span>
            </div>
            <div class="info-row" v-if="homework.grade !== null">
              <span class="label">{{ $t('m.Grade') }}:</span>
              <span class="value" :class="getGradeClass(homework.grade)">
                {{ homework.grade }}%
              </span>
            </div>
            <div class="info-row" v-if="homework.feedback">
              <span class="label">{{ $t('m.Feedback') }}:</span>
              <div class="feedback">{{ homework.feedback }}</div>
            </div>
          </div>
          
          <div class="actions" v-if="homework.status === 'graded'">
            <Button type="success" long disabled>
              <Icon type="md-checkmark-circle" />
              {{ $t('m.Homework_Completed') }}
            </Button>
          </div>
        </Panel>
      </Col>
    </Row>
  </div>
</template>

<script>
import { Row, Col, Panel, Card, Tag, Icon, Progress, Button, Table, Input, Message } from 'view-ui-plus'
import api from '@oj/api'
import time from '@/utils/time'
import dayjs from 'dayjs'

export default {
  name: 'StudentHomeworkDetail',
  components: {
    Row, Col, Panel, Card, Tag, Icon, Progress, Button, Table, Input
  },
  data() {
    return {
      loading: false,
      homework: {
        title: '',
        description: '',
        status: 'assigned',
        problems: [],
        comments: []
      },
      comments: [],
      newComment: '',
      submittingComment: false,
      problemColumns: [
        {
          title: this.$t('m.#'),
          key: 'order',
          width: 60,
          align: 'center'
        },
        {
          title: this.$t('m.Title'),
          key: 'title',
          render: (h, params) => {
            const problem = params.row
            return h('router-link', {
              props: {
                to: {
                  name: 'homework-problem-details',
                  params: {
                    homeworkId: this.homework.id,
                    problemId: problem.problem_id
                  }
                }
              },
              style: {
                color: problem.status === 'solved' ? '#67c23a' : '#409eff',
                textDecoration: 'none'
              }
            }, problem.title)
          }
        },
        {
          title: this.$t('m.Difficulty'),
          key: 'difficulty',
          width: 100,
          render: (h, params) => {
            const colors = {
              Low: 'success',
              Mid: 'warning',
              High: 'error'
            }
            return h('Tag', {
              props: {
                color: colors[params.row.difficulty] || 'default'
              }
            }, this.$t('m.' + params.row.difficulty))
          }
        },
        {
          title: this.$t('m.Score'),
          key: 'score',
          width: 80,
          align: 'center'
        },
        {
          title: this.$t('m.Status'),
          key: 'status',
          width: 120,
          align: 'center',
          render: (h, params) => {
            const status = params.row.status
            const statusMap = {
              not_started: { text: this.$t('m.Not_Started'), color: 'default' },
              attempted: { text: this.$t('m.Attempted'), color: 'warning' },
              solved: { text: this.$t('m.Solved'), color: 'success' }
            }
            const info = statusMap[status] || statusMap.not_started
            return h('Tag', {
              props: {
                color: info.color
              }
            }, info.text)
          }
        },
        {
          title: this.$t('m.Attempts'),
          key: 'attempts',
          width: 100,
          align: 'center',
          render: (h, params) => {
            const attempts = params.row.attempts || 0
            const maxAttempts = this.homework.max_attempts
            const text = maxAttempts ? `${attempts}/${maxAttempts}` : attempts.toString()
            return h('span', {
              style: {
                color: maxAttempts && attempts >= maxAttempts ? '#f56c6c' : '#606266'
              }
            }, text)
          }
        },
        {
          title: this.$t('m.Actions'),
          key: 'actions',
          width: 100,
          align: 'center',
          render: (h, params) => {
            const problem = params.row
            const canAttempt = !this.homework.max_attempts || 
                               problem.attempts < this.homework.max_attempts
            
            return h('Button', {
              props: {
                type: 'primary',
                size: 'small',
                disabled: !canAttempt || problem.status === 'solved'
              },
              on: {
                click: () => this.solveProblem(problem)
              }
            }, problem.status === 'solved' ? this.$t('m.View') : this.$t('m.Solve'))
          }
        }
      ]
    }
  },
  computed: {
    homeworkId() {
      return this.$route.params.id
    },
    isOverdue() {
      return dayjs(this.homework.due_date).isBefore(dayjs()) && 
             this.homework.status !== 'submitted' && 
             this.homework.status !== 'graded'
    },
    completedProblems() {
      return this.homework.problems.filter(p => p.status === 'solved').length
    },
    progressPercent() {
      if (!this.homework.problems.length) return 0
      return Math.round((this.completedProblems / this.homework.problems.length) * 100)
    }
  },
  mounted() {
    this.loadHomework()
    this.loadComments()
  },
  methods: {
    async loadHomework() {
      this.loading = true
      try {
        const res = await api.getStudentHomeworkDetail(this.homeworkId)
        this.homework = res.data.data
        
        // Update status if needed
        if (this.homework.status === 'assigned' && this.completedProblems > 0) {
          this.homework.status = 'in_progress'
        }
      } catch (err) {
        this.$error(err.data?.data || 'Failed to load homework')
        this.$router.back()
      } finally {
        this.loading = false
      }
    },
    
    async loadComments() {
      try {
        const res = await api.getHomeworkComments(this.homeworkId)
        this.comments = res.data.data || []
      } catch (err) {
        console.error('Failed to load comments:', err)
      }
    },
    
    async submitComment() {
      if (!this.newComment.trim()) {
        this.$error(this.$t('m.Comment_Cannot_Be_Empty'))
        return
      }
      
      this.submittingComment = true
      try {
        await api.createHomeworkComment({
          homework_id: this.homeworkId,
          content: this.newComment
        })
        this.newComment = ''
        Message.success(this.$t('m.Comment_Submitted'))
        this.loadComments()
      } catch (err) {
        this.$error(err.data?.data || 'Failed to submit comment')
      } finally {
        this.submittingComment = false
      }
    },
    
    async deleteComment(commentId) {
      try {
        await api.deleteHomeworkComment(commentId)
        Message.success(this.$t('m.Comment_Deleted'))
        this.loadComments()
      } catch (err) {
        this.$error(err.data?.data || 'Failed to delete comment')
      }
    },
    
    solveProblem(problem) {
      this.$router.push({
        name: 'homework-problem-details',
        params: {
          homeworkId: this.homework.id,
          problemId: problem.problem_id
        }
      })
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
    },
    
    formatTime(dateStr) {
      return time.utcToLocal(dateStr)
    }
  }
}
</script>

<style lang="less" scoped>
.student-homework-detail {
  margin-top: 20px;
  
  .homework-info-card {
    margin-bottom: 20px;
    
    .info-header {
      display: flex;
      gap: 30px;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid #ebeef5;
      
      .info-item {
        display: flex;
        align-items: center;
        gap: 10px;
        
        .label {
          color: #909399;
          font-weight: 500;
        }
      }
    }
    
    .description {
      font-size: 14px;
      line-height: 1.8;
      color: #606266;
    }
  }
  
  .problems-card {
    margin-bottom: 20px;
  }
  
  .comments-card {
    .comment-input {
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid #ebeef5;
    }
    
    .comments-list {
      .comment-item {
        padding: 15px 0;
        border-bottom: 1px solid #f0f0f0;
        
        &:last-child {
          border-bottom: none;
        }
        
        .comment-header {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
          
          .author {
            font-weight: 500;
            color: #303133;
            margin-right: 15px;
          }
          
          .time {
            color: #909399;
            font-size: 13px;
            flex: 1;
          }
          
          .delete-btn {
            color: #f56c6c;
          }
        }
        
        .comment-content {
          color: #606266;
          line-height: 1.6;
        }
      }
      
      .no-comments {
        text-align: center;
        padding: 40px 0;
        color: #909399;
      }
    }
  }
  
  .info-list {
    .info-row {
      margin-bottom: 15px;
      
      .label {
        display: inline-block;
        width: 100px;
        color: #909399;
        font-weight: 500;
      }
      
      .value {
        color: #606266;
      }
      
      .feedback {
        margin-top: 5px;
        padding: 10px;
        background: #f5f7fa;
        border-radius: 4px;
        font-size: 13px;
        line-height: 1.6;
      }
    }
  }
  
  .actions {
    margin-top: 20px;
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