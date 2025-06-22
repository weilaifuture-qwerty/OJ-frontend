# Django CSRF Configuration for Vue Frontend

## Required Django Settings

Add these settings to your Django `settings.py`:

```python
# CORS Settings
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:8080",  # Your Vue dev server
]

# CSRF Settings
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:8080",
]

# Cookie settings
CSRF_COOKIE_NAME = 'csrftoken'
CSRF_COOKIE_HTTPONLY = False  # Important: Must be False for JavaScript to read it
CSRF_COOKIE_SAMESITE = 'Lax'  # or None if you need cross-site requests
CSRF_COOKIE_SECURE = False  # Set to True in production with HTTPS

SESSION_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SECURE = False  # Set to True in production

# Ensure CSRF middleware is enabled
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # Must be before CommonMiddleware
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',  # This must be present
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
```

## Django View Configuration

### For Function-Based Views:

```python
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import JsonResponse

@ensure_csrf_cookie
def get_csrf_token(request):
    """Endpoint to get CSRF token"""
    return JsonResponse({'detail': 'CSRF cookie set'})
```

### For Class-Based Views (DRF):

```python
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie

class LoginView(APIView):
    @method_decorator(ensure_csrf_cookie)
    def get(self, request):
        """GET request to retrieve CSRF token"""
        return Response({'detail': 'CSRF cookie set'})
    
    def post(self, request):
        """POST request for login"""
        # Your login logic here
        pass
```

## URL Configuration

Add an endpoint to get CSRF token:

```python
# urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('api/csrf/', views.get_csrf_token),  # Add this
    path('api/login/', views.LoginView.as_view()),
    # ... other URLs
]
```

## Frontend Implementation

1. **First, get the CSRF token before making POST requests:**

```javascript
// Get CSRF token on app initialization
async function initializeCSRF() {
  try {
    await axios.get('/api/csrf/');
    console.log('CSRF token initialized');
  } catch (error) {
    console.error('Failed to get CSRF token:', error);
  }
}
```

2. **Add to your main app initialization:**

```javascript
// In your main.js or App.vue
import { onMounted } from 'vue'

onMounted(async () => {
  await initializeCSRF();
});
```

## Debugging Steps

1. **Check Django logs for CSRF errors:**
   ```bash
   python manage.py runserver --verbosity 3
   ```

2. **Verify CORS headers in Django:**
   ```python
   # In your Django shell
   from django.conf import settings
   print(settings.CORS_ALLOW_CREDENTIALS)
   print(settings.CORS_ALLOWED_ORIGINS)
   print(settings.CSRF_COOKIE_HTTPONLY)
   ```

3. **Test with curl:**
   ```bash
   # Get CSRF token
   curl -c cookies.txt http://localhost:8000/api/csrf/
   
   # Use token in POST request
   CSRF_TOKEN=$(grep csrftoken cookies.txt | awk '{print $7}')
   curl -b cookies.txt -H "X-CSRFToken: $CSRF_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"username":"test","password":"test"}' \
        http://localhost:8000/api/login/
   ```

## Common Issues and Solutions

### Issue 1: CSRF token not being sent
- **Solution**: Ensure `CSRF_COOKIE_HTTPONLY = False` in Django settings

### Issue 2: CORS blocking requests
- **Solution**: Install and configure `django-cors-headers`:
  ```bash
  pip install django-cors-headers
  ```

### Issue 3: Cookies not being set
- **Solution**: Check if you're accessing the site via `http://localhost:8080` (not `127.0.0.1`)

### Issue 4: CSRF token mismatch
- **Solution**: Ensure the token in the cookie matches the one in the header

## Alternative: Disable CSRF for API endpoints (NOT recommended for production)

If you're using Django REST Framework and want to disable CSRF for API views:

```python
from rest_framework.authentication import SessionAuthentication

class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return  # Do not enforce CSRF

# In your view
class MyAPIView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    # ...
```

**Note**: Only use this for development or if you're using token-based authentication instead.