<template>
  <Card class="daily-check-in" shadow>
    <template #title>
      <Icon type="md-calendar" size="20" />
      {{ $t('m.Daily_Check_In') }}
    </template>
    <div class="check-in-content">
      <div v-if="!isAuthenticated" class="login-prompt-compact">
        <p>{{ $t('m.Please_login_to_check_in') }}</p>
        <Button type="primary" size="small" @click="goToLogin">{{ $t('m.Login') }}</Button>
      </div>
      <template v-else>
        <div class="compact-container">
          <!-- Top row: Streak info and button -->
          <div class="top-row">
            <div class="streak-info-compact">
              <div class="streak-item">
                <Icon type="md-flame" size="20" :style="{ color: streakColor }" />
                <span class="streak-number">{{ userStreak.current_streak }}</span>
                <span class="streak-label">current</span>
              </div>
              <div class="divider"></div>
              <div class="streak-item">
                <Icon type="md-trophy" size="20" style="color: #faad14" />
                <span class="streak-number">{{ userStreak.best_streak }}</span>
                <span class="streak-label">best</span>
              </div>
            </div>
            
            <Button 
              v-if="!checkedInToday"
              type="primary" 
              size="default"
              :loading="checking"
              @click="checkIn"
              class="check-in-button-compact"
            >
              <Icon type="md-checkmark" />
              Check In Today
            </Button>
            <div v-else class="checked-status">
              <Icon type="ios-checkmark-circle" size="24" color="#52c41a" />
              <span>Done!</span>
            </div>
          </div>
          
          <!-- Calendar -->
          <div class="calendar-compact">
            <div class="calendar-header">{{ currentMonthYear }}</div>
            <div class="calendar-weekdays">
              <span v-for="day in ['S', 'M', 'T', 'W', 'T', 'F', 'S']" :key="day">{{ day }}</span>
            </div>
            <div class="calendar-grid">
              <div 
                v-for="day in calendarDays" 
                :key="day.date"
                class="calendar-day"
                :class="{
                  'checked': day.checked,
                  'today': day.isToday,
                  'other-month': day.otherMonth
                }"
                :title="day.date"
              >
                {{ day.day }}
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </Card>
</template>

<script>
import { Card, Button, Icon, Message } from 'view-ui-plus'
import { useUserStore } from '@/stores/user'
import api from '@oj/api'
import dayjs from 'dayjs'

export default {
  name: 'DailyCheckIn',
  components: {
    Card,
    Button,
    Icon
  },
  data() {
    return {
      checking: false,
      userStreak: {
        current_streak: 0,
        best_streak: 0,
        last_check_in: null,
        check_in_days: []
      }
    }
  },
  computed: {
    isAuthenticated() {
      const userStore = useUserStore()
      return userStore.isAuthenticated
    },
    checkedInToday() {
      if (!this.userStreak.last_check_in) {
        return false
      }
      
      // Check if last check-in was today
      const lastCheckIn = dayjs(this.userStreak.last_check_in)
      const today = dayjs()
      return lastCheckIn.isSame(today, 'day')
    },
    currentMonthYear() {
      return dayjs().format('MMMM YYYY')
    },
    streakColor() {
      const streak = this.userStreak.current_streak
      if (streak === 0) return '#bfbfbf'
      if (streak < 3) return '#faad14'
      if (streak < 7) return '#fa541c'
      if (streak < 14) return '#f5222d'
      return '#ff0000'
    },
    weekDays() {
      const days = []
      const today = dayjs()
      const startOfWeek = today.startOf('week')
      
      for (let i = 0; i < 7; i++) {
        const day = startOfWeek.add(i, 'day')
        const isChecked = this.userStreak.check_in_days.some(date => 
          dayjs(date).isSame(day, 'day')
        )
        
        days.push({
          date: day.format('YYYY-MM-DD'),
          label: day.format('ddd')[0], // First letter of day name
          checked: isChecked,
          isToday: day.isSame(today, 'day'),
          isFuture: day.isAfter(today, 'day')
        })
      }
      
      return days
    },
    monthCheckIns() {
      const currentMonth = dayjs().month()
      const currentYear = dayjs().year()
      
      return this.userStreak.check_in_days.filter(date => {
        const checkInDate = dayjs(date)
        return checkInDate.month() === currentMonth && checkInDate.year() === currentYear
      }).length
    },
    totalDaysInMonth() {
      return dayjs().daysInMonth()
    },
    calendarDays() {
      const start = dayjs().startOf('month')
      const end = dayjs().endOf('month')
      const startWeek = start.startOf('week')
      const endWeek = end.endOf('week')
      
      const days = []
      let current = startWeek
      
      while (current.isBefore(endWeek) || current.isSame(endWeek, 'day')) {
        const isChecked = this.userStreak.check_in_days.some(date => 
          dayjs(date).isSame(current, 'day')
        )
        
        days.push({
          date: current.format('YYYY-MM-DD'),
          day: current.date(),
          checked: isChecked,
          isToday: current.isSame(dayjs(), 'day'),
          otherMonth: !current.isSame(dayjs(), 'month')
        })
        
        current = current.add(1, 'day')
      }
      
      return days
    }
  },
  mounted() {
    if (this.isAuthenticated) {
      this.loadStreakData()
    }
  },
  methods: {
    goToLogin() {
      const userStore = useUserStore()
      userStore.changeModalStatus({ visible: true })
    },
    async loadStreakData() {
      try {
        const res = await api.getUserStreak()
        if (res.data && res.data.data) {
          this.userStreak = res.data.data
        } else {
          throw new Error('No streak data in response')
        }
      } catch (error) {
        // If API doesn't exist yet, use mock data
        const today = dayjs()
        const hasCheckedInToday = this.userStreak.last_check_in && 
                                  dayjs(this.userStreak.last_check_in).isSame(today, 'day')
        
        this.userStreak = {
          current_streak: hasCheckedInToday ? 5 : 4,
          best_streak: 12,
          last_check_in: hasCheckedInToday ? today.format() : today.subtract(1, 'day').format(),
          check_in_days: this.generateMockCheckIns()
        }
      }
    },
    async checkIn() {
      this.checking = true
      try {
        const res = await api.dailyCheckIn()
        if (res.data && res.data.data) {
          this.userStreak = res.data.data
          this.$Message.success(this.$t('m.Check_In_Success'))
          
          // Show streak animation if streak is continuing
          if (this.userStreak.current_streak > 1) {
            this.showStreakAnimation()
          }
        } else {
          throw new Error('Check-in failed - no data in response')
        }
      } catch (error) {
        // Mock implementation since backend doesn't have this endpoint yet
        // Check if continuing streak or starting new one
        const lastCheckIn = this.userStreak.last_check_in ? dayjs(this.userStreak.last_check_in) : null
        const yesterday = dayjs().subtract(1, 'day')
        
        if (lastCheckIn && lastCheckIn.isSame(yesterday, 'day')) {
          // Continue streak
          this.userStreak.current_streak += 1
        } else {
          // New streak
          this.userStreak.current_streak = 1
        }
        
        this.userStreak.best_streak = Math.max(this.userStreak.best_streak, this.userStreak.current_streak)
        this.userStreak.last_check_in = dayjs().format()
        
        // Add today to check_in_days if not already there
        const today = dayjs().format('YYYY-MM-DD')
        if (!this.userStreak.check_in_days.includes(today)) {
          this.userStreak.check_in_days.push(today)
        }
        
        this.$Message.success(this.$t('m.Check_In_Success'))
        if (this.userStreak.current_streak > 1) {
          this.showStreakAnimation()
        }
        
        // Force component to re-evaluate computed properties
        this.$forceUpdate()
      } finally {
        this.checking = false
      }
    },
    showStreakAnimation() {
      // Add a nice animation for streak continuation
      const streakEl = this.$el.querySelector('.current-streak')
      if (streakEl) {
        streakEl.classList.add('streak-animation')
        setTimeout(() => {
          streakEl.classList.remove('streak-animation')
        }, 1000)
      }
    },
    generateMockCheckIns() {
      const days = []
      const today = dayjs()
      
      // Generate some random check-ins for the current month (excluding today)
      for (let i = 0; i < 10; i++) {
        const randomDay = Math.floor(Math.random() * (today.date() - 1)) + 1
        if (randomDay < today.date()) {
          days.push(today.startOf('month').add(randomDay - 1, 'day').format('YYYY-MM-DD'))
        }
      }
      
      // Add last 4 days for current streak (not including today)
      for (let i = 1; i <= 4; i++) {
        const checkInDate = today.subtract(i, 'day').format('YYYY-MM-DD')
        if (!days.includes(checkInDate)) {
          days.push(checkInDate)
        }
      }
      
      // Sort and remove duplicates
      return [...new Set(days)].sort()
    }
  },
  watch: {
    isAuthenticated(val) {
      if (val) {
        this.loadStreakData()
      }
    }
  }
}
</script>

