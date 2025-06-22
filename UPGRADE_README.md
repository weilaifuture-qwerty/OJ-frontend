# OnlineJudgeFE Upgrade Guide

## Overview

This project has been prepared for modernization from Vue 2 + Webpack 3 to Vue 3 + Vite. We've created multiple migration paths to ensure a smooth transition.

## Migration Options

### Option 1: Gradual Migration (Recommended)
Use Vue 2.7 as a stepping stone:

```bash
# Step 1: Backup current project
cp -r . ../OnlineJudgeFE-backup

# Step 2: Use Vue 2.7 configuration
cp package-vue2.7.json package.json
cp vite.config.vue2.js vite.config.js

# Step 3: Install dependencies
rm -rf node_modules package-lock.json yarn.lock
npm install

# Step 4: Test the application
npm run dev
```

### Option 2: Direct Vue 3 Migration
For teams ready to make the full jump:

```bash
# The package.json is already set up for Vue 3
rm -rf node_modules package-lock.json yarn.lock
npm install
```

## Key Changes

### Dependencies Updated:
- **Build Tool**: Webpack 3 → Vite 5
- **Framework**: Vue 2.5 → Vue 3.4 (or Vue 2.7 for gradual migration)
- **State Management**: Vuex 3 → Pinia 2 (or keep Vuex for Vue 2.7)
- **Router**: Vue Router 3 → Vue Router 4
- **UI Libraries**: 
  - iView → View UI Plus (Vue 3) or iView 3.x (Vue 2.7)
  - Element UI → Element Plus (Vue 3) or Element UI 2.15 (Vue 2.7)
- **Date Library**: Moment.js → Day.js
- **Build Time**: ~60s → ~10s (with Vite)

### Development Experience:
- Hot Module Replacement (HMR) is now instant
- No more DLL plugin needed - Vite handles caching automatically
- ESM-based development server
- Optimized production builds

## Next Steps

### For Vue 2.7 Path:
1. Update component syntax gradually
2. Test thoroughly
3. Once stable, upgrade to Vue 3

### For Vue 3 Path:
1. Update all components following MIGRATION_GUIDE.md
2. Update state management to Pinia
3. Update router syntax
4. Fix breaking changes

## Quick Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Linting
npm run lint
npm run lint:fix
```

## Important Notes

1. **API Compatibility**: The `/api` proxy is configured in vite.config.js
2. **Static Assets**: Now served from `/static` in production
3. **Environment Variables**: Use `import.meta.env` instead of `process.env`
4. **Dynamic Imports**: Vite handles these automatically
5. **CSS**: LESS is still supported, but consider migrating to CSS modules

## Troubleshooting

### Common Issues:

1. **"Cannot find module" errors**
   - Clear node_modules and reinstall
   - Check import paths (no .vue extension needed)

2. **UI Components not working**
   - Ensure you're using the correct UI library version
   - Check component registration

3. **Build failures**
   - Check for Vue 2 → Vue 3 breaking changes
   - Review console errors carefully

## Support

- Vue 3 Migration Guide: https://v3-migration.vuejs.org/
- Vite Documentation: https://vitejs.dev/
- View UI Plus: https://www.iviewui.com/
- Element Plus: https://element-plus.org/

## Rollback Plan

If you need to rollback:
```bash
# Restore from backup
cp -r ../OnlineJudgeFE-backup/* .
npm install
```

Good luck with your migration! 🚀