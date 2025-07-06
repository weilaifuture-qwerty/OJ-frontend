# Homework System Backend Endpoints

This document lists all the backend endpoints required for the homework management system.

## 1. Homework Management Endpoints

### Create Homework
```
POST /api/admin_create_homework
```
Request Body:
```json
{
  "title": "string",
  "description": "string",
  "due_date": "ISO 8601 datetime string",
  "problem_ids": [1, 2, 3],
  "student_ids": [10, 11, 12],
  "student_usernames": ["user1", "user2"] // Optional, for manual student entry
}
```
Response:
```json
{
  "error": null,
  "data": {
    "id": 1,
    "title": "Week 1 Homework",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### Get Admin Homework List
```
GET /api/admin/homework
```
Query Parameters:
- `page`: int (default: 1)
- `limit`: int (default: 10)

Response:
```json
{
  "error": null,
  "data": {
    "results": [
      {
        "id": 1,
        "title": "Week 1 Homework",
        "description": "Complete the assigned problems",
        "due_date": "2024-01-15T23:59:59Z",
        "is_active": true,
        "problems": [
          {"id": 1, "_id": "P001", "title": "Two Sum"}
        ],
        "assigned_students": [
          {"id": 10, "username": "student1", "email": "student1@example.com"}
        ]
      }
    ],
    "total": 50
  }
}
```

### Update Homework
```
PUT /api/admin/homework/{homework_id}
```
Request Body:
```json
{
  "title": "string",
  "description": "string",
  "due_date": "ISO 8601 datetime string",
  "problem_ids": [1, 2, 3]
}
```

### Delete Homework
```
DELETE /api/admin/homework/{homework_id}
```

### Get Student Homework List
```
GET /api/homework/list
```
Response:
```json
{
  "error": null,
  "data": {
    "results": [
      {
        "id": 1,
        "title": "Week 1 Homework",
        "due_date": "2024-01-15T23:59:59Z",
        "problem_count": 5,
        "completed_count": 3,
        "status": "in_progress"
      }
    ]
  }
}
```

### Get Homework Detail (Student View)
```
GET /api/homework/{homework_id}
```
Response:
```json
{
  "error": null,
  "data": {
    "id": 1,
    "title": "Week 1 Homework",
    "description": "Complete all problems",
    "due_date": "2024-01-15T23:59:59Z",
    "problems": [
      {
        "id": 1,
        "_id": "P001",
        "title": "Two Sum",
        "difficulty": "Low",
        "submission_status": "accepted" // or "wrong_answer", "not_attempted"
      }
    ],
    "total_score": 100,
    "achieved_score": 60,
    "comments": "Good work on the first three problems"
  }
}
```

## 2. User Management Endpoints

### Get Available Students
```
GET /api/available_students
```
Query Parameters:
- `search`: string (search by username, email, or real name)
- `group`: string (filter by group/class)
- `include_stats`: boolean (include homework statistics)

Response:
```json
{
  "error": null,
  "data": [
    {
      "id": 10,
      "username": "student1",
      "email": "student1@example.com",
      "real_name": "John Doe",
      "group": "CS101",
      "homework_stats": {
        "total": 5,
        "completed": 3,
        "average_score": 85
      }
    }
  ]
}
```

### Get Users (General Endpoint)
```
GET /api/users
```
Query Parameters:
- `type`: string ("student", "teacher", "admin")
- `search`: string
- `page`: int
- `limit`: int

Response:
```json
{
  "error": null,
  "data": {
    "results": [
      {
        "id": 10,
        "username": "student1",
        "email": "student1@example.com",
        "real_name": "John Doe",
        "admin_type": "Regular User"
      }
    ],
    "total": 100
  }
}
```

### Get Available Groups
```
GET /api/available_groups
```
Response:
```json
{
  "error": null,
  "data": {
    "groups": [
      {"name": "CS101", "count": 25},
      {"name": "CS102", "count": 30},
      {"name": "Math201", "count": 20}
    ],
    "count": 3
  }
}
```

### Get Students by Group
```
GET /api/students/group/{group_name}
```
Response:
```json
{
  "error": null,
  "data": [
    {
      "id": 10,
      "username": "student1",
      "email": "student1@example.com"
    }
  ]
}
```

## 3. Problem Management Endpoints

### Get Problem List
```
GET /api/problem
```
Query Parameters:
- `limit`: int
- `offset`: int
- `keyword`: string (fuzzy search in title, id, or tags - should support partial matches)
- `tag`: string (filter by tag)
- `difficulty`: string ("Low", "Mid", "High")

Response:
```json
{
  "error": null,
  "data": {
    "results": [
      {
        "id": 1,
        "_id": "P001",
        "title": "Two Sum",
        "difficulty": "Low",
        "tags": ["Array", "Hash Table"],
        "submission_number": 1000,
        "accepted_number": 800
      }
    ],
    "total": 200
  }
}
```

## 4. Submission Endpoints

### Submit Homework Solution
```
POST /api/homework/{homework_id}/submit/{problem_id}
```
Request Body:
```json
{
  "language": "C++",
  "code": "string"
}
```

### Get Homework Submission Status
```
GET /api/homework/{homework_id}/submissions
```
Response:
```json
{
  "error": null,
  "data": {
    "submissions": [
      {
        "problem_id": 1,
        "status": "accepted",
        "language": "C++",
        "submitted_at": "2024-01-10T10:00:00Z",
        "score": 100
      }
    ]
  }
}
```

## 5. Additional Endpoints

### Get Language Options
```
GET /api/languages
```
Response:
```json
{
  "error": null,
  "data": {
    "languages": [
      {"name": "C", "content_type": "text/x-csrc"},
      {"name": "C++", "content_type": "text/x-c++src"},
      {"name": "Python3", "content_type": "text/x-python"}
    ]
  }
}
```

### Check Submission Existence
```
GET /api/submission_exists
```
Query Parameters:
- `problem_id`: int

Response:
```json
{
  "error": null,
  "data": true
}
```

## Error Response Format

All endpoints should return errors in this format:
```json
{
  "error": "error-code",
  "data": "Error message description"
}
```

Common error codes:
- `not-found`: Resource not found
- `unauthorized`: User not authenticated
- `forbidden`: User lacks permission
- `validation-error`: Invalid input data
- `server-error`: Internal server error