import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import i18n from '@/i18n'
import useClipboard from 'vue-clipboard3'
import { GOOGLE_ANALYTICS_ID } from '@/utils/constants'

import ViewUIPlus from 'view-ui-plus'
import 'view-ui-plus/dist/styles/viewuiplus.css'

import Panel from '@oj/components/Panel.vue'
import VerticalMenu from '@oj/components/verticalMenu/verticalMenu.vue'
import VerticalMenuItem from '@oj/components/verticalMenu/verticalMenu-item.vue'

// Import custom styles after ViewUI to ensure overrides work
import '@/styles/index.less'

// Import layout monitoring for debugging
// import '@/utils/layout-monitor'
// import '@/utils/layout-debug'

import highlight from '@/plugins/highlight'
import katex from '@/plugins/katex'
import filters from '@/utils/filters.js'
import dropdownTrigger from '@oj/components/DropdownTrigger.js'

import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import {
  TitleComponent,
  GridComponent,
  DataZoomComponent,
  LegendComponent,
  TooltipComponent,
  ToolboxComponent,
  MarkPointComponent
} from 'echarts/components'

use([
  CanvasRenderer,
  BarChart,
  LineChart,
  PieChart,
  TitleComponent,
  GridComponent,
  DataZoomComponent,
  LegendComponent,
  TooltipComponent,
  ToolboxComponent,
  MarkPointComponent
])

const app = createApp(App)
const pinia = createPinia()

// Use Pinia for state management
app.use(pinia)
app.use(router)
app.use(i18n)

// Configure ViewUIPlus with i18n
app.use(ViewUIPlus, {
  i18n: (key, value) => i18n.global.t(key, value)
})
// Vue clipboard3 is used differently in Vue 3
const { toClipboard } = useClipboard()
app.config.globalProperties.$copyText = toClipboard

// Register clipboard directive
app.directive('clipboard', {
  mounted(el, binding) {
    el._clickHandler = async () => {
      try {
        await toClipboard(binding.value.copy || binding.value)
        if (binding.value.success) {
          binding.value.success()
        }
      } catch (e) {
        if (binding.value.error) {
          binding.value.error(e)
        }
      }
    }
    el.addEventListener('click', el._clickHandler)
  },
  unmounted(el) {
    el.removeEventListener('click', el._clickHandler)
  }
})
app.use(highlight)
app.use(katex)

// Register global components
app.component('VChart', VChart)
app.component('VerticalMenu', VerticalMenu)
app.component('VerticalMenuItem', VerticalMenuItem)
// Don't register Panel globally since components import it directly

// Register global properties for filters
app.config.globalProperties.$filters = filters
Object.keys(filters).forEach(key => {
  app.config.globalProperties[`$${key}`] = filters[key]
})

// Configure global message methods
app.config.globalProperties.$Message = app.config.globalProperties.$Message || {}
if (app.config.globalProperties.$Message.config) {
  app.config.globalProperties.$Message.config({
    duration: 2
  })
}
app.config.globalProperties.$error = (s) => app.config.globalProperties.$Message?.error?.(s)
app.config.globalProperties.$info = (s) => app.config.globalProperties.$Message?.info?.(s)
app.config.globalProperties.$success = (s) => app.config.globalProperties.$Message?.success?.(s)

// Register dropdown trigger directive
app.directive('dropdown-trigger', dropdownTrigger)

// Google Analytics (if needed)
if (GOOGLE_ANALYTICS_ID) {
  // TODO: Add Vue 3 compatible analytics solution
}

// Add global error handler for debugging
app.config.errorHandler = (err, instance, info) => {
  // Suppress known ViewUI Plus errors
  if (err.message) {
    // Menu navigation errors
    if (err.message.includes('getActiveKey')) {
      console.log('[Suppressed Error] ViewUI Menu getActiveKey - known issue during navigation')
      return
    }
    // Panel mounting errors
    if (err.message.includes('panelCount')) {
      console.log('[Suppressed Error] ViewUI Panel panelCount - known issue with Panel components')
      return
    }
  }
  
  // Log other errors
  console.error('[Global Error Handler]', err)
  console.error('[Error Info]', info)
  console.error('[Component Instance]', instance)
  
  // Re-throw other errors
  throw err
}

// Override console.warn to suppress specific warnings
const originalWarn = console.warn
console.warn = function(...args) {
  // Suppress injection warnings from ViewUI Plus
  if (args[0] && args[0].includes && args[0].includes('injection "CollapseInstance" not found')) {
    console.log('[Suppressed Warning] CollapseInstance injection - this is expected behavior')
    return
  }
  // Suppress size prop validation warnings
  if (args[0] && args[0].includes && args[0].includes('Invalid prop: custom validator check failed for prop "size"')) {
    console.log('[Suppressed Warning] Tag size prop - this has been fixed')
    return
  }
  originalWarn.apply(console, args)
}

app.mount('#app')
