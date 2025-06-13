import { createI18n, useI18n } from 'vue-i18n';
import enUSLocale from 'view-ui-plus/dist/locale/en-US';
import zhCNLocale from 'view-ui-plus/dist/locale/zh-CN';

// Available languages
export const availableLocales = [
  { code: 'en', name: 'English' },
  { code: 'zh', name: '中文' },
  // Add more languages as needed
];

// Basic i18n setup
export const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: {
      ...enUSLocale,
      // ... (add your custom English translations here if needed)
    },
    zh: {
      ...zhCNLocale,
      // ... (add your custom Chinese translations here if needed)
    }
  }
});

// Get current locale
export const getCurrentLocale = () => {
  return i18n.global.locale.value;
};

// Set locale
export const setLocale = (locale) => {
  i18n.global.locale.value = locale;
  // Save to localStorage for persistence
  localStorage.setItem('user-locale', locale);
};

// Initialize locale from localStorage or browser
export const initLocale = () => {
  const savedLocale = localStorage.getItem('user-locale');
  const browserLocale = navigator.language.split('-')[0];
  const defaultLocale = 'en';
  const locale = savedLocale ||
    (availableLocales.find(l => l.code === browserLocale) ? browserLocale : defaultLocale);
  setLocale(locale);
};

// Composable for using i18n in components
export const useI18nUtils = () => {
  const { t, locale } = useI18n();
  const changeLocale = (newLocale) => {
    setLocale(newLocale);
  };
  return {
    t,
    locale,
    changeLocale,
    availableLocales
  };
}; 