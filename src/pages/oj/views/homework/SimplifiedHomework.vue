<template>
  <div class="simplified-homework">
    <h2>Homework System (Using Existing APIs)</h2>
    
    <!-- Admin View -->
    <div v-if="isAdminRole">
      <Card>
        <p slot="title">Create Homework Assignment</p>
        <div class="homework-info">
          <Alert type="info">
            This simplified version uses problem tags to group homework assignments.
            Tag problems with "homework-week1", "homework-week2", etc. to create assignments.
          </Alert>
          
          <h3>Current Homework Groups:</h3>
          <div v-for="group in homeworkGroups" :key="group.tag" class="homework-group">
            <h4>{{ formatHomeworkTitle(group.tag) }}</h4>
            <p>{{ group.problems.length }} problems</p>
            <ul>
              <li v-for="problem in group.problems" :key="problem.id">
                {{ problem._id }} - {{ problem.title }}
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
    
    <!-- Student View -->
    <div v-else>
      <Card>
        <p slot="title">My Homework Assignments</p>
        
        <Tabs v-model="activeTab">
          <TabPane label="All Homework" name="all">
            <div v-if="homeworkGroups.length === 0" class="no-homework">
              <Icon type="ios-checkmark-circle-outline" size="80" style="color: #67c23a;" />
              <h3>No Homework Found</h3>
              <p>You don't have any homework pending. Great job! 🎉</p>
            </div>
            
            <div v-else>
              <div v-for="group in homeworkGroups" :key="group.tag" class="homework-item">
                <h3>{{ formatHomeworkTitle(group.tag) }}</h3>
                <Progress :percent="getProgress(group)" status="active" />
                <p>{{ getSolvedCount(group) }} / {{ group.problems.length }} problems solved</p>
                
                <Table :columns="problemColumns" :data="group.problems" size="small">
                  <template #title="{ row }">
                    <router-link :to="{name: 'problem-details', params: {problemID: row._id}}">
                      {{ row._id }} - {{ row.title }}
                    </router-link>
                  </template>
                  
                  <template #status="{ row }">
                    <Tag v-if="isSolved(row)" color="success">Solved</Tag>
                    <Tag v-else color="default">Not Started</Tag>
                  </template>
                  
                  <template #action="{ row }">
                    <Button 
                      type="primary" 
                      size="small"
                      @click="goToProblem(row)"
                    >
                      {{ isSolved(row) ? 'Review' : 'Solve' }}
                    </Button>
                  </template>
                </Table>
              </div>
            </div>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  </div>
</template>

<script>
import { Card, Alert, Table, Button, Tag, Icon, Progress, Tabs, TabPane } from 'view-ui-plus'
import api from '@oj/api'
import { useUserStore } from '@/stores/user'

export default {
  name: 'SimplifiedHomework',
  components: {
    Card, Alert, Table, Button, Tag, Icon, Progress, Tabs, TabPane
  },
  data() {
    return {
      problems: [],
      submissions: [],
      homeworkGroups: [],
      loading: false,
      activeTab: 'all',
      problemColumns: [
        {
          title: 'Problem',
          slot: 'title',
          minWidth: 300
        },
        {
          title: 'Difficulty',
          key: 'difficulty',
          width: 100
        },
        {
          title: 'Status',
          slot: 'status',
          width: 120
        },
        {
          title: 'Action',
          slot: 'action',
          width: 100
        }
      ]
    }
  },
  computed: {
    userStore() {
      return useUserStore()
    },
    isAdminRole() {
      return this.userStore.isAdminRole
    },
    user() {
      return this.userStore.user
    }
  },
  mounted() {
    this.loadProblems()
    if (!this.isAdminRole) {
      this.loadMySubmissions()
    }
  },
  methods: {
    async loadProblems() {
      this.loading = true
      try {
        // Load all problems
        const res = await api.getProblemList(0, 1000, {})
        if (res && res.data && res.data.data) {
          this.problems = res.data.data.results || []
          this.groupHomeworkProblems()
        }
      } catch (err) {
        this.$Message.error('Failed to load problems')
      } finally {
        this.loading = false
      }
    },
    
    async loadMySubmissions() {
      try {
        // Load user's submissions to check which problems are solved
        const res = await api.getSubmissionList(0, 1000, {
          myself: 1,
          result: 0  // Accepted
        })
        if (res && res.data && res.data.data) {
          this.submissions = res.data.data.results || []
        }
      } catch (err) {
        console.error('Failed to load submissions:', err)
      }
    },
    
    groupHomeworkProblems() {
      // Group problems by homework tags
      const groups = {}
      
      this.problems.forEach(problem => {
        if (problem.tags) {
          problem.tags.forEach(tag => {
            if (tag.startsWith('homework-')) {
              if (!groups[tag]) {
                groups[tag] = []
              }
              groups[tag].push(problem)
            }
          })
        }
      })
      
      // Convert to array and sort
      this.homeworkGroups = Object.keys(groups)
        .sort()
        .map(tag => ({
          tag,
          problems: groups[tag]
        }))
    },
    
    formatHomeworkTitle(tag) {
      // Convert "homework-week1" to "Week 1 Homework"
      const parts = tag.split('-')
      if (parts.length >= 2) {
        const week = parts[1].replace('week', 'Week ')
        return `${week} Homework`
      }
      return tag
    },
    
    isSolved(problem) {
      return this.submissions.some(sub => 
        sub.problem === problem._id && sub.result === 0
      )
    },
    
    getSolvedCount(group) {
      return group.problems.filter(p => this.isSolved(p)).length
    },
    
    getProgress(group) {
      const solved = this.getSolvedCount(group)
      const total = group.problems.length
      return total > 0 ? Math.round((solved / total) * 100) : 0
    },
    
    goToProblem(problem) {
      this.$router.push({
        name: 'problem-details',
        params: { problemID: problem._id }
      })
    }
  }
}
</script>

<style scoped>
.simplified-homework {
  padding: 20px;
}

.homework-info {
  margin-top: 20px;
}

.homework-group {
  margin: 20px 0;
  padding: 15px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
}

.homework-item {
  margin: 20px 0;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
}

.no-homework {
  text-align: center;
  padding: 60px 0;
}

.no-homework h3 {
  margin: 20px 0 10px;
}
</style>