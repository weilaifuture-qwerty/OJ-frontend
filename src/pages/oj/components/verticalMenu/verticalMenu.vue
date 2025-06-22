<template>
  <Card :padding="0" dis-hover>
    <ul>
      <slot></slot>
    </ul>
  </Card>
</template>

<script>
  export default {
    name: 'VerticalMenu',
    provide() {
      return {
        rootMenu: this,
        getActiveKey: () => null // Provide a dummy function to prevent errors
      }
    },
    emits: ['on-click'],
    methods: {
      handleItemClick(route) {
        this.$emit('on-click', route)
      }
    }
  }
</script>

<style scoped lang="less">
</style>
