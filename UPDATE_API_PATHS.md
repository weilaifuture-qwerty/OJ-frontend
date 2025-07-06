# How to Update API Paths if Needed

If your Django backend uses different URL paths, you can update the frontend API calls:

## Option 1: Update Individual API Calls

In `src/pages/oj/api.js`, update the homework endpoints:

```javascript
// Change from:
getAdminHomeworkList (params) {
  return ajax('admin_homework_list', 'get', { params })
},

// To (if your URLs are under /api/homework/):
getAdminHomeworkList (params) {
  return ajax('homework/admin_homework_list', 'get', { params })
},
```

## Option 2: Create a Homework API Module

Create `src/pages/oj/api/homework.js`:

```javascript
import { ajax } from '../api'

// Add a prefix for all homework APIs
const HOMEWORK_PREFIX = 'homework/'

export default {
  // Student APIs
  getStudentHomework(params) {
    return ajax(HOMEWORK_PREFIX + 'student_homework', 'get', { params })
  },
  getHomeworkProgress() {
    return ajax(HOMEWORK_PREFIX + 'homework_progress', 'get')
  },
  // ... other APIs
}
```

## Option 3: Use Environment Variables

Add to `.env`:
```
VITE_HOMEWORK_API_PREFIX=homework/
```

Then in your API:
```javascript
const HOMEWORK_PREFIX = import.meta.env.VITE_HOMEWORK_API_PREFIX || ''

getAdminHomeworkList (params) {
  return ajax(HOMEWORK_PREFIX + 'admin_homework_list', 'get', { params })
},
```

## To Find Your Actual API Paths:

1. Check Django admin at `http://localhost:8000/admin/`
2. Look at Django URLs with: `python manage.py show_urls | grep homework`
3. Check the `homework/urls.py` file in your Django project
4. Use the API checker at `http://localhost:8080/check-homework-api.html`