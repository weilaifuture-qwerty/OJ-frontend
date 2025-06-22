<template>
  <div class="container">
    <div>
      <SideMenu></SideMenu>
    </div>
    <div id="header">
      <i class="fas fa-font katex-editor" @click="katexVisible=true" ></i>
      <screen-full :width="14" :height="14" class="screen-full"></screen-full>
      <el-dropdown @command="handleCommand">
        <span class="el-dropdown-link">
          {{user.username}}
          <el-icon class="el-icon--right"><arrow-down /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="logout">Logout</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <div class="content-app">
      <transition name="fadeInUp" mode="out-in">
        <router-view></router-view>
      </transition>
      <div class="footer">
        Build Version: {{ version }}
      </div>
    </div>

    <el-dialog :title="$t('m.Latex_Editor')" v-model="katexVisible">
      <KatexEditor></KatexEditor>
    </el-dialog>
  </div>
</template>

<script>
  import { useAdminStore } from '@/stores/admin'
  import { useRouter } from 'vue-router'
  import { ArrowDown } from '@element-plus/icons-vue'
  import SideMenu from '../components/SideMenu.vue'
  import ScreenFull from '@admin/components/ScreenFull.vue'
  import KatexEditor from '@admin/components/KatexEditor.vue'

  export default {
    name: 'app',
    setup() {
      const adminStore = useAdminStore()
      const router = useRouter()
      
      return {
        adminStore,
        router
      }
    },
    data () {
      return {
        version: import.meta.env.VERSION,
        katexVisible: false
      }
    },
    components: {
      SideMenu,
      KatexEditor,
      ScreenFull,
      ArrowDown
    },
    async beforeMount() {
      try {
        await this.adminStore.getProfile()
      } catch (error) {
        // Not logged in
        this.router.push({name: 'login'})
      }
    },
    methods: {
      async handleCommand (command) {
        if (command === 'logout') {
          await this.adminStore.logout()
          this.router.push({name: 'login'})
        }
      }
    },
    computed: {
      user() {
        return this.adminStore.user || {}
      }
    }
  }
</script>

<style lang="less">
  a {
    background-color: transparent;
  }

  a:active, a:hover {
    outline-width: 0
  }

  img {
    border-style: none
  }

  .container {
    overflow: auto;
    font-weight: 400;
    height: 100%;
    -webkit-font-smoothing: antialiased;
    background-color: #EDECEC;
    overflow-y: scroll;
    min-width: 1000px;
  }

  * {
    box-sizing: border-box;
  }

  #header {
    text-align: right;
    padding-left: 210px;
    padding-right: 30px;
    line-height: 50px;
    height: 50px;
    background: #F9FAFC;
    .screen-full {
      margin-right: 8px;
    }
  }

  .content-app {
    padding-top: 20px;
    padding-right: 10px;
    padding-left: 210px;
  }

  .footer {
    margin: 15px;
    text-align: center;
    font-size: small;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translate(0, 30px);
    }

    to {
      opacity: 1;
      transform: none;
    }
  }

  .fadeInUp-enter-active {
    animation: fadeInUp .8s;
  }

  .katex-editor {
    margin-right: 5px;
    /*font-size: 18px;*/
  }

  .el-dropdown-link {
    cursor: pointer;
    color: #409eff;
    display: flex;
    align-items: center;
  }
  
  .el-icon--right {
    margin-left: 5px;
  }

</style>
