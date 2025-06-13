// Adapted from src/pages/admin/router.js

// Example for lazy loading: const Dashboard = () => import('@/views/admin/Dashboard.vue');

// Removed unused placeholder constants

const adminRoutes = [
  // {
  //   path: 'login', // Relative to /admin, so /admin/login
  //   name: 'admin-login',
  //   component: () => import('@/views/admin/Login.vue'), // Assumed path
  //   meta: { public: true } // Mark as public, no auth needed
  // },
  // {
  //   path: '', // Base for admin section, effectively /admin/
  //   component: () => import('@/views/admin/Layout.vue'), // Admin layout component
  //   meta: { requiresAuth: true, requiresAdmin: true }, // Protected section
  //   children: [
  //     {
  //       path: '', // Default child for /admin/
  //       name: 'admin-dashboard',
  //       component: () => import('@/views/admin/Dashboard.vue'), // Assumed path
  //       meta: { title: 'Dashboard' }
  //     },
  //     {
  //       path: 'announcement',
  //       name: 'admin-announcement',
  //       component: () => import('@/views/admin/Announcement.vue'), // Assumed path
  //       meta: { title: 'Announcement Management' }
  //     },
  //     {
  //       path: 'user',
  //       name: 'admin-user',
  //       component: () => import('@/views/admin/UserManagement.vue'), // Assumed path
  //       meta: { title: 'User Management' }
  //     },
  //     {
  //       path: 'conf',
  //       name: 'admin-conf',
  //       component: () => import('@/views/admin/Configuration.vue'), // Assumed path
  //       meta: { title: 'System Configuration' }
  //     },
  //     {
  //       path: 'judge-server',
  //       name: 'admin-judge-server',
  //       component: () => import('@/views/admin/JudgeServer.vue'), // Assumed path
  //       meta: { title: 'Judge Server Management' }
  //     },
  //     {
  //       path: 'prune-test-case',
  //       name: 'admin-prune-test-case',
  //       component: () => import('@/views/admin/PruneTestCase.vue'), // Assumed path
  //       meta: { title: 'Prune Test Cases' }
  //     },
  //     {
  //       path: 'problems',
  //       name: 'admin-problem-list',
  //       component: () => import('@/views/admin/ProblemList.vue'), // Assumed path
  //       meta: { title: 'Problem List' }
  //     },
  //     {
  //       path: 'problem/create',
  //       name: 'admin-create-problem',
  //       component: () => import('@/views/admin/ProblemEdit.vue'), // Assumed path, using one for create/edit
  //       meta: { title: 'Create Problem' }
  //     },
  //     {
  //       path: 'problem/edit/:problemId',
  //       name: 'admin-edit-problem',
  //       component: () => import('@/views/admin/ProblemEdit.vue'), // Assumed path
  //       meta: { title: 'Edit Problem' }
  //     },
  //     {
  //       path: 'problem/batch_ops',
  //       name: 'admin-problem_batch_ops',
  //       component: () => import('@/views/admin/ProblemImportExport.vue'), // Assumed path
  //       meta: { title: 'Problem Batch Operations' }
  //     },
  //     {
  //       path: 'contest/create',
  //       name: 'admin-create-contest',
  //       component: () => import('@/views/admin/ContestEdit.vue'), // Assumed path, using one for create/edit
  //       meta: { title: 'Create Contest' }
  //     },
  //     {
  //       path: 'contest',
  //       name: 'admin-contest-list',
  //       component: () => import('@/views/admin/ContestList.vue'), // Assumed path
  //       meta: { title: 'Contest List' }
  //     },
  //     {
  //       path: 'contest/:contestId/edit',
  //       name: 'admin-edit-contest',
  //       component: () => import('@/views/admin/ContestEdit.vue'), // Assumed path
  //       meta: { title: 'Edit Contest' }
  //     },
  //     {
  //       path: 'contest/:contestId/announcement',
  //       name: 'admin-contest-announcement',
  //       component: () => import('@/views/admin/Announcement.vue'), // Re-use if general enough
  //       meta: { title: 'Contest Announcement' }
  //     },
  //     {
  //       path: 'contest/:contestId/problems',
  //       name: 'admin-contest-problem-list',
  //       component: () => import('@/views/admin/ContestProblemList.vue'), // Specific component for contest problems
  //       meta: { title: 'Contest Problem List' }
  //     },
  //     {
  //       path: 'contest/:contestId/problem/create',
  //       name: 'admin-create-contest-problem',
  //       component: () => import('@/views/admin/ProblemEdit.vue'), // Re-use, context passed via route params
  //       meta: { title: 'Create Contest Problem' }
  //     },
  //     {
  //       path: 'contest/:contestId/problem/:problemId/edit',
  //       name: 'admin-edit-contest-problem',
  //       component: () => import('@/views/admin/ProblemEdit.vue'), // Re-use
  //       meta: { title: 'Edit Contest Problem' }
  //     }
  //   ]
  // },
  // {
  //   // Catch all for admin, this should be the last route in adminRoutes
  //   path: ':pathMatch(.*)*', 
  //   name: 'admin-not-found',
  //   component: () => import('@/views/admin/NotFound.vue') // Assumed path for admin 404
  //   // Or redirect to admin dashboard: redirect: { name: 'admin-dashboard' }
  // }
  {
    path: '',
    name: 'admin-dashboard',
    component: () => import('@/views/admin/AdminDashboard.vue'),
    meta: { requiresAuth: true, requiresAdmin: true, title: 'Dashboard' }
  },
  {
    path: 'problems',
    name: 'admin-problem-management',
    component: () => import('@/views/admin/ProblemAdmin.vue'),
    meta: { requiresAuth: true, requiresAdmin: true, title: 'Problem Management' }
  },
  {
    path: 'users',
    name: 'admin-user-management',
    component: () => import('@/views/admin/UserAdmin.vue'),
    meta: { requiresAuth: true, requiresAdmin: true, title: 'User Management' }
  }
];

export default adminRoutes; 