<template>
  <div class="admin-contest-container">
    <Card>
      <template #title>
        <h2>Contest Management</h2>
      </template>
      <div class="contest-search-bar">
        <Input v-model="search" placeholder="Search by contest title or ID" style="width: 300px" @on-enter="fetchContests" />
        <Button type="primary" @click="fetchContests" style="margin-left: 8px;">Search</Button>
      </div>
      <Table :columns="columns" :data="contests" :loading="loading" stripe>
        <template #action="{ row }">
          <Button size="small" @click="viewContest(row)">View</Button>
          <Button size="small" type="error" @click="deleteContest(row)" style="margin-left: 8px;">Delete</Button>
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

const contests = ref([]);
const total = ref(0);
const loading = ref(false);
const search = ref('');
const currentPage = ref(1);
const pageSize = ref(20);

const columns = [
  { title: 'ID', key: 'id' },
  { title: 'Title', key: 'title' },
  { title: 'Start Time', key: 'start_time' },
  { title: 'End Time', key: 'end_time' },
  { title: 'Action', slot: 'action', width: 160 }
];

const fetchContests = async () => {
  loading.value = true;
  try {
    const offset = (currentPage.value - 1) * pageSize.value;
    const params = { limit: pageSize.value, offset };
    if (search.value) params.keyword = search.value;
    const res = await axios.get('/api/contest/', { params });
    contests.value = res.data.results;
    total.value = res.data.count;
  } catch (e) {
    contests.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

const handlePageChange = (page) => {
  currentPage.value = page;
  fetchContests();
};

const viewContest = (row) => {
  // Implement view contest details modal or page
  alert(`View contest: ${row.title}`);
};

const deleteContest = async (row) => {
  // Implement delete contest logic (requires backend support)
  alert(`Delete contest: ${row.title}`);
};

onMounted(fetchContests);
</script>

<style scoped>
.admin-contest-container {
  margin: 20px;
}
.contest-search-bar {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}
.pagination-container {
  margin-top: 16px;
  text-align: right;
}
</style> 