<template>
  <div class="simditor-wrapper">
    <el-input
      type="textarea"
      v-model="content"
      :autosize="{ minRows: 10, maxRows: 30 }"
      placeholder="Enter content here..."
      @input="handleInput"
    />
    <div class="editor-tips">
      <small>Tip: You can use Markdown syntax. HTML is also supported.</small>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Simditor',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    value: {
      type: String,
      default: ''
    },
    toolbar: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:modelValue', 'input', 'change'],
  data() {
    return {
      content: this.modelValue || this.value
    }
  },
  watch: {
    modelValue(newVal) {
      if (newVal !== this.content) {
        this.content = newVal
      }
    },
    value(newVal) {
      if (newVal !== this.content) {
        this.content = newVal
      }
    }
  },
  methods: {
    handleInput(value) {
      this.$emit('update:modelValue', value)
      this.$emit('input', value)
      this.$emit('change', value)
    }
  }
}
</script>

<style lang="less" scoped>
.simditor-wrapper {
  width: 100%;
  
  .editor-tips {
    margin-top: 5px;
    color: #909399;
    font-size: 12px;
  }
}
</style>