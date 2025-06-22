<template>
  <div id="header">
    <Menu v-if="website && website.website_name && menuReady" theme="light" mode="horizontal" @on-select="handleRoute" :active-name="activeMenu || '/'" class="oj-menu" ref="menu">
      <div class="logo"><span>{{website.website_name}}</span></div>
      <MenuItem name="/">
        <Icon type="md-home"></Icon>
        {{$t('m.Home')}}
      </MenuItem>
      <MenuItem name="/problem">
        <Icon type="md-keypad"></Icon>
        {{$t('m.NavProblems')}}
      </MenuItem>
      <MenuItem name="/contest">
        <Icon type="md-trophy"></Icon>
        {{$t('m.Contests')}}
      </MenuItem>
      <MenuItem name="/homework" v-if="isAuthenticated">
        <Icon type="md-book"></Icon>
        {{$t('m.Homework')}}
      </MenuItem>
      <!-- Hidden Status Menu Item
      <MenuItem name="/status">
        <Icon type="md-pulse"></Icon>
        {{$t('m.NavStatus')}}
      </MenuItem>
      -->
      <Submenu name="rank">
        <template #title>
          <Icon type="md-podium"></Icon>
          {{$t('m.Rank')}}
        </template>
        <MenuItem name="/acm-rank">
          {{$t('m.ACM_Rank')}}
        </MenuItem>
        <MenuItem name="/oi-rank">
          {{$t('m.OI_Rank')}}
        </MenuItem>
      </Submenu>
      <!-- Hidden About Menu
      <Submenu name="about">
        <template #title>
          <Icon type="md-information-circle"></Icon>
          {{$t('m.About')}}
        </template>
        <MenuItem name="/about">
          {{$t('m.Judger')}}
        </MenuItem>
        <MenuItem name="/FAQ">
          {{$t('m.FAQ')}}
        </MenuItem>
      </Submenu>
      -->
      <template v-if="!isAuthenticated">
        <div class="btn-menu">
          <Button type="primary"
                  ghost
                  ref="loginBtn"
                  @click="handleBtnClick('login')">{{$t('m.Login')}}
          </Button>
          <Button v-if="website.allow_register"
                  type="primary"
                  ghost
                  @click="handleBtnClick('register')">{{$t('m.Register')}}
          </Button>
        </div>
      </template>
      <template v-else>
        <div class="user-menu-container">
          <div class="menu-item-wrapper">
            <MoodStatus />
          </div>
          <div class="menu-item-wrapper">
            <div class="drop-menu">
              <div class="custom-dropdown" @click="toggleDropdown">
                <a href="javascript:void(0)" class="drop-menu-title">
                <img 
                  v-if="userProfile && userProfile.avatar" 
                  :src="userProfile.avatar" 
                  class="navbar-avatar"
                  :alt="user.username"
                />
                <img 
                  v-else 
                  src="/default.png" 
                  class="navbar-avatar"
                  :alt="user.username"
                />
                <span class="username-text">{{ user.username }}</span>
                <Icon type="md-arrow-dropdown" size="16" />
              </a>
            <div v-show="showDropdown" class="custom-dropdown-menu">
              <a @click.stop="handleDropdownClick('/user-home')" class="dropdown-item">{{$t('m.MyHome')}}</a>
              <a @click.stop="handleDropdownClick('/setting/profile')" class="dropdown-item">{{$t('m.Settings')}}</a>
              <a v-if="isAdminRole" @click.stop="handleDropdownClick('/admin')" class="dropdown-item">{{$t('m.Management')}}</a>
              <div class="dropdown-divider"></div>
              <a @click.stop="handleDropdownClick('/logout')" class="dropdown-item">{{$t('m.Logout')}}</a>
            </div>
          </div>
            </div>
          </div>
        </div>
      </template>
    </Menu>
    <Modal v-model="modalVisible" :width="400">
      <template #header>
        <div class="modal-title">{{$t('m.Welcome_to')}} {{website.website_name_shortcut}}</div>
      </template>
      <component :is="modalStatus.mode" v-if="modalVisible"></component>
      <template #footer>
        <div style="display: none"></div>
      </template>
    </Modal>
  </div>
</template>

