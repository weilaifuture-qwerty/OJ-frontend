<template>
  <Menu v-if="isReady" v-bind="$attrs" v-on="$listeners">
    <slot></slot>
  </Menu>
</template>

<script>
export default {
  name: 'SafeMenu',
  data() {
    return {
      isReady: false
    }
  },
  mounted() {
    // Delay menu initialization to avoid ViewUI Plus initialization errors
    this.$nextTick(() => {
      setTimeout(() => {
        this.isReady = true
      }, 50)
    })
  }
}
</script>