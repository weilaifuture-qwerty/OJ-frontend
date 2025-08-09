<template>
  <Card class="daily-check-in" :bordered="false">
    <template #title>
      <div class="card-title">
        <Icon type="md-calendar" />
        <span>{{ $t('m.Daily_Check_In') }}</span>
      </div>
    </template>
    <div class="check-in-content">
      <div v-if="!isAuthenticated" class="login-prompt-compact">
        <p>{{ $t('m.Please_login_to_check_in') }}</p>
        <Button type="primary" size="small" @click="goToLogin">{{ $t('m.Login') }}</Button>
      </div>
      <template v-else>
        <div class="compact-container">
          <!-- Streak info on first row -->
          <div class="streak-row">
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
          </div>
          
          <!-- Check-in button on separate row -->
          <div class="button-row">
            <Button 
              v-if="!checkedInToday"
              type="primary" 
              size="default"
              :loading="checking"
              @click="checkIn"
              class="check-in-button-full"
            >
              <Icon type="md-checkmark" />
              Check In Today
            </Button>
            <div v-else class="checked-status-full">
              <Icon type="ios-checkmark-circle" size="24" color="#52c41a" />
              <span>Checked in today!</span>
            </div>
          </div>
          
          <!-- Debug info (remove in production) -->
          <div v-if="showDebug" class="debug-info" style="font-size: 10px; background: #f0f0f0; padding: 8px; margin-bottom: 10px; border-radius: 4px;">
            <div><strong>Debug Info:</strong></div>
            <div>Today: {{ dayjs().format('YYYY-MM-DD HH:mm:ss') }}</div>
            <div>Last Check-in: {{ userStreak.last_check_in }}</div>
            <div>Check-in Days: {{ userStreak.check_in_days.join(', ') }}</div>
            <div>Checked Today: {{ checkedInToday }}</div>
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
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

