# OnlineJudgeFE Feature Comparison

This document compares the features present in your current `/src/views` structure with those in the original [OnlineJudgeFE repo](https://github.com/QingdaoU/OnlineJudgeFE).

---

## Current `/src/views` Structure

### 1. Problem
- `ProblemList.vue` — Problem list page
- `ProblemView.vue` — Problem details/submit page

### 2. Submission
- `SubmissionList.vue` — Submission list/status page
- `SubmissionDetails.vue` — Submission details page

### 3. User
- `UserLogin.vue` — Login
- `UserRegister.vue` — Register
- `ApplyResetPassword.vue` — Request password reset
- `ResetPassword.vue` — Reset password

### 4. Setting
- `AccountSetting.vue` — Account info
- `ProfileSetting.vue` — Profile info
- `SecuritySetting.vue` — Security/password

---

## Features in the Original Repo (Not Yet in Your Views)

### A. Contest System
- Contest List (view all contests)
- Contest Details (info, problems, announcements)
- Contest Problem List (problems for a contest)
- Contest Problem View (view/submit contest problem)
- Contest Submissions (submissions for a contest)
- Contest Rank (real-time contest ranking)
- Contest Announcements (clarifications, messages)
- Contest Registration/Password (join private contests)

### B. User Home/Profile
- User Home (dashboard, solved/attempted problems, stats)
- User Rank (global user ranking)
- User Submissions (personal submission history)

### C. Admin/Management
- Problem Management (add/edit/delete problems)
- Contest Management (add/edit/delete contests)
- User Management (ban, promote, etc.)
- Announcement Management
- System Settings

### D. Other Features
- Discussion/Q&A (problem/contest discussion boards)
- Statistics/Charts (ECharts for stats, user progress, etc.)
- Theme/Appearance Settings
- Multi-language (i18n) Switcher
- Markdown/Simditor Editor for Problems

---

## Summary Table

| Feature Area         | Your Views Present | Original Repo Has | Notes/To-Do                        |
|----------------------|:-----------------:|:----------------:|-------------------------------------|
| Problem List/View    | ✔️                | ✔️               | Good                                |
| Submission List/View | ✔️                | ✔️               | Good                                |
| User Auth/Settings   | ✔️                | ✔️               | Good                                |
| Contest System       | ❌                | ✔️               | **Missing: contest list, details, rank, etc.** |
| User Home/Rank       | ❌                | ✔️               | **Missing: user dashboard, rank**   |
| Admin/Management     | ❌                | ✔️               | **Missing: admin panels**           |
| Discussion/Q&A       | ❌                | ✔️               | **Missing: discussion boards**      |
| Statistics/Charts    | ❌                | ✔️               | **Missing: ECharts stats**          |
| Theme/i18n Switcher  | (i18n partial)    | ✔️               | Theme switcher may be missing       |

---

## Next Steps

- If you want to match the original repo, the **Contest System** is the most important missing feature.
- User home/rank and admin/management features are also common in full-featured OJs.
- Let me know which feature you want to implement next, and I can guide you step by step!

**Reference:**  
[QingdaoU/OnlineJudgeFE GitHub Repo](https://github.com/QingdaoU/OnlineJudgeFE) 