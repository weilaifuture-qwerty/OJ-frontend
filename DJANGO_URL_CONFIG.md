# Django URL Configuration for Homework System

## 1. Check your main urls.py file

In your Django project's main `urls.py` file (probably `OnlineJudge/urls.py`), make sure you have:

```python
from django.urls import path, include

urlpatterns = [
    # ... other patterns ...
    path('api/', include('homework.urls')),  # Make sure this is included
    # ... other patterns ...
]
```

## 2. Create homework/urls.py if it doesn't exist

Create a file `homework/urls.py` with:

```python
from django.urls import path
from . import views

urlpatterns = [
    # Student URLs
    path('student_homework/', views.StudentHomeworkListAPIView.as_view(), name='student_homework'),
    path('student_homework_detail/', views.StudentHomeworkDetailAPIView.as_view(), name='student_homework_detail'),
    path('homework_progress/', views.HomeworkProgressAPIView.as_view(), name='homework_progress'),
    path('submit_homework_problem/', views.SubmitHomeworkProblemAPIView.as_view(), name='submit_homework_problem'),
    
    # Admin URLs
    path('admin_homework_list/', views.AdminHomeworkListAPIView.as_view(), name='admin_homework_list'),
    path('admin_create_homework/', views.AdminCreateHomeworkAPIView.as_view(), name='admin_create_homework'),
    path('admin_delete_homework/', views.AdminDeleteHomeworkAPIView.as_view(), name='admin_delete_homework'),
    path('admin_homework_detail/', views.AdminHomeworkDetailAPIView.as_view(), name='admin_homework_detail'),
    path('available_students/', views.AvailableStudentsAPIView.as_view(), name='available_students'),
    path('grade_homework/', views.GradeHomeworkAPIView.as_view(), name='grade_homework'),
    path('homework_statistics/', views.HomeworkStatisticsAPIView.as_view(), name='homework_statistics'),
    
    # Comment URLs
    path('homework_comments/', views.HomeworkCommentAPIView.as_view(), name='homework_comments'),
]
```

## 3. Alternative: Add to existing API urls

If you have an existing API app, you can add the homework URLs there:

In `api/urls.py` or similar:

```python
# Import homework views
from homework.views import (
    StudentHomeworkListAPIView,
    StudentHomeworkDetailAPIView,
    HomeworkProgressAPIView,
    # ... other views
)

urlpatterns = [
    # ... existing patterns ...
    
    # Homework URLs
    path('student_homework/', StudentHomeworkListAPIView.as_view()),
    path('available_students/', AvailableStudentsAPIView.as_view()),
    path('admin_homework_list/', AdminHomeworkListAPIView.as_view()),
    # ... add all homework URLs here
]
```

## 4. Debug URL routing

To see all registered URLs in Django:

```bash
python manage.py show_urls
```

Or in Django shell:

```python
from django.urls import get_resolver
resolver = get_resolver()
for pattern in resolver.url_patterns:
    print(pattern)
```

## 5. Check if homework app is installed

In `settings.py`, make sure:

```python
INSTALLED_APPS = [
    # ... other apps ...
    'homework',  # Make sure this is included
    # ... other apps ...
]
```

## Common issues:

1. **App not installed**: Add 'homework' to INSTALLED_APPS
2. **URLs not included**: Include homework.urls in main urls.py
3. **Wrong URL path**: Make sure the path matches what frontend expects
4. **Missing trailing slash**: Django might redirect URLs without trailing slashes