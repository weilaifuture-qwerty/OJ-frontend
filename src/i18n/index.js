import { createI18n } from 'vue-i18n'
import en from 'element-plus/dist/locale/en.mjs'
import zhCN from 'element-plus/dist/locale/zh-cn.mjs'
import zhTW from 'element-plus/dist/locale/zh-tw.mjs'

const messages = {
  'en-US': {
    ...en,
    m: {
      Welcome_to_OnlineJudge: 'Welcome to OnlineJudge',
      Welcome_to_use: 'Welcome to use OnlineJudge',
      // Add more keys as needed from the original repo
    }
  },
  'zh-CN': {
    ...zhCN,
    m: {
      Welcome_to_OnlineJudge: '欢迎来到 OnlineJudge',
      Welcome_to_use: '欢迎使用 OnlineJudge',
      // Add more keys as needed from the original repo
    }
  },
  'zh-TW': {
    ...zhTW,
    m: {
      Welcome_to_OnlineJudge: '歡迎來到 OnlineJudge',
      Welcome_to_use: '歡迎使用 OnlineJudge',
      // Add more keys as needed from the original repo
    }
  }
}

const i18n = createI18n({
  legacy: false,
  locale: 'en-US',
  fallbackLocale: 'en-US',
  messages
})

export default i18n
