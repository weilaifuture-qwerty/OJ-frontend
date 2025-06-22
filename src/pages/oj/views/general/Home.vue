<template>
  <Row type="flex" justify="center" class="home-container">
    <Col :span="24" :lg="{span: 22}" :xl="{span: 20}">
      <!-- Top Section - Key Features -->
      <Row :gutter="20" class="top-section">
        <Col :span="24" :md="{span: 12}" :lg="{span: 6}">
          <SidebarStatus />
        </Col>
        <Col :span="24" :md="{span: 12}" :lg="{span: 6}">
          <DailyCheckIn />
        </Col>
        <Col :span="24" :md="{span: 12}" :lg="{span: 6}">
          <HomeworkSummary />
        </Col>
        <Col :span="24" :md="{span: 12}" :lg="{span: 6}">
          <ProblemSuggestion :compact="true" />
        </Col>
      </Row>
      
      <!-- Main Content Section -->
      <Row :gutter="20" class="main-section">
        <Col :span="24" :lg="{span: 16}">
          <!-- Active Contests -->
          <panel shadow v-if="contests.length" class="contest-panel">
            <template #title>
              <div class="section-header">
                <Icon type="md-trophy" size="20" />
                <span>Active Contests</span>
              </div>
            </template>
            <div class="contest-grid">
              <div 
                v-for="(contest, idx) of contests.slice(0, 3)" 
                :key="idx"
                class="contest-card"
                @click="goContestById(contest.id)">
                <div class="contest-header">
                  <h4>{{ contest.title }}</h4>
                  <Tag :color="getContestStatusColor(contest)">{{ contest.rule_type }}</Tag>
                </div>
                <div class="contest-info">
                  <div class="info-item">
                    <Icon type="md-calendar" />
                    <span>{{ formatTime(contest.start_time) }}</span>
                  </div>
                  <div class="info-item">
                    <Icon type="md-time" />
                    <span>{{ getDuration(contest.start_time, contest.end_time) }}</span>
                  </div>
                </div>
                <div class="contest-description" v-html="truncateDescription(contest.description)"></div>
              </div>
            </div>
          </panel>
          
          <!-- Announcements -->
          <Announcements class="announcement-panel"></Announcements>
        </Col>
        
        <!-- Extended Sidebar -->
        <Col :span="24" :lg="{span: 8}">
          <!-- Additional Problem Suggestions -->
          <panel shadow class="extended-problems">
            <template #title>
              <div class="section-header">
                <Icon type="md-bulb" size="20" />
                <span>More Practice Problems</span>
              </div>
            </template>
            <ProblemSuggestion :extended="true" :hideTitle="true" />
          </panel>
        </Col>
      </Row>
    </Col>
  </Row>
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
      }
    }
  }
</script>

<style lang="less" scoped>
  .home-container {
    padding-top: 20px;
    min-height: calc(100vh - 60px);
    background: #f7f8fa;
  }
  
  // Top section with key features
  .top-section {
    margin-bottom: 20px;
    
    .ivu-col {
      margin-bottom: 15px;
      
      @media (min-width: 768px) {
        margin-bottom: 0;
      }
    }
    
    // Ensure proper spacing between cards on medium screens
    @media (min-width: 768px) and (max-width: 991px) {
      .ivu-col-md-12:nth-child(1),
      .ivu-col-md-12:nth-child(2) {
        margin-bottom: 15px;
      }
    }
  }
  
  // Main content section
  .main-section {
    margin-bottom: 40px;
  }
  
  // Section headers
  .section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 500;
    
    i {
      color: #1890ff;
    }
  }
  
  // Contest panel styling
  .contest-panel {
    margin-bottom: 20px;
    
    .contest-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 15px;
      
      @media (min-width: 992px) {
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      }
    }
    
    .contest-card {
      padding: 16px;
      background: #fff;
      border: 1px solid #e8eaec;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
      
      &:hover {
        border-color: #1890ff;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        transform: translateY(-2px);
      }
      
      .contest-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 12px;
        
        h4 {
          margin: 0;
          font-size: 16px;
          font-weight: 500;
          color: #17233d;
          flex: 1;
          margin-right: 10px;
        }
      }
      
      .contest-info {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
        margin-bottom: 12px;
        
        .info-item {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 13px;
          color: #808695;
          
          i {
            font-size: 14px;
          }
        }
      }
      
      .contest-description {
        font-size: 13px;
        color: #515a6e;
        line-height: 1.6;
      }
    }
  }
  
  // Announcement panel
  .announcement-panel {
    :deep(.ivu-card) {
      margin-bottom: 0;
    }
  }
  
  // Extended problems panel
  .extended-problems {
    :deep(.ivu-card-body) {
      padding-top: 0;
    }
  }
  
  // Make panels more compact on mobile
  @media (max-width: 767px) {
    :deep(.ivu-card) {
      margin-bottom: 15px;
      
      .ivu-card-head {
        padding: 12px 16px;
      }
      
      .ivu-card-body {
        padding: 16px;
      }
    }
  }
  
  // Optimize for above-the-fold content
  @media (min-height: 800px) {
    .top-section {
      min-height: 180px;
    }
  }
</style>