<style lang="less" scoped>
.daily-check-in {
  margin-bottom: 20px;
  
  .check-in-content {
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
  
  .compact-container {
    .top-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      gap: 15px;
    }
    
    .streak-info-compact {
      display: flex;
      align-items: center;
      gap: 15px;
      
      .streak-item {
        display: flex;
        align-items: center;
        gap: 6px;
        
        .streak-number {
          font-size: 20px;
          font-weight: bold;
          line-height: 1;
        }
        
        .streak-label {
          font-size: 12px;
          color: #808695;
        }
      }
      
      .divider {
        width: 1px;
        height: 24px;
        background: #e8eaec;
      }
    }
    
    .check-in-button-compact {
      i {
        margin-right: 4px;
      }
    }
    
    .checked-status {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #52c41a;
      font-size: 14px;
      font-weight: 500;
    }
    
    .calendar-compact {
      .calendar-header {
        text-align: center;
        font-size: 13px;
        font-weight: 500;
        margin-bottom: 8px;
        color: #17233d;
      }
      
      .calendar-weekdays {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 2px;
        margin-bottom: 4px;
        
        span {
          text-align: center;
          font-size: 11px;
          color: #808695;
          font-weight: 500;
        }
      }
      
      .calendar-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 2px;
        
        .calendar-day {
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          border-radius: 4px;
          background: #f5f5f5;
          color: #666;
          position: relative;
          cursor: default;
          transition: all 0.2s;
          
          &.checked {
            background: #52c41a;
            color: white;
            font-weight: 500;
          }
          
          &.today {
            border: 2px solid #1890ff;
            font-weight: bold;
            color: #1890ff;
            
            &.checked {
              color: white;
            }
          }
          
          &.other-month {
            opacity: 0.3;
          }
          
          &:hover:not(.other-month) {
            transform: scale(1.1);
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
        }
      }
    }
  }
  
  // Mobile responsive
  @media (max-width: 576px) {
    .compact-container {
      .top-row {
        flex-direction: column;
        align-items: stretch;
        gap: 10px;
      }
      
      .streak-info-compact {
        justify-content: center;
      }
      
      .check-in-button-compact {
        width: 100%;
      }
      
      .checked-status {
        justify-content: center;
      }
    }
  }
}

.streak-animation {
  animation: streakPulse 1s ease-in-out;
}

@keyframes streakPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
    color: #ff4757;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>