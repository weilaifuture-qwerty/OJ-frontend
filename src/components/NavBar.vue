<template>
  <div id="header">
    <Menu theme="light" mode="horizontal" @on-select="handleRoute" :active-name="activeMenu" class="oj-menu">
      <div class="logo"><span v-if="appStore.website">{{ appStore.website.website_name }}</span></div>
      <MenuItem name="/">
        <Icon type="md-home" /> <!-- View UI Plus often prefixes icons with md- or ios- -->
        {{ t('Home') }}
      </MenuItem>
      <MenuItem name="/problem">
        <Icon type="ios-keypad" />
        {{ t('NavProblems') }}
      </MenuItem>
      <MenuItem name="/contest">
        <Icon type="md-trophy" />
        {{ t('Contests') }}
      </MenuItem>
      <MenuItem name="/status">
        <Icon type="ios-pulse" /> <!-- Was ios-pulse-strong -->
        {{ t('NavStatus') }}
      </MenuItem>
      <Submenu name="rank">
        <template #title> <!-- Vue 3 slot syntax -->
          <Icon type="md-podium" />
          {{ t('Rank') }}
        </template>
        <MenuItem name="/acm-rank">{{ t('ACM_Rank') }}</MenuItem>
        <MenuItem name="/oi-rank">{{ t('OI_Rank') }}</MenuItem>
      </Submenu>
      <Submenu name="about">
        <template #title>
          <Icon type="ios-information-circle" /> <!-- Was information-circled -->
          {{ t('About') }}
        </template>
        <MenuItem name="/about">{{ t('Judger') }}</MenuItem>
        <MenuItem name="/FAQ">{{ t('FAQ') }}</MenuItem>
      </Submenu>
      <template v-if="!userStore.isAuthenticated">
        <div class="btn-menu">
          <Button type="default" shape="circle" @click="handleBtnClick('login')">
            {{ t('Login') }}
          </Button>
          <Button v-if="appStore.website && appStore.website.allow_register" type="default" shape="circle" @click="handleBtnClick('register')" style="margin-left: 5px;">
            {{ t('Register') }}
          </Button>
        </div>
      </template>
      <template v-else>
        <Dropdown class="drop-menu" @on-click="handleRoute" placement="bottom" trigger="click">
          <Button type="text" class="drop-menu-title">
            {{ userStore.user.username }}
            <Icon type="ios-arrow-down" /> <!-- Was arrow-down-b -->
          </Button>
          <template #list> <!-- Vue 3 slot syntax -->
            <DropdownMenu>
              <DropdownItem name="/user-home">{{ t('MyHome') }}</DropdownItem>
              <DropdownItem name="/status?myself=1">{{ t('MySubmissions') }}</DropdownItem>
              <DropdownItem name="/setting/profile">{{ t('Settings') }}</DropdownItem>
              <DropdownItem v-if="userStore.isAdminRole" name="/admin/">{{ t('Management') }}</DropdownItem> <!-- Ensure name leads to admin -->
              <Dropdown v-if="userStore.isAdminRole" trigger="hover" placement="right-start">
                <template #title>
                  <span>{{ t('Management') }}</span>
                </template>
                <DropdownMenu>
                  <DropdownItem name="/admin/problems">Problem Management</DropdownItem>
                  <!-- Add more admin links here as needed -->
                </DropdownMenu>
              </Dropdown>
              <DropdownItem @click="handleLogout" divided>{{ t('Logout') }}</DropdownItem>
            </DropdownMenu>
          </template>
        </Dropdown>
      </template>
    </Menu>
    <Modal v-model="modalVisible" :title="modalTitle" :width="400" :footer-hide="true">
      <!-- <div slot="header" class="modal-title">{{$t('m.Welcome_to')}} {{website.website_name_shortcut}}</div> --> <!-- Title is now a prop -->
      <component :is="currentModalComponent" v-if="appStore.modalStatus.visible"></component>
      <!-- <div slot="footer" style="display: none"></div> --> <!-- footer-hide prop used -->
    </Modal>
  </div>
</template>

<script setup>
import { computed, onMounted, defineAsyncComponent } from 'vue';
import { useAppStore } from '../stores/appStore';
import { useUserStore } from '../stores/userStore';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

// Dynamically import Login and Register components (placeholders for now)
// These should be actual paths to your migrated components
const LoginComponent = defineAsyncComponent(() => import('../views/user/UserLogin.vue')); // Updated path
const RegisterComponent = defineAsyncComponent(() => import('../views/user/UserRegister.vue')); // Updated path

const appStore = useAppStore();
const userStore = useUserStore();
const router = useRouter();
const route = useRoute();
const { t } = useI18n();

onMounted(() => {
  console.log('appStore.website:', appStore.website);
  // Fetch initial data if not already loaded (Pinia stores manage this internally if designed well)
  if (!userStore.profile.id) { // Check a specific property to see if profile is truly empty
      userStore.fetchProfile();
  }
  if (!appStore.website.website_name) { // Check a specific property
      appStore.fetchWebsiteConfig();
  }
});

const handleRoute = (name) => {
  if (name) {
    if (name.startsWith('/admin')) { // Check if it's an admin route
      // window.open(name); // Opens in new tab
      router.push(name); // Or navigate within the SPA
    } else {
      router.push(name);
    }
  }
};

const handleBtnClick = (mode) => {
  appStore.setModalStatus({ visible: true, mode: mode });
};

const handleLogout = async () => {
  await userStore.logout();
  router.push('/'); // Redirect to home after logout
};

const activeMenu = computed(() => {
  // Ensure route.path exists and is not null/undefined before splitting
  if (route.path) {
    const pathParts = route.path.split('/');
    return pathParts.length > 1 ? `/${pathParts[1]}` : '/';
  }
  return '/'; // Default active menu
});

const modalVisible = computed({
  get: () => appStore.modalStatus.visible,
  set: (value) => appStore.setModalStatus({ visible: value }),
});

const modalTitle = computed(() => {
    return `${t('Welcome_to')} ${appStore.website.website_name_shortcut || 'OJ'}`;
});

const currentModalComponent = computed(() => {
  if (!appStore.modalStatus.visible) return null;
  return appStore.modalStatus.mode === 'login' ? LoginComponent : RegisterComponent;
});

</script>

<style lang="less" scoped>
/* Copied from old NavBar.vue and slightly adapted */
#header {
  min-width: 300px;
  position: fixed;
  top: 0;
  left: 0;
  height: auto; /* Or specific height e.g., 60px if menu has fixed height */
  width: 100%;
  z-index: 1000;
  background-color: #fff;
  box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.1);
  .oj-menu {
    background: #fdfdfd;
  }

  .logo {
    margin-left: 2%;
    margin-right: 2%;
    font-size: 20px;
    float: left;
    line-height: 60px; /* Adjust if menu height changes */
  }

  .drop-menu {
    float: right;
    margin-right: 30px;
    /* position: absolute; */ /* Consider if absolute positioning is needed with flex/grid layouts */
    /* right: 10px; */
    &-title {
      font-size: 18px;
    }
  }
  .btn-menu {
    font-size: 16px;
    float: right;
    margin-right: 10px; /* Be mindful of layout with other items like dropdown */
    display: flex; /* Added for better alignment of buttons if needed */
    align-items: center; /* Vertically align items in btn-menu */
    height: 60px; /* Match line-height of logo for vertical centering */
  }
}

/* Modal styles are usually handled by View UI Plus globally or can be customized if needed */
/* .modal-title was used for custom slot, but Modal component has a title prop */
</style> 