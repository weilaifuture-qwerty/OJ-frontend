import ProblemList from './problem/ProblemList.vue'
import Problem from './problem/Problem.vue'
import Logout from './user/LogoutSimple.vue'
import UserHome from './user/UserHomeSimple.vue'
import About from './help/AboutSimple.vue'
import FAQ from './help/FAQSimple.vue'
import NotFound from './general/404Simple.vue'
import Home from './general/Home.vue'
import Announcements from './general/Announcements.vue'

// Grouping Components in the Same Chunk
const SubmissionList = () => import(/* webpackChunkName: "submission" */ '@oj/views/submission/SubmissionListSimple.vue')
const SubmissionDetails = () => import(/* webpackChunkName: "submission" */ '@oj/views/submission/SubmissionDetails.vue')

const ACMRank = () => import(/* webpackChunkName: "userRank" */ '@oj/views/rank/ACMRankSimple.vue')
const OIRank = () => import(/* webpackChunkName: "userRank" */ '@oj/views/rank/OIRankSimple.vue')

const ApplyResetPassword = () => import(/* webpackChunkName: "password" */ '@oj/views/user/ApplyResetPassword.vue')
const ResetPassword = () => import(/* webpackChunkName: "password" */ '@oj/views/user/ResetPassword.vue')

// Homework System Components
const StudentHomeworkList = () => import(/* webpackChunkName: "homework" */ '@oj/views/homework/StudentHomeworkList.vue')
const StudentHomeworkDetail = () => import(/* webpackChunkName: "homework" */ '@oj/views/homework/StudentHomeworkDetail.vue')

export {
  Home, NotFound, Announcements,
  Logout, UserHome, About, FAQ,
  ProblemList, Problem,
  ACMRank, OIRank,
  SubmissionList, SubmissionDetails,
  ApplyResetPassword, ResetPassword,
  StudentHomeworkList, StudentHomeworkDetail
}
/* 组件导出分为两类, 一类常用的直接导出，另一类诸如Login, Logout等用懒加载,懒加载不在此处导出
 *   在对应的route内加载
 *   见https://router.vuejs.org/en/advanced/lazy-loading.html
 */
