import { createRouter, createWebHistory } from 'vue-router';

// Import route configurations
import ojRoutes from './ojRoutes';
import adminRoutes from './adminRoutes';

// Import Pinia stores
import { useUserStore } from '../stores/userStore'; // Adjusted path
import { useAppStore } from '../stores/appStore';   // Adjusted path

// Placeholder for View UI Plus Global Loading Bar - Replace with actual import or access method
// e.g., import { LoadingBar } from 'view-ui-plus'; or access via app instance if registered globally
const ViewUILoadingBar = {
  start: () => console.log('[ViewUILoadingBar] Started'), // Mock implementation
  finish: () => console.log('[ViewUILoadingBar] Finished'), // Mock implementation
  error: () => console.log('[ViewUILoadingBar] Error')      // Mock implementation
};

const routes = [
  // OJ routes are at the root
  ...ojRoutes,
  // Admin routes are namespaced under /admin
  {
    path: '/admin',
    // name: 'admin-section', // Optional: name for the group
    // component: AdminLayout, // Optional: A layout component for the entire admin section
    children: adminRoutes
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL), // Or import.meta.env.BASE_URL if using Vite
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { x: 0, y: 0 };
    }
  },
});

// Navigation guards
// Assuming you will have a Pinia store for auth and modal status
// import { useAuthStore } from '@/stores/authStore'; // Example store path
// import { useModalStore } from '@/stores/modalStore'; // Example store path
// import storage from '@/utils/storage'; // Assuming this will be migrated
// import { STORAGE_KEY } from '@/utils/constants'; // Assuming this will be migrated

router.beforeEach(async (to, from, next) => {
  ViewUILoadingBar.start(); // Start loading bar

  const userStore = useUserStore();
  const appStore = useAppStore();

  // Attempt to load profile if not already loaded and not on a public admin route
  // This helps ensure user data is available for auth checks
  // Check if userStore is fully initialized (e.g. by checking if a known getter like isAuthenticated is defined)
  if (typeof userStore.isAuthenticated !== 'undefined' && !userStore.isAuthenticated && !userStore.profile.id) {
    // Avoid fetching profile if we are navigating to public admin login or if it's already fetched.
    // This check could be more sophisticated based on token presence in storage if you have one.
    if (!to.path.startsWith('/admin/login')) { // Don't fetch if going to admin login
        try {
            await userStore.fetchProfile();
        } catch (error) {
            console.warn('Failed to fetch profile during navigation guard:', error);
            // Do not block navigation if profile fetch fails, allow other checks to proceed
        }
    }
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);
  const isAuthenticated = userStore.isAuthenticated;
  const isAdmin = userStore.isAdminRole;

  if (to.meta.public) { // Allow access to explicitly public routes (e.g. admin login)
    next();
    return;
  }

  if (requiresAdmin) {
    if (!isAuthenticated) {
      // console.error('Admin area: Please login first');
      // For admin section, redirect to admin login if not authenticated
      next({ name: 'admin-login', query: { redirect: to.fullPath } });
    } else if (!isAdmin) {
      // console.error('Admin area: Insufficient privileges');
      // If authenticated but not an admin, redirect to a general access denied page or home
      next({ name: 'home' }); // Or a specific 'access-denied' route
    } else {
      next(); // Proceed if authenticated and admin
    }
  } else if (requiresAuth) {
    if (!isAuthenticated) {
      // console.error('User area: Please login first');
      appStore.showLoginModal(); // Show OJ login modal for regular protected routes
      // Decide where to redirect, or if modal is sufficient. 
      // If redirecting, ensure modal doesn't pop up over new route.
      // next({ name: 'home' }); // Or a specific login route for OJ if modal is not used
      if (from.name !== 'login') { // Avoid redirect loop if already on a login-like page
        next({ name: 'home', query: { loginRedirect: to.fullPath } });
      } else {
        next(false); // Prevent navigation if already trying to show modal from a login context
      }
    } else {
      next(); // Proceed if authenticated for a regular protected route
    }
  } else {
    next(); // No auth required, or already handled by public meta
  }
});

router.afterEach((to) => {
  ViewUILoadingBar.finish(); // Finish loading bar
  
  const appStore = useAppStore();
  appStore.updateDocumentTitle(to.meta.title);
});

router.onError(error => {
  ViewUILoadingBar.error(); // Show error state in loading bar
  console.error("Router error:", error);
  // Optionally, redirect to an error page or show a global notification
});

export default router; 