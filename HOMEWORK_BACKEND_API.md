# Homework System Backend API Documentation

## Overview

The homework system allows teachers/admins to assign OJ problems as homework to students. Students solve these problems directly in the OJ, and grading is automatic based on the OJ judge results.

## Database Schema

### Homework Table
```sql
CREATE TABLE homework (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_by_id INTEGER NOT NULL,  -- References user table (admin/teacher who created)
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    due_date DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    auto_grade BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (created_by_id) REFERENCES user(id)
);
```

### Homework Problems Table
```sql
CREATE TABLE homework_problems (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    homework_id INTEGER NOT NULL,
    problem_id INTEGER NOT NULL,
    order_index INTEGER DEFAULT 0,
    points INTEGER DEFAULT 100,  -- Points for this problem
    FOREIGN KEY (homework_id) REFERENCES homework(id) ON DELETE CASCADE,
    FOREIGN KEY (problem_id) REFERENCES problem(id),
    UNIQUE KEY unique_homework_problem (homework_id, problem_id)
);
```

### Homework Assignments Table
```sql
CREATE TABLE homework_assignments (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    homework_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    assigned_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('assigned', 'in_progress', 'submitted', 'graded') DEFAULT 'assigned',
    grade DECIMAL(5,2) DEFAULT NULL,
    graded_date DATETIME DEFAULT NULL,
    FOREIGN KEY (homework_id) REFERENCES homework(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES user(id),
    UNIQUE KEY unique_assignment (homework_id, student_id)
);
```

### Homework Submissions Table
```sql
CREATE TABLE homework_submissions (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    assignment_id INTEGER NOT NULL,
    problem_id INTEGER NOT NULL,
    submission_id INTEGER NOT NULL,  -- References OJ submission
    is_accepted BOOLEAN DEFAULT FALSE,
    submitted_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES homework_assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (problem_id) REFERENCES problem(id),
    FOREIGN KEY (submission_id) REFERENCES submission(id),
    UNIQUE KEY unique_problem_submission (assignment_id, problem_id, submission_id)
);
```

### Homework Comments Table
```sql
CREATE TABLE homework_comments (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    homework_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    comment TEXT NOT NULL,
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (homework_id) REFERENCES homework(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user(id)
);
```

## API Endpoints

### Student Endpoints

#### 1. Get Student Homework List
```
GET /api/student_homework
```

Query Parameters:
- `page` (int): Page number (default: 1)
- `limit` (int): Items per page (default: 10)
- `status` (string): Filter by status (all, assigned, in_progress, submitted, graded)

Response:
```json
{
  "error": null,
  "data": {
    "results": [
      {
        "id": 1,
        "title": "Week 1: Introduction to Algorithms",
        "description": "Basic algorithm concepts",
        "due_date": "2024-06-30T23:59:59Z",
        "assigned_by": "Teacher Name",
        "status": "in_progress",
        "problem_count": 5,
        "problems_solved": 2,
        "progress": 40,
        "grade": null,
        "problems": [
          {
            "id": 101,
            "_id": "1001",
            "title": "Two Sum",
            "status": "solved"
          }
        ]
      }
    ],
    "total": 10
  }
}
```

#### 2. Get Homework Progress Summary
```
GET /api/homework_progress
```

Response:
```json
{
  "error": null,
  "data": {
    "counts": {
      "assigned": 2,
      "in_progress": 1,
      "submitted": 0,
      "graded": 3
    }
  }
}
```

#### 3. Get Student Homework Detail
```
GET /api/student_homework_detail?id=1
```

Response:
```json
{
  "error": null,
  "data": {
    "id": 1,
    "title": "Week 1: Introduction to Algorithms",
    "description": "Learn basic algorithms",
    "due_date": "2024-06-30T23:59:59Z",
    "assigned_date": "2024-06-20T10:00:00Z",
    "status": "in_progress",
    "grade": null,
    "problems": [
      {
        "id": 101,
        "_id": "1001",
        "title": "Two Sum",
        "difficulty": "Low",
        "status": "solved",
        "submission_count": 3,
        "accepted": true
      },
      {
        "id": 102,
        "_id": "1002",
        "title": "Add Two Numbers",
        "difficulty": "Mid",
        "status": "attempted",
        "submission_count": 2,
        "accepted": false
      }
    ],
    "progress": {
      "total_problems": 5,
      "solved_problems": 2,
      "attempted_problems": 1,
      "percentage": 40
    }
  }
}
```

#### 4. Submit Homework Problem
```
POST /api/submit_homework_problem
```

This endpoint is automatically triggered when a student submits a solution to a problem that is part of their homework.

Request Body:
```json
{
  "homework_id": 1,
  "problem_id": 101,
  "submission_id": 12345  // OJ submission ID
}
```

### Admin/Teacher Endpoints

#### 1. Get Admin Homework List
```
GET /api/admin_homework_list
```

Query Parameters:
- `page` (int): Page number
- `limit` (int): Items per page

Response:
```json
{
  "error": null,
  "data": {
    "results": [
      {
        "id": 1,
        "title": "Week 1: Introduction to Algorithms",
        "description": "Basic algorithms",
        "due_date": "2024-06-30T23:59:59Z",
        "created_date": "2024-06-20T10:00:00Z",
        "is_active": true,
        "problems": [
          {
            "id": 101,
            "_id": "1001",
            "title": "Two Sum"
          }
        ],
        "assigned_students": [
          {
            "id": 10,
            "username": "student1",
            "email": "student1@example.com"
          }
        ],
        "statistics": {
          "total_students": 30,
          "submitted": 20,
          "graded": 15,
          "average_grade": 85.5
        }
      }
    ],
    "total": 5
  }
}
```

