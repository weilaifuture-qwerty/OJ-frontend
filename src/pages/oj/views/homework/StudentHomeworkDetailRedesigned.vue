<template>
  <div class="homework-detail-redesigned">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <Spin size="large" />
      <p>Loading homework details...</p>
    </div>
    
    <!-- Main Content -->
    <div v-else class="detail-wrapper">
      <!-- Hero Header -->
      <div class="hero-header">
        <div class="hero-content">
          <Button 
            type="text" 
            @click="$router.back()" 
            class="back-button"
          >
            <Icon type="ios-arrow-back" size="24" />
            Back
          </Button>
          
          <div class="hero-info">
            <h1 class="homework-title">{{ homework.title }}</h1>
            <div class="meta-info">
              <div class="meta-item">
                <Icon type="ios-person" />
                <span>{{ homework.assigned_by }}</span>
              </div>
              <div class="meta-item">
                <Icon type="ios-calendar" />
                <span>Due {{ formatRelativeTime(homework.due_date) }}</span>
              </div>
              <div class="meta-item">
                <Tag :color="getStatusColor(homework.status)" class="status-tag">
                  {{ getStatusText(homework.status) }}
                </Tag>
              </div>
            </div>
          </div>
          
          <!-- Progress Overview -->
          <div class="progress-overview">
            <div class="progress-stats">
              <div class="stat">
                <span class="stat-value">{{ completedProblems }}</span>
                <span class="stat-label">Completed</span>
              </div>
              <div class="stat">
                <span class="stat-value">{{ homework.problems.length }}</span>
                <span class="stat-label">Total Problems</span>
              </div>
              <div class="stat" v-if="homework.grade !== null">
                <span class="stat-value">{{ homework.grade }}%</span>
                <span class="stat-label">Grade</span>
              </div>
            </div>
            <div class="progress-bar-wrapper">
              <Progress 
                :percent="progressPercent" 
                :stroke-width="12"
                :show-info="false"
                :status="progressPercent === 100 ? 'success' : 'active'"
                class="custom-progress"
              />
              <span class="progress-text">{{ progressPercent }}% Complete</span>
            </div>
          </div>
        </div>
        
        <div class="hero-background"></div>
      </div>
      
      <!-- Main Content Area -->
      <div class="content-container">
        <div class="main-content">
          <!-- Description Card -->
          <div class="content-card description-card" v-if="homework.description">
            <h3 class="card-title">
              <Icon type="ios-document-outline" />
              Description
            </h3>
            <div class="card-content">
              <p>{{ homework.description }}</p>
            </div>
          </div>
          
          <!-- Problems Section -->
          <div class="content-card problems-card">
            <h3 class="card-title">
              <Icon type="ios-list-box-outline" />
              Problems
              <span class="problem-count">({{ completedProblems }}/{{ homework.problems.length }})</span>
            </h3>
            
            <div class="problems-grid">
              <div 
                v-for="(problem, index) in homework.problems" 
                :key="problem.id"
                class="problem-card"
                :class="{ 'solved': problem.status === 'solved' }"
              >
                <div class="problem-header">
                  <span class="problem-number">#{{ index + 1 }}</span>
                  <Tag :color="getDifficultyColor(problem.difficulty)" size="small">
                    {{ problem.difficulty }}
                  </Tag>
                </div>
                
                <h4 class="problem-title">{{ problem.title }}</h4>
                
                <div class="problem-stats">
                  <div class="stat-item">
                    <Icon type="ios-trophy" />
                    <span>{{ problem.score }} pts</span>
                  </div>
                  <div class="stat-item">
                    <Icon type="ios-refresh" />
                    <span>{{ problem.attempts }} attempts</span>
                  </div>
                  <div class="stat-item" v-if="problem.status === 'solved'">
                    <Icon type="ios-checkmark-circle" style="color: #67c23a;" />
                    <span style="color: #67c23a;">Solved</span>
                  </div>
                </div>
                
                <Button 
                  :type="problem.status === 'solved' ? 'default' : 'primary'"
                  @click="solveProblem(problem)"
                  class="problem-action"
                  long
                >
                  {{ problem.status === 'solved' ? 'Review' : 'Solve Problem' }}
                  <Icon type="ios-arrow-forward" />
                </Button>
              </div>
            </div>
          </div>
          
          <!-- Discussion Section -->
          <div class="content-card discussion-card">
            <h3 class="card-title">
              <Icon type="ios-chatbubbles-outline" />
              Discussion
              <span class="comment-count">({{ comments.length }})</span>
            </h3>
            
            <div class="comment-input-wrapper">
              <Input
                v-model="newComment"
                type="textarea"
                :rows="3"
                placeholder="Ask a question or share your thoughts..."
                class="comment-input"
              />
              <Button
                type="primary"
                @click="submitComment"
                :loading="submittingComment"
                class="submit-comment"
              >
                <Icon type="ios-send" />
                Post Comment
              </Button>
            </div>
            
            <div class="comments-list">
              <div 
                v-for="comment in comments" 
                :key="comment.id"
                class="comment-item"
              >
                <div class="comment-avatar">
                  <Icon type="ios-person" size="24" />
                </div>
                <div class="comment-content">
                  <div class="comment-header">
                    <span class="comment-author">{{ comment.author }}</span>
                    <span class="comment-time">{{ formatRelativeTime(comment.created_at) }}</span>
                  </div>
                  <p class="comment-text">{{ comment.content }}</p>
                  <div class="comment-actions" v-if="comment.can_delete">
                    <Button type="text" size="small" @click="deleteComment(comment.id)">
                      <Icon type="ios-trash-outline" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
              
              <div v-if="comments.length === 0" class="no-comments">
                <Icon type="ios-chatbubbles-outline" size="48" />
                <p>No comments yet. Be the first to start the discussion!</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Sidebar -->
        <div class="sidebar">
          <!-- Info Card -->
          <div class="sidebar-card info-card">
            <h4 class="sidebar-title">
              <Icon type="ios-information-circle-outline" />
              Details
            </h4>
            <div class="info-list">
              <div class="info-item">
                <span class="info-label">Assigned</span>
                <span class="info-value">{{ formatDate(homework.assigned_at) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Due Date</span>
                <span class="info-value" :class="{ 'overdue': isOverdue }">
                  {{ formatDate(homework.due_date) }}
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">Max Attempts</span>
                <span class="info-value">{{ homework.max_attempts || 'Unlimited' }}</span>
              </div>
              <div class="info-item" v-if="homework.allow_late_submit">
                <span class="info-label">Late Penalty</span>
                <span class="info-value">{{ homework.late_penalty_percent }}% per day</span>
              </div>
            </div>
          </div>
          
          <!-- Quick Actions -->
          <div class="sidebar-card actions-card">
            <h4 class="sidebar-title">
              <Icon type="ios-flash-outline" />
              Quick Actions
            </h4>
            <Button long class="action-button">
              <Icon type="ios-download-outline" />
              Export Progress
            </Button>
            <Button long class="action-button">
              <Icon type="ios-help-circle-outline" />
              Get Help
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Card, Tag, Icon, Progress, Button, Table, Input, Message, Spin } from 'view-ui-plus'
import api from '@oj/api'
import time from '@/utils/time'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

export default {
  name: 'StudentHomeworkDetailRedesigned',
  components: {
    Card, Tag, Icon, Progress, Button, Table, Input, Message, Spin
  },
  data() {
    return {
      loading: true,
      homework: {
        title: '',
        description: '',
        due_date: '',
        assigned_at: '',
        assigned_by: '',
        status: 'assigned',
        problems: [],
        grade: null,
        max_attempts: null,
        allow_late_submit: false,
        late_penalty_percent: 0
      },
      comments: [],
      newComment: '',
      submittingComment: false
    }
  },
  computed: {
    homeworkId() {
      return this.$route.params.id
    },
    completedProblems() {
      return this.homework.problems.filter(p => p.status === 'solved').length
    },
    progressPercent() {
      if (this.homework.problems.length === 0) return 0
      return Math.round((this.completedProblems / this.homework.problems.length) * 100)
    },
    isOverdue() {
      return dayjs(this.homework.due_date).isBefore(dayjs())
    }
  },
  mounted() {
    this.loadHomeworkDetail()
    this.loadComments()
  },
  methods: {
    async loadHomeworkDetail() {
      this.loading = true
      try {
        const res = await api.getHomeworkDetail(this.homeworkId)
        if (res && res.data && res.data.data) {
          this.homework = res.data.data
        } else {
          throw new Error('Invalid response format')
        }
      } catch (err) {
        console.error('Failed to load homework:', err)
        if (err.response?.status === 404) {
          this.$error('Homework not found')
        } else {
          this.$error('Failed to load homework details')
        }
        setTimeout(() => {
          this.$router.back()
        }, 2000)
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
        this.$error('Comment cannot be empty')
        return
      }
      
      this.submittingComment = true
      try {
        await api.createHomeworkComment({
          homework_id: this.homeworkId,
          content: this.newComment
        })
        this.newComment = ''
        this.$success('Comment posted')
        this.loadComments()
      } catch (err) {
        this.$error('Failed to submit comment')
      } finally {
        this.submittingComment = false
      }
    },
    
    async deleteComment(commentId) {
      try {
        await api.deleteHomeworkComment(commentId)
        this.$success('Comment deleted')
        this.loadComments()
      } catch (err) {
        this.$error('Failed to delete comment')
      }
    },
    
    solveProblem(problem) {
      const displayId = problem.display_id || problem._id || String(problem.problem_id)
      this.$router.push({
        name: 'problem-details',
        params: { problemID: displayId }
      })
    },
    
    getDifficultyColor(difficulty) {
      const colors = {
        Low: 'success',
        Mid: 'warning',
        High: 'error'
      }
      return colors[difficulty] || 'default'
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
      return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    },
    
    formatDate(date) {
      return time.utcToLocal(date, 'YYYY-MM-DD HH:mm')
    },
    
    formatRelativeTime(date) {
      return dayjs(date).fromNow()
    }
  }
}
</script>

<style lang="less" scoped>
.homework-detail-redesigned {
  min-height: calc(100vh - 60px);
  background: #f5f7fa;
  
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    
    p {
      margin-top: 20px;
      color: #909399;
      font-size: 16px;
    }
  }
}

