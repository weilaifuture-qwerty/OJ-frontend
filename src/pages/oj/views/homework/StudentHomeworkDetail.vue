<template>
  <div class="homework-detail-page">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-content">
        <Spin size="large" />
        <p class="loading-text">{{ $t('m.Loading_Homework_Details') }}</p>
      </div>
    </div>
    
    <div class="homework-container" v-else>
      <!-- Hero Header -->
      <div class="hero-header">
        <div class="hero-background"></div>
        <div class="hero-content">
          <Button
            type="text"
            @click="$router.back()"
            class="back-button"
          >
            <Icon type="ios-arrow-back" size="24" />
            <span>{{ $t('m.Back') }}</span>
          </Button>
          <h1 class="homework-title">{{ homework.title }}</h1>
          <p class="homework-description">{{ homework.description }}</p>
          <div class="hero-stats">
            <div class="stat-item">
              <Icon type="md-calendar" />
              <span>{{ $t('m.Due') }}: {{ formatDate(homework.due_date) }}</span>
            </div>
            <div class="stat-item">
              <Icon type="md-checkmark-circle" />
              <span>{{ completedProblems }}/{{ homework.problems.length }} {{ $t('m.Completed') }}</span>
            </div>
            <div class="stat-item" v-if="homework.grade !== null">
              <Icon type="md-trophy" />
              <span>{{ $t('m.Grade') }}: {{ homework.grade }}%</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="content-wrapper">
        <!-- Main Content -->
        <div class="main-content">
          
          <!-- Progress Overview Card -->
          <Card class="progress-card">
            <div class="progress-header">
              <h3>{{ $t('m.Your_Progress') }}</h3>
              <Tag :color="getStatusColor(homework.status)" size="large">
                {{ getStatusText(homework.status) }}
              </Tag>
            </div>
            <div class="progress-visual">
              <div class="circular-progress">
                <svg viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="90" class="progress-bg"></circle>
                  <circle cx="100" cy="100" r="90" class="progress-fill" 
                    :style="{ strokeDasharray: `${progressPercent * 5.65} 565` }"></circle>
                </svg>
                <div class="progress-text">
                  <span class="percent">{{ progressPercent }}%</span>
                  <span class="label">{{ $t('m.Complete') }}</span>
                </div>
              </div>
              <div class="progress-details">
                <div class="detail-item">
                  <Icon type="md-checkmark-circle" class="icon-success" />
                  <span>{{ completedProblems }} {{ $t('m.Problems_Solved') }}</span>
                </div>
                <div class="detail-item">
                  <Icon type="md-time" />
                  <span>{{ homework.problems.length - completedProblems }} {{ $t('m.Remaining') }}</span>
                </div>
                <div class="detail-item" v-if="isOverdue">
                  <Icon type="md-alert" class="icon-warning" />
                  <span class="text-warning">{{ $t('m.Assignment_Overdue') }}</span>
                </div>
              </div>
            </div>
          </Card>
          
          <!-- Problem List -->
          <Card class="problems-card">
            <div slot="title" class="card-header">
              <div class="header-left">
                <Icon type="md-code-working" />
                <h3>{{ $t('m.Problem_Set') }}</h3>
              </div>
              <div class="header-right">
                <span class="problem-count">{{ completedProblems }}/{{ homework.problems.length }} {{ $t('m.Completed') }}</span>
              </div>
            </div>
            
            <div class="problem-grid">
              <div v-for="problem in homework.problems" :key="problem.id" 
                class="problem-card" 
                :class="{ 'solved': problem.status === 'solved', 'attempted': problem.status === 'attempted' }"
                @click="solveProblem(problem)">
                <div class="problem-header">
                  <span class="problem-number">#{{ problem.order }}</span>
                  <Tag :color="getDifficultyColor(problem.difficulty)" size="small">
                    {{ $t('m.' + problem.difficulty) }}
                  </Tag>
                </div>
                <h4 class="problem-title">{{ problem.title }}</h4>
                <div class="problem-meta">
                  <div class="meta-item">
                    <Icon type="md-star" />
                    <span>{{ problem.score }} {{ $t('m.Points') }}</span>
                  </div>
                  <div class="meta-item">
                    <Icon type="md-refresh" />
                    <span>{{ problem.attempts }} {{ $t('m.Attempts') }}</span>
                  </div>
                </div>
                <div class="problem-status">
                  <Icon v-if="problem.status === 'solved'" type="md-checkmark-circle" class="status-icon solved" />
                  <Icon v-else-if="problem.status === 'attempted'" type="md-time" class="status-icon attempted" />
                  <Icon v-else type="md-radio-button-off" class="status-icon" />
                  <span class="status-text">{{ getProblemStatusText(problem.status) }}</span>
                </div>
                <Button 
                  :type="problem.status === 'solved' ? 'default' : 'primary'"
                  size="small"
                  long
                  class="problem-action"
                  :disabled="homework.max_attempts && problem.attempts >= homework.max_attempts && problem.status !== 'solved'"
                  @click.stop="solveProblem(problem)">
                  {{ problem.status === 'solved' ? $t('m.Review_Solution') : $t('m.Start_Solving') }}
                </Button>
              </div>
            </div>
          </Card>
          
          <!-- Discussion Section -->
          <Card class="discussion-card">
            <div slot="title" class="card-header">
              <div class="header-left">
                <Icon type="md-chatbubbles" />
                <h3>{{ $t('m.Discussion_Board') }}</h3>
              </div>
              <div class="header-right">
                <span class="comment-count">{{ comments.length }} {{ $t('m.Comments') }}</span>
              </div>
            </div>
            
            <div class="comment-composer">
              <div class="composer-header">
                <Avatar icon="ios-person" size="small" />
                <span class="composer-title">{{ $t('m.Add_Your_Comment') }}</span>
              </div>
              <Input
                v-model="newComment"
                type="textarea"
                :rows="4"
                :placeholder="$t('m.Share_Your_Thoughts')"
                :maxlength="500"
                show-word-limit
                class="comment-textarea"
              />
              <div class="composer-actions">
                <Button
                  @click="newComment = ''"
                  :disabled="!newComment.trim() || submittingComment">
                  {{ $t('m.Cancel') }}
                </Button>
                <Button
                  type="primary"
                  @click="submitComment"
                  :loading="submittingComment"
                  :disabled="!newComment.trim()">
                  <Icon type="md-send" />
                  {{ $t('m.Post_Comment') }}
                </Button>
              </div>
            </div>
            
            <div class="comments-timeline">
              <transition-group name="comment-list" tag="div">
                <div
                  v-for="comment in comments"
                  :key="comment.id"
                  class="comment-item"
                >
                  <Avatar icon="ios-person" size="small" class="comment-avatar" />
                  <div class="comment-body">
                    <div class="comment-meta">
                      <span class="author">{{ comment.author }}</span>
                      <span class="time">{{ formatTime(comment.created_at) }}</span>
                      <Button
                        v-if="comment.can_delete"
                        type="text"
                        size="small"
                        @click="deleteComment(comment.id)"
                        class="delete-btn"
                      >
                        <Icon type="md-trash" />
                      </Button>
                    </div>
                    <div class="comment-text">
                      {{ comment.content }}
                    </div>
                  </div>
                </div>
              </transition-group>
              
              <div v-if="comments.length === 0" class="empty-state">
                <Icon type="md-chatbubbles" size="48" />
                <p>{{ $t('m.Be_First_To_Comment') }}</p>
              </div>
            </div>
          </Card>
        </div>
      
        <!-- Sidebar -->
        <div class="sidebar">
          <!-- Quick Stats Card -->
          <Card class="stats-card">
            <div slot="title" class="card-header">
              <Icon type="md-stats" />
              <h3>{{ $t('m.Quick_Stats') }}</h3>
            </div>
            <div class="stats-grid">
              <div class="stat-box">
                <Icon type="md-calendar" class="stat-icon" />
                <div class="stat-content">
                  <span class="stat-value">{{ daysUntilDue }}</span>
                  <span class="stat-label">{{ $t('m.Days_Left') }}</span>
                </div>
              </div>
              <div class="stat-box">
                <Icon type="md-trophy" class="stat-icon" />
                <div class="stat-content">
                  <span class="stat-value">{{ totalScore }}/{{ maxScore }}</span>
                  <span class="stat-label">{{ $t('m.Points') }}</span>
                </div>
              </div>
            </div>
          </Card>
          
          <!-- Assignment Details Card -->
          <Card class="details-card">
            <div slot="title" class="card-header">
              <Icon type="md-information-circle" />
              <h3>{{ $t('m.Assignment_Details') }}</h3>
            </div>
          
            <div class="detail-list">
              <div class="detail-item">
                <Icon type="md-person" class="detail-icon" />
                <div class="detail-content">
                  <span class="detail-label">{{ $t('m.Instructor') }}</span>
                  <span class="detail-value">{{ homework.assigned_by }}</span>
                </div>
              </div>
              <div class="detail-item">
                <Icon type="md-calendar" class="detail-icon" />
                <div class="detail-content">
                  <span class="detail-label">{{ $t('m.Assigned_On') }}</span>
                  <span class="detail-value">{{ formatDate(homework.assigned_at) }}</span>
                </div>
              </div>
              <div class="detail-item">
                <Icon type="md-refresh" class="detail-icon" />
                <div class="detail-content">
                  <span class="detail-label">{{ $t('m.Max_Attempts') }}</span>
                  <span class="detail-value">{{ homework.max_attempts || $t('m.Unlimited') }}</span>
                </div>
              </div>
              <div class="detail-item" v-if="homework.allow_late_submit">
                <Icon type="md-warning" class="detail-icon" />
                <div class="detail-content">
                  <span class="detail-label">{{ $t('m.Late_Penalty') }}</span>
                  <span class="detail-value text-warning">-{{ homework.late_penalty_percent }}%</span>
                </div>
              </div>
            </div>
          
            <div class="grade-section" v-if="homework.grade !== null">
              <div class="grade-header">
                <Icon type="md-school" />
                <span>{{ $t('m.Final_Grade') }}</span>
              </div>
              <div class="grade-display" :class="getGradeClass(homework.grade)">
                <span class="grade-number">{{ homework.grade }}</span>
                <span class="grade-percent">%</span>
              </div>
              <div class="feedback-section" v-if="homework.feedback">
                <h4>{{ $t('m.Instructor_Feedback') }}</h4>
                <p class="feedback-text">{{ homework.feedback }}</p>
              </div>
            </div>
            
            <div class="action-section">
              <Button v-if="homework.status === 'graded'" type="success" long icon="md-checkmark-circle">
                {{ $t('m.Assignment_Completed') }}
              </Button>
              <Button v-else-if="progressPercent === 100" type="primary" long icon="md-send" @click="submitHomework">
                {{ $t('m.Submit_Assignment') }}
              </Button>
              <Button v-else type="default" long disabled>
                {{ $t('m.Complete_All_Problems') }}
              </Button>
            </div>
          </Card>
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
import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'

