import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import i18n from '@/i18n'
import ElementPlus from 'element-plus'
import { ElMessage } from 'element-plus'
import 'element-plus/dist/index.css'

import filters from '@/utils/filters'
import router from './router'
import { GOOGLE_ANALYTICS_ID } from '@/utils/constants'
import katex from '@/plugins/katex'

import Panel from './components/Panel.vue'
import IconBtn from './components/btn/IconBtn.vue'
import Save from './components/btn/Save.vue'
import Cancel from './components/btn/Cancel.vue'
import './style.less'

const app = createApp(App)
const pinia = createPinia()

// Use Pinia for state management
app.use(pinia)
app.use(router)
app.use(i18n)
app.use(ElementPlus)
app.use(katex)

// Register global components
app.component(IconBtn.name, IconBtn)
app.component(Panel.name, Panel)
app.component(Save.name, Save)
app.component(Cancel.name, Cancel)

// Register global properties for filters
app.config.globalProperties.$filters = filters
Object.keys(filters).forEach(key => {
  app.config.globalProperties[`$${key}`] = filters[key]
})

// Configure global message methods
app.config.globalProperties.$error = (msg) => {
  ElMessage.error(msg)
}

app.config.globalProperties.$warning = (msg) => {
  ElMessage.warning(msg)
}

app.config.globalProperties.$success = (msg) => {
  ElMessage.success(msg || 'Succeeded')
}

// Google Analytics (if needed)
if (GOOGLE_ANALYTICS_ID) {
  // TODO: Add Vue 3 compatible analytics solution
}

app.mount('#app')