<script>
  import { computed } from 'vue'
  import { useUserStore } from '@/stores/user'
  import { useWebsiteStore } from '@/stores/website'
  import login from '@oj/views/user/Login.vue'
  import register from '@oj/views/user/Register.vue'
  import MoodStatus from './MoodStatus.vue'

  export default {
    components: {
      login,
      register,
      MoodStatus
    },
    setup() {
      const userStore = useUserStore()
      const websiteStore = useWebsiteStore()
      
      return {
        userStore,
        websiteStore,
        getProfile: () => userStore.getProfile(),
        changeModalStatus: (status) => userStore.changeModalStatus(status)
      }
    },
    data() {
      return {
        showDropdown: false,
        menuReady: false
      }
    },
    mounted () {
      this.getProfile()
      // Close dropdown when clicking outside
      document.addEventListener('click', this.handleClickOutside)
      
      // Fix for ViewUI Plus menu error - delay menu initialization
      setTimeout(() => {
        this.menuReady = true
      }, 100)
    },
    unmounted() {
      document.removeEventListener('click', this.handleClickOutside)
    },
    methods: {
      handleRoute (route) {
        try {
          if (route && route.indexOf('admin') < 0) {
            this.$router.push(route)
          } else {
            window.open('/admin/')
          }
        } catch (error) {
          console.error('[NavBar] Error in handleRoute:', error)
        }
      },
      async handleDropdownClick (name) {
        console.log('Dropdown clicked:', name)
        this.showDropdown = false
        if (name === '/logout') {
          await this.userStore.logout()
          this.$router.push('/')
          this.$Message.success('Logout successfully')
        } else if (name === '/admin') {
          window.open('/admin/')
        } else {
          this.$router.push(name)
        }
      },
      toggleDropdown() {
        this.showDropdown = !this.showDropdown
      },
      handleClickOutside(e) {
        if (!this.$el.contains(e.target)) {
          this.showDropdown = false
        }
      },
      handleBtnClick (mode) {
        this.changeModalStatus({
          visible: true,
          mode: mode
        })
      }
    },
    computed: {
      website() {
        return this.websiteStore.website
      },
      modalStatus() {
        return this.userStore.modalStatus
      },
      user() {
        return this.userStore.user
      },
      isAuthenticated() {
        return this.userStore.isAuthenticated
      },
      isAdminRole() {
        return this.userStore.isAdminRole
      },
      userProfile() {
        return this.userStore.profile
      },
      activeMenu () {
        try {
          if (!this.$route || !this.$route.path) {
            return '/'
          }
          const path = this.$route.path
          
          // Match homework routes
          if (path.startsWith('/homework')) {
            return '/homework'
          }
          // Match other routes
          const pathParts = path.split('/')
          const firstPart = pathParts.length > 1 ? '/' + pathParts[1] : '/'
          
          // Special handling for nested routes
          if (firstPart === '/acm-rank' || firstPart === '/oi-rank') {
            return firstPart
          }
          
          return firstPart
        } catch (error) {
          console.error('[NavBar] Error computing activeMenu:', error)
          return '/'
        }
      },
      modalVisible: {
        get () {
          return this.modalStatus.visible
        },
        set (value) {
          this.changeModalStatus({visible: value})
        }
      }
    }
  }
</script>

<style lang="less" scoped>
  #header {
    min-width: 300px;
    position: fixed;
    top: 0;
    left: 0;
    height: 60px;
    width: 100%;
    z-index: 1000;
    background-color: #fff;
    box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.1);
    
    .oj-menu {
      background: #fff;
      border-bottom: none;
      height: 60px;
      position: relative;
      
      &:deep(.ivu-menu-horizontal) {
        height: 60px;
        line-height: 60px;
      }
      
      &:deep(.ivu-menu-item) {
        padding: 0 20px;
        height: 60px;
        line-height: 60px;
        
        &:hover {
          color: #2d8cf0;
          border-bottom: 2px solid #2d8cf0;
        }
        
        &-active {
          color: #2d8cf0;
          border-bottom: 2px solid #2d8cf0;
        }
      }
      
      &:deep(.ivu-menu-submenu) {
        padding: 0 20px;
        height: 60px;
        
        .ivu-menu-submenu-title {
          height: 60px;
          line-height: 60px;
          padding: 0;
        }
      }
    }

    .logo {
      margin-left: 2%;
      margin-right: 2%;
      font-size: 20px;
      float: left;
      line-height: 60px;
      color: #17233d;
      font-weight: 500;
    }

    .user-menu-container {
      float: right;
      display: flex;
      align-items: center;
      gap: 12px;
      position: absolute;
      right: 20px;
      top: 50%;
      transform: translateY(-50%);
      
      .menu-item-wrapper {
        display: inline-flex;
        align-items: center;
        height: 36px;
      }
    }
    
    .drop-menu {
      position: relative;
      display: inline-block;
      vertical-align: middle;
      
      &-title {
        font-size: 14px;
        color: #515a6e;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 14px;
        text-decoration: none;
        border-radius: 20px;
        background: #f7f8fa;
        transition: all 0.2s;
        border: 1px solid transparent;
        height: 36px;
        vertical-align: middle;
        box-sizing: border-box;
        
        &:hover {
          color: #2d8cf0;
          text-decoration: none;
          background: #e8f4ff;
          border-color: #d1e9ff;
          
          .navbar-avatar {
            border-color: #2d8cf0;
            box-shadow: 0 0 0 2px rgba(45, 140, 240, 0.1);
          }
        }
        
        .navbar-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          object-fit: cover;
          border: 1px solid #e8eaec;
          transition: all 0.3s ease;
        }

        .username-text {
          font-weight: 500;
          max-width: 100px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          line-height: 1;
        }
      }
      
      // Custom dropdown styles
      .custom-dropdown {
        position: relative;
        display: inline-block;
        cursor: pointer;
        
        .custom-dropdown-menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          background: white;
          border: 1px solid #dcdee2;
          border-radius: 8px;
          box-shadow: 0 2px 12px rgba(0,0,0,.1);
          min-width: 160px;
          z-index: 9999;
          padding: 4px 0;
          
          .dropdown-item {
            display: block;
            padding: 5px 12px;
            color: #515a6e;
            text-decoration: none;
            cursor: pointer;
            transition: all .2s ease-in-out;
            font-size: 13px;
            line-height: 1.5;
            
            &:hover {
              background-color: #f3f3f3;
              color: #2d8cf0;
            }
          }
          
          .dropdown-divider {
            height: 1px;
            margin: 3px 0;
            background-color: #e8eaec;
          }
        }
      }
    }
    
    .btn-menu {
      font-size: 14px;
      float: right;
      margin-right: 20px;
      height: 60px;
      display: flex;
      align-items: center;
      
      .ivu-btn {
        margin-left: 10px;
        visibility: visible !important;
        opacity: 1 !important;
        display: inline-block !important;
        border-color: #dcdee2;
        color: #515a6e;
        
        &:hover {
          border-color: #2d8cf0;
          color: #2d8cf0;
        }
        
        &:first-child {
          margin-left: 0;
        }
      }
    }
  }

  .modal {
    &-title {
      font-size: 18px;
      font-weight: 600;
    }
  }
</style>