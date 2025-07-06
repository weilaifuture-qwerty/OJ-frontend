// Test script to demonstrate available user-related APIs
// This can be run in the browser console when logged in as admin

// Note: These APIs require authentication and proper permissions

console.log('=== User API Test Guide ===\n');

console.log('1. Get User List (with pagination):');
console.log(`
// Import the API module (if in component)
import api from '@admin/api'

// Get users with pagination
// Parameters: offset, limit, keyword (optional)
api.getUserList(0, 10, '').then(res => {
  console.log('Total users:', res.data.data.total);
  console.log('Users:', res.data.data.results);
  
  // Example user object structure:
  // {
  //   id: 1,
  //   username: "student1",
  //   email: "student1@example.com",
  //   real_name: "John Doe",
  //   admin_type: "Regular User",
  //   create_time: "2024-01-01T00:00:00Z",
  //   last_login: "2024-01-15T10:30:00Z",
  //   two_factor_auth: false,
  //   is_disabled: false,
  //   problem_permission: "None"
  // }
});
`);

console.log('\n2. Get Managed Students (for admin homework system):');
console.log(`
// Get students assigned to current admin
api.getManagedStudents().then(res => {
  console.log('Managed students:', res.data.data);
  // Returns array of student objects
});
`);

console.log('\n3. Get Available Students (for homework assignment):');
console.log(`
// From OJ API - Get students available for homework assignment
import ojApi from '@oj/api'

ojApi.getAvailableStudents().then(res => {
  console.log('Available students:', res.data.data);
  // Returns array of student objects that can be assigned homework
});
`);

console.log('\n4. Get Single User by ID:');
console.log(`
// Get specific user details
api.getUser(userId).then(res => {
  console.log('User details:', res.data.data);
});
`);

console.log('\n5. Filter Users by Type:');
console.log(`
// Get all users then filter by admin_type
api.getUserList(0, 1000, '').then(res => {
  const allUsers = res.data.data.results;
  
  // Filter only students (Regular Users)
  const students = allUsers.filter(user => 
    user.admin_type === 'Regular User' || !user.admin_type
  );
  
  // Filter only admins
  const admins = allUsers.filter(user => 
    user.admin_type === 'Admin'
  );
  
  // Filter only super admins
  const superAdmins = allUsers.filter(user => 
    user.admin_type === 'Super Admin'
  );
  
  console.log('Students:', students.length);
  console.log('Admins:', admins.length);
  console.log('Super Admins:', superAdmins.length);
});
`);

console.log('\n6. Search Users by Keyword:');
console.log(`
// Search users by username, email, or real name
api.getUserList(0, 20, 'john').then(res => {
  console.log('Search results:', res.data.data.results);
  // Returns users matching the keyword
});
`);

console.log('\n7. Get Admin-Student Relations:');
console.log(`
// For super admins - see which students are assigned to which admins
api.getAdminStudentRelations({}).then(res => {
  console.log('Relations:', res.data.data);
  // Returns array of {id, admin, student} objects
});

// Get relations for specific admin
api.getAdminStudentRelations({ admin_id: adminId }).then(res => {
  console.log('Students assigned to admin:', res.data.data);
});
`);

console.log('\n=== Important Notes ===');
console.log('- All APIs require proper authentication (login)');
console.log('- User permissions affect what data is returned');
console.log('- Regular users can only see their own profile');
console.log('- Admins can see students assigned to them');
console.log('- Super admins can see all users');
console.log('- The getUserList API supports pagination for large datasets');
console.log('- Always handle errors appropriately in production code');

console.log('\n=== User Types ===');
console.log('- "Regular User": Students who can solve problems and submit homework');
console.log('- "Admin": Teachers who can create problems and assign homework');
console.log('- "Super Admin": System administrators with full access');