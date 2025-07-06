# Add these URL patterns to your Django backend

# In your main urls.py (OnlineJudge/urls.py or similar):
from django.urls import path, include

urlpatterns = [
    # ... existing patterns ...
    path('api/', include('homework.urls')),  # Add this line
]

# Create a new file: homework/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # Student endpoints
    path('student_homework/', views.StudentHomeworkListView.as_view(), name='student_homework'),
    path('student_homework_detail/', views.StudentHomeworkDetailView.as_view(), name='student_homework_detail'),
    path('homework_progress/', views.HomeworkProgressView.as_view(), name='homework_progress'),
    path('submit_homework_problem/', views.SubmitHomeworkProblemView.as_view(), name='submit_homework_problem'),
    
    # Admin endpoints
    path('admin_homework_list/', views.AdminHomeworkListView.as_view(), name='admin_homework_list'),
    path('admin_create_homework/', views.AdminCreateHomeworkView.as_view(), name='admin_create_homework'),
    path('admin_update_homework/', views.AdminUpdateHomeworkView.as_view(), name='admin_update_homework'),
    path('admin_delete_homework/', views.AdminDeleteHomeworkView.as_view(), name='admin_delete_homework'),
    path('admin_assign_homework/', views.AdminAssignHomeworkView.as_view(), name='admin_assign_homework'),
    path('available_students/', views.AvailableStudentsView.as_view(), name='available_students'),
    
    # Comment endpoints
    path('homework_comments/', views.HomeworkCommentsView.as_view(), name='homework_comments'),
]

# If you need mock views for testing, create homework/views.py:
from django.http import JsonResponse
from django.views import View
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import json

class StudentHomeworkListView(LoginRequiredMixin, View):
    def get(self, request):
        # Mock response for testing
        return JsonResponse({
            "error": None,
            "data": {
                "results": [],
                "total": 0
            }
        })

class HomeworkProgressView(LoginRequiredMixin, View):
    def get(self, request):
        return JsonResponse({
            "error": None,
            "data": {
                "counts": {
                    "assigned": 0,
                    "in_progress": 0,
                    "submitted": 0,
                    "graded": 0
                }
            }
        })

class AdminHomeworkListView(LoginRequiredMixin, View):
    def get(self, request):
        # Check if user is admin
        if not request.user.is_staff:
            return JsonResponse({"error": "Permission denied"}, status=403)
            
        return JsonResponse({
            "error": None,
            "data": {
                "results": [],
                "total": 0
            }
        })

class AvailableStudentsView(LoginRequiredMixin, View):
    def get(self, request):
        if not request.user.is_staff:
            return JsonResponse({"error": "Permission denied"}, status=403)
            
        # Get all non-admin users
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        students = User.objects.filter(is_staff=False).values('id', 'username', 'email')
        
        return JsonResponse({
            "error": None,
            "data": list(students)
        })

@method_decorator(csrf_exempt, name='dispatch')
class AdminCreateHomeworkView(LoginRequiredMixin, View):
    def post(self, request):
        if not request.user.is_staff:
            return JsonResponse({"error": "Permission denied"}, status=403)
            
        data = json.loads(request.body)
        # TODO: Implement homework creation logic
        
        return JsonResponse({
            "error": None,
            "data": {
                "id": 1,
                "message": "Homework created successfully"
            }
        })

# Add similar mock implementations for other views...