<template>
  <div class="admin-problem-container">
    <Card>
      <template #title>
        <h2>Problem Management</h2>
      </template>
      <div class="problem-search-bar">
        <Input v-model="search" placeholder="Search by problem title or ID" style="width: 300px" @on-enter="fetchProblems" />
        <Button type="primary" @click="fetchProblems" style="margin-left: 8px;">Search</Button>
      </div>
      <Table :columns="columns" :data="problems" :loading="loading" stripe>
        <template #action="{ row }">
          <Button size="small" @click="viewProblem(row)">View</Button>
          <Button size="small" type="error" @click="deleteProblem(row)" style="margin-left: 8px;">Delete</Button>
        </template>
      </Table>
      <div class="pagination-container">
        <Page :total="total" v-model:current="currentPage" :page-size="pageSize" @on-change="handlePageChange" />
      </div>
    </Card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const problems = ref([]);
const total = ref(0);
const loading = ref(false);
const search = ref('');
const currentPage = ref(1);
const pageSize = ref(20);

const columns = [
  { title: 'ID', key: 'id' },
  { title: 'Title', key: 'title' },
  { title: 'Difficulty', key: 'difficulty' },
  { title: 'Action', slot: 'action', width: 160 }
];

const fetchProblems = async () => {
  loading.value = true;
  try {
    const offset = (currentPage.value - 1) * pageSize.value;
    const params = { limit: pageSize.value, offset };
    if (search.value) params.keyword = search.value;
    const res = await axios.get('/api/problem/', { params });
    problems.value = res.data.results;
    total.value = res.data.count;
  } catch (e) {
    problems.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

const handlePageChange = (page) => {
  currentPage.value = page;
  fetchProblems();
};

const viewProblem = (row) => {
  // Implement view problem details modal or page
  alert(`View problem: ${row.title}`);
};

const deleteProblem = async (row) => {
  // Implement delete problem logic (requires backend support)
  alert(`Delete problem: ${row.title}`);
};

onMounted(fetchProblems);
</script>

<style scoped>
.admin-problem-container {
  margin: 20px;
}
.problem-search-bar {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}
.pagination-container {
  margin-top: 16px;
  text-align: right;
}
</style> 