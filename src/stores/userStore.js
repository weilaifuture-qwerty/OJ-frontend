import { defineStore } from 'pinia';
import api from '@/api'; // Import the real API service
import storage from '@/utils/storage'; // Use the real storage utility
import { STORAGE_KEY, USER_TYPE, PROBLEM_PERMISSION } from '@/utils/constants'; // Use real constants
// import i18n from '@/i18n'; // Placeholder for i18n - assuming it's globally available or passed if needed
import { useAppStore } from './appStore'; // For modal control, etc.

// Mock i18n instance for store logic if needed, or rely on global instance
// This should ideally be handled by the main Vue i18n instance
const i18n = {
  locale: 'en', 
  t: (key) => key 
};

export const useUserStore = defineStore('user', {
  state: () => ({
    profile: storage.get(STORAGE_KEY.USER_PROFILE) || {},
    // token: storage.get(STORAGE_KEY.AUTH_TOKEN) || null, // Uncomment if using token auth
    isAuthenticatedState: storage.get(STORAGE_KEY.AUTHED) || false,
  }),
  getters: {
    user: (state) => state.profile.user || {},
    isAuthenticated: (state) => state.isAuthenticatedState,
    isAdminRole: (state) => {
      const user = state.profile.user || {};
      return user.admin_type === USER_TYPE.ADMIN || user.admin_type === USER_TYPE.SUPER_ADMIN;
    },
    isSuperAdmin: (state) => {
      const user = state.profile.user || {};
      return user.admin_type === USER_TYPE.SUPER_ADMIN;
    },
    hasProblemPermission: (state) => {
      const user = state.profile.user || {};
      // Ensure PROBLEM_PERMISSION.NONE is correctly defined in your constants
      return user.problem_permission !== PROBLEM_PERMISSION.NONE;
    },
  },
  actions: {
    setProfileData(profileData) {
      this.profile = profileData || {};
      this.isAuthenticatedState = !!(profileData && profileData.user && profileData.user.id);
      storage.set(STORAGE_KEY.USER_PROFILE, this.profile);
      storage.set(STORAGE_KEY.AUTHED, this.isAuthenticatedState);
      
      // Language update based on profile - ensure i18n instance is correctly accessed
      // if (profileData && profileData.language && i18n.global && typeof i18n.global.locale === 'object') {
      //   i18n.global.locale.value = profileData.language;
      // } else if (profileData && profileData.language) {
      //  console.warn('i18n global locale not directly writable, or i18n instance not standard.')
      // }
    },
    async fetchProfile() {
      try {
        const profileData = await api.getProfile();
        this.setProfileData(profileData);
      } catch (error) {
        console.error('Failed to fetch profile:', error.message || error);
        this.clearProfileData();
      }
    },
    clearProfileData() {
      this.profile = {};
      this.isAuthenticatedState = false;
      // this.token = null; // if using token auth
      storage.remove(STORAGE_KEY.USER_PROFILE);
      storage.remove(STORAGE_KEY.AUTHED);
      // storage.remove(STORAGE_KEY.AUTH_TOKEN); // if using token auth
      // Consider calling storage.clearAllAppStorage() here if appropriate, or specific removals
    },
    async login(credentials) {
      try {
        const response = await api.login(credentials);
        await this.fetchProfile();
        if (!this.isAuthenticatedState) {
          throw new Error(i18n.t('Login_succeeded_but_profile_fetch_failed'));
        }
        return response;
      } catch (error) {
        console.error('Login failed:', error.message || error);
        this.clearProfileData();
        throw error;
      }
    },
    async register(registrationData) {
      try {
        const response = await api.register(registrationData);
        // Optionally auto-login after registration
        // await this.login({
        //   username: registrationData.username,
        //   password: registrationData.password
        // });
        return response;
      } catch (error) {
        console.error('Registration failed:', error.message || error);
        throw error;
      }
    },
    async logout() {
      const appStore = useAppStore();
      try {
        await api.logout();
      } catch (error) {
        console.error('Logout API call failed:', error.message || error);
      } finally {
        this.clearProfileData();
        appStore.closeModal();
      }
    }
  },
}); 