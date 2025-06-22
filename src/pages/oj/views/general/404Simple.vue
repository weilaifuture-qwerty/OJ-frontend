<template>
  <div class="not-found">
    <h1>404</h1>
    <p>Page not found</p>
    <router-link to="/">Go Home</router-link>
  </div>
</template>

<script>
export default {
  name: 'NotFound'
}
</script>

<style scoped>
.not-found {
  text-align: center;
  padding: 50px;
}
</style>