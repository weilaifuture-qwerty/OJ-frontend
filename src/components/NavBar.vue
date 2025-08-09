<template>
  <div class="navbar">
    <div class="navbar-logo">
      <router-link to="/">QDUOJ</router-link>
    </div>
    <ul class="navbar-menu">
      <li><router-link to="/">Home</router-link></li>
      <li><router-link to="/problem">Problems</router-link></li>
      <li><router-link to="/contest">Contests</router-link></li>
      <li><router-link to="/status">Status</router-link></li>
      <li><router-link to="/rank">Rank</router-link></li>
      <li><router-link to="/about">About</router-link></li>
    </ul>
    <div class="navbar-actions">
      <router-link to="/login" class="btn">Login</router-link>
      <router-link to="/register" class="btn">Register</router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NavBar'
}
</script>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #eee;
  padding: 0 32px;
  height: 56px;
}
.navbar-logo {
  font-weight: bold;
  font-size: 22px;
}
.navbar-menu {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}
.navbar-menu li {
  margin: 0 16px;
}
.navbar-actions .btn {
  margin-left: 12px;
  padding: 4px 16px;
  border: 1px solid #dcdcdc;
  border-radius: 16px;
  background: #fff;
  color: #333;
  text-decoration: none;
  transition: background 0.2s;
}
.navbar-actions .btn:hover {
  background: #f5f5f5;
}
</style> 