<template>
  <div class="problem-detail">
    <el-card class="problem-card">
      <template #header>
        <div class="card-header">
          <h2>{{ problem.title }}</h2>
          <div class="problem-meta">
            <el-tag :type="problem.difficulty === 'Easy' ? 'success' : problem.difficulty === 'Medium' ? 'warning' : 'danger'">
              {{ problem.difficulty }}
            </el-tag>
            <span class="acceptance-rate">Acceptance Rate: {{ problem.acceptanceRate }}%</span>
          </div>
        </div>
      </template>
      
      <div class="problem-content">
        <div class="description" v-html="problem.description"></div>
        
        <div class="examples">
          <h3>Examples</h3>
          <div v-for="(example, index) in problem.examples" :key="index" class="example">
            <h4>Example {{ index + 1 }}</h4>
            <pre><code>{{ example.input }}</code></pre>
            <pre><code>{{ example.output }}</code></pre>
            <div v-if="example.explanation" class="explanation">
              <strong>Explanation:</strong> {{ example.explanation }}
            </div>
          </div>
        </div>
        
        <div class="constraints">
          <h3>Constraints</h3>
          <ul>
            <li v-for="(constraint, index) in problem.constraints" :key="index">
              {{ constraint }}
            </li>
          </ul>
        </div>
      </div>
    </el-card>

    <el-card class="submission-card">
      <template #header>
        <div class="card-header">
          <h3>Submit Solution</h3>
        </div>
      </template>
      
      <el-form :model="submission" :rules="rules" ref="formRef">
        <el-form-item prop="language">
          <el-select v-model="submission.language" placeholder="Select Language">
            <el-option label="Python" value="python" />
            <el-option label="Java" value="java" />
            <el-option label="C++" value="cpp" />
          </el-select>
        </el-form-item>
        
        <el-form-item prop="code">
          <el-input
            v-model="submission.code"
            type="textarea"
            :rows="15"
            placeholder="Write your code here..."
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            Submit
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import api from '@/api'

const route = useRoute()
const formRef = ref(null)
const submitting = ref(false)

const problem = reactive({
  title: '',
  difficulty: '',
  acceptanceRate: 0,
  description: '',
  examples: [],
  constraints: []
})

const submission = reactive({
  language: '',
  code: ''
})

const rules = {
  language: [
    { required: true, message: 'Please select a language', trigger: 'change' }
  ],
  code: [
    { required: true, message: 'Please write your code', trigger: 'blur' }
  ]
}

onMounted(async () => {
  try {
    const response = await api.getProblem(route.params.id)
    Object.assign(problem, response.data)
  } catch (error) {
    ElMessage.error('Failed to load problem details')
  }
})

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitting.value = true
    await api.submitProblem(route.params.id, submission)
    ElMessage.success('Solution submitted successfully')
  } catch (error) {
    ElMessage.error(error.message || 'Failed to submit solution')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.problem-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.problem-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.problem-meta {
  display: flex;
  gap: 10px;
  align-items: center;
}

.acceptance-rate {
  color: #666;
}

.problem-content {
  margin-top: 20px;
}

.examples {
  margin: 20px 0;
}

.example {
  margin: 15px 0;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
}

.example pre {
  background: #1e1e1e;
  color: #fff;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
}

.explanation {
  margin-top: 10px;
  color: #666;
}

.constraints ul {
  list-style-type: none;
  padding-left: 0;
}

.constraints li {
  margin: 5px 0;
  color: #666;
}

.submission-card {
  margin-top: 20px;
}
</style> 