import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import ViewUIPlus from 'view-ui-plus'
import 'view-ui-plus/dist/styles/viewuiplus.css'
import App from '@/App.vue'
import router from './router'
import { createPinia } from 'pinia'
import i18n from './i18n'
import 'font-awesome/css/font-awesome.min.css'
import './styles/theme.less'
import './styles/base.css'
import 'katex/dist/katex.min.css'
import './utils/filters'

const app = createApp(App)
const pinia = createPinia()

app.use(ElementPlus)
app.use(ViewUIPlus)
app.use(pinia)
app.use(router)
app.use(i18n)

app.mount('#app') 