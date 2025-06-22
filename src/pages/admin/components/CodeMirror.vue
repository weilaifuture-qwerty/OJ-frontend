<template>
  <div class="codemirror-wrapper">
    <textarea
      v-model="currentValue"
      class="code-editor"
      :style="{ fontFamily: 'monospace', fontSize: '14px' }"
      @input="handleInput"
    ></textarea>
  </div>
</template>

<script>
export default {
  name: 'CodeMirror',
  props: {
    value: {
      type: String,
      default: ''
    },
    mode: {
      type: String,
      default: 'text/x-csrc'
    }
  },
  data() {
    return {
      currentValue: this.value,
      options: {
        mode: 'text/x-csrc',
        lineNumbers: true,
        lineWrapping: false,
        theme: 'solarized',
        tabSize: 4,
        line: true,
        foldGutter: true,
        gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
        autofocus: true
      }
    }
  },
  watch: {
    value(newVal) {
      if (this.currentValue !== newVal) {
        this.currentValue = newVal
      }
    }
  },
  methods: {
    handleInput() {
      this.$emit('change', this.currentValue)
      this.$emit('input', this.currentValue)
    },
    setValue(value) {
      this.currentValue = value
    },
    getValue() {
      return this.currentValue
    }
  }
}
</script>

<style scoped>
.codemirror-wrapper {
  width: 100%;
  height: 100%;
}

.code-editor {
  width: 100%;
  min-height: 300px;
  padding: 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
}

.code-editor:focus {
  outline: none;
  border-color: #409eff;
}
</style>