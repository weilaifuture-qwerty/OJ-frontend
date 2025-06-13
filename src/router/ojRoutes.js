// Adapted from src/pages/oj/router/routes.js

// Placeholder components - these will need to be created/migrated
// Example: const Home = () => import('@/views/oj/Home.vue');

// const About = { template: '<div>About</div>' }; // Placeholder
// const ACMRank = { template: '<div>ACMRank</div>' }; // Placeholder
// const Announcements = { template: '<div>Announcements</div>' }; // Placeholder
// const ApplyResetPassword = { template: '<div>ApplyResetPassword</div>' }; // Placeholder
// const FAQ = { template: '<div>FAQ</div>' }; // Placeholder
// const Home = { template: '<div>Home</div>' }; // Placeholder
// const Logout = { template: '<div>Logout</div>' }; // Placeholder
// const NotFound = { template: '<div>NotFound</div>' }; // Placeholder
// const OIRank = { template: '<div>OIRank</div>' }; // Placeholder
// const ResetPassword = { template: '<div>ResetPassword</div>' }; // Placeholder
// const SubmissionDetails = { template: '<div>SubmissionDetails</div>' }; // Placeholder
// const SubmissionList = { template: '<div>SubmissionList</div>' }; // Placeholder
// const UserHome = { template: '<div>UserHome</div>' }; // Placeholder

// const Contest = { // Placeholder for Contest views
//   ContestDetails: { template: '<div>Contest Details</div>' },
//   ContestList: { template: '<div>Contest List</div>' },
//   ContestProblemList: { template: '<div>Contest Problem List</div>' },
//   ContestRank: { template: '<div>Contest Rank</div>' },
//   ACMContestHelper: { template: '<div>ACM Contest Helper</div>' },
// };

// const Setting = { // Placeholder for Setting views
//   Settings: { template: '<div>Settings</div>' },
//   ProfileSetting: { template: '<div>Profile Setting</div>' },
//   AccountSetting: { template: '<div>Account Setting</div>' },
//   SecuritySetting: { template: '<div>Security Setting</div>' },
// };


const ojRoutes = [
  // {
  //   name: 'home',
  //   path: '/',
  //   meta: { title: 'Home' },
  //   component: () => import('@/views/oj/Home.vue') // Assumed path, adjust if different
  // },
  {
    name: 'apply-reset-password',
    path: '/apply-reset-password',
    meta: { title: 'Apply Reset Password' },
    component: () => import('@/views/user/ApplyResetPassword.vue')
  },
  {
    name: 'reset-password',
    path: '/reset-password/:token',
    meta: { title: 'Reset Password' },
    component: () => import('@/views/user/ResetPassword.vue')
  },
  {
    name: 'problem-list',
    path: '/problem',
    meta: { title: 'Problem List' },
    component: () => import('@/views/problem/ProblemList.vue')
  },
  {
    name: 'problem-details',
    path: '/problem/:problemID',
    meta: { title: 'Problem Details' },
    component: () => import('@/views/problem/ProblemView.vue')
  },
  {
    name: 'submission-list',
    path: '/status',
    meta: { title: 'Submission List' },
    component: () => import('@/views/submission/SubmissionList.vue')
  },
  {
    name: 'submission-details',
    path: '/status/:id/',
    meta: { title: 'Submission Details' },
    component: () => import('@/views/submission/SubmissionDetails.vue')
  },
  // {
  //   name: 'contest-list',
  //   path: '/contest',
  //   meta: { title: 'Contest List' },
  //   component: () => import('@/views/contest/ContestList.vue') // Assumed path
  // },
  // {
  //   name: 'contest-details',
  //   path: '/contest/:contestID/',
  //   component: () => import('@/views/contest/ContestDetails.vue'), // Assumed path
  //   meta: { title: 'Contest Details' },
  //   children: [
  //     {
  //       name: 'contest-submission-list',
  //       path: 'submissions',
  //       component: () => import('@/views/submission/SubmissionList.vue') // Re-use if applicable
  //     },
  //     {
  //       name: 'contest-problem-list',
  //       path: 'problems',
  //       component: () => import('@/views/contest/ContestProblemList.vue') // Assumed path
  //     },
  //     {
  //       name: 'contest-problem-details',
  //       path: 'problem/:problemID/',
  //       component: () => import('@/views/problem/ProblemView.vue'), // Re-use if applicable
  //       meta: { title: 'Contest Problem' }
  //     },
  //     {
  //       name: 'contest-announcement-list',
  //       path: 'announcements',
  //       component: () => import('@/views/contest/ContestAnnouncements.vue') // Assumed path
  //     },
  //     {
  //       name: 'contest-rank',
  //       path: 'rank',
  //       component: () => import('@/views/contest/ContestRank.vue') // Assumed path
  //     },
  //     {
  //       name: 'acm-helper',
  //       path: 'helper',
  //       component: () => import('@/views/contest/ACMContestHelper.vue') // Assumed path
  //     }
  //   ]
  // },
  // {
  //   name: 'acm-rank',
  //   path: '/acm-rank',
  //   meta: { title: 'ACM Rankings' },
  //   component: () => import('@/views/rank/ACMRank.vue') // Assumed path
  // },
  // {
  //   name: 'oi-rank',
  //   path: '/oi-rank',
  //   meta: { title: 'OI Rankings' },
  //   component: () => import('@/views/rank/OIRank.vue') // Assumed path
  // },
  // {
  //   name: 'user-home',
  //   path: '/user-home',
  //   meta: { requiresAuth: true, title: 'User Home' },
  //   component: () => import('@/views/user/UserHome.vue') // Assumed path
  // },
  {
    path: '/setting',
    component: () => import('@/views/setting/SettingsPage.vue'),
    meta: { requiresAuth: true }, 
    children: [
      {
        name: 'default-setting',
        path: '', 
        meta: { title: 'Profile Settings' }, 
        component: () => import('@/views/setting/ProfileSetting.vue') 
      },
      {
        name: 'profile-setting',
        path: 'profile',
        meta: { title: 'Profile Settings' },
        component: () => import('@/views/setting/ProfileSetting.vue') 
      },
      {
        name: 'account-setting',
        path: 'account',
        meta: { title: 'Account Settings' },
        component: () => import('@/views/setting/AccountSetting.vue') 
      },
      {
        name: 'security-setting',
        path: 'security',
        meta: { title: 'Security Settings' },
        component: () => import('@/views/setting/SecuritySetting.vue') 
      },
      {
        name: 'timezone-setting',
        path: 'timezone',
        meta: { title: 'Timezone Settings' },
        component: () => import('@/views/setting/TimezoneSetting.vue') 
      }
    ]
  },
  // {
  //   path: '/about',
  //   name: 'about',
  //   meta: { title: 'About' },
  //   component: () => import('@/views/oj/About.vue') 
  // },
  // {
  //   path: '/faq',
  //   name: 'faq',
  //   meta: { title: 'FAQ' },
  //   component: () => import('@/views/oj/FAQ.vue') 
  // },
  // {
  //   path: '/:pathMatch(.*)*',
  //   name: 'not-found',
  //   meta: { title: '404' },
  //   component: () => import('@/views/oj/NotFound.vue')
  // }
];

export default ojRoutes; 