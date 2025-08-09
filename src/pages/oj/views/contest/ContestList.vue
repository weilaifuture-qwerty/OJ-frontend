<template>
  <div class="contest-list">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <h2>Contests</h2>
          <el-button type="primary" @click="handleCreateContest" v-if="isAdmin">
            Create Contest
          </el-button>
        </div>
      </template>

      <div class="filter-container">
        <el-form :inline="true" :model="filterForm" class="filter-form">
          <el-form-item label="Status">
            <el-select v-model="filterForm.status" placeholder="Select status" clearable>
              <el-option
                v-for="item in statusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="Type">
            <el-select v-model="filterForm.type" placeholder="Select type" clearable>
              <el-option
                v-for="item in typeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleFilter">Filter</el-button>
            <el-button @click="resetFilter">Reset</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table :data="contests" style="width: 100%">
        <el-table-column prop="title" label="Title" min-width="200">
          <template #default="{ row }">
            <router-link :to="`/contest/${row.id}`" class="contest-link">
              {{ row.title }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column prop="start_time" label="Start Time" width="180">
          <template #default="{ row }">
            {{ formatDate(row.start_time) }}
          </template>
        </el-table-column>
        <el-table-column prop="end_time" label="End Time" width="180">
          <template #default="{ row }">
            {{ formatDate(row.end_time) }}
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="Duration" width="120">
          <template #default="{ row }">
            {{ formatDuration(row.duration) }}
          </template>
        </el-table-column>
        <el-table-column prop="contest_type" label="Type" width="120">
          <template #default="{ row }">
            <el-tag :type="getContestTypeColor(row.contest_type)">
              {{ row.contest_type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Status" width="120">
          <template #default="{ row }">
            <el-tag :type="getContestStatusType(row.status)">
              {{ getContestStatusName(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useContestStore } from '@/store/modules/contest'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'
import { formatDate, formatDuration } from '@/utils/utils'
import { CONTEST_STATUS, CONTEST_TYPE } from '@/utils/constants'

const router = useRouter()
const contestStore = useContestStore()
const userStore = useUserStore()

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const filterForm = ref({
  status: '',
  type: ''
})

const statusOptions = [
  { label: 'Not Started', value: CONTEST_STATUS.NOT_START },
  { label: 'Underway', value: CONTEST_STATUS.UNDERWAY },
  { label: 'Ended', value: CONTEST_STATUS.ENDED }
]

const typeOptions = [
  { label: 'Public', value: CONTEST_TYPE.PUBLIC },
  { label: 'Private', value: CONTEST_TYPE.PRIVATE },
  { label: 'Password Protected', value: CONTEST_TYPE.PASSWORD_PROTECTED }
]

const contests = computed(() => contestStore.contests)
const isAdmin = computed(() => userStore.isAdmin)

const getContestTypeColor = (type) => {
  switch (type) {
    case CONTEST_TYPE.PUBLIC:
      return 'success'
    case CONTEST_TYPE.PRIVATE:
      return 'warning'
    case CONTEST_TYPE.PASSWORD_PROTECTED:
      return 'info'
    default:
      return 'info'
  }
}

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

const handleFilter = async () => {
  currentPage.value = 1
  await fetchContests()
}

const resetFilter = async () => {
  filterForm.value = {
    status: '',
    type: ''
  }
  currentPage.value = 1
  await fetchContests()
}

const handleSizeChange = async (val) => {
  pageSize.value = val
  await fetchContests()
}

const handleCurrentChange = async (val) => {
  currentPage.value = val
  await fetchContests()
}

const handleCreateContest = () => {
  router.push('/contest/create')
}

const fetchContests = async () => {
  try {
    loading.value = true
    const params = {
      page: currentPage.value,
      page_size: pageSize.value,
      ...filterForm.value
    }
    await contestStore.fetchContests(params)
    total.value = contestStore.total
  } catch (error) {
    ElMessage.error('Failed to fetch contests')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchContests()
})
</script>

<style scoped>
.contest-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-container {
  margin-bottom: 20px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.contest-link {
  color: #409EFF;
  text-decoration: none;
}

.contest-link:hover {
  text-decoration: underline;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
