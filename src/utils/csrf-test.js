/**
 * CSRF Debugging Script
 * Run this in the browser console to diagnose CSRF issues
 */

// Helper function to get cookie value
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

// Test 1: Check current state
console.group('1. Current State Check');
console.log('Current URL:', window.location.href);
console.log('All cookies:', document.cookie);
console.log('CSRF Token:', getCookie('csrftoken'));
console.log('Session ID:', getCookie('sessionid'));
console.groupEnd();

// Test 2: Make GET request to initialize CSRF
console.group('2. GET Request Test');
fetch('/api/website', {
  credentials: 'include',
  headers: {
    'Accept': 'application/json',
  }
})
.then(response => {
  console.log('GET Response Status:', response.status);
  console.log('Response Headers:');
  for (let [key, value] of response.headers) {
    console.log(`  ${key}: ${value}`);
  }
  return response.json();
})
.then(data => {
  console.log('Response Data:', data);
  console.log('CSRF Token after GET:', getCookie('csrftoken'));
})
.catch(error => {
  console.error('GET Error:', error);
});
console.groupEnd();

// Test 3: Make POST request with CSRF token
setTimeout(() => {
  console.group('3. POST Request Test');
  const csrfToken = getCookie('csrftoken');
  console.log('Using CSRF Token:', csrfToken);
  
  fetch('/api/login', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken || '',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      username: 'test',
      password: 'test'
    })
  })
  .then(response => {
    console.log('POST Response Status:', response.status);
    console.log('Response Headers:');
    for (let [key, value] of response.headers) {
      console.log(`  ${key}: ${value}`);
    }
    return response.text();
  })
  .then(text => {
    try {
      const data = JSON.parse(text);
      console.log('Response Data:', data);
    } catch (e) {
      console.log('Response Text:', text);
    }
  })
  .catch(error => {
    console.error('POST Error:', error);
  });
  console.groupEnd();
}, 2000);

// Test 4: Check axios configuration
setTimeout(() => {
  console.group('4. Axios Configuration');
  if (typeof axios !== 'undefined') {
    console.log('Axios defaults:', {
      baseURL: axios.defaults.baseURL,
      withCredentials: axios.defaults.withCredentials,
      xsrfCookieName: axios.defaults.xsrfCookieName,
      xsrfHeaderName: axios.defaults.xsrfHeaderName
    });
    
    // Test axios request
    axios.post('/api/login', {
      username: 'test',
      password: 'test'
    })
    .then(response => {
      console.log('Axios POST Success:', response.data);
    })
    .catch(error => {
      console.error('Axios POST Error:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.config?.headers
      });
    });
  } else {
    console.log('Axios not available in global scope');
  }
  console.groupEnd();
}, 3000);

// Export for use in modules
export { getCookie };