// Storage Keys
export const STORAGE_KEY = {
  AUTHED: 'oj_authed', // Prefixed to avoid conflicts if app is part of a larger domain
  USER_PROFILE: 'oj_user_profile',
  AUTH_TOKEN: 'oj_auth_token', // If using token-based auth
  PREFERRED_LANGUAGE: 'oj_preferred_language',
};

// User Roles/Types
export const USER_TYPE = {
  REGULAR_USER: 'Regular User',
  ADMIN: 'Admin',
  SUPER_ADMIN: 'Super Admin',
};

// Problem Difficulty Levels (example, adjust as per your system)
export const PROBLEM_DIFFICULTY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

// Problem Permissions (example)
export const PROBLEM_PERMISSION = {
  NONE: 'None',        // Cannot submit to any problem
  OWN: 'Own',          // Can submit to own problems (if such concept exists)
  ALL: 'All',          // Can submit to all problems
};

// Contest Status
export const CONTEST_STATUS = {
  NOT_START: 0,
  UNDERWAY: 1,
  ENDED: -1,
  SCHEDULED: 2, // Example: if you have a state before NOT_START
};

// Contest Types
export const CONTEST_TYPE = {
  PUBLIC: 'Public',
  PRIVATE_PASSWORD: 'Password Protected',
  PRIVATE_INVITE: 'Invite Only', // Example if you have invite-based private contests
};

// Submission Status (common examples, align with your backend)
export const SUBMISSION_STATUS = {
  PENDING: 'Pending',
  JUDGING: 'Judging',
  ACCEPTED: 'Accepted',
  WRONG_ANSWER: 'Wrong Answer',
  TIME_LIMIT_EXCEEDED: 'Time Limit Exceeded',
  MEMORY_LIMIT_EXCEEDED: 'Memory Limit Exceeded',
  RUNTIME_ERROR: 'Runtime Error',
  COMPILE_ERROR: 'Compile Error',
  SYSTEM_ERROR: 'System Error',
  PARTIALLY_ACCEPTED: 'Partially Accepted',
};

// Judge Status
export const JUDGE_STATUS = {
  PENDING: 0,
  JUDGING: 1,
  ACCEPTED: 2,
  WRONG_ANSWER: 3,
  TIME_LIMIT_EXCEEDED: 4,
  MEMORY_LIMIT_EXCEEDED: 5,
  RUNTIME_ERROR: 6,
  COMPILE_ERROR: 7,
  SYSTEM_ERROR: 8,
  PARTIALLY_ACCEPTED: 9,
};

// My Status
export const MY_STATUS = {
  NOT_SUBMITTED: -1,
  NO_AC_SUBMISSION: 0,
  ACCEPTED: 1,
};

// Add other constants as needed... 