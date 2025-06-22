// Simple CSRF Debug Script - Copy and paste this into browser console

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
console.log('3. Session ID:', getCookie('sessionid') || 'NOT FOUND');

// 3. Test GET request to establish session
console.log('\n4. Testing GET request to /api/website...');
fetch('/api/website', {
  method: 'GET',
  credentials: 'include'
})
.then(response => {
  console.log('   Status:', response.status);
  // Check if we got any Set-Cookie headers (won't be visible in JS but we can infer)
  return response.json();
})
.then(data => {
  console.log('   Response:', data);
  
  // After GET, check cookies again
  console.log('\n5. Cookies after GET request:');
  console.log(document.cookie);
  
  const newCsrfToken = getCookie('csrftoken');
  console.log('   CSRF Token now:', newCsrfToken || 'STILL NOT FOUND');
  
  if (!newCsrfToken) {
    console.log('\n⚠️  No CSRF token found! Possible issues:');
    console.log('   - Django CSRF_COOKIE_HTTPONLY might be True (should be False)');
    console.log('   - Django might not be setting CSRF cookie on GET requests');
    console.log('   - Cookie domain/path mismatch');
    return;
  }
  
  // 4. Test POST request with CSRF token
  console.log('\n6. Testing POST to /api/login with CSRF token...');
  return fetch('/api/login', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': newCsrfToken
    },
    body: JSON.stringify({
      username: 'test_user',
      password: 'test_pass'
    })
  });
})
.then(response => {
  if (response) {
    console.log('   POST Status:', response.status);
    if (response.status === 403) {
      return response.text();
    }
    return response.json();
  }
})
.then(data => {
  if (data) {
    console.log('   POST Response:', data);
    if (typeof data === 'string' && data.includes('CSRF')) {
      console.log('\n⚠️  CSRF verification failed! Check:');
      console.log('   - CSRF_TRUSTED_ORIGINS in Django settings');
      console.log('   - CORS_ALLOWED_ORIGINS in Django settings');
      console.log('   - Referer header policy');
    }
  }
})
.catch(error => {
  console.error('Error:', error);
});

// 5. Also check what the form would send
console.log('\n7. Form-like request test in 3 seconds...');
setTimeout(() => {
  const formData = new URLSearchParams();
  formData.append('username', 'test');
  formData.append('password', 'test');
  
  const token = getCookie('csrftoken');
  if (token) {
    formData.append('csrfmiddlewaretoken', token);
  }
  
  fetch('/api/login', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-CSRFToken': token || ''
    },
    body: formData
  })
  .then(r => {
    console.log('   Form-style POST status:', r.status);
    return r.text();
  })
  .then(text => {
    console.log('   Form response preview:', text.substring(0, 200));
  });
}, 3000);

console.log('\n=== Check Network tab for full request/response details ===');