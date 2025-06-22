import { createRouter, createWebHistory } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
// 引入 view 组件
import { Announcement, Conf, Contest, ContestList, Home, JudgeServer, Login,
  Problem, ProblemList, User, PruneTestCase, Dashboard, ProblemImportOrExport,
  AdminStudentManagement, HomeworkList, CreateEditHomework } from './views'

const router = createRouter({
  history: createWebHistory('/admin/'),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/',
      component: Home,
      children: [
        {
          path: '',
          name: 'dashboard',
          component: Dashboard
        },
        {
          path: '/announcement',
          name: 'announcement',
          component: Announcement
        },
        {
          path: '/user',
          name: 'user',
          component: User
        },
        {
          path: '/conf',
          name: 'conf',
          component: Conf
        },
        {
          path: '/judge-server',
          name: 'judge-server',
          component: JudgeServer
        },
        {
          path: '/prune-test-case',
          name: 'prune-test-case',
          component: PruneTestCase
        },
        {
          path: '/problems',
          name: 'problem-list',
          component: ProblemList
        },
        {
          path: '/problem/create',
          name: 'create-problem',
          component: Problem
        },
        {
          path: '/problem/edit/:problemId',
          name: 'edit-problem',
          component: Problem
        },
        {
          path: '/problem/batch_ops',
          name: 'problem_batch_ops',
          component: ProblemImportOrExport
        },
        {
          path: '/contest/create',
          name: 'create-contest',
          component: Contest
        },
        {
          path: '/contest',
          name: 'contest-list',
          component: ContestList
        },
        {
          path: '/contest/:contestId/edit',
          name: 'edit-contest',
          component: Contest
        },
        {
          path: '/contest/:contestId/announcement',
          name: 'contest-announcement',
          component: Announcement
        },
        {
          path: '/contest/:contestId/problems',
          name: 'contest-problem-list',
          component: ProblemList
        },
        {
          path: '/contest/:contestId/problem/create',
          name: 'create-contest-problem',
          component: Problem
        },
        {
          path: '/contest/:contestId/problem/:problemId/edit',
          name: 'edit-contest-problem',
          component: Problem
        },
        // Homework System Routes
        {
          path: '/homework/admin-student',
          name: 'admin-student-management',
          component: AdminStudentManagement
        },
        {
          path: '/homework',
          name: 'admin-homework-list',
          component: HomeworkList
        },
        {
          path: '/homework/create',
          name: 'admin-create-homework',
          component: CreateEditHomework
        },
        {
          path: '/homework/:id/edit',
          name: 'admin-edit-homework',
          component: CreateEditHomework
        },
        {
          path: '/homework/:id/assign',
          name: 'admin-assign-homework',
          component: HomeworkList  // We'll create a separate assign component later
        },
        {
          path: '/homework/:id/progress',
          name: 'admin-homework-progress',
          component: HomeworkList  // We'll create a separate progress component later
        },
        {
          path: '/homework/:id/detail',
          name: 'admin-homework-detail',
          component: HomeworkList  // We'll create a separate detail component later
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*', redirect: '/login'
    }
  ]
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  if (to.name === 'login') {
    // Always allow access to login page
    next()
  } else {
    // Check if user is authenticated
    const adminStore = useAdminStore()
    if (!adminStore.isAuthenticated) {
      try {
        await adminStore.getProfile()
        next()
      } catch (error) {
        // Not authenticated, redirect to login
        next({ name: 'login' })
      }
    } else {
      next()
    }
  }
})

export default router
