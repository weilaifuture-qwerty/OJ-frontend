<template>
  <div class="home-container">
    <div class="home-content">
      <!-- Top Section - Key Features -->
      <div class="top-section">
        <div class="feature-grid">
          <div class="feature-card">
            <SidebarStatus />
          </div>
          <div class="feature-card">
            <DailyCheckIn />
          </div>
          <div class="feature-card">
            <HomeworkSummary />
          </div>
          <div class="feature-card">
            <ProblemSuggestion :compact="true" />
          </div>
        </div>
      </div>
      
      <!-- Main Content Section -->
      <div class="main-section">
        <div class="main-content">
          <!-- Active Contests -->
          <div v-if="contests.length" class="contest-card">
            <div class="section-header">
              <Icon type="md-trophy" size="20" />
              <span>Active Contests</span>
              <Button type="text" size="small" @click="$router.push('/contest')" class="view-all">
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
                <div class="contest-status" :class="getContestStatusClass(contest)"></div>
                <div class="contest-content">
                  <h4>{{ contest.title }}</h4>
                  <div class="contest-meta">
                    <span class="meta-item">
                      <Icon type="md-calendar" size="14" />
                      {{ formatTime(contest.start_time) }}
                    </span>
                    <span class="meta-item">
                      <Icon type="md-time" size="14" />
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
          <Announcements class="announcement-panel"></Announcements>
        </div>
        
        <!-- Extended Sidebar -->
        <div class="sidebar-content">
          <!-- Additional Problem Suggestions -->
          <div class="sidebar-card">
            <div class="section-header">
              <Icon type="md-bulb" size="20" />
              <span>More Practice Problems</span>
            </div>
            <ProblemSuggestion :extended="true" :hideTitle="true" />
          </div>
        </div>
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
  import { Tag, Button, Icon } from 'view-ui-plus'
  // import { debugLayout } from '@/utils/layout-debug'

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
      Icon
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
      
      // Debug layout after component mounts
      // this.$nextTick(() => {
      //   console.log('Home component mounted, debugging layout...')
      //   debugLayout()
      // })
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
    padding-top: 20px;
    min-height: calc(100vh - 60px);
    background: #f0f2f5;
    width: 100%;
  }
  
  .home-content {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    box-sizing: border-box;
  }
  
  // Top section with key features
  .top-section {
    margin-bottom: 24px;
    
    .feature-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      
      @media (min-width: 992px) {
        grid-template-columns: repeat(4, 1fr);
      }
      
      @media (min-width: 768px) and (max-width: 991px) {
        grid-template-columns: repeat(2, 1fr);
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
  
  // Main content section
  .main-section {
    margin-bottom: 40px;
    display: flex;
    gap: 20px;
    
    .main-content {
      flex: 1;
      min-width: 0;
    }
    
    .sidebar-content {
      width: 320px;
      flex-shrink: 0;
    }
    
    @media (max-width: 991px) {
      flex-direction: column;
      
      .sidebar-content {
        width: 100%;
      }
    }
    
    .contest-card, .sidebar-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      padding: 24px;
      margin-bottom: 20px;
    }
  }
  
  // Section headers
  .section-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #f0f0f0;
    position: relative;
    
    i {
      color: #667eea;
    }
    
    span {
      font-size: 18px;
      font-weight: 600;
      color: #1a1a1a;
      flex: 1;
    }
    
    .view-all {
      color: #667eea;
      font-weight: 500;
      
      &:hover {
        color: #764ba2;
      }
    }
  }
  
  // Contest list styling
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
    
    &:hover {
      background: #f5f7fa;
      padding-left: 20px;
      
      .contest-arrow {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    .contest-status {
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
      
      h4 {
        margin: 0 0 8px 0;
        font-size: 15px;
        font-weight: 500;
        color: #1a1a1a;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
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
    }
    
    .contest-arrow {
      font-size: 18px;
      color: #c0c4cc;
      opacity: 0;
      transform: translateX(-10px);
      transition: all 0.2s ease;
    }
  }
  
  // Announcement panel
  .announcement-panel {
    :deep(.ivu-card) {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      margin-bottom: 0;
    }
  }
  
  // Sidebar styling
  .sidebar-card {
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
  @media (max-width: 767px) {
    .section-header {
      flex-wrap: wrap;
      
      span {
        width: 100%;
        margin-bottom: 10px;
      }
    }
    
    .contest-card, .sidebar-card {
      padding: 16px;
    }
  }
</style>