// Hero Header
.hero-header {
  position: relative;
  background: white;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  
  .hero-background {
    position: absolute;
    top: 0;
    right: -100px;
    width: 400px;
    height: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    opacity: 0.1;
    transform: skewX(-20deg);
  }
  
  .hero-content {
    position: relative;
    max-width: 1400px;
    margin: 0 auto;
    padding: 30px 40px;
    
    .back-button {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: #606266;
      margin-bottom: 20px;
      padding: 0;
      
      &:hover {
        color: #667eea;
      }
    }
    
    .hero-info {
      margin-bottom: 30px;
      
      .homework-title {
        font-size: 32px;
        font-weight: 600;
        color: #303133;
        margin: 0 0 15px 0;
      }
      
      .meta-info {
        display: flex;
        align-items: center;
        gap: 24px;
        
        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #606266;
          font-size: 14px;
          
          .ivu-icon {
            font-size: 16px;
            color: #909399;
          }
        }
        
        .status-tag {
          font-weight: 500;
        }
      }
    }
    
    .progress-overview {
      display: flex;
      align-items: center;
      gap: 40px;
      
      .progress-stats {
        display: flex;
        gap: 30px;
        
        .stat {
          text-align: center;
          
          .stat-value {
            display: block;
            font-size: 28px;
            font-weight: 700;
            color: #303133;
            line-height: 1;
          }
          
          .stat-label {
            display: block;
            font-size: 12px;
            color: #909399;
            margin-top: 5px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
        }
      }
      
      .progress-bar-wrapper {
        flex: 1;
        position: relative;
        
        .custom-progress {
          /deep/ .ivu-progress-bg {
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          }
          
          /deep/ .ivu-progress-success-bg {
            background: linear-gradient(90deg, #67c23a 0%, #4caf50 100%);
          }
        }
        
        .progress-text {
          position: absolute;
          right: 0;
          top: -20px;
          font-size: 14px;
          font-weight: 600;
          color: #606266;
        }
      }
    }
  }
}

// Content Container
.content-container {
  max-width: 1400px;
  margin: 30px auto;
  padding: 0 40px;
  display: flex;
  gap: 30px;
  
  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  
  .sidebar {
    width: 320px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
}

// Content Cards
.content-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  
  .card-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 20px 0;
    display: flex;
    align-items: center;
    gap: 8px;
    
    .ivu-icon {
      font-size: 22px;
      color: #667eea;
    }
    
    .problem-count,
    .comment-count {
      font-weight: 400;
      color: #909399;
      margin-left: 8px;
    }
  }
}

