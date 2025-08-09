<template>
  <div>
    <h2>Assign Task to Students</h2>
    <div>
      <input v-model="taskId" placeholder="Task ID to assign" />
      <button @click="assignTask">Assign Task</button>
    </div>
    <div v-if="assignStatus">{{ assignStatus }}</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      taskId: '',
      assignStatus: ''
    }
  },
  methods: {
    async assignTask() {
      if (!this.taskId) {
        this.assignStatus = 'Please enter a task ID.'
        return
      }
      const res = await fetch('/api/classroom/tasks/assign/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_id: this.taskId,
          student_ids: [] // No students selected
        })
      })
      if (res.ok) {
        this.assignStatus = 'Task assigned successfully!'
      } else {
        this.assignStatus = 'Failed to assign task.'
      }
    }
  }
}
</script>

<style scoped>
ul {
  list-style: none;
  padding: 0;
}
li {
  cursor: pointer;
  margin-bottom: 4px;
}
li:hover {
  background: #f0f0f0;
}
</style> 