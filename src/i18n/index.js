import { createI18n } from 'vue-i18n'

// Import OJ and Admin messages
import { m as ojEnUS } from './oj/en-US.js'
import { m as ojZhCN } from './oj/zh-CN.js'
import { m as ojZhTW } from './oj/zh-TW.js'
import { m as adminEnUS } from './admin/en-US.js'
import { m as adminZhCN } from './admin/zh-CN.js'
import { m as adminZhTW } from './admin/zh-TW.js'

// Import ViewUI Plus locale
import enUSLocale from 'view-ui-plus/dist/locale/en-US'
import zhCNLocale from 'view-ui-plus/dist/locale/zh-CN'
import zhTWLocale from 'view-ui-plus/dist/locale/zh-TW'

const languages = [
  {value: 'en-US', label: 'English'},
  {value: 'zh-CN', label: '简体中文'},
  {value: 'zh-TW', label: '繁體中文'}
]

const messages = {
  'en-US': { 
    m: { ...ojEnUS, ...adminEnUS },
    ...enUSLocale
  },
  'zh-CN': { 
    m: { ...ojZhCN, ...adminZhCN },
    ...zhCNLocale
  },
  'zh-TW': { 
    m: { ...ojZhTW, ...adminZhTW },
    ...zhTWLocale
  }
}

// Create i18n instance
const i18n = createI18n({
  legacy: true, // Use legacy mode for now to support Vue 2 style components
  locale: 'en-US',
  fallbackLocale: 'en-US',
  messages: messages
})

export default i18n
export { languages }