#### 2. Create Homework
```
POST /api/admin_create_homework
```

Request Body:
```json
{
  "title": "Week 1: Introduction to Algorithms",
  "description": "Learn basic algorithm concepts",
  "due_date": "2024-06-30T23:59:59Z",
  "problem_ids": [101, 102, 103],
  "student_ids": [10, 11, 12],  // Or empty array for all students
  "auto_grade": true
}
```

#### 3. Get Available Students
```
GET /api/available_students
```

Response:
```json
{
  "error": null,
  "data": [
    {
      "id": 10,
      "username": "student1",
      "email": "student1@example.com",
      "real_name": "John Doe"
    }
  ]
}
```

#### 4. Update Homework
```
PUT /api/admin_update_homework
```

Request Body:
```json
{
  "id": 1,
  "title": "Updated Title",
  "description": "Updated description",
  "due_date": "2024-07-05T23:59:59Z",
  "is_active": true
}
```

#### 5. Delete Homework
```
DELETE /api/admin_delete_homework?id=1
```

#### 6. Get Homework Statistics
```
GET /api/admin_homework_stats?id=1
```

Response:
```json
{
  "error": null,
  "data": {
    "homework_id": 1,
    "total_students": 30,
    "status_breakdown": {
      "assigned": 5,
      "in_progress": 10,
      "submitted": 10,
      "graded": 5
    },
    "problem_stats": [
      {
        "problem_id": 101,
        "title": "Two Sum",
        "attempted": 25,
        "solved": 20,
        "success_rate": 0.8
      }
    ],
    "grade_distribution": {
      "A": 5,
      "B": 8,
      "C": 2,
      "D": 0,
      "F": 0
    }
  }
}
```

### Homework Comments Endpoints

#### 1. Get Comments
```
GET /api/homework_comments?homework_id=1
```

#### 2. Create Comment
```
POST /api/homework_comments
```

Request Body:
```json
{
  "homework_id": 1,
  "comment": "I'm having trouble with problem 2"
}
```

#### 3. Delete Comment
```
DELETE /api/homework_comments?id=1
```

## Automatic Grading Logic

When auto_grade is enabled, the system should:

1. Monitor submissions to problems that are part of homework assignments
2. When a student gets an AC (Accepted) submission:
   - Mark the problem as solved in `homework_submissions`
   - Update the assignment progress
   - If all problems are solved, mark the assignment as "submitted"
   - Calculate the grade based on solved problems

### Grade Calculation Formula
```python
def calculate_grade(assignment):
    total_problems = assignment.homework.problems.count()
    solved_problems = assignment.submissions.filter(is_accepted=True).count()
    
    if total_problems == 0:
        return 0
    
    base_grade = (solved_problems / total_problems) * 100
    
    # Apply late penalty if needed
    if assignment.homework.due_date < now():
        days_late = (now() - assignment.homework.due_date).days
        penalty = min(days_late * 5, 50)  # 5% per day, max 50%
        base_grade = max(base_grade - penalty, 0)
    
    return round(base_grade, 2)
```

## Integration with OJ System

### Submission Hook
Add a hook in the OJ submission handler:

```python
def on_submission_judged(submission):
    if submission.result == JudgeStatus.ACCEPTED:
        # Check if this problem is part of any active homework
        homework_problems = HomeworkProblem.objects.filter(
            problem_id=submission.problem_id,
            homework__is_active=True,
            homework__assignments__student_id=submission.user_id
        )
        
        for hw_problem in homework_problems:
            assignment = hw_problem.homework.assignments.get(student_id=submission.user_id)
            
            # Record the submission
            HomeworkSubmission.objects.update_or_create(
                assignment=assignment,
                problem=hw_problem.problem,
                defaults={
                    'submission_id': submission.id,
                    'is_accepted': True,
                    'submitted_date': now()
                }
            )
            
            # Update assignment status
            if assignment.status == 'assigned':
                assignment.status = 'in_progress'
            
            # Check if all problems are solved
            if assignment.is_completed():
                assignment.status = 'submitted'
                if assignment.homework.auto_grade:
                    assignment.grade = calculate_grade(assignment)
                    assignment.status = 'graded'
                    assignment.graded_date = now()
            
            assignment.save()
```

## Security Considerations

1. **Authorization**: 
   - Students can only view their own assignments
   - Only admins/teachers can create/edit homework
   - Students cannot modify grades or submission status

2. **Validation**:
   - Ensure due dates are in the future when creating homework
   - Validate that problems exist before adding to homework
   - Prevent duplicate assignments to the same student

3. **Rate Limiting**:
   - Limit API calls to prevent abuse
   - Cache homework lists and problem data

## Implementation Priority

1. **Phase 1** (Core Features):
   - Create homework with OJ problems
   - Assign to students
   - View homework list for students
   - Track problem completion

2. **Phase 2** (Auto-grading):
   - Integration with OJ submission system
   - Automatic progress tracking
   - Grade calculation

3. **Phase 3** (Advanced Features):
   - Homework templates
   - Bulk operations
   - Analytics and reporting
   - Export grades