import axios from 'axios'
import { ElMessage } from 'element-plus'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// Request interceptor
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  response => {
    return response
  },
  error => {
    if (error.response) {
      switch (error.response.status) {
        case 400:
          ElMessage.error(error.response.data.message || 'Bad request')
          break
        case 401:
          ElMessage.error('Please login first')
          // Redirect to login page
          window.location.href = '/login'
          break
        case 403:
          ElMessage.error('Access denied')
          break
        case 404:
          ElMessage.error('Resource not found')
          break
        case 500:
          ElMessage.error('Server error')
          break
        default:
          ElMessage.error('Unknown error')
      }
    } else {
      ElMessage.error('Network error')
    }
    return Promise.reject(error)
  }
)

// Auth APIs
export const login = (data) => api.post('/auth/login', data)
export const register = (data) => api.post('/auth/register', data)
export const logout = () => api.post('/auth/logout')
export const getUserInfo = () => api.get('/auth/user')

// Problem APIs
export const getProblems = (params) => api.get('/problems', { params })
export const getProblem = (id) => api.get(`/problems/${id}`)
export const submitProblem = (id, data) => api.post(`/problems/${id}/submit`, data)

// Contest APIs
export const getContests = (params) => api.get('/contests', { params })
export const getContest = (id) => api.get(`/contests/${id}`)
export const getContestProblems = (id) => api.get(`/contests/${id}/problems`)
export const joinContest = (id, password) => api.post(`/contests/${id}/join`, { password })
export const getContestSubmissions = (id, params) => api.get(`/contests/${id}/submissions`, { params })
export const getContestRankings = (id, params) => api.get(`/contests/${id}/rankings`, { params })

// Submission APIs
export const getSubmissions = (params) => api.get('/submissions', { params })
export const getSubmission = (id) => api.get(`/submissions/${id}`)

// User APIs
export const updateProfile = (data) => api.put('/users/profile', data)
export const changePassword = (data) => api.put('/users/password', data)

export default {
  login,
  register,
  logout,
  getUserInfo,
  getProblems,
  getProblem,
  submitProblem,
  getContests,
  getContest,
  getContestProblems,
  joinContest,
  getContestSubmissions,
  getContestRankings,
  getSubmissions,
  getSubmission,
  updateProfile,
  changePassword
} 