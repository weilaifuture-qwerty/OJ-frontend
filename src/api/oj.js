import request from '@/utils/request'

export function getProblems(params) {
  return request({
    url: '/api/problems',
    method: 'get',
    params
  })
}

export function getProblem(id) {
  return request({
    url: `/api/problems/${id}`,
    method: 'get'
  })
}

export function submitSolution(problemId, data) {
  return request({
    url: `/api/problems/${problemId}/submit`,
    method: 'post',
    data
  })
}

export function getSubmissions(params) {
  return request({
    url: '/api/submissions',
    method: 'get',
    params
  })
}

export function getSubmission(id) {
  return request({
    url: `/api/submissions/${id}`,
    method: 'get'
  })
} 