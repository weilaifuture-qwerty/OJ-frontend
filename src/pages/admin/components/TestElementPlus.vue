<template>
  <div class="test-element-plus">
    <h3>ElementPlus Test</h3>
    <el-button type="primary">Test Button</el-button>
    <el-menu>
      <el-menu-item index="1">Menu Item 1</el-menu-item>
      <el-submenu index="2">
        <template #title>Submenu</template>
        <el-menu-item index="2-1">Submenu Item 1</el-menu-item>
      </el-submenu>
    </el-menu>
  </div>
</template>

<script>
export default {
  name: 'TestElementPlus'
}
</script>