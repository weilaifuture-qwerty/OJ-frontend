<template>
  <div class="home-container">
    <div class="home-wrapper">
      <!-- Hero Section with Key Features -->
      <div class="hero-section">
        <Row :gutter="24" class="feature-grid">
          <Col :span="24" :md="{span: 12}" :lg="{span: 6}" class="feature-col">
            <div class="feature-card status-card">
              <SidebarStatus />
            </div>
          </Col>
          <Col :span="24" :md="{span: 12}" :lg="{span: 6}" class="feature-col">
            <div class="feature-card checkin-card">
              <DailyCheckIn />
            </div>
          </Col>
          <Col :span="24" :md="{span: 12}" :lg="{span: 6}" class="feature-col">
            <div class="feature-card homework-card">
              <HomeworkSummary />
            </div>
          </Col>
          <Col :span="24" :md="{span: 12}" :lg="{span: 6}" class="feature-col">
            <div class="feature-card suggestion-card">
              <ProblemSuggestion :compact="true" />
            </div>
          </Col>
        </Row>
      </div>
      
      <!-- Main Content Area -->
      <div class="main-content">
        <Row :gutter="24">
          <Col :span="24" :xl="{span: 16}">
            <!-- Active Contests -->
            <div v-if="contests.length" class="content-card contests-section">
              <div class="card-header">
                <div class="header-icon">
                  <Icon type="md-trophy" />
                </div>
                <h2 class="header-title">Active Contests</h2>
                <Button type="text" size="small" @click="$router.push('/contest')">
                  View All
                  <Icon type="ios-arrow-forward" />
                </Button>
              </div>
              <div class="contest-list">
                <div 
                  v-for="(contest, idx) of contests.slice(0, 3)" 
                  :key="idx"
                  class="contest-item"
                  @click="goContestById(contest.id)">
                  <div class="contest-badge" :class="getContestStatusClass(contest)"></div>
                  <div class="contest-content">
                    <h3 class="contest-title">{{ contest.title }}</h3>
                    <div class="contest-meta">
                      <span class="meta-item">
                        <Icon type="md-calendar" />
                        {{ formatTime(contest.start_time) }}
                      </span>
                      <span class="meta-item">
                        <Icon type="md-time" />
                        {{ getDuration(contest.start_time, contest.end_time) }}
                      </span>
                      <Tag :color="getContestStatusColor(contest)" size="small">
                        {{ contest.rule_type }}
                      </Tag>
                    </div>
                  </div>
                  <Icon type="ios-arrow-forward" class="contest-arrow" />
                </div>
              </div>
            </div>
            
            <!-- Announcements -->
            <div class="content-card announcements-section">
              <Announcements />
            </div>
          </Col>
          
          <!-- Sidebar -->
          <Col :span="24" :xl="{span: 8}">
            <!-- More Problems -->
            <div class="content-card sidebar-card">
              <div class="card-header">
                <div class="header-icon">
                  <Icon type="ios-bulb" />
                </div>
                <h2 class="header-title">Practice Problems</h2>
              </div>
              <ProblemSuggestion :extended="true" :hideTitle="true" />
            </div>
          </Col>
        </Row>
      </div>
    </div>
  </div>
</template>

<script>
  import Announcements from './AnnouncementsSimple.vue'
  import Panel from '@oj/components/Panel.vue'
  import DailyCheckIn from '@oj/components/DailyCheckIn.vue'
  import HomeworkSummary from '@oj/components/HomeworkSummary.vue'
  import ProblemSuggestion from '@oj/components/ProblemSuggestion.vue'
  import SidebarStatus from '@oj/components/SidebarStatus.vue'
  import api from '@oj/api'
  import time from '@/utils/time'
  import { CONTEST_STATUS } from '@/utils/constants'
  import dayjs from 'dayjs'
  import { Tag, Button, Icon, Row, Col } from 'view-ui-plus'

  export default {
    name: 'home',
    components: {
      Announcements,
      Panel,
      DailyCheckIn,
      HomeworkSummary,
      ProblemSuggestion,
      SidebarStatus,
      Tag,
      Button,
      Icon,
      Row,
      Col
    },
    data () {
      return {
        contests: [],
        index: 0
      }
    },
    mounted () {
      let params = {status: CONTEST_STATUS.UNDERWAY}
      api.getContestList(0, 5, params).then(res => {
        this.contests = res.data.data.results
      })
    },
    methods: {
      getDuration (startTime, endTime) {
        return time.duration(startTime, endTime)
      },
      goContest () {
        this.$router.push({
          name: 'contest-details',
          params: {contestID: this.contests[this.index].id}
        })
      },
      goContestById (contestId) {
        this.$router.push({
          name: 'contest-details',
          params: {contestID: contestId}
        })
      },
      formatTime(timestamp) {
        return dayjs(timestamp).format('YYYY-M-D HH:mm')
      },
      getContestStatusColor(contest) {
        const now = new Date()
        const start = new Date(contest.start_time)
        const end = new Date(contest.end_time)
        
        if (now < start) return 'primary'
        if (now >= start && now <= end) return 'success'
        return 'default'
      },
      truncateDescription(description) {
        const div = document.createElement('div')
        div.innerHTML = description
        const text = div.textContent || div.innerText || ''
        return text.length > 100 ? text.substring(0, 100) + '...' : text
      },
      getContestStatusClass(contest) {
        const now = new Date()
        const start = new Date(contest.start_time)
        const end = new Date(contest.end_time)
        
        if (now < start) return 'upcoming'
        if (now >= start && now <= end) return 'active'
        return 'ended'
      }
    }
  }
