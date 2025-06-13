<template>
  <div class="admin-dashboard-container">
    <Card>
      <template #title>
        <h2>Admin Dashboard</h2>
      </template>
      <Row :gutter="16">
        <Col :xs="24" :sm="12" :md="6">
          <Card class="dashboard-card" @click="goTo('admin-problem-management')">
            <Icon type="ios-keypad" class="dashboard-icon problem" />
            <div class="stat-label">Problems</div>
            <div class="stat-value">{{ stats.problems }}</div>
          </Card>
        </Col>
        <Col :xs="24" :sm="12" :md="6">
          <Card class="dashboard-card" @click="goTo('admin-user-management')">
            <Icon type="md-people" class="dashboard-icon user" />
            <div class="stat-label">Users</div>
            <div class="stat-value">{{ stats.users }}</div>
          </Card>
        </Col>
        <Col :xs="24" :sm="12" :md="6">
          <Card class="dashboard-card" @click="goTo('admin-contest-list')">
            <Icon type="md-trophy" class="dashboard-icon contest" />
            <div class="stat-label">Contests</div>
            <div class="stat-value">{{ stats.contests }}</div>
          </Card>
        </Col>
        <Col :xs="24" :sm="12" :md="6">
          <Card class="dashboard-card" @click="goTo('admin-submission-management')">
            <Icon type="ios-pulse" class="dashboard-icon submission" />
            <div class="stat-label">Submissions</div>
            <div class="stat-value">{{ stats.submissions }}</div>
          </Card>
        </Col>
      </Row>
    </Card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const stats = ref({
  problems: '...',
  users: '...',
  contests: '...',
  submissions: '...'
});

const fetchStats = async () => {
  try {
    const [problems, users, contests, submissions] = await Promise.all([
      axios.get('/api/problem/?limit=1'),
      axios.get('/api/user/?limit=1'),
      axios.get('/api/contest/?limit=1'),
      axios.get('/api/submission/?limit=1')
    ]);
    stats.value.problems = problems.data.count;
    stats.value.users = users.data.count;
    stats.value.contests = contests.data.count;
    stats.value.submissions = submissions.data.count;
  } catch (error) {
    console.error('Failed to fetch admin stats:', error);
  }
};

onMounted(() => {
  fetchStats();
});

const goTo = (routeName) => {
  router.push({ name: routeName });
};
</script>

<style scoped>
.admin-dashboard-container {
  margin: 20px;
}
.dashboard-card {
  text-align: center;
  cursor: pointer;
  margin-bottom: 16px;
  transition: box-shadow 0.2s, transform 0.2s;
  min-height: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.dashboard-card:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  transform: translateY(-2px) scale(1.03);
}
.dashboard-icon {
  font-size: 40px;
  margin-bottom: 10px;
}
.dashboard-icon.problem { color: #2d8cf0; }
.dashboard-icon.user { color: #19be6b; }
.dashboard-icon.contest { color: #ff9900; }
.dashboard-icon.submission { color: #ed3f14; }
.stat-label {
  font-size: 18px;
  color: #888;
  margin-bottom: 4px;
}
.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #222;
}
</style> 