// Extend dayjs with UTC and timezone support
dayjs.extend(utc)
dayjs.extend(timezone)

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
      },
      showDebug: false // Set to true to see debug info
    }
  },
  computed: {
    isAuthenticated() {
      const userStore = useUserStore()
      return userStore.isAuthenticated
    },
    checkedInToday() {
      if (!this.userStreak.check_in_days || this.userStreak.check_in_days.length === 0) {
        return false
      }
      
      // Check if today's date exists in check_in_days array
      const today = dayjs().format('YYYY-MM-DD')
      return this.userStreak.check_in_days.some(date => {
        const checkDate = dayjs(date).format('YYYY-MM-DD')
        return checkDate === today
      })
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
          this.parseDate(date).startOf('day').isSame(day.startOf('day'), 'day')
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
        // Format both dates to YYYY-MM-DD for consistent comparison
        const currentDateStr = current.format('YYYY-MM-DD')
        const isChecked = this.userStreak.check_in_days.some(date => {
          // Simple string comparison - backend returns dates in user's timezone
          return date === currentDateStr
        })
        
        days.push({
          date: currentDateStr,
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
    
    // Helper method to safely parse and compare dates
    isSameDay(date1, date2) {
      // Parse dates as UTC if they look like ISO strings, otherwise as local
      const d1 = this.parseDate(date1)
      const d2 = this.parseDate(date2)
      return d1.startOf('day').isSame(d2.startOf('day'), 'day')
    },
    
    // Parse date intelligently - if it's an ISO string, parse as UTC then convert to local
    parseDate(date) {
      if (typeof date === 'string' && date.includes('T') && date.includes('Z')) {
        // ISO string with timezone - parse as UTC and convert to local
        return dayjs.utc(date).local()
      } else if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Date-only string (YYYY-MM-DD) - parse as local date
        return dayjs(date).startOf('day')
      } else {
        // Other formats - parse normally
        return dayjs(date)
      }
    },
    
    // Convert date to local date string to avoid timezone issues
    toLocalDateString(date) {
      const parsed = this.parseDate(date)
      return parsed.format('YYYY-MM-DD')
    },
    async loadStreakData() {
      try {
        const res = await api.getUserStreak()
        if (res.data && res.data.data) {
          // Process the dates to ensure they're in local timezone
          const streakData = res.data.data
          console.log('[DEBUG] Raw streak data from API:', streakData)
          
          // Backend now handles timezone correctly, so just use the dates as-is
          const processedCheckInDays = (streakData.check_in_days || [])
          console.log('[DEBUG] Check-in days from backend:', processedCheckInDays)
          
          this.userStreak = {
            ...streakData,
            check_in_days: processedCheckInDays,
            last_check_in: streakData.last_check_in ? 
              this.toLocalDateString(streakData.last_check_in) : null
          }
          
          console.log('[DEBUG] Processed streak data:', this.userStreak)
        } else {
          throw new Error('No streak data in response')
        }
      } catch (error) {
        // If API doesn't exist yet, use mock data
        const today = dayjs()
        // Set initial state - user hasn't checked in today yet
        this.userStreak = {
          current_streak: 4, // Current streak not including today
          best_streak: 12,
          last_check_in: today.subtract(1, 'day').startOf('day').format(), // Last check-in was yesterday
          check_in_days: [] // Will be populated by generateMockCheckIns
        }
        
        // Generate mock check-in days
        this.userStreak.check_in_days = this.generateMockCheckIns()
      }
    },
    async checkIn() {
      this.checking = true
      
      // Debug: Log current date information
      const now = new Date()
      const dayjs_now = dayjs()
      console.log('[DEBUG] Check-in clicked at:', {
        'JavaScript Date': now.toString(),
        'ISO String': now.toISOString(),
        'Local Date String': now.toLocaleDateString(),
        'Local Time String': now.toLocaleTimeString(),
        'Timezone Offset': now.getTimezoneOffset(),
        'DayJS format': dayjs_now.format(),
        'DayJS ISO': dayjs_now.toISOString(),
        'DayJS startOf day': dayjs_now.startOf('day').format(),
        'DayJS YYYY-MM-DD': dayjs_now.format('YYYY-MM-DD')
      })
      
      try {
        const res = await api.dailyCheckIn()
        console.log('[DEBUG] Check-in API response:', res)
        
        if (res.data && res.data.data) {
          console.log('[DEBUG] Check-in response:', res.data.data)
          
          // Update streak data from check-in response
          const checkInData = res.data.data
          this.userStreak.current_streak = checkInData.current_streak
          this.userStreak.best_streak = checkInData.best_streak || this.userStreak.best_streak
          
          // Add today to check_in_days
          const today = dayjs().format('YYYY-MM-DD')
          if (!this.userStreak.check_in_days.includes(today)) {
            this.userStreak.check_in_days.push(today)
          }
          this.userStreak.last_check_in = dayjs().format()
          
          this.$Message.success(checkInData.message || this.$t('m.Check_In_Success'))
          
          // Show streak animation if streak is continuing
          if (this.userStreak.current_streak > 1) {
            this.showStreakAnimation()
          }
        } else {
          throw new Error('Check-in failed - no data in response')
        }
      } catch (error) {
        console.error('[DEBUG] Check-in error:', error)
        
        // Check if user has already checked in today before proceeding
        const today = dayjs().format('YYYY-MM-DD')
        if (this.userStreak.check_in_days.includes(today)) {
          this.$Message.warning(this.$t('m.Already_Checked_In_Today'))
          return
        }
        
        // Mock implementation since backend doesn't have this endpoint yet
        // Check if continuing streak or starting new one
        const lastCheckIn = this.userStreak.last_check_in ? 
          dayjs(this.userStreak.last_check_in).startOf('day') : null
        const yesterday = dayjs().subtract(1, 'day').startOf('day')
        
        if (lastCheckIn && lastCheckIn.isSame(yesterday, 'day')) {
          // Continue streak
          this.userStreak.current_streak += 1
        } else {
          // New streak
          this.userStreak.current_streak = 1
        }
        
        this.userStreak.best_streak = Math.max(this.userStreak.best_streak, this.userStreak.current_streak)
        const checkInDate = dayjs().startOf('day')
        this.userStreak.last_check_in = checkInDate.format()
        
        // Debug: Log what we're storing
        console.log('[DEBUG] Storing check-in date:', {
          'checkInDate': checkInDate.format(),
          'checkInDate ISO': checkInDate.toISOString(),
          'checkInDate YYYY-MM-DD': checkInDate.format('YYYY-MM-DD')
        })
        
        // Add today to check_in_days if not already there
        const todayDateStr = checkInDate.format('YYYY-MM-DD')
        const todayExists = this.userStreak.check_in_days.some(date => {
          const isSame = dayjs(date).startOf('day').isSame(checkInDate, 'day')
          console.log('[DEBUG] Comparing dates:', {
            'existing date': date,
            'today': todayDateStr,
            'isSame': isSame
          })
          return isSame
        })
        
        if (!todayExists) {
          console.log('[DEBUG] Adding today to check_in_days:', todayDateStr)
          this.userStreak.check_in_days.push(todayDateStr)
        } else {
          console.log('[DEBUG] Today already exists in check_in_days')
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
      
      // Add last 4 days for current streak (not including today if not checked in)
      const hasCheckedToday = this.userStreak.last_check_in && 
                            dayjs(this.userStreak.last_check_in).startOf('day').isSame(today.startOf('day'), 'day')
      
      // If user has checked in today, include today
      if (hasCheckedToday) {
        days.push(today.startOf('day').format('YYYY-MM-DD'))
      }
      
      // Add previous consecutive days for current streak
      for (let i = 1; i <= 4; i++) {
        const checkInDate = today.subtract(i, 'day').startOf('day').format('YYYY-MM-DD')
        days.push(checkInDate)
      }
      
      // Add some random check-ins from earlier in the month (for demonstration)
      const currentMonth = today.month()
      const currentYear = today.year()
      
      // Add a few scattered check-ins from earlier in the month
      const scatteredDays = [3, 7, 11, 15, 18]
      scatteredDays.forEach(day => {
        if (day < today.date() - 5) { // Don't overlap with streak days
          const checkDate = dayjs().year(currentYear).month(currentMonth).date(day)
          if (checkDate.isBefore(today.subtract(5, 'day'))) {
            days.push(checkDate.format('YYYY-MM-DD'))
          }
        }
      })
      
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
    .streak-row {
      display: flex;
      justify-content: center;
      margin-bottom: 12px;
    }
    
    .button-row {
      display: flex;
      justify-content: center;
      margin-bottom: 16px;
    }
    
    .streak-info-compact {
      display: flex;
      align-items: center;
      gap: 20px;
      
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
    
    .check-in-button-full {
      width: 100%;
      max-width: 200px;
      i {
        margin-right: 4px;
      }
    }
    
    .checked-status-full {
      display: flex;
      align-items: center;
      justify-content: center;
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