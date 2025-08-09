<template>
  <Card class="problem-suggestion" :class="{ compact }" :bordered="false">
    <template #title v-if="!hideTitle">
      <div class="card-title">
        <Icon type="ios-bulb" />
        <span>{{ $t('m.Suggested_Problems') }}</span>
      </div>
    </template>
    <div class="suggestion-content">
      <div v-if="!isAuthenticated" class="login-prompt">
        <p>{{ $t('m.Login_to_get_personalized_suggestions') }}</p>
        <Button type="primary" @click="goToLogin">{{ $t('m.Login') }}</Button>
      </div>
      
      <template v-else>
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <Spin size="large" />
          <p>{{ $t('m.Analyzing_your_practice_history') }}</p>
        </div>
        
        <!-- Daily Problem Mode -->
        <div v-else-if="todaysProblem && !todaysProblemCompleted" class="daily-problem-mode">
          <div class="daily-problem-header">
            <h3>{{ $t('m.Daily_Problem') }}</h3>
            <div class="date-badge">{{ getSimpleDate() }}</div>
          </div>
          
          <div class="daily-problem-card">
            <router-link 
              :to="{ name: 'problem-details', params: { problemID: todaysProblem._id } }"
              class="problem-link"
              @click="trackProblemClick"
            >
              <h4 class="problem-name">{{ todaysProblem.title }}</h4>
              <div class="problem-meta">
                <Tag color="gold" size="small">
                  <Icon type="md-star" size="12" />
                  {{ $t('m.Problem_of_the_Day') }}
                </Tag>
                <span class="difficulty-badge" :class="`difficulty-${todaysProblem.difficulty.toLowerCase()}`">
                  {{ $t('m.' + todaysProblem.difficulty) }}
                </span>
              </div>
            </router-link>
          </div>
          
          <div class="daily-actions">
            <Button type="primary" @click="goToSolve" size="large" long>
              <Icon type="md-arrow-forward" />
              {{ $t('m.Go_to_Solve') }}
            </Button>
            <Button type="text" @click="viewMoreProblems" size="small">
              {{ $t('m.View_More_Problems') }}
            </Button>
          </div>
          
          <div class="motivation-tip">
            <Icon type="ios-quote" />
            <p>{{ getMotivationalQuote() }}</p>
          </div>
        </div>
        
        <!-- Completed Today -->
        <div v-else-if="todaysProblemCompleted" class="completed-today">
          <div class="completion-banner">
            <Icon type="ios-checkmark-circle" size="32" />
            <div class="completion-text">
              <h4>{{ $t('m.Great_Job') }}</h4>
              <p>{{ getStreakDays() }} {{ $t('m.day_streak') }}</p>
            </div>
          </div>
          
          <div class="next-suggestions">
            <h4>{{ $t('m.Want_More_Practice') }}</h4>
            <div class="bonus-problems">
              <router-link 
                v-for="(problem, index) in bonusProblems" 
                :key="problem._id"
                :to="{ name: 'problem-details', params: { problemID: problem._id } }"
                class="bonus-problem-card"
              >
                <span class="problem-title">{{ problem.title }}</span>
                <span class="difficulty-badge" :class="`difficulty-${problem.difficulty.toLowerCase()}`">
                  {{ $t('m.' + problem.difficulty) }}
                </span>
              </router-link>
            </div>
            <Button type="text" @click="loadMoreProblems" :loading="loadingMore" size="small">
              {{ $t('m.Load_More_Problems') }}
              <Icon type="ios-arrow-down" />
            </Button>
          </div>
        </div>
        
        <!-- Regular Suggestions List (fallback) -->
        <div v-else-if="suggestions.length > 0" class="suggestions-list">
          <div class="suggestion-header">
            <p class="suggestion-intro">{{ $t('m.Based_on_your_recent_practice') }}</p>
            <Button 
              type="text" 
              size="small" 
              @click="refreshSuggestions"
              :loading="refreshing"
            >
              <Icon type="md-refresh" />
              {{ $t('m.Refresh') }}
            </Button>
          </div>
          
          <div 
            v-for="(problem, index) in displaySuggestions" 
            :key="problem._id"
            class="problem-item"
            :class="{ 'recommended': index === 0 && !compact }"
          >
            <div class="problem-header">
              <router-link 
                :to="{ name: 'problem-details', params: { problemID: problem._id } }"
                class="problem-title"
              >
                {{ problem.title }}
              </router-link>
              <Tag v-if="index === 0" color="gold">
                <Icon type="md-star" size="12" />
                {{ $t('m.Recommended') }}
              </Tag>
            </div>
            
            <div class="problem-info">
              <span class="difficulty" :class="`difficulty-${problem.difficulty.toLowerCase()}`">
                <Icon type="md-speedometer" size="14" />
                {{ $t('m.' + problem.difficulty) }}
              </span>
              <span class="ac-rate">
                <Icon type="md-checkmark-circle" size="14" />
                {{ getACRate(problem.accepted_number, problem.submission_number) }}
              </span>
              <span class="submission-count">
                <Icon type="md-people" size="14" />
                {{ problem.submission_number }} {{ $t('m.Submissions') }}
              </span>
            </div>
            
            <div class="problem-tags" v-if="problem.tags && problem.tags.length">
              <Tag v-for="tag in problem.tags.slice(0, 3)" :key="tag">
                {{ tag }}
              </Tag>
              <span v-if="problem.tags.length > 3" class="more-tags">
                +{{ problem.tags.length - 3 }}
              </span>
            </div>
            
            <div class="ai-reasoning" v-if="problem.ai_reason">
              <Icon type="ios-bulb-outline" size="14" />
              <span>{{ problem.ai_reason }}</span>
            </div>
          </div>
          
          <div class="view-more">
            <Button type="text" @click="viewAllSuggestions">
              {{ $t('m.View_More_Suggestions') }}
              <Icon type="ios-arrow-forward" />
            </Button>
          </div>
        </div>
        
        <!-- No Suggestions -->
        <div v-else class="no-suggestions">
          <Icon type="ios-help-circle-outline" size="48" color="#ccc" />
          <p>{{ $t('m.No_suggestions_available') }}</p>
          <small>{{ $t('m.Try_solving_more_problems') }}</small>
          <Button type="primary" @click="goToProblems" style="margin-top: 15px;">
            {{ $t('m.Browse_Problems') }}
          </Button>
        </div>
      </template>
    </div>
  </Card>
