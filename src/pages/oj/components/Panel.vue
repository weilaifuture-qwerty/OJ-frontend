<template>
  <Card :padding="padding" :shadow="shadow" :dis-hover="disHover" :bordered="bordered">
    <template #title>
      <div class="panel-title">
        <slot name="title"></slot>
      </div>
    </template>
    <template #extra>
      <div class="panel-extra">
        <slot name="extra"></slot>
      </div>
    </template>
    <div class="panel-body">
      <slot></slot>
    </div>
  </Card>
</template>

<script>
  export default {
    name: 'Panel',
    props: {
      shadow: {
        required: false,
        type: Boolean,
        default: false
      },
      padding: {
        required: false,
        type: Number,
        default: 0
      },
      disHover: {
        required: false,
        type: Boolean,
        default: false
      },
      bordered: {
        required: false,
        type: Boolean,
        default: true
      }
    }
  }
</script>

<style lang="less">
  @import (reference) '../../../styles/common.less';

  .panel-title {
    font-size: 18px;
    font-weight: 500;
    line-height: 1;
  }

  .panel-extra {
    line-height: 32px;
    .ivu-input-icon {
      line-height: 32px;
    }
    ul.filter {
      list-style: none;
      margin: 0;
      padding: 0;
      display: inline-block;
      > li {
        display: inline-block;
        padding: 0 10px;
        vertical-align: middle;
      }
    }
  }
  .panel-body {
    word-break: break-word;
    word-wrap: break-word;
    padding: 16px;
  }
</style>
