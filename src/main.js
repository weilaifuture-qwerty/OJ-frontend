import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './stores'

// Import View UI Plus
import ViewUIPlus from 'view-ui-plus'
import 'view-ui-plus/dist/styles/viewuiplus.css'
import enUSLocale from 'view-ui-plus/dist/locale/en-US';

// Import vue-i18n (let the alias handle the correct build)
import { i18n, initLocale } from '@/utils/i18n';

// Log the imported locale to check its structure
console.log('enUSLocale', enUSLocale);

// Initialize locale
initLocale();

const app = createApp(App);

app.use(pinia);
app.use(router);
app.use(ViewUIPlus);
app.use(i18n);

app.mount('#app');
