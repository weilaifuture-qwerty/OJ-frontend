<template>
  <div class="admin-user-container">
    <Card>
      <template #title>
        <h2>User Management</h2>
      </template>
      <div class="user-search-bar">
        <Input v-model="search" placeholder="Search by username or email" style="width: 300px" @on-enter="fetchUsers" />
        <Button type="primary" @click="fetchUsers" style="margin-left: 8px;">Search</Button>
        <Button type="success" @click="showCreateUserModal" style="margin-left: 8px;">Create User</Button>
      </div>
      <Table :columns="columns" :data="users" :loading="loading" stripe>
        <template #action="{ row }">
          <Button size="small" @click="viewUser(row)">View</Button>
          <Button size="small" type="error" @click="deleteUser(row)" style="margin-left: 8px;">Delete</Button>
        </template>
      </Table>
      <div class="pagination-container">
        <Page :total="total" v-model:current="currentPage" :page-size="pageSize" @on-change="handlePageChange" />
      </div>
    </Card>

    <!-- Create User Modal -->
    <Modal v-model="createUserModalVisible" title="Create User" @on-ok="createUser">
      <Form :model="newUser" :label-width="80">
        <FormItem label="Username">
          <Input v-model="newUser.username" placeholder="Enter username" />
        </FormItem>
        <FormItem label="Email">
          <Input v-model="newUser.email" placeholder="Enter email" />
        </FormItem>
        <FormItem label="Password">
          <Input v-model="newUser.password" type="password" placeholder="Enter password" />
        </FormItem>
        <FormItem label="Real Name">
          <Input v-model="newUser.real_name" placeholder="Enter real name" />
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
// import api from '@/api';
import { apiClient } from '@/api';

const users = ref([]);
const total = ref(0);
const loading = ref(false);
const search = ref('');
const currentPage = ref(1);
const pageSize = ref(20);
const createUserModalVisible = ref(false);
const newUser = ref({
  username: '',
  email: '',
  password: '',
  real_name: '',
  admin_type: 'REGULAR_USER',
  problem_permission: [],
  contest_permission: []
});

const columns = [
  { title: 'Username', key: 'username' },
  { title: 'Email', key: 'email' },
  { title: 'Register Time', key: 'create_time' },
  { title: 'Action', slot: 'action', width: 160 }
];

const fetchUsers = async () => {
  loading.value = true;
  try {
    const offset = (currentPage.value - 1) * pageSize.value;
    const params = { limit: pageSize.value, offset };
    if (search.value) params.keyword = search.value;
    const res = await apiClient.get('/admin/user/', { params });
    users.value = res.data.results;
    total.value = res.data.count;
  } catch (e) {
    users.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

const handlePageChange = (page) => {
  currentPage.value = page;
  fetchUsers();
};

const viewUser = (row) => {
  // Implement view user details modal or page
  alert(`View user: ${row.username}`);
};

const deleteUser = async (row) => {
  // Implement delete user logic (requires backend support)
  alert(`Delete user: ${row.username}`);
};

const showCreateUserModal = () => {
  createUserModalVisible.value = true;
};

const createUser = async () => {
  try {
    // const userPayload = {
    //   username: newUser.value.username,
    //   email: newUser.value.email,
    //   password: newUser.value.password,
    //   real_name: newUser.value.real_name,
    //   admin_type: newUser.value.admin_type
    // };
    const userPayload = [
      newUser.value.username,
      newUser.value.email,
      newUser.value.password,
      newUser.value.real_name,
      newUser.value.admin_type
    ];
    console.log('Payload:', { users: [userPayload] });
    await apiClient.post('/admin/user/', { users: [userPayload] } );
    createUserModalVisible.value = false;
    newUser.value = {
      username: '',
      email: '',
      password: '',
      real_name: '',
      admin_type: 'REGULAR_USER',
      problem_permission: [],
      contest_permission: []
    };
    fetchUsers();
  } catch (e) {
    console.error('Create user error:', e);
    let msg = 'Failed to create user. ';
    if (e && e.message) msg += e.message;
    if (e && e.data && e.data.message) msg += e.data.message;
    alert(msg);
  }
};

onMounted(fetchUsers);
</script>

<style scoped>
.admin-user-container {
  margin: 20px;
}
.user-search-bar {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}
.pagination-container {
  margin-top: 16px;
  text-align: right;
}
</style> 