</script>

<style lang="less" scoped>
  .home-container {
    min-height: calc(100vh - 60px);
    background: #f0f2f5;
    padding: 0;
  }
  
  .home-wrapper {
    max-width: 1400px;
    margin: 0 auto;
    padding: 24px;
    
    @media (max-width: 768px) {
      padding: 16px;
    }
  }
  
  // Hero Section with Feature Cards
  .hero-section {
    margin-bottom: 32px;
    
    .feature-grid {
      margin: 0 -12px;
    }
    
    .feature-col {
      padding: 0 12px;
      margin-bottom: 24px;
      
      @media (min-width: 992px) {
        margin-bottom: 0;
      }
    }
    
    .feature-card {
      height: 100%;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      transition: all 0.3s ease;
      overflow: hidden;
      
      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
      }
      
      // Remove padding from inner components
      :deep(.ivu-card) {
        box-shadow: none;
        border: none;
        background: transparent;
        
        .ivu-card-body {
          padding: 20px;
        }
      }
    }
  }
  
  // Main Content Area
  .main-content {
    .content-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      padding: 24px;
      margin-bottom: 24px;
      
      @media (max-width: 768px) {
        padding: 16px;
        margin-bottom: 16px;
      }
    }
    
    .card-header {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid #f0f0f0;
      
      .header-icon {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;
        
        i {
          font-size: 20px;
          color: white;
        }
      }
      
      .header-title {
        flex: 1;
        font-size: 18px;
        font-weight: 600;
        color: #1a1a1a;
        margin: 0;
      }
      
      .ivu-btn-text {
        color: #667eea;
        font-weight: 500;
        
        &:hover {
          color: #764ba2;
        }
      }
    }
  }
  
  // Contest Section
  .contests-section {
    .contest-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .contest-item {
      display: flex;
      align-items: center;
      padding: 16px;
      background: #fafbfc;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
      overflow: hidden;
      
      &:hover {
        background: #f5f7fa;
        padding-left: 20px;
        
        .contest-arrow {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      .contest-badge {
        width: 4px;
        height: 40px;
        border-radius: 2px;
        margin-right: 16px;
        flex-shrink: 0;
        
        &.active {
          background: linear-gradient(180deg, #52c41a 0%, #73d13d 100%);
        }
        
        &.upcoming {
          background: linear-gradient(180deg, #1890ff 0%, #40a9ff 100%);
        }
        
        &.ended {
          background: linear-gradient(180deg, #d9d9d9 0%, #bfbfbf 100%);
        }
      }
      
      .contest-content {
        flex: 1;
        min-width: 0;
      }
      
      .contest-title {
        font-size: 15px;
        font-weight: 500;
        color: #1a1a1a;
        margin: 0 0 8px 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .contest-meta {
        display: flex;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
        
        .meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          color: #8c8c8c;
          
          i {
            font-size: 14px;
          }
        }
      }
      
      .contest-arrow {
        font-size: 18px;
        color: #c0c4cc;
        opacity: 0;
        transform: translateX(-10px);
        transition: all 0.2s ease;
      }
    }
  }
  
  // Announcements Section
  .announcements-section {
    :deep(.ivu-card) {
      box-shadow: none;
      border: none;
      margin: -24px;
      
      .ivu-card-head {
        background: transparent;
        border: none;
        padding: 24px 24px 16px;
        
        p {
          font-size: 18px;
          font-weight: 600;
          color: #1a1a1a;
        }
      }
      
      .ivu-card-body {
        padding: 0 24px 24px;
      }
    }
  }
  
  // Sidebar
  .sidebar-card {
    .header-icon {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }
    
    :deep(.ivu-card) {
      box-shadow: none;
      border: none;
      margin: 0;
      
      .ivu-card-body {
        padding: 0;
      }
    }
  }
  
  // Responsive adjustments
  @media (max-width: 1200px) {
    .hero-section {
      .feature-col {
        &:nth-child(1), &:nth-child(2) {
          @media (min-width: 768px) and (max-width: 991px) {
            margin-bottom: 24px;
          }
        }
      }
    }
  }
  
  // Dark mode support (optional)
  @media (prefers-color-scheme: dark) {
    .home-container {
      background: #1a1a1a;
    }
    
    .feature-card,
    .content-card {
      background: #2a2a2a;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }
    
    .header-title,
    .contest-title {
      color: #f0f0f0;
    }
    
    .contest-item {
      background: #333;
      
      &:hover {
        background: #3a3a3a;
      }
    }
  }
</style>