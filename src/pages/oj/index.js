import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import i18n from '@/i18n'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@/styles/index.less'

import { ElMessage } from 'element-plus'
import VueClipboard from 'vue-clipboard2'
import VueAnalytics from 'vue-analytics'
import { GOOGLE_ANALYTICS_ID } from '@/utils/constants'

import Panel from '@oj/components/Panel.vue'
import VerticalMenu from '@oj/components/verticalMenu/verticalMenu.vue'
import VerticalMenuItem from '@oj/components/verticalMenu/verticalMenu-item.vue'

import highlight from '@/plugins/highlight'
import katex from '@/plugins/katex'
import filters from '@/utils/filters.js'

import ECharts from 'vue-echarts/components/ECharts.vue'
import 'echarts/lib/chart/bar'
import 'echarts/lib/chart/line'
import 'echarts/lib/chart/pie'
import 'echarts/lib/component/title'
import 'echarts/lib/component/grid'
import 'echarts/lib/component/dataZoom'
import 'echarts/lib/component/legend'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/toolbox'
import 'echarts/lib/component/markPoint'

const app = createApp(App)

// Register global components
app.component('ECharts', ECharts)
app.component(VerticalMenu.name, VerticalMenu)
app.component(VerticalMenuItem.name, VerticalMenuItem)
app.component(Panel.name, Panel)

// Register global utility filters
Object.keys(filters).forEach(key => {
  app.config.globalProperties.$filters = {
    ...app.config.globalProperties.$filters,
    [key]: filters[key]
  }
})

// Configure global message
app.config.globalProperties.$message = ElMessage
app.config.globalProperties.$error = (s) => ElMessage.error(s)
app.config.globalProperties.$info = (s) => ElMessage.info(s)
app.config.globalProperties.$success = (s) => ElMessage.success(s)

// Use plugins
app.use(router)
app.use(store)
app.use(i18n)
app.use(ElementPlus)
app.use(VueClipboard)
app.use(highlight)
app.use(katex)
app.use(VueAnalytics, {
  id: GOOGLE_ANALYTICS_ID,
  router
})

app.mount('#app')
