<template>
  <div class="csrf-debug">
    <h2>CSRF Token Debugging</h2>
    
    <div class="section">
      <h3>Cookie Information</h3>
      <pre>{{ cookieInfo }}</pre>
    </div>

    <div class="section">
      <h3>Test Results</h3>
      <div v-for="(result, index) in testResults" :key="index" class="test-result">
        <h4>{{ result.test }}</h4>
        <pre>{{ result.result }}</pre>
      </div>
    </div>

    <div class="actions">
      <el-button @click="runAllTests" type="primary">Run All Tests</el-button>
      <el-button @click="clearResults">Clear Results</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const cookieInfo = ref('Loading...')
const testResults = ref([])

// Get cookie value by name
function getCookie(name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}

// Check cookies and display info
function checkCookies() {
  const csrfToken = getCookie('csrftoken')
  const sessionId = getCookie('sessionid')
  
  cookieInfo.value = JSON.stringify({
    csrftoken: csrfToken || 'NOT FOUND',
    sessionid: sessionId || 'NOT FOUND',
    allCookies: document.cookie || 'NO COOKIES',
    cookieEnabled: navigator.cookieEnabled
  }, null, 2)
}

// Test 1: Make a GET request to get CSRF token
async function testGetCSRFToken() {
  const result = { test: 'GET request to obtain CSRF token', result: '' }
  
  try {
    // First, make a GET request to ensure we have a CSRF token
    const response = await axios.get('/api/website')
    
    result.result = `Status: ${response.status}\n`
    result.result += `Headers: ${JSON.stringify(response.headers, null, 2)}\n`
    
    // Check if cookie was set
    checkCookies()
    const csrfToken = getCookie('csrftoken')
    result.result += `\nCSRF Token from cookie: ${csrfToken || 'NOT FOUND'}`
    
  } catch (error) {
    result.result = `Error: ${error.message}\n${error.response?.data || ''}`
  }
  
  testResults.value.push(result)
}

// Test 2: Test axios POST with credentials
async function testAxiosPost() {
  const result = { test: 'Axios POST with withCredentials', result: '' }
  
  try {
    const csrfToken = getCookie('csrftoken')
    result.result += `Using CSRF Token: ${csrfToken || 'NOT FOUND'}\n\n`
    
    const response = await axios.post('/api/login', {
      username: 'test',
      password: 'test'
    })
    
    result.result += `Status: ${response.status}\n`
    result.result += `Response: ${JSON.stringify(response.data, null, 2)}`
    
  } catch (error) {
    result.result += `Error: ${error.message}\n`
    result.result += `Status: ${error.response?.status}\n`
    result.result += `Response: ${JSON.stringify(error.response?.data, null, 2)}\n`
    result.result += `Request Headers: ${JSON.stringify(error.config?.headers, null, 2)}`
  }
  
  testResults.value.push(result)
}

// Test 3: Test fetch API with credentials
async function testFetchPost() {
  const result = { test: 'Fetch API POST with credentials', result: '' }
  
  try {
    const csrfToken = getCookie('csrftoken')
    result.result += `Using CSRF Token: ${csrfToken || 'NOT FOUND'}\n\n`
    
    const response = await fetch('/api/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken || ''
      },
      body: JSON.stringify({
        username: 'test',
        password: 'test'
      })
    })
    
    const data = await response.json()
    
    result.result += `Status: ${response.status}\n`
    result.result += `Response: ${JSON.stringify(data, null, 2)}\n`
    result.result += `Response Headers:\n`
    for (let [key, value] of response.headers) {
      result.result += `  ${key}: ${value}\n`
    }
    
  } catch (error) {
    result.result += `Error: ${error.message}\n${error.stack}`
  }
  
  testResults.value.push(result)
}

// Test 4: Check axios defaults
async function testAxiosDefaults() {
  const result = { test: 'Axios Default Configuration', result: '' }
  
  result.result = JSON.stringify({
    baseURL: axios.defaults.baseURL,
    withCredentials: axios.defaults.withCredentials,
    xsrfCookieName: axios.defaults.xsrfCookieName,
    xsrfHeaderName: axios.defaults.xsrfHeaderName,
    headers: axios.defaults.headers
  }, null, 2)
  
  testResults.value.push(result)
}

// Test 5: Manual axios request with explicit headers
async function testManualAxiosPost() {
  const result = { test: 'Manual Axios POST with explicit CSRF header', result: '' }
  
  try {
    const csrfToken = getCookie('csrftoken')
    result.result += `Using CSRF Token: ${csrfToken || 'NOT FOUND'}\n\n`
    
    const response = await axios({
      url: '/api/login',
      method: 'POST',
      data: {
        username: 'test',
        password: 'test'
      },
      withCredentials: true,
      headers: {
        'X-CSRFToken': csrfToken || '',
        'Content-Type': 'application/json'
      }
    })
    
    result.result += `Status: ${response.status}\n`
    result.result += `Response: ${JSON.stringify(response.data, null, 2)}`
    
  } catch (error) {
    result.result += `Error: ${error.message}\n`
    result.result += `Status: ${error.response?.status}\n`
    result.result += `Response: ${JSON.stringify(error.response?.data, null, 2)}\n`
    result.result += `Request Config: ${JSON.stringify({
      url: error.config?.url,
      method: error.config?.method,
      headers: error.config?.headers,
      withCredentials: error.config?.withCredentials
    }, null, 2)}`
  }
  
  testResults.value.push(result)
}

// Test 6: Check if we're getting CORS headers
async function testCORSHeaders() {
  const result = { test: 'CORS Headers Check', result: '' }
  
  try {
    // Use native fetch to see all headers
    const response = await fetch('/api/website', {
      method: 'GET',
      credentials: 'include'
    })
    
    result.result += `Status: ${response.status}\n`
    result.result += `Response Headers:\n`
    for (let [key, value] of response.headers) {
      result.result += `  ${key}: ${value}\n`
    }
    
    // Check specific CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Credentials': response.headers.get('Access-Control-Allow-Credentials'),
      'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
      'Set-Cookie': response.headers.get('Set-Cookie') || 'Browser hides this header'
    }
    
    result.result += `\nCORS Configuration:\n${JSON.stringify(corsHeaders, null, 2)}`
    
  } catch (error) {
    result.result += `Error: ${error.message}`
  }
  
  testResults.value.push(result)
}

// Run all tests
async function runAllTests() {
  testResults.value = []
  checkCookies()
  
  await testGetCSRFToken()
  await new Promise(resolve => setTimeout(resolve, 500))
  
  await testAxiosDefaults()
  await testCORSHeaders()
  await testAxiosPost()
  await testManualAxiosPost()
  await testFetchPost()
}

function clearResults() {
  testResults.value = []
  cookieInfo.value = 'Click "Run All Tests" to start'
}

onMounted(() => {
  checkCookies()
})
</script>

<style scoped>
.csrf-debug {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.section {
  margin-bottom: 30px;
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 5px;
}

.test-result {
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 5px;
}

.test-result h4 {
  margin-top: 0;
  color: #333;
}

pre {
  background-color: #f0f0f0;
  padding: 10px;
  border-radius: 3px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.actions {
  margin-top: 20px;
}

.actions .el-button {
  margin-right: 10px;
}
</style>