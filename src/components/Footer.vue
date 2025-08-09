<template>
  <footer class="footer">
    <div class="footer-content">
      QDUOJ<br />
      Powered by <a href="https://github.com/QingdaoU/OnlineJudgeFE" target="_blank">OnlineJudge</a>
      <span class="footer-version">Version: 20210928-acce7</span>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer'
}
</script>

<style scoped>
.footer {
  width: 100%;
  background: #f8f8f8;
  border-top: 1px solid #eee;
  text-align: center;
  padding: 16px 0 8px 0;
  color: #888;
  position: relative;
  bottom: 0;
}
.footer-content {
  font-size: 14px;
}
.footer-version {
  margin-left: 8px;
  color: #bbb;
}
</style> 