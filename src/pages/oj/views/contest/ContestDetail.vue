<template>
  <div class="contest-detail">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <h2>{{ contest.title }}</h2>
          <div class="contest-meta">
            <el-tag :type="getContestStatusType(contestStatus)">
              {{ getContestStatusName(contestStatus) }}
            </el-tag>
            <span class="time-remaining" v-if="contestStatus !== 'ENDED'">
              {{ countdown }}
            </span>
          </div>
        </div>
      </template>

      <div class="contest-content">
        <div class="description" v-html="contest.description"></div>
        
        <div class="contest-info">
          <div class="info-item">
            <span class="label">Start Time:</span>
            <span class="value">{{ formatDate(contest.start_time) }}</span>
          </div>
          <div class="info-item">
            <span class="label">End Time:</span>
            <span class="value">{{ formatDate(contest.end_time) }}</span>
          </div>
          <div class="info-item">
            <span class="label">Duration:</span>
            <span class="value">{{ formatDuration(contest.duration) }}</span>
          </div>
          <div class="info-item">
            <span class="label">Type:</span>
            <span class="value">{{ contest.contest_type }}</span>
          </div>
        </div>

        <div v-if="showPasswordForm" class="password-form">
          <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef">
            <el-form-item prop="password">
              <el-input
                v-model="passwordForm.password"
                type="password"
                placeholder="Enter contest password"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleJoinContest" :loading="joining">
                Join Contest
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <div v-else-if="contestStatus === 'NOT_START'" class="not-started">
          <p>This contest has not started yet.</p>
          <el-button type="primary" @click="handleJoinContest" :loading="joining">
            Join Contest
          </el-button>
        </div>

        <div v-else-if="contestStatus === 'UNDERWAY'" class="problems-list">
          <h3>Problems</h3>
          <el-table :data="contestProblems" style="width: 100%">
            <el-table-column prop="id" label="#" width="80" align="center" />
            <el-table-column prop="title" label="Title" min-width="200">
              <template #default="{ row }">
                <router-link :to="`/contest/${contest.id}/problem/${row.id}`" class="problem-link">
                  {{ row.title }}
                </router-link>
              </template>
            </el-table-column>
            <el-table-column prop="difficulty" label="Difficulty" width="120" align="center">
              <template #default="{ row }">
                <el-tag :type="getDifficultyColor(row.difficulty)">
                  {{ row.difficulty }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="accepted" label="Accepted" width="100" align="center" />
            <el-table-column prop="submitted" label="Submitted" width="100" align="center" />
            <el-table-column prop="acceptanceRate" label="Acceptance Rate" width="150" align="center">
              <template #default="{ row }">
                {{ getACRate(row.accepted, row.submitted) }}
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useContestStore } from '@/store/modules/contest'
import { ElMessage } from 'element-plus'
import { formatDate, formatDuration, getACRate, getDifficultyColor } from '@/utils/utils'
import { CONTEST_STATUS } from '@/utils/constants'

const route = useRoute()
const router = useRouter()
const contestStore = useContestStore()

const loading = ref(false)
const joining = ref(false)
const passwordFormRef = ref(null)
const passwordForm = ref({
  password: ''
})

const passwordRules = {
  password: [
    { required: true, message: 'Please enter the contest password', trigger: 'blur' }
  ]
}

const contest = computed(() => contestStore.currentContest)
const contestStatus = computed(() => contestStore.contestStatus)
const countdown = computed(() => contestStore.countdown)
const showPasswordForm = computed(() => contestStore.passwordFormVisible)
const contestProblems = computed(() => contestStore.contestProblems)

const getContestStatusType = (status) => {
  switch (status) {
    case CONTEST_STATUS.NOT_START:
      return 'warning'
    case CONTEST_STATUS.UNDERWAY:
      return 'success'
    case CONTEST_STATUS.ENDED:
      return 'info'
    default:
      return 'info'
  }
}

const getContestStatusName = (status) => {
  switch (status) {
    case CONTEST_STATUS.NOT_START:
      return 'Not Started'
    case CONTEST_STATUS.UNDERWAY:
      return 'Underway'
    case CONTEST_STATUS.ENDED:
      return 'Ended'
    default:
      return 'Unknown'
  }
}

const handleJoinContest = async () => {
  if (!passwordFormRef.value) return
  
  try {
    await passwordFormRef.value.validate()
    joining.value = true
    await contestStore.joinContest(route.params.id, passwordForm.value.password)
    ElMessage.success('Successfully joined the contest')
  } catch (error) {
    ElMessage.error(error.message || 'Failed to join contest')
  } finally {
    joining.value = false
  }
}

let timer = null

onMounted(async () => {
  try {
    loading.value = true
    await contestStore.fetchContest(route.params.id)
    timer = setInterval(() => {
      contestStore.updateNow()
    }, 1000)
  } catch (error) {
    ElMessage.error('Failed to load contest details')
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.contest-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.contest-meta {
  display: flex;
  gap: 10px;
  align-items: center;
}

.time-remaining {
  color: #666;
}

.contest-content {
  margin-top: 20px;
}

.contest-info {
  margin: 20px 0;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
}

.info-item {
  margin: 10px 0;
  display: flex;
  gap: 10px;
}

.label {
  font-weight: bold;
  min-width: 100px;
}

.password-form {
  max-width: 400px;
  margin: 20px auto;
}

.not-started {
  text-align: center;
  margin: 40px 0;
}

.problems-list {
  margin-top: 30px;
}

.problem-link {
  color: #409EFF;
  text-decoration: none;
}

.problem-link:hover {
  text-decoration: underline;
}
</style>
