<template>
  <div>
    <NavBar />
    <div class="content-app">
      <router-view v-slot="{ Component }">
        <transition name="fadeInUp" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
      <div class="footer">
        <p v-if="appStore.website && appStore.website.website_footer" v-html="appStore.website.website_footer"></p>
        <p>Powered by <a href="https://github.com/QingdaoU/OnlineJudge">OnlineJudge</a>
          <span v-if="version">&nbsp; Version: {{ version }}</span>
        </p>
      </div>
    </div>
    <!-- <BackTop /> --> <!-- Placeholder: BackTop component to be migrated -->
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useAppStore } from './stores/appStore';
import { useRoute } from 'vue-router';

import NavBar from './components/NavBar.vue'; // Corrected path
// import BackTop from '@/components/BackTop.vue'; // Placeholder - adjust path once migrated

const appStore = useAppStore();
const route = useRoute();

// process.env.VERSION was used in old app. Vue CLI 5 exposes env vars via import.meta.env
// Example: const version = import.meta.env.VITE_APP_VERSION; (if using Vite-style env vars) or import.meta.env.VUE_APP_VERSION
// For now, let's use a placeholder or make it dynamic if available in website config
const version = ref(null); // Or: computed(() => appStore.website.version_info_if_any);

onMounted(() => {
  appStore.fetchWebsiteConfig();
  // Remove app-loader if it exists (from old project's index.html)
  try {
    const appLoader = document.getElementById('app-loader');
    if (appLoader) {
      document.body.removeChild(appLoader);
    }
  } catch (e) {
    // ignore
  }
});

// Watch for changes in website data and route to update document title
watch(() => appStore.website, (newWebsite) => {
  if (newWebsite && newWebsite.website_name_shortcut) {
    appStore.updateDocumentTitle(route.meta.title);
  }
}, { deep: true });

watch(() => route.meta.title, (newTitle) => {
  // Ensure website config is loaded before trying to set title based on it
  if (appStore.website && appStore.website.website_name_shortcut) {
    appStore.updateDocumentTitle(newTitle);
  } else {
    // If website config not yet loaded, attempt to fetch it then update title
    // This might also be handled by an initial fetch in main.js or router guards
    appStore.fetchWebsiteConfig().then(() => {
        appStore.updateDocumentTitle(newTitle);
    });
  }
}, { immediate: true }); // `immediate` to run on component mount as well

</script>

<style lang="less">
// Copied from src/pages/oj/App.vue
* {
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
}

a {
  text-decoration: none;
  background-color: transparent;
  &:active,
  &:hover {
    outline-width: 0;
  }
}

@media screen and (max-width: 1200px) {
  .content-app {
    margin-top: 160px; /* This might need adjustment based on new NavBar height */
    padding: 0 2%;
  }
}

@media screen and (min-width: 1200px) {
  .content-app {
    margin-top: 80px; /* This might need adjustment based on new NavBar height */
    padding: 0 2%;
  }
}

.footer {
  margin-top: 20px;
  margin-bottom: 10px;
  text-align: center;
  font-size: small;
}

/* fadeInUp animation definition - Vue's <transition> will apply classes like .fadeInUp-enter-active */
.fadeInUp-enter-active {
  animation: fadeInUp 0.8s;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translate3d(0, 100%, 0);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
</style>
