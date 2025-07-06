<template>
  <div class="layout-test">
    <h1>Layout Test Page</h1>
    <div class="test-content">
      <p>This is a test page to verify the layout is centered correctly.</p>
      <div class="box-container">
        <div class="box">Box 1</div>
        <div class="box">Box 2</div>
        <div class="box">Box 3</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LayoutTest'
}
</script>

<style scoped lang="less">
.layout-test {
  width: 100%;
  padding: 20px;
  
  h1 {
    text-align: center;
    margin-bottom: 30px;
  }
  
  .test-content {
    max-width: 1200px;
    margin: 0 auto;
    background: white;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  
  .box-container {
    display: flex;
    gap: 20px;
    margin-top: 20px;
    
    .box {
      flex: 1;
      padding: 20px;
      background: #f0f2f5;
      border-radius: 4px;
      text-align: center;
    }
  }
}
</style>