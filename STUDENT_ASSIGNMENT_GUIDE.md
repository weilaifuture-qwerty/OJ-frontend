# How to Assign Homework to Students

Since the `available_students` API endpoint is not yet implemented in your backend, you can use the manual student input feature:

## Steps to Assign Students:

1. **Create New Homework**
   - Click "Create Homework" button
   - Fill in Title, Description, and Due Date
   - Select problems by clicking "Select OJ Problems"

2. **Add Students Manually**
   - In the "Assign To" section, click "Enter Usernames Manually"
   - A text area will appear with instructions
   - Enter student usernames separated by commas
   - Example: `student1, student2, student3, john_doe, jane_smith`
   - Click "Add Students" button

3. **Alternative: Use Test Data**
   - The system automatically loads 3 test students when the API fails
   - You can select from: test_student1, test_student2, test_student3

4. **Complete Assignment**
   - After adding students, they will appear in the dropdown
   - Enable "Auto Grade" if you want automatic grading
   - Click "Create" to finish

## Backend Implementation Needed:

To enable automatic student loading, implement this endpoint in Django:

```python
# In homework/views.py
class AvailableStudentsAPIView(APIView):
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        students = User.objects.filter(
            admin_type='Regular User'
        ).values('id', 'username', 'email')
        
        return Response({
            'error': None,
            'data': list(students)
        })
```

Add to `homework/urls.py`:
```python
path('available_students/', views.AvailableStudentsAPIView.as_view()),
```

## Current Workaround Features:

1. **Manual Username Entry** - Type usernames directly
2. **Fallback to User Rank API** - Automatically tries to load users from rank list
3. **Test Data** - Provides sample students for testing
4. **Select All/Clear** - Quick selection buttons

The system is designed to work even without the backend endpoint, so you can start assigning homework immediately!