</template>

<script>
import { Card, Button, Icon, Tag, Spin, Message } from 'view-ui-plus'
import { useUserStore } from '@/stores/user'
import api from '@oj/api'

export default {
  name: 'ProblemSuggestion',
  components: {
    Card,
    Button,
    Icon,
    Tag,
    Spin
  },
  props: {
    compact: {
      type: Boolean,
      default: false
    },
    extended: {
      type: Boolean,
      default: false
    },
    hideTitle: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      refreshing: false,
      suggestions: [],
      userProfile: null,
      todaysProblem: null,
      todaysProblemCompleted: false,
      userSubmissions: {}, // Track user submissions by problem ID
      lastSuggestionDate: null,
      bonusProblems: [],
      loadingMore: false,
      completionTime: null,
      streakDays: 0
    }
  },
  computed: {
    isAuthenticated() {
      const userStore = useUserStore()
      return userStore.isAuthenticated
    },
    displaySuggestions() {
      if (this.compact) {
        return this.suggestions.slice(0, 3)
      }
      if (this.extended) {
        return this.suggestions
      }
      return this.suggestions.slice(0, 5)
    }
  },
  mounted() {
    if (this.isAuthenticated) {
      this.loadDailyProblem()
      this.checkProblemStatus()
    }
  },
  methods: {
    goToLogin() {
      const userStore = useUserStore()
      userStore.changeModalStatus({ visible: true })
    },
    
    goToProblems() {
      this.$router.push({ name: 'problem-list' })
    },
    
    async loadSuggestions() {
      this.loading = true
      try {
        // Get user profile and practice history
        const userRes = await api.getUserInfo()
        this.userProfile = userRes.data.data
        
        // Get AI-powered suggestions
        const res = await api.getProblemSuggestions()
        if (res.data && res.data.data && res.data.data.suggestions) {
          this.suggestions = res.data.data.suggestions
        } else {
          // Fallback to mock suggestions if API returns empty
          this.suggestions = await this.generateMockSuggestions()
        }
      } catch (error) {
        // Use mock suggestions for now
        this.suggestions = await this.generateMockSuggestions()
      } finally {
        this.loading = false
      }
    },
    
    async refreshSuggestions() {
      this.refreshing = true
      try {
        await this.loadSuggestions()
        this.$Message.success(this.$t('m.Suggestions_refreshed'))
      } finally {
        this.refreshing = false
      }
    },
    
    async generateMockSuggestions() {
      // Mock AI logic to suggest problems based on user level
      const mockProblems = [
        {
          _id: 'suggested-1',
          title: 'Two Sum',
          difficulty: 'Low',
          accepted_number: 1523,
          submission_number: 2341,
          tags: ['Array', 'Hash Table'],
          ai_reason: 'Good for practicing hash table techniques based on your recent submissions'
        },
        {
          _id: 'suggested-2',
          title: 'Binary Tree Level Order Traversal',
          difficulty: 'Mid',
          accepted_number: 892,
          submission_number: 1456,
          tags: ['Tree', 'BFS', 'Queue'],
          ai_reason: 'You solved similar tree problems recently, this will strengthen your BFS skills'
        },
        {
          _id: 'suggested-3',
          title: 'Longest Palindromic Substring',
          difficulty: 'Mid',
          accepted_number: 645,
          submission_number: 1823,
          tags: ['String', 'Dynamic Programming'],
          ai_reason: 'Next step in DP after your recent "Maximum Subarray" solution'
        }
      ]
      
      // Simulate AI processing delay
      return new Promise(resolve => {
        setTimeout(() => resolve(mockProblems), 500)
      })
    },
    
    getACRate(accepted, total) {
      if (total === 0) return '0.00%'
      return ((accepted / total) * 100).toFixed(2) + '%'
    },
    
    viewAllSuggestions() {
      // Navigate to problems page with AI suggestions filter
      this.$router.push({
        name: 'problem-list',
        query: { suggested: true }
      })
    },
    
    async loadDailyProblem() {
      // Check if we already have today's problem
      const today = new Date().toDateString()
      const savedDate = localStorage.getItem('lastProblemDate')
      const savedProblem = localStorage.getItem('todaysProblem')
      
      if (savedDate === today && savedProblem) {
        this.todaysProblem = JSON.parse(savedProblem)
      } else {
        // Load new daily problem
        await this.loadSuggestions()
        if (this.suggestions.length > 0) {
          this.todaysProblem = this.suggestions[0]
          
          // Save to localStorage
          localStorage.setItem('lastProblemDate', today)
          localStorage.setItem('todaysProblem', JSON.stringify(this.todaysProblem))
        }
      }
      
      // Check if problem is completed
      if (this.todaysProblem) {
        await this.checkProblemStatus()
      }
    },
    
    async checkProblemStatus() {
      if (!this.todaysProblem) return
      
      try {
        // Check user's submissions for this problem
        const res = await api.getSubmissionList(0, 1, {
          myself: 1,
          problem_id: this.todaysProblem._id,
          result: 0 // Accepted submissions only
        })
        
        if (res.data && res.data.data && res.data.data.results.length > 0) {
          this.todaysProblemCompleted = true
          this.completionTime = new Date(res.data.data.results[0].create_time).toLocaleTimeString()
          await this.updateStreakDays()
          this.loadBonusProblems()
        } else {
          this.todaysProblemCompleted = false
        }
      } catch (error) {
        console.error('Error checking problem status:', error)
        this.todaysProblemCompleted = false
      }
    },
    
    goToSolve() {
      // Navigate to the problem page
      this.$router.push({
        name: 'problem-details',
        params: { problemID: this.todaysProblem._id }
      })
    },
    
    viewMoreProblems() {
      // Navigate to problems list
      this.$router.push({ name: 'problem-list' })
    },
    
    async loadBonusProblems() {
      // Load additional problems from suggestions
      if (this.suggestions.length > 1) {
        this.bonusProblems = this.suggestions.slice(1, 4)
      } else {
        await this.loadSuggestions()
        this.bonusProblems = this.suggestions.slice(0, 3)
      }
    },
    
    async loadMoreProblems() {
      this.loadingMore = true
      try {
        // Load more suggestions
        await this.loadSuggestions()
        this.bonusProblems = [...this.bonusProblems, ...this.suggestions.slice(0, 3)]
      } finally {
        this.loadingMore = false
      }
    },
    
    async calculateStreak() {
      try {
        // Get user's recent accepted submissions
        const res = await api.getSubmissionList(0, 100, {
          myself: 1,
          result: 0 // Accepted submissions only
        })
        
        if (!res.data || !res.data.data) return 0
        
        const submissions = res.data.data.results
        if (submissions.length === 0) return 0
        
        // Group submissions by date
        const submissionDates = new Set()
        submissions.forEach(sub => {
          const date = new Date(sub.create_time).toDateString()
          submissionDates.add(date)
        })
        
        // Calculate streak
        let streak = 0
        const today = new Date()
        let currentDate = today
        
        while (true) {
          const dateStr = currentDate.toDateString()
          if (submissionDates.has(dateStr)) {
            streak++
            currentDate.setDate(currentDate.getDate() - 1)
          } else if (streak === 0 && currentDate.toDateString() === today.toDateString()) {
            // Today hasn't been completed yet, check yesterday
            currentDate.setDate(currentDate.getDate() - 1)
          } else {
            break
          }
        }
        
        return streak
      } catch (error) {
        console.error('Error calculating streak:', error)
        return 0
      }
    },
    
    getTodayDate() {
      return new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    },
    
    getSimpleDate() {
      const date = new Date()
      const day = date.getDate()
      const month = date.toLocaleDateString('en-US', { month: 'short' })
      return `${month} ${day}`
    },
    
    getCompletionTime() {
      return this.completionTime || new Date().toLocaleTimeString()
    },
    
    getStreakDays() {
      return this.streakDays
    },
    
    async updateStreakDays() {
      this.streakDays = await this.calculateStreak()
    },
    
    getMotivationalQuote() {
      const quotes = [
        'Every expert was once a beginner. Keep going!',
        'The journey of a thousand miles begins with a single step.',
        'Practice makes perfect. You\'re doing great!',
        'Consistency is the key to mastery.',
        'Small daily improvements lead to stunning results.',
        'Your future self will thank you for the practice today.',
        'Challenges are what make life interesting. Overcoming them is what makes life meaningful.'
      ]
      
      // Pick a quote based on the day
      const dayIndex = new Date().getDate() % quotes.length
      return quotes[dayIndex]
    },
    
    trackProblemClick() {
      // Track that user clicked on the problem
      // This could be used for analytics
      console.log('User clicked on daily problem:', this.todaysProblem.title)
    }
  },
  watch: {
    isAuthenticated(val) {
      if (val) {
        this.loadDailyProblem()
      } else {
        this.suggestions = []
        this.todaysProblem = null
        this.todaysProblemCompleted = false
      }
    }
  }
}
</script>