// Problems Grid
.problems-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  
  .problem-card {
    background: #f5f7fa;
    border-radius: 8px;
    padding: 20px;
    transition: all 0.3s;
    border: 2px solid transparent;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    &.solved {
      background: #f0f9ff;
      border-color: #67c23a;
    }
    
    .problem-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      
      .problem-number {
        font-size: 14px;
        font-weight: 600;
        color: #909399;
      }
    }
    
    .problem-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 16px 0;
      line-height: 1.4;
    }
    
    .problem-stats {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
      
      .stat-item {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        color: #606266;
        
        .ivu-icon {
          font-size: 16px;
          color: #909399;
        }
      }
    }
    
    .problem-action {
      font-weight: 500;
      
      /deep/ .ivu-icon {
        margin-left: 4px;
      }
    }
  }
}

// Discussion Section
.discussion-card {
  .comment-input-wrapper {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
    
    .comment-input {
      flex: 1;
    }
    
    .submit-comment {
      align-self: flex-end;
    }
  }
  
  .comments-list {
    .comment-item {
      display: flex;
      gap: 12px;
      padding: 16px 0;
      border-bottom: 1px solid #f0f0f0;
      
      &:last-child {
        border-bottom: none;
      }
      
      .comment-avatar {
        width: 40px;
        height: 40px;
        background: #f0f2f5;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        
        .ivu-icon {
          color: #909399;
        }
      }
      
      .comment-content {
        flex: 1;
        
        .comment-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
          
          .comment-author {
            font-weight: 600;
            color: #303133;
          }
          
          .comment-time {
            font-size: 12px;
            color: #909399;
          }
        }
        
        .comment-text {
          color: #606266;
          line-height: 1.6;
          margin: 0 0 8px 0;
        }
        
        .comment-actions {
          .ivu-btn {
            padding: 0;
            height: auto;
            color: #909399;
            
            &:hover {
              color: #ed4014;
            }
          }
        }
      }
    }
    
    .no-comments {
      text-align: center;
      padding: 40px;
      
      .ivu-icon {
        color: #c0c4cc;
        margin-bottom: 12px;
      }
      
      p {
        color: #909399;
        margin: 0;
      }
    }
  }
}

