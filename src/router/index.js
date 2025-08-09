import { createRouter, createWebHistory } from 'vue-router'
import { LoadingBar } from 'view-ui-plus'
import util from '@/utils/util'

// OJ Views
import Home from '@/pages/oj/views/general/Home.vue'
import Logout from '@/pages/oj/views/user/Logout.vue'
import ApplyResetPassword from '@/pages/oj/views/user/ApplyResetPassword.vue'
import ResetPassword from '@/pages/oj/views/user/ResetPassword.vue'
import ProblemList from '@/pages/oj/views/problem/ProblemList.vue'
import Problem from '@/pages/oj/views/problem/Problem.vue'
import SubmissionList from '@/pages/oj/views/submission/SubmissionList.vue'
import SubmissionDetails from '@/pages/oj/views/submission/SubmissionDetails.vue'
import ContestList from '@/pages/oj/views/contest/ContestList.vue'
import ContestDetails from '@/pages/oj/views/contest/ContestDetail.vue' // Assuming ContestDetail.vue is the correct file
import ContestProblemList from '@/pages/oj/views/contest/ContestProblemList.vue'
import Announcements from '@/pages/oj/views/general/Announcements.vue'
import ContestRank from '@/pages/oj/views/contest/ContestRank.vue'
import ACMContestHelper from '@/pages/oj/views/contest/ACMContestHelper.vue' // May need to create this
import ACMRank from '@/pages/oj/views/rank/ACMRank.vue' // May need to create this
import OIRank from '@/pages/oj/views/rank/OIRank.vue' // May need to create this
import UserHome from '@/pages/oj/views/user/UserHome.vue'
import Settings from '@/pages/oj/views/setting/Settings.vue' // May need to create this
import ProfileSetting from '@/pages/oj/views/setting/ProfileSetting.vue' // May need to create this
import AccountSetting from '@/pages/oj/views/setting/AccountSetting.vue' // May need to create this
import SecuritySetting from '@/pages/oj/views/setting/SecuritySetting.vue' // May need to create this
import About from '@/pages/oj/views/help/About.vue' // May need to create this
import FAQ from '@/pages/oj/views/help/FAQ.vue' // May need to create this
import NotFound from '@/pages/oj/views/general/404.vue'

const routes = [
  {
    name: 'home',
    path: '/',
    meta: {title: 'Home'},
    component: Home
  },
  {
    name: 'logout',
    path: '/logout',
    meta: {title: 'Logout'},
    component: Logout
  },
  {
    name: 'apply-reset-password',
    path: '/apply-reset-password',
    meta: {title: 'Apply Reset Password'},
    component: ApplyResetPassword
  },
  {
    name: 'reset-password',
    path: '/reset-password/:token',
    meta: {title: 'Reset Password'},
    component: ResetPassword
  },
  {
    name: 'problem-list',
    path: '/problem',
    meta: {title: 'Problem List'},
    component: ProblemList
  },
  {
    name: 'problem-details',
    path: '/problem/:problemID',
    meta: {title: 'Problem Details'},
    component: Problem
  },
  {
    name: 'submission-list',
    path: '/status',
    meta: {title: 'Submission List'},
    component: SubmissionList
  },
  {
    name: 'submission-details',
    path: '/status/:id/',
    meta: {title: 'Submission Details'},
    component: SubmissionDetails
  },
  {
    name: 'contest-list',
    path: '/contest',
    meta: {title: 'Contest List'},
    component: ContestList
  },
  {
    name: 'contest-details',
    path: '/contest/:contestID/',
    component: ContestDetails,
    meta: {title: 'Contest Details'},
    children: [
      {
        name: 'contest-submission-list',
        path: 'submissions',
        component: SubmissionList
      },
      {
        name: 'contest-problem-list',
        path: 'problems',
        component: ContestProblemList
      },
      {
        name: 'contest-problem-details',
        path: 'problem/:problemID/',
        component: Problem
      },
      {
        name: 'contest-announcement-list',
        path: 'announcements',
        component: Announcements
      },
      {
        name: 'contest-rank',
        path: 'rank',
        component: ContestRank
      },
      {
        name: 'acm-helper',
        path: 'helper',
        component: ACMContestHelper
      }
    ]
  },
  {
    name: 'acm-rank',
    path: '/acm-rank',
    meta: {title: 'ACM Rankings'},
    component: ACMRank
  },
  {
    name: 'oi-rank',
    path: '/oi-rank',
    meta: {title: 'OI Rankings'},
    component: OIRank
  },
  {
    name: 'user-home',
    path: '/user-home',
    component: UserHome,
    meta: {requiresAuth: true, title: 'User Home'}
  },
  {
    path: '/setting',
    component: Settings,
    children: [
      {
        name: 'default-setting',
        path: '',
        meta: {requiresAuth: true, title: 'Default Settings'},
        component: ProfileSetting
      },
      {
        name: 'profile-setting',
        path: 'profile',
        meta: {requiresAuth: true, title: 'Profile Settings'},
        component: ProfileSetting
      },
      {
        name: 'account-setting',
        path: 'account',
        meta: {requiresAuth: true, title: 'Account Settings'},
        component: AccountSetting
      },
      {
        name: 'security-setting',
        path: 'security',
        meta: {requiresAuth: true, title: 'Security Settings'},
        component: SecuritySetting
      }
    ]
  },
  {
    path: '/about',
    name: 'about',
    meta: {title: 'About'},
    component: About
  },
  {
    path: '/faq',
    name: 'faq',
    meta: {title: 'FAQ'},
    component: FAQ
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    meta: {title: '404'},
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  LoadingBar.start()
  util.title(to.meta.title) // Assuming util.title handles undefined meta.title
  // Add authentication check similar to original if needed
  // if (to.matched.some(record => record.meta.requiresAuth)) {
  //   // Check if authenticated (e.g., from Pinia store or localStorage)
  //   const isAuthenticated = false // Replace with actual auth check
  //   if (!isAuthenticated) {
  //     next({ name: 'login' }) // Or 'home', depending on desired behavior
  //   } else {
  //     next()
  //   }
  // } else {
  //   next()
  // }
  next() // Simplified for now
})

router.afterEach(() => {
  LoadingBar.finish()
  window.scrollTo(0, 0)
})

export default router 