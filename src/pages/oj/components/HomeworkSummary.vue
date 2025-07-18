<template>
  <Card class="homework-summary" :bordered="false">
    <template #title>
      <div class="card-title">
        <Icon type="ios-book" />
        <span>{{ $t('m.Homework') }}</span>
      </div>
    </template>
    <div class="homework-content">
      <div v-if="!isAuthenticated" class="login-prompt-compact">
        <p>{{ $t('m.Please_login_to_view_homework') }}</p>
        <Button type="primary" size="small" @click="goToLogin">{{ $t('m.Login') }}</Button>
      </div>
      <template v-else>
        <div class="homework-info" @click="goToHomework">
          <div v-if="loading" class="loading-state">
            <Spin size="small" />
            <span>{{ $t('m.Loading') }}...</span>
          </div>
          <template v-else>
            <div class="homework-status" :class="{ 'all-completed': pendingCount === 0 }">
              <Icon :type="pendingCount > 0 ? 'ios-alert' : 'ios-checkmark-circle'" size="24" />
              <div class="status-text">
                <span v-if="pendingCount > 0" class="pending-count">
                  {{ pendingCount }} {{ $t('m.homework_assignments_pending') }}
                </span>
                <span v-else class="completed-text">
                  {{ $t('m.All_homework_completed') }}
                </span>
                <span class="view-all">{{ $t('m.View_all_homework') }} →</span>
              </div>
            </div>
            <div v-if="nearestDeadline && pendingCount > 0" class="deadline-info" :class="{ 'overdue': isOverdue(nearestDeadline) }">
              <Icon type="ios-time-outline" size="16" />
              <span>{{ isOverdue(nearestDeadline) ? '' : $t('m.Next_due') + ': ' }}{{ formatDeadline(nearestDeadline) }}</span>
            </div>
          </template>
        </div>
      </template>
    </div>
  </Card>
</template>

<script>
import { Card, Button, Icon, Spin } from 'view-ui-plus'
import { useUserStore } from '@/stores/user'
import api from '@oj/api'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

export default {
  name: 'HomeworkSummary',
  components: {
    Card,
    Button,
    Icon,
    Spin
  },
  data() {
    return {
      loading: false,
      pendingCount: 0,
      nearestDeadline: null,
      homeworkList: []
    }
  },
  computed: {
    isAuthenticated() {
      const userStore = useUserStore()
      return userStore.isAuthenticated
    },
    currentUserId() {
      const userStore = useUserStore()
      return userStore.user?.id
    }
  },
  mounted() {
    if (this.isAuthenticated) {
      this.loadHomeworkSummary()
    }
  },
  methods: {
    goToLogin() {
      const userStore = useUserStore()
      userStore.changeModalStatus({ visible: true })
    },
    goToHomework() {
      this.$router.push({ name: 'student-homework-list' })
    },
    async loadHomeworkSummary() {
      this.loading = true
      try {
        // Get all homework to filter client-side
        const res = await api.getStudentHomework({
          limit: 100 // Get all homework
        })
        
        if (res.data && res.data.data) {
          const allHomework = res.data.data.results || []
          
          // Filter for incomplete homework (assigned or in_progress)
          const pendingHomework = allHomework.filter(hw => 
            hw.status === 'assigned' || hw.status === 'in_progress'
          )
          
          this.pendingCount = pendingHomework.length
          
          // Find the nearest deadline from pending homework
          if (pendingHomework.length > 0) {
            const sortedByDeadline = pendingHomework
              .filter(hw => hw.due_date || hw.deadline)
              .sort((a, b) => {
                const dateA = new Date(a.due_date || a.deadline)
                const dateB = new Date(b.due_date || b.deadline)
                return dateA - dateB
              })
            
            if (sortedByDeadline.length > 0) {
              this.nearestDeadline = sortedByDeadline[0].due_date || sortedByDeadline[0].deadline
            }
          }
        }
      } catch (error) {
        console.error('Failed to load homework summary:', error)
        // Fallback to check if we can get some data
        this.pendingCount = 0
        this.nearestDeadline = null
      } finally {
        this.loading = false
      }
    },
    mockHomeworkData() {
      // Mock data for development
      this.pendingCount = 3
      this.nearestDeadline = dayjs().add(2, 'days').format()
    },
    formatDeadline(deadline) {
      const deadlineDate = dayjs(deadline)
      const now = dayjs()
      const daysUntil = deadlineDate.diff(now, 'days')
      
      if (daysUntil < 0) {
        return this.$t('m.Overdue')
      } else if (daysUntil === 0) {
        return this.$t('m.Due_today')
      } else if (daysUntil === 1) {
        return this.$t('m.Due_tomorrow')
      } else if (daysUntil <= 7) {
        return deadlineDate.fromNow()
      } else {
        return deadlineDate.format('MMM D, YYYY')
      }
    },
    
    isOverdue(deadline) {
      return dayjs(deadline).isBefore(dayjs())
    }
  },
  watch: {
    isAuthenticated(val) {
      if (val) {
        this.loadHomeworkSummary()
      }
    }
  }
}
</script>

<style lang="less" scoped>
.homework-summary {
  margin-bottom: 20px;
  
  .homework-content {
    padding: 10px 0;
  }
  
  .login-prompt-compact {
    text-align: center;
    padding: 20px;
    
    p {
      margin-bottom: 15px;
      color: #666;
      font-size: 14px;
    }
  }
  
  .homework-info {
    cursor: pointer;
    transition: all 0.3s;
    
    &:hover {
      .homework-status {
        transform: translateX(5px);
      }
    }
  }
  
  .loading-state {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 20px;
    color: #666;
  }
  
  .homework-status {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 15px;
    border-radius: 8px;
    background: #f7f8fa;
    transition: all 0.3s;
    
    &.all-completed {
      background: #f6ffed;
      
      i {
        color: #52c41a;
      }
    }
    
    i {
      color: #ff9c00;
      flex-shrink: 0;
    }
    
    .status-text {
      flex: 1;
      
      .pending-count {
        font-size: 16px;
        font-weight: 500;
        color: #17233d;
        display: block;
        margin-bottom: 4px;
      }
      
      .completed-text {
        font-size: 16px;
        font-weight: 500;
        color: #52c41a;
        display: block;
        margin-bottom: 4px;
      }
      
      .view-all {
        font-size: 13px;
        color: #808695;
        transition: color 0.3s;
      }
    }
    
    &:hover {
      background: #eef1f6;
      
      &.all-completed {
        background: #eeffde;
      }
      
      .view-all {
        color: #2d8cf0;
      }
    }
  }
  
  .deadline-info {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 10px;
    padding: 8px 15px;
    background: #fff7e6;
    border-radius: 6px;
    font-size: 13px;
    color: #fa8c16;
    
    i {
      flex-shrink: 0;
    }
    
    &.overdue {
      background: #fff1f0;
      color: #f5222d;
      font-weight: 500;
      
      i {
        animation: pulse 2s infinite;
      }
    }
  }
  
  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      opacity: 1;
    }
  }
  
  // Mobile responsive
  @media (max-width: 576px) {
    .homework-status {
      padding: 12px;
      
      .status-text {
        .pending-count,
        .completed-text {
          font-size: 14px;
        }
        
        .view-all {
          font-size: 12px;
        }
      }
    }
    
    .deadline-info {
      font-size: 12px;
      padding: 6px 12px;
    }
  }
}
</style>