// Sidebar Cards
.sidebar-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  
  .sidebar-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 16px 0;
    display: flex;
    align-items: center;
    gap: 8px;
    
    .ivu-icon {
      font-size: 20px;
      color: #667eea;
    }
  }
}

// Info Card
.info-card {
  .info-list {
    .info-item {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
      
      &:last-child {
        border-bottom: none;
      }
      
      .info-label {
        color: #909399;
        font-size: 14px;
      }
      
      .info-value {
        color: #303133;
        font-weight: 500;
        font-size: 14px;
        
        &.overdue {
          color: #f56c6c;
        }
      }
    }
  }
}

// Actions Card
.actions-card {
  .action-button {
    margin-bottom: 12px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}

// Responsive
@media (max-width: 1200px) {
  .content-container {
    .sidebar {
      width: 280px;
    }
  }
}

@media (max-width: 992px) {
  .hero-header .hero-content {
    padding: 20px;
    
    .progress-overview {
      flex-direction: column;
      align-items: flex-start;
      gap: 20px;
    }
  }
  
  .content-container {
    flex-direction: column;
    padding: 0 20px;
    
    .sidebar {
      width: 100%;
    }
  }
  
  .problems-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .hero-header .hero-content {
    .homework-title {
      font-size: 24px;
    }
    
    .meta-info {
      flex-wrap: wrap;
      gap: 12px;
    }
    
    .progress-stats {
      gap: 20px;
      
      .stat {
        .stat-value {
          font-size: 24px;
        }
      }
    }
  }
}
</style>