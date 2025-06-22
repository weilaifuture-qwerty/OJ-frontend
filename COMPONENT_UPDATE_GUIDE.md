# Component Update Guide for Vue 3

## Quick Reference

### 1. Slot Syntax
```vue
<!-- Vue 2 -->
<template slot="title">Title</template>
<template slot-scope="props">{{ props.item }}</template>

<!-- Vue 3 -->
<template #title>Title</template>
<template #default="{ item }">{{ item }}</template>
```

### 2. Component Registration
```vue
<!-- Vue 2 -->
<Menu-item></Menu-item>
<Dropdown-menu></Dropdown-menu>

<!-- Vue 3 (View UI Plus) -->
<MenuItem></MenuItem>
<DropdownMenu></DropdownMenu>
```

### 3. Icon Names (View UI Plus)
```vue
<!-- Vue 2 iView -->
<Icon type="home" />
<Icon type="ios-keypad" />

<!-- Vue 3 View UI Plus -->
<Icon type="md-home" />
<Icon type="md-keypad" />
```

### 4. Vuex to Pinia
```javascript
// Vue 2 with Vuex
import { mapState, mapActions } from 'vuex'
export default {
  computed: {
    ...mapState(['user'])
  },
  methods: {
    ...mapActions(['getProfile'])
  }
}

// Vue 3 with Pinia
import { useUserStore } from '@/stores/user'
export default {
  setup() {
    const userStore = useUserStore()
    return {
      user: computed(() => userStore.user),
      getProfile: () => userStore.getProfile()
    }
  }
}
```

### 5. Filters
```vue
<!-- Vue 2 -->
{{ time | localtime }}

<!-- Vue 3 -->
{{ formatTime(time) }}
```

### 6. v-model on Components
```vue
<!-- Vue 2 -->
<custom-input v-model="value" />

<!-- Vue 3 -->
<custom-input :model-value="value" @update:model-value="value = $event" />
```

## Components Status

### Updated ✅
- [x] App.vue
- [x] NavBar.vue
- [x] Panel.vue
- [x] Home.vue (simplified)

### Need Update ❌
- [ ] Login.vue
- [ ] Register.vue
- [ ] ProblemList.vue
- [ ] Problem.vue
- [ ] ContestList.vue
- [ ] Contest components
- [ ] Submission components
- [ ] User components
- [ ] Admin components

## Common Issues & Solutions

1. **"Vue is not defined"**: Remove `import Vue from 'vue'` and Vue prototype usage
2. **Slot errors**: Update to v-slot syntax
3. **Filter errors**: Replace with methods or computed properties
4. **Icon not showing**: Update icon names to md- prefix
5. **Component not found**: Check component name casing (kebab-case → PascalCase)

## Testing

After updating each component:
1. Check browser console for errors
2. Test all interactive features
3. Verify API calls work correctly
4. Check styling is preserved