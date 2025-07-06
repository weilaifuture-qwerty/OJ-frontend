<template>
  <div class="student-homework-detail">
    <div style="background: white; padding: 20px; margin: 20px; border: 1px solid #ddd;">
      <h1>Homework Detail Debug View</h1>
      
      <!-- Basic debug info -->
      <div style="background: #f0f0f0; padding: 10px; margin: 10px 0;">
        <p><strong>Component Status:</strong> Mounted successfully</p>
        <p><strong>Loading:</strong> {{ loading }}</p>
        <p><strong>Homework ID:</strong> {{ homeworkId }}</p>
        <p><strong>Title:</strong> {{ homework.title || 'No title' }}</p>
      </div>
      
      <!-- Simple loading state -->
      <div v-if="loading" style="text-align: center; padding: 50px;">
        <p>Loading homework details...</p>
      </div>
      
      <!-- Simple content display -->
      <div v-else style="margin-top: 20px;">
        <h2>{{ homework.title }}</h2>
        <p><strong>Description:</strong> {{ homework.description }}</p>
        <p><strong>Status:</strong> {{ homework.status }}</p>
        <p><strong>Due Date:</strong> {{ homework.due_date }}</p>
        <p><strong>Assigned By:</strong> {{ homework.assigned_by }}</p>
        
        <h3>Problems ({{ homework.problems.length }})</h3>
        <ul>
          <li v-for="problem in homework.problems" :key="problem.id">
            {{ problem.title }} - {{ problem.difficulty }} - Status: {{ problem.status }}
          </li>
        </ul>
        
        <h3>Comments ({{ comments.length }})</h3>
        <div v-for="comment in comments" :key="comment.id" style="border: 1px solid #ddd; padding: 10px; margin: 10px 0;">
          <p><strong>{{ comment.author }}:</strong> {{ comment.content }}</p>
          <p style="font-size: 12px; color: #666;">{{ comment.created_at }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StudentHomeworkDetailSimple',
  data() {
    return {
      loading: true,
      homework: {
        title: '',
        description: '',
        status: 'assigned',
        problems: [],
        due_date: null,
        assigned_by: ''
      },
      comments: []
    }
  },
  computed: {
    homeworkId() {
      return this.$route.params.id
    }
  },
  mounted() {
    console.log('DEBUG: Simple component mounted')
    console.log('DEBUG: Homework ID:', this.homeworkId)
    this.loadHomework()
  },
  methods: {
    loadHomework() {
      console.log('DEBUG: Loading homework...')
      
      // Mock data for testing
      this.homework = {
        id: parseInt(this.homeworkId),
        title: 'Week 1 Programming Assignment (Debug)',
        description: 'This is a test homework assignment to debug the display issue.',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'in_progress',
        assigned_by: 'Professor Smith',
        problems: [
          {
            id: 1,
            title: 'Two Sum',
            difficulty: 'Easy',
            status: 'solved'
          },
          {
            id: 2,
            title: 'Add Two Numbers',
            difficulty: 'Medium',
            status: 'attempted'
          }
        ]
      }
      
      this.comments = [
        {
          id: 1,
          author: 'Student',
          content: 'Test comment',
          created_at: new Date()
        }
      ]
      
      // Simulate loading
      setTimeout(() => {
        this.loading = false
        console.log('DEBUG: Loading complete')
      }, 500)
    }
  }
}
</script>

<style scoped>
.student-homework-detail {
  min-height: 100vh;
  background: #f5f5f5;
}
</style>