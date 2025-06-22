import axios from 'axios'
import { useUserStore } from '@/stores/user'
import { setupCSRFToken } from '@/utils/csrf'

axios.defaults.baseURL = '/api'
axios.defaults.xsrfHeaderName = 'X-CSRFToken'
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.withCredentials = true

// Setup CSRF token interceptor
setupCSRFToken(axios)

export default {
  // Session management
  getCSRFToken() {
    // Simple GET request to establish session and get CSRF cookie
    return axios.get('/website')
  },
  getSessionInfo() {
    return ajax('profile', 'get')
  },
  getWebsiteConf (params) {
    return ajax('website', 'get', {
      params
    })
  },
  getAnnouncementList (offset, limit) {
    let params = {
      offset: offset,
      limit: limit
    }
    return ajax('announcement', 'get', {
      params
    })
  },
  login (data) {
    return ajax('login', 'post', {
      data
    })
  },
  checkUsernameOrEmail (username, email) {
    return ajax('check_username_or_email', 'post', {
      data: {
        username,
        email
      }
    })
  },
  // 注册
  register (data) {
    return ajax('register', 'post', {
      data
    })
  },
  logout () {
    return ajax('logout', 'get')
  },
  getCaptcha () {
    return ajax('captcha', 'get')
  },
  getUserInfo (username = undefined) {
    return ajax('profile', 'get', {
      params: {
        username
      }
    })
  },
  updateProfile (profile) {
    return ajax('profile', 'put', {
      data: profile
    })
  },
  uploadAvatar (formData) {
    return ajax('upload_avatar', 'post', {
      data: formData,
      headers: {'content-type': 'multipart/form-data'}
    })
  },
  deleteAvatar () {
    return ajax('upload_avatar', 'delete')
  },
  freshDisplayID (userID) {
    return ajax('profile/fresh_display_id', 'get', {
      params: {
        user_id: userID
      }
    })
  },
  twoFactorAuth (method, data) {
    return ajax('two_factor_auth', method, {
      data
    })
  },
  tfaRequiredCheck (username) {
    return ajax('tfa_required', 'post', {
      data: {
        username
      }
    })
  },
  getSessions () {
    return ajax('sessions', 'get')
  },
  deleteSession (sessionKey) {
    return ajax('sessions', 'delete', {
      params: {
        session_key: sessionKey
      }
    })
  },
  applyResetPassword (data) {
    return ajax('apply_reset_password', 'post', {
      data
    })
  },
  resetPassword (data) {
    return ajax('reset_password', 'post', {
      data
    })
  },
  changePassword (data) {
    return ajax('change_password', 'post', {
      data
    })
  },
  changeEmail (data) {
    return ajax('change_email', 'post', {
      data
    })
  },
  changeUsername (data) {
    return ajax('change_username', 'post', {
      data
    })
  },
  getLanguages () {
    return ajax('languages', 'get')
  },
  getProblemTagList () {
    return ajax('problem/tags', 'get')
  },
  getProblemList (offset, limit, searchParams) {
    let params = {
      paging: true,
      offset,
      limit
    }
    Object.keys(searchParams).forEach((element) => {
      if (searchParams[element]) {
        params[element] = searchParams[element]
      }
    })
    return ajax('problem', 'get', {
      params: params
    })
  },
  pickone () {
    return ajax('pickone', 'get')
  },
  getProblem (problemID) {
    console.log('[API] getProblem called with problemID:', problemID)
    const url = 'problem'
    const params = { problem_id: problemID }
    console.log('[API] Request URL:', url)
    console.log('[API] Request params:', params)
    
    return ajax(url, 'get', {
      params
    }).then(response => {
      console.log('[API] getProblem response:', response)
      console.log('[API] Response data:', response.data)
      console.log('[API] Problem data:', response.data.data)
      return response
    }).catch(error => {
      console.error('[API] getProblem error:', error)
      console.error('[API] Error response:', error.response)
      throw error
    })
  },
  getContestList (offset, limit, searchParams) {
    let params = {
      offset,
      limit
    }
    if (searchParams !== undefined) {
      Object.keys(searchParams).forEach((element) => {
        if (searchParams[element]) {
          params[element] = searchParams[element]
        }
      })
    }
    return ajax('contests', 'get', {
      params
    })
  },
  getContest (id) {
    return ajax('contest', 'get', {
      params: {
        id
      }
    })
  },
  getContestAccess (contestID) {
    return ajax('contest/access', 'get', {
      params: {
        contest_id: contestID
      }
    })
  },
  checkContestPassword (contestID, password) {
    return ajax('contest/password', 'post', {
      data: {
        contest_id: contestID,
        password
      }
    })
  },
  getContestAnnouncementList (contestId) {
    return ajax('contest/announcement', 'get', {
      params: {
        contest_id: contestId
      }
    })
  },
  getContestProblemList (contestId) {
    return ajax('contest/problem', 'get', {
      params: {
        contest_id: contestId
      }
    })
  },
  getContestProblem (problemID, contestID) {
    return ajax('contest/problem', 'get', {
      params: {
        contest_id: contestID,
        problem_id: problemID
      }
    })
  },
  submitCode (data) {
    return ajax('submission', 'post', {
      data
    })
  },
  getSubmissionList (offset, limit, params) {
    params.limit = limit
    params.offset = offset
    return ajax('submissions', 'get', {
      params
    })
  },
  getContestSubmissionList (offset, limit, params) {
    params.limit = limit
    params.offset = offset
    return ajax('contest_submissions', 'get', {
      params
    })
  },
  getSubmission (id) {
    return ajax('submission', 'get', {
      params: {
        id
      }
    })
  },
  submissionExists (problemID) {
    return ajax('submission_exists', 'get', {
      params: {
        problem_id: problemID
      }
    })
  },
  submissionRejudge (id) {
    return ajax('admin/submission/rejudge', 'get', {
      params: {
        id
      }
    })
  },
  updateSubmission (data) {
    return ajax('submission', 'put', {
      data
    })
  },
  getUserRank (offset, limit, rule = 'acm') {
    let params = {
      offset,
      limit,
      rule
    }
    return ajax('user_rank', 'get', {
      params
    })
  },
  getContestRank (params) {
    return ajax('contest_rank', 'get', {
      params
    })
  },
  getACMACInfo (params) {
    return ajax('admin/contest/acm_helper', 'get', {
      params
    })
  },
  updateACInfoCheckedStatus (data) {
    return ajax('admin/contest/acm_helper', 'put', {
      data
    })
  },
  downloadFile (url) {
    return axios.get(url, {responseType: 'blob'})
  },
  getUserStreak () {
    return ajax('user_streak', 'get')
  },
  dailyCheckIn () {
    return ajax('daily_check_in', 'post')
  },
  getProblemSuggestions () {
    return ajax('problem_suggestions', 'get')
  },
  getUserPracticeHistory (params) {
    return ajax('user_practice_history', 'get', {
      params
    })
  },
  // Homework System - Student
  getStudentHomework (params) {
    return ajax('student_homework', 'get', {
      params
    })
  },
  getStudentHomeworkDetail (id) {
    return ajax('student_homework_detail', 'get', {
      params: { id }
    })
  },
  submitHomeworkProblem (data) {
    return ajax('submit_homework_problem', 'post', {
      data
    })
  },
  getHomeworkProgress () {
    return ajax('homework_progress', 'get')
  },
  getHomeworkComments (homeworkId) {
    return ajax('homework_comments', 'get', {
      params: { homework_id: homeworkId }
    })
  },
  createHomeworkComment (data) {
    return ajax('homework_comments', 'post', {
      data
    })
  },
  deleteHomeworkComment (id) {
    return ajax('homework_comments', 'delete', {
      params: { id }
    })
  }
};

