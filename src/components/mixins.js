import { ElMessage } from 'element-plus'

export const handleError = (error) => {
  if (error.response) {
    ElMessage.error(error.response.data.message || 'An error occurred')
  } else {
    ElMessage.error('Network error')
  }
}

export const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString()
}

export const formatDuration = (seconds) => {
  if (!seconds) return '0s'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  
  let result = ''
  if (hours > 0) result += `${hours}h `
  if (minutes > 0) result += `${minutes}m `
  if (remainingSeconds > 0 || result === '') result += `${remainingSeconds}s`
  
  return result.trim()
}

export const getDifficultyColor = (difficulty) => {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return 'success'
    case 'medium':
      return 'warning'
    case 'hard':
      return 'danger'
    default:
      return 'info'
  }
}

export const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case 'accepted':
      return 'success'
    case 'wrong answer':
      return 'danger'
    case 'time limit exceeded':
      return 'warning'
    case 'memory limit exceeded':
      return 'warning'
    case 'runtime error':
      return 'danger'
    case 'compilation error':
      return 'danger'
    default:
      return 'info'
  }
} 