// CSRF token utilities
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

export function getCSRFToken() {
  return getCookie('csrftoken');
}

export function setupCSRFToken(axios) {
  // Add a request interceptor to include CSRF token
  axios.interceptors.request.use(
    config => {
      // Only add CSRF token for state-changing methods
      if (['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
        const token = getCSRFToken();
        if (token) {
          config.headers['X-CSRFToken'] = token;
        }
      }
      return config;
    },
    error => {
      return Promise.reject(error);
    }
  );
}