/**
 * @param url
 * @param method get|post|put|delete...
 * @param params like queryString. if a url is index?a=1&b=2, params = {a: '1', b: '2'}
 * @param data post data, use for method put|post
 * @returns {Promise}
 */
function ajax (url, method, options) {
  if (options !== undefined) {
    var {params = {}, data = {}, headers = {}} = options
  } else {
    params = data = {}
    headers = {}
  }
  
  console.log('[AJAX] Request:', {
    url,
    method,
    params,
    data,
    headers,
    fullURL: axios.defaults.baseURL + '/' + url
  })
  
  return new Promise((resolve, reject) => {
    axios({
      url,
      method,
      params,
      data,
      headers
    }).then(res => {
      console.log('[AJAX] Response:', {
        url,
        status: res.status,
        statusText: res.statusText,
        headers: res.headers,
        data: res.data
      })
      
      // API正常返回(status=20x), 是否错误通过有无error判断
      if (res.data.error !== null) {
        console.error('[AJAX] API returned error:', res.data.error)
        // Will be handled by components
        reject(res)
        // 若后端返回为登录，则为session失效，应退出当前登录用户
        if (res.data.data && res.data.data.startsWith('Please login')) {
          const userStore = useUserStore()
          userStore.changeModalStatus({'mode': 'login', 'visible': true})
        }
      } else {
        console.log('[AJAX] Success - data:', res.data.data)
        resolve(res)
      }
    }, res => {
      console.error('[AJAX] Request failed:', {
        url,
        error: res,
        response: res.response,
        message: res.message
      })
      // API请求异常，一般为Server error 或 network error
      reject(res)
    })
  })
}
