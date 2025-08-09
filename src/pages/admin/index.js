import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import i18n from '@/i18n'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './style.less'

import { ElMessage } from 'element-plus'
import VueAnalytics from 'vue-analytics'
import { GOOGLE_ANALYTICS_ID } from '@/utils/constants'
import katex from '@/plugins/katex'
import filters from '@/utils/filters'

import Panel from './components/Panel.vue'
import IconBtn from './components/btn/IconBtn.vue'
import Save from './components/btn/Save.vue'
import Cancel from './components/btn/Cancel.vue'

const app = createApp(App)

// Register global components
app.component(IconBtn.name, IconBtn)
app.component(Panel.name, Panel)
app.component(Save.name, Save)
app.component(Cancel.name, Cancel)

// Register global utility filters
Object.keys(filters).forEach(key => {
  app.config.globalProperties.$filters = {
    ...app.config.globalProperties.$filters,
    [key]: filters[key]
  }
})

// Configure global message
app.config.globalProperties.$message = ElMessage
app.config.globalProperties.$error = (msg) => ElMessage.error(msg)
app.config.globalProperties.$warning = (msg) => ElMessage.warning(msg)
app.config.globalProperties.$success = (msg) => {
  if (!msg) {
    ElMessage.success('Succeeded')
  } else {
    ElMessage.success(msg)
  }
}

// Use plugins
app.use(router)
app.use(store)
app.use(i18n)
app.use(ElementPlus)
app.use(katex)
app.use(VueAnalytics, {
  id: GOOGLE_ANALYTICS_ID,
  router
})

app.mount('#app')
