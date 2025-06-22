<template>
  <div>
    <h1>OnlineJudge - Migration in Progress</h1>
    <p>The application is being migrated to Vue 3. Core infrastructure is ready.</p>
    <p>Components are being updated...</p>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'AppSimple',
  mounted() {
    console.log('App mounted - Vue 3 is working!')
  }
}
</script>

<style>
body {
  margin: 0;
  padding: 20px;
  font-family: Arial, sans-serif;
}
</style>