export default {
  name: 'StudentHomeworkDetail',
  components: {
    Card, Tag, Icon, Progress, Button, Table, Input, Spin
  },
  data() {
    return {
      loading: true,
      homework: {
        id: null,
        title: 'Loading...',
        description: '',
        status: 'assigned',
        problems: [],
        comments: [],
        due_date: new Date(),
        assigned_by: '',
        assigned_at: new Date(),
        max_attempts: null,
        allow_late_submit: false,
        late_penalty_percent: 0,
        grade: null,
        feedback: null
      },
      comments: [],
      newComment: '',
      submittingComment: false,
      problemColumns: [
        {
          title: '#',
          key: 'order',
          width: 60,
          align: 'center'
        },
        {
          title: this.$t('m.Title'),
          key: 'title',
          render: (h, params) => {
            const problem = params.row
            const displayId = problem.display_id || problem._id || String(problem.problem_id)
            return h('router-link', {
              props: {
                to: {
                  name: 'problem-details',
                  params: {
                    problemID: displayId
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
            
            // Create a wrapper div with click handler
            return h('div', {
              style: {
                cursor: canAttempt && problem.status !== 'solved' ? 'pointer' : 'not-allowed'
              },
              on: {
                click: (e) => {
                  e.stopPropagation()
                  if (canAttempt || problem.status === 'solved') {
                    this.solveProblem(problem)
                  }
                }
              }
            }, [
              h('Button', {
                props: {
                  type: 'primary',
                  size: 'small',
                  disabled: !canAttempt && problem.status !== 'solved'
                },
                style: {
                  pointerEvents: 'none' // Prevent button from capturing clicks
                }
              }, problem.status === 'solved' ? this.$t('m.View') : this.$t('m.Solve'))
            ])
          }
        }
      ]
    }
  },
  computed: {
    ...mapState(useUserStore, ['isAuthenticated', 'user', 'isAdminRole']),
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
    },
    daysUntilDue() {
      const days = dayjs(this.homework.due_date).diff(dayjs(), 'day')
      return days > 0 ? days : 0
    },
    totalScore() {
      return this.homework.problems
        .filter(p => p.status === 'solved')
        .reduce((sum, p) => sum + (p.score || 0), 0)
    },
    maxScore() {
      return this.homework.problems.reduce((sum, p) => sum + (p.score || 0), 0)
    }
  },
  mounted() {
    this.initializeComponent()
    
    // Refresh problem statuses when returning from problem page
    this.$router.afterEach((to, from) => {
      if (from.name === 'problem-details' && to.name === 'student-homework-detail') {
        this.checkProblemStatuses()
      }
    })
  },
  methods: {
    initializeComponent() {
      this.loadHomework()
      this.loadComments()
    },
    
    async loadHomework() {
      this.loading = true
      
      // Connect to real backend
      try {
        const res = await api.getStudentHomeworkDetail(this.homeworkId)
        this.homework = res.data.data || {
          title: 'Loading...',
          description: '',
          status: 'assigned',
          problems: [],
          due_date: new Date()
        }
        
        // Ensure problems is an array
        if (!this.homework.problems) {
          this.homework.problems = []
        }
        
        // Check actual submission status for each problem
        await this.checkProblemStatuses()
        
        // Update status if needed
        if (this.homework.status === 'assigned' && this.completedProblems > 0) {
          this.homework.status = 'in_progress'
        }
      } catch (err) {
        console.error('Failed to load homework:', err)
        console.error('Full error object:', JSON.stringify(err, null, 2))
        
        // The error might be the response directly based on the API structure
        const errorData = err.data || err.response?.data
        console.error('Error data extracted:', errorData)
        
        if (errorData?.error === 'server-error' && errorData?.data) {
          this.$error(errorData.data)
        } else if (errorData?.error === 'error' && errorData?.data) {
          this.$error(errorData.data)
        } else if (errorData?.message) {
          this.$error(errorData.message)
        } else {
          this.$error('Failed to load homework details. Please check if you have access to this homework.')
        }
        
        // Go back on any error for now
        setTimeout(() => {
          this.$router.back()
        }, 2000)
      } finally {
        this.loading = false
      }
    },
    
    async checkProblemStatuses() {
      // Check actual submission status for each problem
      for (let problem of this.homework.problems) {
        try {
          // Get user's submissions for this specific problem
          const res = await api.getSubmissionList(0, 10, {
            myself: 1,
            problem_id: problem.problem_id || problem.id
          })
          
          if (res.data && res.data.data && res.data.data.results) {
            const submissions = res.data.data.results
            
            // Check if any submission is accepted
            const hasAccepted = submissions.some(sub => sub.result === 0)
            const hasAttempted = submissions.length > 0
            
            // Update problem status based on actual submissions
            if (hasAccepted) {
              problem.status = 'solved'
            } else if (hasAttempted) {
              problem.status = 'attempted'
            } else {
              problem.status = 'not_started'
            }
            
            // Update attempts count
            problem.attempts = submissions.length
          } else {
            // No submissions found
            problem.status = 'not_started'
            problem.attempts = 0
          }
        } catch (err) {
          console.error(`Failed to check status for problem ${problem.id}:`, err)
          // Keep existing status if check fails
        }
      }
    },
    
    async loadComments() {
      // Connect to real backend
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
    
    async submitHomework() {
      try {
        // Recheck problem statuses before submission
        await this.checkProblemStatuses()
        
        // Verify all problems are actually solved
        const allSolved = this.homework.problems.every(p => p.status === 'solved')
        if (!allSolved) {
          this.$error('Not all problems are completed. Please solve all problems before submitting.')
          return
        }
        
        await api.submitHomework(this.homeworkId)
        this.$Message.success(this.$t('m.Homework_Submitted'))
        this.loadHomework()
      } catch (err) {
        this.$error(err.data?.data || 'Failed to submit homework')
      }
    },
    
    solveProblem(problem) {
      // Navigate to the problem detail page
      // The Problem component expects the display_id (string like "001")
      const displayId = problem.display_id || problem._id || String(problem.problem_id)
      
      this.$router.push({
        name: 'problem-details',
        params: {
          problemID: displayId
        }
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
    
    getProblemStatusColor(status) {
      const colors = {
        not_started: 'default',
        attempted: 'warning',
        solved: 'success'
      }
      return colors[status] || 'default'
    },
    
    getProblemStatusText(status) {
      const statusMap = {
        not_started: 'Not_Started',
        attempted: 'Attempted',
        solved: 'Solved'
      }
      return this.$t(`m.${statusMap[status] || status}`)
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
      // Map status to translation keys
      const statusMap = {
        'assigned': 'Assigned',
        'in_progress': 'In progress',
        'submitted': 'Submitted', 
        'graded': 'Graded'
      }
      return this.$t(`m.${statusMap[status] || status}`)
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

// Animations
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.comment-list-enter-active {
  transition: all 0.3s ease;
}
.comment-list-leave-active {
  transition: all 0.3s ease;
}
.comment-list-enter {
  opacity: 0;
  transform: translateY(30px);
}
.comment-list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.homework-detail-page {
  min-height: 100vh;
  background: #f3f3f7;
  
  // Loading State
  .loading-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    
    .loading-content {
      text-align: center;
      animation: fadeIn 0.5s ease;
      
      .loading-text {
        margin-top: 20px;
        font-size: 16px;
        color: #515a6e;
      }
    }
  }
  
  // Hero Header
  .hero-header {
    position: relative;
    background: #fff;
    border-bottom: 1px solid #e8eaec;
    padding: 30px 0 20px;
    margin-bottom: 24px;
    overflow: hidden;
    
    .hero-background {
      display: none;
    }
    
    .hero-content {
      position: relative;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
      color: #17233d;
      animation: slideIn 0.6s ease;
      
      .back-button {
        color: #515a6e;
        margin-bottom: 16px;
        padding: 0;
        font-size: 15px;
        background: transparent;
        border-radius: 0;
        transition: all 0.3s ease;
        
        &:hover {
          color: #1890ff;
          background: transparent;
          transform: translateX(-3px);
        }
        
        i {
          margin-right: 4px;
        }
      }
      
      .homework-title {
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 8px;
        text-shadow: none;
        color: #17233d;
      }
      
      .homework-description {
        font-size: 14px;
        color: #808695;
        margin-bottom: 16px;
        max-width: 800px;
      }
      
      .hero-stats {
        display: flex;
        gap: 24px;
        flex-wrap: wrap;
        
        .stat-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: #515a6e;
          
          i {
            font-size: 16px;
            color: #808695;
          }
        }
      }
    }
  }
  
  // Content Wrapper
  .content-wrapper {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px 40px;
    display: flex;
    gap: 24px;
    
    .main-content {
      flex: 1;
      min-width: 0;
    }
    
    .sidebar {
      width: 360px;
      
      @media (max-width: 1024px) {
        display: none;
      }
    }
    
    @media (max-width: 768px) {
      padding: 0 16px 32px;
    }
  }
  
  // Cards Common Styles
  .ivu-card {
    border-radius: 4px;
    border: 1px solid #e8eaec;
    box-shadow: none;
    transition: all 0.3s ease;
    animation: fadeIn 0.5s ease;
    
    &:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }
    
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      
      .header-left {
        display: flex;
        align-items: center;
        gap: 8px;
        
        i {
          font-size: 20px;
          color: #1890ff;
        }
        
        h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #17233d;
        }
      }
      
      .header-right {
        color: #909399;
        font-size: 14px;
      }
    }
  }
  
  // Progress Card
  .progress-card {
    margin-bottom: 24px;
    
    .progress-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
      
      h3 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
      }
    }
    
    .progress-visual {
      display: flex;
      align-items: center;
      gap: 40px;
      
      .circular-progress {
        position: relative;
        width: 200px;
        height: 200px;
        
        svg {
          transform: rotate(-90deg);
          
          .progress-bg {
            fill: none;
            stroke: #f0f0f0;
            stroke-width: 10;
          }
          
          .progress-fill {
            fill: none;
            stroke: #1890ff;
            stroke-width: 10;
            stroke-linecap: round;
            transition: stroke-dasharray 1s ease;
          }
        }
        
        .progress-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          
          .percent {
            display: block;
            font-size: 36px;
            font-weight: 600;
            color: #303133;
          }
          
          .label {
            display: block;
            font-size: 14px;
            color: #909399;
            margin-top: 4px;
          }
        }
      }
      
      .progress-details {
        flex: 1;
        
        .detail-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          font-size: 16px;
          
          i {
            font-size: 24px;
            
            &.icon-success {
              color: #67c23a;
            }
            
            &.icon-warning {
              color: #e6a23c;
            }
          }
        }
      }
    }
  }
  
  // Problems Card
  .problems-card {
    margin-bottom: 24px;
    
    .problem-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
      
      .problem-card {
        background: #fff;
        border: 1px solid #e8eaec;
        border-radius: 4px;
        padding: 20px;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
        
        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 3px;
          height: 100%;
          background: #dcdfe6;
          transition: all 0.3s ease;
        }
        
        &.solved::before {
          background: #52c41a;
        }
        
        &.attempted::before {
          background: #faad14;
        }
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          border-color: #1890ff;
        }
        
        .problem-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
          
          .problem-number {
            font-size: 14px;
            color: #909399;
            font-weight: 600;
          }
        }
        
        .problem-title {
          font-size: 16px;
          font-weight: 600;
          color: #17233d;
          margin-bottom: 12px;
          line-height: 1.4;
        }
        
        .problem-meta {
          display: flex;
          gap: 20px;
          margin-bottom: 16px;
          
          .meta-item {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 14px;
            color: #606266;
            
            i {
              color: #909399;
            }
          }
        }
        
        .problem-status {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
          
          .status-icon {
            font-size: 20px;
            
            &.solved {
              color: #52c41a;
            }
            
            &.attempted {
              color: #faad14;
            }
          }
          
          .status-text {
            font-size: 14px;
            color: #606266;
          }
        }
        
        .problem-action {
          margin-top: auto;
        }
      }
    }
  }
  
  // Discussion Card
  .discussion-card {
    .comment-composer {
      background: #f8f9fa;
      border-radius: 4px;
      padding: 16px;
      margin-bottom: 20px;
      
      .composer-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
        
        .composer-title {
          font-weight: 600;
          color: #303133;
        }
      }
      
      .comment-textarea {
        margin-bottom: 16px;
      }
      
      .composer-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
      }
    }
    
    .comments-timeline {
      .comment-item {
        display: flex;
        gap: 16px;
        padding: 20px 0;
        border-bottom: 1px solid #ebeef5;
        
        &:last-child {
          border-bottom: none;
        }
        
        .comment-avatar {
          flex-shrink: 0;
        }
        
        .comment-body {
          flex: 1;
          
          .comment-meta {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
            
            .author {
              font-weight: 600;
              color: #303133;
              margin-right: 12px;
            }
            
            .time {
              color: #909399;
              font-size: 14px;
              flex: 1;
            }
            
            .delete-btn {
              opacity: 0;
              transition: opacity 0.3s ease;
              
              &:hover {
                color: #f56c6c;
              }
            }
          }
          
          .comment-text {
            color: #606266;
            line-height: 1.8;
            font-size: 15px;
          }
        }
        
        &:hover .delete-btn {
          opacity: 1;
        }
      }
      
      .empty-state {
        text-align: center;
        padding: 60px 20px;
        color: #909399;
        
        i {
          color: #dcdfe6;
          margin-bottom: 16px;
        }
        
        p {
          font-size: 16px;
        }
      }
    }
  }
  
  // Sidebar Cards
  .stats-card {
    margin-bottom: 20px;
    
    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      
      .stat-box {
        background: #f8f9fa;
        border-radius: 4px;
        padding: 16px;
        display: flex;
        align-items: center;
        gap: 12px;
        
        .stat-icon {
          font-size: 28px;
          color: #1890ff;
          opacity: 0.8;
        }
        
        .stat-content {
          .stat-value {
            display: block;
            font-size: 24px;
            font-weight: 600;
            color: #303133;
            line-height: 1;
          }
          
          .stat-label {
            display: block;
            font-size: 14px;
            color: #909399;
            margin-top: 4px;
          }
        }
      }
    }
  }
  
  .details-card {
    .detail-list {
      .detail-item {
        display: flex;
        align-items: flex-start;
        gap: 16px;
        padding: 16px 0;
        border-bottom: 1px solid #ebeef5;
        
        &:last-child {
          border-bottom: none;
        }
        
        .detail-icon {
          font-size: 20px;
          color: #909399;
          margin-top: 2px;
        }
        
        .detail-content {
          flex: 1;
          
          .detail-label {
            display: block;
            font-size: 14px;
            color: #909399;
            margin-bottom: 4px;
          }
          
          .detail-value {
            display: block;
            font-size: 16px;
            color: #303133;
            font-weight: 500;
          }
        }
      }
    }
    
    .grade-section {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #ebeef5;
      
      .grade-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;
        
        i {
          font-size: 20px;
          color: #1890ff;
        }
        
        span {
          font-weight: 600;
          color: #303133;
        }
      }
      
      .grade-display {
        text-align: center;
        padding: 20px;
        background: #f8f9fa;
        border-radius: 4px;
        margin-bottom: 20px;
        
        .grade-number {
          font-size: 48px;
          font-weight: 700;
          line-height: 1;
        }
        
        .grade-percent {
          font-size: 24px;
          font-weight: 600;
        }
        
        &.text-success {
          color: #52c41a;
          background: #f6ffed;
        }
        
        &.text-primary {
          color: #1890ff;
          background: #e6f7ff;
        }
        
        &.text-warning {
          color: #faad14;
          background: #fffbe6;
        }
        
        &.text-error {
          color: #f5222d;
          background: #fff1f0;
        }
      }
      
      .feedback-section {
        h4 {
          font-size: 16px;
          font-weight: 600;
          color: #303133;
          margin-bottom: 12px;
        }
        
        .feedback-text {
          background: #f5f7fa;
          border-radius: 8px;
          padding: 16px;
          line-height: 1.8;
          color: #606266;
        }
      }
    }
    
    .action-section {
      margin-top: 24px;
    }
  }
  
  // Utility Classes
  .text-error {
    color: #f5222d;
  }
  
  .text-success {
    color: #52c41a;
  }
  
  .text-primary {
    color: #1890ff;
  }
  
  .text-warning {
    color: #faad14;
  }
  
  .text-info {
    color: #909399;
  }
  
  // Responsive Design
  @media (max-width: 768px) {
    .hero-header {
      padding: 40px 0 30px;
      
      .hero-content {
        .homework-title {
          font-size: 28px;
        }
        
        .homework-description {
          font-size: 16px;
        }
        
        .hero-stats {
          gap: 20px;
          
          .stat-item {
            font-size: 14px;
          }
        }
      }
    }
    
    .progress-card .progress-visual {
      flex-direction: column;
      
      .circular-progress {
        width: 160px;
        height: 160px;
      }
    }
    
    .problems-card .problem-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>