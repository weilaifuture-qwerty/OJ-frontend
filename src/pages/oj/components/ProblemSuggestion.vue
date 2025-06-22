<template>
  <Card class="problem-suggestion" :class="{ compact }" shadow>
    <template #title v-if="!hideTitle">
      <Icon type="ios-bulb" size="20" />
      {{ $t('m.Suggested_Problems') }}
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
        
        <!-- Suggestions -->
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
      userProfile: null
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
      this.loadSuggestions()
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
        if (res.data && res.data.data) {
          this.suggestions = res.data.data.suggestions || []
        } else {
          // Fallback to mock suggestions if API not implemented
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
    }
  },
  watch: {
    isAuthenticated(val) {
      if (val) {
        this.loadSuggestions()
      } else {
        this.suggestions = []
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
}
</style>