<style lang="less" scoped>
.problem-suggestion {
  margin-bottom: 20px;
  
  &.compact {
    .suggestion-content {
      min-height: auto;
    }
    
    .problem-item {
      padding: 10px;
      margin-bottom: 8px;
    }
    
    .problem-info {
      font-size: 12px;
    }
    
    .suggestion-header {
      margin-bottom: 10px;
    }
  }
  
  .suggestion-content {
    min-height: 200px;
  }
  
  .login-prompt {
    padding: 40px 20px;
    text-align: center;
    
    p {
      margin-bottom: 20px;
      color: #666;
    }
  }
  
  .loading-state {
    padding: 60px 20px;
    text-align: center;
    
    p {
      margin-top: 20px;
      color: #666;
    }
  }
  
  .suggestions-list {
    .suggestion-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      
      .suggestion-intro {
        margin: 0;
        color: #666;
        font-size: 14px;
      }
    }
    
    .problem-item {
      padding: 15px;
      margin-bottom: 12px;
      border: 1px solid #e8e8e8;
      border-radius: 4px;
      transition: all 0.3s;
      
      &:hover {
        border-color: #1890ff;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }
      
      &.recommended {
        border-color: #faad14;
        background: #fffbe6;
      }
      
      .problem-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        
        .problem-title {
          font-size: 16px;
          font-weight: 500;
          color: #1890ff;
          text-decoration: none;
          
          &:hover {
            text-decoration: underline;
          }
        }
      }
      
      .problem-info {
        display: flex;
        gap: 15px;
        margin-bottom: 8px;
        font-size: 13px;
        color: #666;
        
        .difficulty {
          display: flex;
          align-items: center;
          gap: 4px;
          
          &.difficulty-low {
            color: #52c41a;
          }
          
          &.difficulty-mid {
            color: #faad14;
          }
          
          &.difficulty-high {
            color: #f5222d;
          }
        }
        
        .ac-rate, .submission-count {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }
      
      .problem-tags {
        margin-bottom: 8px;
        
        .ivu-tag {
          margin-right: 6px;
          font-size: 12px;
          padding: 0 7px;
          height: 22px;
          line-height: 20px;
        }
        
        .more-tags {
          font-size: 12px;
          color: #999;
          margin-left: 4px;
        }
      }
      
      .ai-reasoning {
        display: flex;
        align-items: flex-start;
        gap: 6px;
        padding: 8px;
        background: #f0f2f5;
        border-radius: 4px;
        font-size: 13px;
        color: #595959;
        line-height: 1.4;
        
        .ivu-icon {
          flex-shrink: 0;
          margin-top: 2px;
        }
      }
    }
    
    .view-more {
      text-align: center;
      margin-top: 15px;
      
      .ivu-btn {
        font-size: 14px;
      }
    }
  }
  
  .no-suggestions {
    padding: 40px 20px;
    text-align: center;
    
    p {
      margin: 15px 0 5px;
      color: #666;
      font-size: 16px;
    }
    
    small {
      color: #999;
      font-size: 13px;
    }
  }
  
  // Daily Problem Mode styles
  .daily-problem-mode {
    padding: 5px 0;
    
    .daily-problem-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 25px;
      
      h3 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: #17233d;
      }
      
      .date-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: 500;
        padding: 6px 20px;
        background: #e6f7ff;
        color: #1890ff;
        border-radius: 16px;
        white-space: nowrap;
        min-width: 80px;
        text-align: center;
      }
    }
    
    .daily-problem-card {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      transition: all 0.3s ease;
      
      &:hover {
        background: #f0f2f5;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      }
      
      .problem-link {
        display: block;
        text-decoration: none;
        
        .problem-name {
          margin: 0 0 12px 0;
          font-size: 18px;
          font-weight: 500;
          color: #1890ff;
          line-height: 1.4;
          
          &:hover {
            color: #40a9ff;
          }
        }
        
        .problem-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          
          .difficulty-badge {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 4px;
            font-size: 13px;
            font-weight: 500;
            
            &.difficulty-low {
              color: #52c41a;
              background: #f6ffed;
              border: 1px solid #b7eb8f;
            }
            
            &.difficulty-mid {
              color: #faad14;
              background: #fffbe6;
              border: 1px solid #ffe58f;
            }
            
            &.difficulty-high {
              color: #f5222d;
              background: #fff1f0;
              border: 1px solid #ffccc7;
            }
          }
        }
      }
    }
    
    .daily-actions {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      margin-top: 20px;
      
      .ivu-btn-primary {
        max-width: 280px;
        font-size: 15px;
        height: 40px;
        
        .ivu-icon {
          margin-right: 6px;
        }
      }
      
      .ivu-btn-text {
        color: #8c8c8c;
        
        &:hover {
          color: #595959;
        }
      }
    }
    
    .motivation-tip {
      margin-top: 30px;
      padding: 15px 20px;
      background: #f0f2f5;
      border-radius: 6px;
      position: relative;
      text-align: center;
      
      .ivu-icon {
        position: absolute;
        top: 12px;
        left: 15px;
        color: #bfbfbf;
        font-size: 18px;
      }
      
      p {
        margin: 0;
        font-style: italic;
        color: #595959;
        line-height: 1.5;
        font-size: 14px;
      }
    }
  }
  
  // Completed Today styles
  .completed-today {
    padding: 5px 0;
    
    .completion-banner {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 20px;
      background: #f6ffed;
      border: 1px solid #b7eb8f;
      border-radius: 8px;
      margin-bottom: 25px;
      
      .ivu-icon {
        color: #52c41a;
      }
      
      .completion-text {
        h4 {
          margin: 0 0 4px;
          color: #389e0d;
          font-size: 18px;
          font-weight: 600;
        }
        
        p {
          margin: 0;
          color: #52c41a;
          font-size: 14px;
        }
      }
    }
    
    .next-suggestions {
      h4 {
        margin: 0 0 15px;
        font-size: 16px;
        font-weight: 600;
        color: #17233d;
      }
      
      .bonus-problems {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 15px;
        
        .bonus-problem-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: #f8f9fa;
          border-radius: 6px;
          text-decoration: none;
          transition: all 0.3s;
          
          &:hover {
            background: #f0f2f5;
            transform: translateX(4px);
          }
          
          .problem-title {
            color: #1890ff;
            font-size: 15px;
            font-weight: 500;
          }
          
          .difficulty-badge {
            font-size: 12px;
            padding: 2px 8px;
            border-radius: 3px;
            font-weight: 500;
            
            &.difficulty-low {
              color: #52c41a;
              background: #f6ffed;
            }
            
            &.difficulty-mid {
              color: #faad14;
              background: #fffbe6;
            }
            
            &.difficulty-high {
              color: #f5222d;
              background: #fff1f0;
            }
          }
        }
      }
      
      .ivu-btn-text {
        color: #8c8c8c;
        margin-top: 5px;
        
        &:hover {
          color: #1890ff;
        }
      }
    }
  }
}
</style>