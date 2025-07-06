<!-- eslint-disable -->
<!-- unplugin-vue-components disabled -->
<template>
  <el-menu class="vertical_menu"
           :router="true" :default-active="currentPath">
    <div class="logo">
      <img src="../../../assets/logo.svg" alt="oj admin"/>
    </div>
    <el-menu-item index="/"><i class="fas fa-tachometer-alt"></i> {{$t('m.Dashboard')}}</el-menu-item>
    <el-submenu index="general">
      <template #title><el-icon><Menu /></el-icon>{{$t('m.General')}}</template>
      <el-menu-item index="/user">{{$t('m.Students')}}</el-menu-item>
      <el-menu-item index="/announcement">{{$t('m.Announcement')}}</el-menu-item>
      <el-menu-item index="/conf">{{$t('m.System_Config')}}</el-menu-item>
      <el-menu-item index="/judge-server">{{$t('m.Judge_Server')}}</el-menu-item>
      <el-menu-item index="/prune-test-case">{{$t('m.Prune_Test_Case')}}</el-menu-item>
    </el-submenu>
    <el-submenu index="problem" v-if="hasProblemPermission">
      <template #title><i class="fas fa-bars"></i> {{$t('m.Problem')}}</template>
      <el-menu-item index="/problems">{{$t('m.Problem_List')}}</el-menu-item>

    </el-submenu>
    <el-submenu index="contest">
      <template #title><i class="fas fa-trophy"></i> {{$t('m.Contest')}}</template>
      <el-menu-item index="/contest">{{$t('m.Contest_List')}}</el-menu-item>
      <!-- Hidden Create Contest
      <el-menu-item index="/contest/create">{{$t('m.Create_Contest')}}</el-menu-item>
      -->
    </el-submenu>
    <el-submenu index="homework">
      <template #title><i class="fas fa-book"></i> {{$t('m.Homework')}}</template>
      <el-menu-item index="/homework/admin-student" v-if="isSuperAdmin">{{$t('m.Admin_Student_Management')}}</el-menu-item>
      <el-menu-item index="/homework">{{$t('m.Homework_List')}}</el-menu-item>
    </el-submenu>
  </el-menu>
</template>

<script>
  import { useRoute } from 'vue-router'
  import { useAdminStore } from '@/stores/admin'
  import { computed, ref, onMounted } from 'vue'
  import { Menu } from '@element-plus/icons-vue'

  export default {
    name: 'SideMenu',
    components: {
      Menu
    },
    setup() {
      const route = useRoute()
      const adminStore = useAdminStore()
      const currentPath = ref('')
      
      onMounted(() => {
        currentPath.value = route.path
        console.log('[SideMenu Debug] User:', user.value)
        console.log('[SideMenu Debug] User.user:', user.value?.user)
        console.log('[SideMenu Debug] Is Super Admin:', isSuperAdmin.value)
        console.log('[SideMenu Debug] Admin Type from user:', user.value?.admin_type)
        console.log('[SideMenu Debug] Admin Type from user.user:', user.value?.user?.admin_type)
      })
      
      const user = computed(() => adminStore.user)
      const isSuperAdmin = computed(() => adminStore.isSuperAdmin)
      const isAdminRole = computed(() => adminStore.isAdminRole)
      const hasProblemPermission = computed(() => {
        return adminStore.user?.problem_permission !== 'None'
      })
      
      return {
        currentPath,
        user,
        isSuperAdmin,
        isAdminRole,
        hasProblemPermission
      }
    }
  }
</script>

<style scoped lang="less">
  .vertical_menu {
    overflow: auto;
    width: 205px;
    height: 100%;
    position: fixed !important;
    z-index: 100;
    top: 0;
    bottom: 0;
    left: 0;
    .logo {
      margin: 20px 0;
      text-align: center;
      img {
        background-color: #fff;
        border-radius: 50%;
        border: 3px solid #fff;
        width: 75px;
        height: 75px;
      }
    }
  }
</style>
