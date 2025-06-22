// CSRF Debug Script - Copy and paste this into browser console

console.log('=== CSRF Debug Info ===');

// 1. Check cookies
console.log('1. Current cookies:');
console.log(document.cookie);

// 2. Check CSRF token
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

const csrfToken = getCookie('csrftoken');
console.log('2. CSRF Token:', csrfToken || 'NOT FOUND');

// 3. Check axios defaults
console.log('3. Axios defaults:');
console.log('   withCredentials:', axios.defaults.withCredentials);
console.log('   xsrfHeaderName:', axios.defaults.xsrfHeaderName);
console.log('   xsrfCookieName:', axios.defaults.xsrfCookieName);

// 4. Test GET request to establish session
console.log('4. Testing GET request to /api/website...');
fetch('/api/website', {
  method: 'GET',
  credentials: 'include'
})
.then(response => {
  console.log('   GET /api/website status:', response.status);
  console.log('   Response headers:');
  response.headers.forEach((value, key) => {
    if (key.toLowerCase().includes('cookie') || key.toLowerCase().includes('csrf')) {
      console.log(`   ${key}: ${value}`);
    }
  });
  return response.json();
})
.then(data => {
  console.log('   Response data:', data);
  
  // After GET, check cookies again
  console.log('5. Cookies after GET:');
  console.log(document.cookie);
  
  const newCsrfToken = getCookie('csrftoken');
  console.log('6. CSRF Token after GET:', newCsrfToken || 'NOT FOUND');
  
  // 5. Test POST request with manual CSRF header
  console.log('7. Testing POST with manual CSRF header...');
  return fetch('/api/login', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': newCsrfToken || ''
    },
    body: JSON.stringify({
      username: 'test',
      password: 'test'
    })
  });
})
.then(response => {
  console.log('   POST /api/login status:', response.status);
  if (response.status === 403) {
    return response.text();
  }
  return response.json();
})
.then(data => {
  console.log('   POST response:', data);
})
.catch(error => {
  console.error('   Error:', error);
});

// 8. Check if axios interceptor is working
console.log('8. Testing axios interceptor...');
setTimeout(() => {
  // Create a test axios instance
  const testAxios = axios.create({
    baseURL: '/api',
    withCredentials: true,
    xsrfHeaderName: 'X-CSRFToken',
    xsrfCookieName: 'csrftoken'
  });
  
  // Add interceptor to log headers
  testAxios.interceptors.request.use(config => {
    console.log('   Axios request config:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      withCredentials: config.withCredentials
    });
    return config;
  });
  
  // Try a POST
  testAxios.post('/login', {
    username: 'test',
    password: 'test'
  }).catch(err => {
    console.log('   Axios error:', err.response?.status, err.response?.data);
  });
}, 2000);

console.log('=== End Debug Info ===');
console.log('Check the network tab for more details on the requests.');