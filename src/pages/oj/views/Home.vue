<template>
  <div class="home">
    <Row type="flex" justify="center" align="middle" class="container">
      <Col :span="24">
        <Card class="welcome-card">
          <div slot="title">
            <Icon type="home"></Icon>
            {{ $t('m.Welcome_to') }} OnlineJudge
          </div>
          <div class="welcome-content">
            <h2>{{ $t('m.Welcome_to') }} OnlineJudge</h2>
            <p>{{ $t('m.Welcome_to_use') }}</p>
          </div>
        </Card>
      </Col>
    </Row>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {}
  }
}
</script>

<style scoped lang="less">
.home {
  .container {
    margin-top: 20px;
  }
  .welcome-card {
    text-align: center;
    .welcome-content {
      padding: 20px;
      h2 {
        margin-bottom: 20px;
      }
    }
  }
}
</style> 