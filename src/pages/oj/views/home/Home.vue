<template>
  <div class="home-container">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="welcome-card">
          <template #header>
            <div class="card-header">
              <h2>Welcome to Online Judge</h2>
            </div>
          </template>
          <div class="card-content">
            <p>This is a platform for competitive programming and algorithm practice.</p>
            <el-button type="primary" @click="$router.push('/problems')">
              Start Solving
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-4">
      <el-col :span="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <h3>Problems</h3>
            </div>
          </template>
          <div class="card-content">
            <p>Browse and solve programming problems</p>
            <el-button type="text" @click="$router.push('/problems')">
              View Problems
            </el-button>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <h3>Contests</h3>
            </div>
          </template>
          <div class="card-content">
            <p>Participate in programming contests</p>
            <el-button type="text" @click="$router.push('/contests')">
              View Contests
            </el-button>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <h3>Rankings</h3>
            </div>
          </template>
          <div class="card-content">
            <p>Check the leaderboard and rankings</p>
            <el-button type="text" @click="$router.push('/rankings')">
              View Rankings
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  // Add any initialization logic here
})
</script>

<style scoped>
.home-container {
  padding: 20px;
}

.welcome-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-content {
  text-align: center;
  padding: 20px 0;
}

.mt-4 {
  margin-top: 20px;
}

h2 {
  margin: 0;
  color: #409EFF;
}

h3 {
  margin: 0;
  color: #409EFF;
}
</style> 