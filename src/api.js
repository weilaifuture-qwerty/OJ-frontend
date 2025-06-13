// Placeholder for API calls
// Actual implementation will depend on your backend and chosen HTTP client (e.g., axios)

import axios from 'axios';
// Message import might not be needed here if error handling is done in stores/components
// import { Message } from 'view-ui-plus'; 
// Stores should not be imported directly into api.js to avoid circular dependencies.
// If global loading or auth modals need to be triggered from here (e.g. in interceptors),
// consider an event bus or a callback mechanism.

// Function to get CSRF token from cookies
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Function to ensure CSRF token is available
async function ensureCsrfToken() {
  // Temporarily disable extra GET request for CSRF token
  return getCookie('csrftoken');
}

// Create an Axios instance
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  withCredentials: true,
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Request interceptor to ensure CSRF token is set
apiClient.interceptors.request.use(
  async (config) => {
    // Ensure CSRF token is available before making the request
    const csrftoken = await ensureCsrfToken();
    if (csrftoken) {
      config.headers['X-CSRFToken'] = csrftoken;
    }
    config.withCredentials = true;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    if (response.data && response.data.data !== undefined) {
      if (response.data.error) {
        return Promise.reject(response.data);
      }
      return response.data.data;
    }
    return response.data;
  },
  async (error) => {
    if (error.response) {
      // Handle CSRF token errors
      if (error.response.status === 403 && error.response.data?.detail?.includes('CSRF')) {
        console.error('CSRF token error:', error.response.data);
        // Try to get a new CSRF token
        await ensureCsrfToken();
        // Retry the original request
        const config = error.config;
        return apiClient(config);
      }
      return Promise.reject(error.response.data);
    }
    return Promise.reject(error);
  }
);

// API Functions
const api = {
  // User related
  login: (data) => apiClient.post('/login/', data),
  register: (data) => apiClient.post('/register/', data),
  logout: () => apiClient.get('/logout/'),
  getUserInfo: () => apiClient.get('/user/'),
  getProfile: () => apiClient.get('/profile/'),
  updateProfile: (data) => apiClient.put('/user/', data),
  changePassword: (data) => apiClient.put('/user/change_password/', data),
  changeEmail: (data) => apiClient.put('/user/change_email/', data),
  deleteAccount: (data) => apiClient.delete('/user/', { data }),
  
  // Problem related
  getProblemList: (params) => apiClient.get('/problem/', { params }),
  getProblem: (id) => apiClient.get(`/problem/${id}/`),
  
  // Submission related
  getSubmissionList: (params) => apiClient.get('/submission/', { params }),
  getSubmission: (id) => apiClient.get(`/submission/${id}/`),
  submitCode: (data) => apiClient.post('/submission/', data),
  
  // Contest related
  getContestList: (params) => apiClient.get('/contest/', { params }),
  getContest: (id) => apiClient.get(`/contest/${id}/`),
  
  // Website config
  getWebsiteConf: () => apiClient.get('/website/'),
  
  // Two-factor authentication
  twoFactorAuth: (method, data) => apiClient[method]('/two_factor_auth/', data),
  tfaRequiredCheck: () => apiClient.get('/tfa_required/'),
  
  // Sessions
  getSessions: () => apiClient.get('/sessions/'),
  deleteSession: (key) => apiClient.delete(`/sessions/${key}/`),
};

export default api;
export { apiClient }; 