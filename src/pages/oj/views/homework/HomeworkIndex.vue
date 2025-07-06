<template>
  <div class="homework-index-container">
    <!-- Full homework system with backend integration -->
    <StudentHomeworkList v-if="!isAdminRole" />
    <AdminHomeworkList v-else />
  </div>
</template>

<script>
import { useUserStore } from '@/stores/user'
import StudentHomeworkList from './StudentHomeworkList.vue'
import AdminHomeworkList from './AdminHomeworkList.vue'

export default {
  name: 'HomeworkIndex',
  components: {
    StudentHomeworkList,
    AdminHomeworkList
  },
  computed: {
    userStore() {
      return useUserStore()
    },
    isAdminRole() {
      return this.userStore.isAdminRole
    }
  }
}
</script>

<style scoped>
.homework-index-container {
  width: 100%;
}
</style>