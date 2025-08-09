<template>
  <div class="code-mirror-container">
    <textarea ref="textarea"></textarea>
  </div>
</template>

<script>
import CodeMirror from 'codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/monokai.css'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/mode/python/python'
import 'codemirror/mode/clike/clike'

export default {
  name: 'CodeMirror',
  props: {
    value: {
      type: String,
      default: ''
    },
    language: {
      type: String,
      default: 'javascript'
    }
  },
  data() {
    return {
      editor: null
    }
  },
  mounted() {
    this.editor = CodeMirror.fromTextArea(this.$refs.textarea, {
      mode: this.language,
      theme: 'monokai',
      lineNumbers: true,
      indentUnit: 2,
      smartIndent: true,
      tabSize: 2,
      indentWithTabs: false,
      lineWrapping: true,
      matchBrackets: true,
      autoCloseBrackets: true
    })

    this.editor.setValue(this.value)
    this.editor.on('change', () => {
      this.$emit('input', this.editor.getValue())
    })
  },
  watch: {
    value(newVal) {
      if (this.editor && newVal !== this.editor.getValue()) {
        this.editor.setValue(newVal)
      }
    },
    language(newVal) {
      if (this.editor) {
        this.editor.setOption('mode', newVal)
      }
    }
  },
  beforeDestroy() {
    if (this.editor) {
      this.editor.toTextArea()
    }
  }
}
</script>

<style scoped>
.code-mirror-container {
  height: 100%;
  width: 100%;
}
.code-mirror-container :deep(.CodeMirror) {
  height: 100%;
  font-size: 14px;
}
</style> 