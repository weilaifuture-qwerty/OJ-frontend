<template>
  <div class="rank-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>Rankings</h2>
          <el-input
            v-model="searchQuery"
            placeholder="Search users..."
            class="search-input"
            clearable
          />
        </div>
      </template>

      <el-table
        :data="filteredRankings"
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column
          prop="rank"
          label="Rank"
          width="80"
          align="center"
        />
        <el-table-column
          prop="username"
          label="Username"
          min-width="150"
        >
          <template #default="{ row }">
            <router-link :to="`/user/${row.username}`" class="user-link">
              {{ row.username }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column
          prop="solved"
          label="Solved"
          width="100"
          align="center"
        />
        <el-table-column
          prop="submitted"
          label="Submitted"
          width="100"
          align="center"
        />
        <el-table-column
          prop="acceptanceRate"
          label="Acceptance Rate"
          width="150"
          align="center"
        >
          <template #default="{ row }">
            {{ row.acceptanceRate }}%
          </template>
        </el-table-column>
        <el-table-column
          prop="rating"
          label="Rating"
          width="100"
          align="center"
        />
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import api from '@/api'

const loading = ref(false)
const rankings = ref([])
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

const filteredRankings = computed(() => {
  if (!searchQuery.value) return rankings.value
  const query = searchQuery.value.toLowerCase()
  return rankings.value.filter(user => 
    user.username.toLowerCase().includes(query)
  )
})

const fetchRankings = async () => {
  try {
    loading.value = true
    const response = await api.getRankings({
      page: currentPage.value,
      pageSize: pageSize.value
    })
    rankings.value = response.data.items
    total.value = response.data.total
  } catch (error) {
    ElMessage.error('Failed to load rankings')
  } finally {
    loading.value = false
  }
}

const handleSizeChange = (val) => {
  pageSize.value = val
  fetchRankings()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchRankings()
}

onMounted(() => {
  fetchRankings()
})
</script>

<style scoped>
.rank-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-input {
  width: 200px;
}

.user-link {
  color: #409EFF;
  text-decoration: none;
}

.user-link:hover {
  text-decoration: underline;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style> 