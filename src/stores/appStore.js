import { defineStore } from 'pinia';
import api from '@/api'; // Import the real API service
// import { useI18n } from 'vue-i18n'; // If needed for t() directly in store

export const useAppStore = defineStore('app', {
  state: () => ({
    website: {},
    modalStatus: {
      mode: 'login', // 'login' or 'register'
      visible: false,
    },
    // isRouteLoading: false, // For global route loading indicator, if not using ViewUI $Loading
    languages: [], // If you manage available languages from backend
    currentLanguage: null, // If you manage current language state here
  }),
  getters: {
    // website and modalStatus are directly accessible
    // Getters can be added for computed values if needed
  },
  actions: {
    async fetchWebsiteConfig() {
      try {
        const configData = await api.getWebsiteConf(); // Use real API
        this.website = configData || {};
        // If backend provides languages, update them here
        // if (configData && configData.languages) {
        //   this.languages = configData.languages;
        // }
        // If backend provides default language, set it
        // if (configData && configData.default_language && !this.currentLanguage) {
        //   this.setLanguage(configData.default_language);
        // }
      } catch (error) {
        console.error('Failed to fetch website config:', error.message || error);
        this.website = { website_name_shortcut: 'OJ' }; // Sensible default on error
      }
    },
    setModalStatus({ mode, visible }) {
      if (mode !== undefined) {
        this.modalStatus.mode = mode;
      }
      if (visible !== undefined) {
        this.modalStatus.visible = visible;
      }
    },
    showLoginModal() {
      this.setModalStatus({ mode: 'login', visible: true });
    },
    showRegisterModal() {
      this.setModalStatus({ mode: 'register', visible: true });
    },
    closeModal() {
      this.setModalStatus({ visible: false });
    },
    updateDocumentTitle(routeTitle) {
      const baseTitle = this.website.website_name_shortcut || 'OnlineJudge';
      if (routeTitle) {
        document.title = `${baseTitle} | ${routeTitle}`;
      } else {
        document.title = baseTitle;
      }
    },
    // Example for route loading indicator state management
    // setRouteLoading(isLoading) {
    //   this.isRouteLoading = isLoading;
    // },

    // Language management actions (example)
    // async fetchLanguages() { // If languages are fetched separately
    //   try {
    //     this.languages = await api.getLanguages(); // Assuming an API endpoint
    //   } catch (error) {
    //     console.error('Failed to fetch languages:', error);
    //     this.languages = [];
    //   }
    // },
    // setLanguage(langCode) {
    //   this.currentLanguage = langCode;
    //   // Here you would also tell vue-i18n instance to change locale
    //   // This might involve getting the i18n instance (e.g., from main.js or a plugin)
    //   // const i18n = getI18nInstance(); // Placeholder
    //   // if (i18n) i18n.global.locale.value = langCode;
    //   // localStorage.setItem('preferred_language', langCode);
    // }
  },
}); 