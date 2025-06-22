<template>
  <div class="logout">
    <p>Logging out...</p>
  </div>
</template>

<script>
export default {
  name: 'Logout',
  mounted() {
    // Simple logout logic
    setTimeout(() => {
      this.$router.push('/')
    }, 1000)
  }
}
</script>

<style scoped>
.logout {
  text-align: center;
  padding: 50px;
}
</style>