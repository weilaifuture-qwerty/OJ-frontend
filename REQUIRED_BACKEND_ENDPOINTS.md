# Required Backend Endpoints for Homework System

## Student Management Endpoints

### 1. Get Available Students
**Endpoint:** `GET /api/available_students`
```python
# Returns all users who can be assigned homework (non-admin users)
Response: {
    "error": null,
    "data": [
        {
            "id": 1,
            "username": "student1",
            "email": "student1@example.com",
            "real_name": "John Doe",
            "school": "Example University"
        },
        ...
    ]
}
```

### 2. Get All Users (Alternative)
**Endpoint:** `GET /api/users`
```python
# Returns paginated list of all users
Query params: ?page=1&limit=100&user_type=regular
Response: {
    "error": null,
    "data": {
        "results": [...],
        "total": 150
    }
}
```

### 3. Get Students by Class/Group
**Endpoint:** `GET /api/students_by_group`
```python
# Returns students grouped by class or grade
Query params: ?group_id=1
Response: {
    "error": null,
    "data": {
        "group_name": "CS101",
        "students": [...]
    }
}
```

## Homework Management Endpoints

### 4. Create Homework Assignment
**Endpoint:** `POST /api/admin_create_homework`
```python
Request: {
    "title": "Week 1 Assignment",
    "description": "Complete these problems",
    "due_date": "2024-12-31T23:59:59Z",
    "problem_ids": [1, 2, 3],
    "student_ids": [1, 2, 3, 4, 5],  # Can be user IDs
    "student_usernames": ["user1", "user2"],  # Alternative: usernames
    "assign_to_all": false,  # Optional: assign to all students
    "auto_grade": true
}
Response: {
    "error": null,
    "data": {
        "id": 1,
        "message": "Homework created successfully"
    }
}
```

### 5. Get Admin Homework List
**Endpoint:** `GET /api/admin_homework_list`
```python
Query params: ?page=1&limit=10
Response: {
    "error": null,
    "data": {
        "results": [
            {
                "id": 1,
                "title": "Week 1 Assignment",
                "description": "...",
                "due_date": "2024-12-31T23:59:59Z",
                "problems": [...],
                "assigned_students": [...],
                "is_active": true,
                "created_at": "2024-01-01T00:00:00Z"
            }
        ],
        "total": 10
    }
}
```

### 6. Bulk Assign Students
**Endpoint:** `POST /api/bulk_assign_students`
```python
Request: {
    "homework_id": 1,
    "action": "add",  # or "remove"
    "student_ids": [1, 2, 3],
    "assign_to_all_new_users": true  # Optional
}
Response: {
    "error": null,
    "data": {
        "assigned_count": 3,
        "message": "Students assigned successfully"
    }
}
```

### 7. Get Student Groups/Classes
**Endpoint:** `GET /api/student_groups`
```python
Response: {
    "error": null,
    "data": [
        {
            "id": 1,
            "name": "CS101 - Introduction to Programming",
            "student_count": 45,
            "created_at": "2024-01-01T00:00:00Z"
        },
        {
            "id": 2,
            "name": "CS102 - Data Structures",
            "student_count": 38,
            "created_at": "2024-01-01T00:00:00Z"
        }
    ]
}
```

### 8. Search Students
**Endpoint:** `GET /api/search_students`
```python
Query params: ?keyword=john&limit=20
Response: {
    "error": null,
    "data": [
        {
            "id": 1,
            "username": "john_doe",
            "email": "john@example.com",
            "real_name": "John Doe"
        }
    ]
}
```

## Student-Side Endpoints

### 9. Get Student Homework List
**Endpoint:** `GET /api/student_homework`
```python
Query params: ?page=1&limit=10&status=pending
Response: {
    "error": null,
    "data": {
        "results": [...],
        "total": 5
    }
}
```

### 10. Get Homework Progress
**Endpoint:** `GET /api/homework_progress`
```python
Response: {
    "error": null,
    "data": {
        "total_assigned": 10,
        "completed": 7,
        "pending": 3,
        "overdue": 1
    }
}
```

## Implementation Tips for Django Backend

### Quick Implementation for Student List

```python
# In your Django views.py
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser

User = get_user_model()

class AvailableStudentsAPIView(APIView):
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        # Get all non-admin users
        students = User.objects.filter(
            is_superuser=False,
            admin_type='Regular User'  # Adjust based on your user model
        ).values('id', 'username', 'email', 'real_name')
        
        return Response({
            'error': None,
            'data': list(students)
        })

# In urls.py
path('api/available_students/', AvailableStudentsAPIView.as_view()),
```

### Alternative: Use Existing User Rank API

If you already have a user rank API, modify the frontend to use it better:

```javascript
// In loadStudents() method
const userRes = await api.getUserRank(0, 1000, 'acm')  // Get more users
const students = userRes.data.data.results
  .filter(user => user.admin_type === 'Regular User')
  .map(user => ({
    id: user.id,
    username: user.username,
    email: user.email || `${user.username}@example.com`,
    real_name: user.real_name || user.username
  }))
```

## Priority Implementation Order

1. **`/api/available_students`** - Most critical for basic functionality
2. **`/api/admin_create_homework`** - Already expected by frontend
3. **`/api/admin_homework_list`** - For viewing created homework
4. **`/api/student_homework`** - For students to see assignments
5. Other endpoints can be added progressively

## Testing the Endpoints

Use the test page at `/public/test-exact-endpoints.html` to verify your endpoints are working correctly.