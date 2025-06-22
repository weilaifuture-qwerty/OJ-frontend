# OnlineJudgeFE Migration Guide

This guide outlines the steps to migrate from the legacy Vue 2 + Webpack 3 setup to a modern Vue 3 + Vite setup.

## Overview of Changes

### Major Updates:
- **Vue 2.5.16 → Vue 3.4.15**: Complete framework upgrade
- **Webpack 3 → Vite 5**: Modern build tool with faster HMR
- **Vuex → Pinia**: Modern state management
- **iView → View UI Plus**: Vue 3 compatible UI library
- **Element UI → Element Plus**: Vue 3 compatible UI library
- **Moment.js → Day.js**: Smaller date library
- **Options API → Composition API**: Gradual migration recommended

### Build Tool Changes:
- Removed Webpack and all related plugins
- Added Vite with optimized configuration
- Simplified build process
- Faster development server

## Migration Steps

### Step 1: Install Dependencies
```bash
# Remove old node_modules and lock file
rm -rf node_modules package-lock.json yarn.lock

# Install new dependencies
npm install
```

### Step 2: Update Entry Files

#### Update src/pages/oj/index.js:
```javascript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ViewUIPlus from 'view-ui-plus'
import 'view-ui-plus/dist/styles/viewuiplus.css'
import App from './App.vue'
import router from './router'
import i18n from '@/i18n'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(ViewUIPlus)

app.mount('#app')
```

#### Update src/pages/admin/index.js:
```javascript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import i18n from '@/i18n'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(ElementPlus)

app.mount('#app')
```

### Step 3: Update Router

Convert Vue Router to v4 syntax:
```javascript
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // your routes
  ]
})

export default router
```

### Step 4: Update Vuex to Pinia

Create store files in src/stores/:
```javascript
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    // state
  }),
  getters: {
    // getters
  },
  actions: {
    // actions
  }
})
```

### Step 5: Component Updates

#### Common Breaking Changes:
1. **v-model on components**: Use `modelValue` prop and `update:modelValue` event
2. **Filters**: Replace with computed properties or methods
3. **Event listeners**: Replace `$on`, `$off`, `$once` with external event emitter
4. **Slots**: Update to v-slot syntax
5. **Transitions**: Update class names

#### Example Component Update:
```vue
<!-- Old Vue 2 -->
<template slot="title">Title</template>

<!-- New Vue 3 -->
<template #title>Title</template>

<!-- Old Vue 2 -->
<input v-model="value" @change="$emit('change', $event)">

<!-- New Vue 3 -->
<input :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
```

### Step 6: UI Library Updates

#### iView → View UI Plus:
- Component names remain mostly the same
- Import paths change from `iview` to `view-ui-plus`
- Some props may have changed - check documentation

#### Element UI → Element Plus:
- Component names change from `el-*` to `el-*` (mostly the same)
- Import paths change from `element-ui` to `element-plus`
- Icon usage changes significantly

### Step 7: Update Utils

#### Replace Moment.js with Day.js:
```javascript
// Old
import moment from 'moment'
moment().format('YYYY-MM-DD')

// New
import dayjs from 'dayjs'
dayjs().format('YYYY-MM-DD')
```

### Step 8: Run and Fix

1. Start development server:
```bash
npm run dev
```

2. Fix errors as they appear:
   - Template syntax errors
   - Import errors
   - Component registration issues
   - API compatibility issues

### Step 9: Testing

1. Test all major features:
   - User authentication
   - Problem submission
   - Contest functionality
   - Admin panel

2. Check browser console for errors

3. Verify build works:
```bash
npm run build
```

## Common Issues and Solutions

### Issue: Global properties not available
```javascript
// Vue 2
Vue.prototype.$message = Message

// Vue 3 (in main.js)
app.config.globalProperties.$message = Message
```

### Issue: Component emits not working
```javascript
// Add emits option to components
export default {
  emits: ['update:modelValue', 'change', 'submit'],
  // ...
}
```

### Issue: Reactive data not updating
```javascript
// Use ref or reactive from Vue 3
import { ref, reactive } from 'vue'

const count = ref(0)
const state = reactive({ name: '' })
```

## Resources

- [Vue 3 Migration Guide](https://v3-migration.vuejs.org/)
- [Vue Router 4 Migration](https://router.vuejs.org/guide/migration/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Element Plus Documentation](https://element-plus.org/)
- [View UI Plus Documentation](https://www.iviewui.com/)
- [Vite Documentation](https://vitejs.dev/)

## Gradual Migration Path

If a full migration is too risky, consider:

1. **Phase 1**: Update to Vue 2.7 first (supports Composition API)
2. **Phase 2**: Replace Webpack with Vite while staying on Vue 2.7
3. **Phase 3**: Migrate to Vue 3 component by component
4. **Phase 4**: Update remaining dependencies

This allows testing at each phase and rolling back if needed.