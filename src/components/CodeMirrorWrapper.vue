<template>
  <div ref="editorElement"></div>
</template>

<script>
import { defineComponent, ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import CodeMirror from 'codemirror'
import 'codemirror/lib/codemirror.css'

export default defineComponent({
  name: 'CodeMirrorWrapper',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    options: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['update:modelValue', 'ready'],
  setup(props, { emit }) {
    const editorElement = ref(null)
    let editor = null
    let isInternalChange = false

    onMounted(() => {
      // Initialize CodeMirror
      editor = CodeMirror(editorElement.value, {
        value: props.modelValue || '',
        ...props.options
      })

      // Handle editor changes
      editor.on('change', () => {
        if (!isInternalChange) {
          emit('update:modelValue', editor.getValue())
        }
      })

      // Emit ready event
      emit('ready', editor)
    })

    // Watch for external value changes
    watch(() => props.modelValue, (newValue) => {
      if (editor && editor.getValue() !== newValue) {
        isInternalChange = true
        const cursor = editor.getCursor()
        editor.setValue(newValue || '')
        editor.setCursor(cursor)
        nextTick(() => {
          isInternalChange = false
        })
      }
    })

    // Watch for options changes
    watch(() => props.options, (newOptions) => {
      if (editor) {
        Object.keys(newOptions).forEach(key => {
          editor.setOption(key, newOptions[key])
        })
      }
    }, { deep: true })

    onBeforeUnmount(() => {
      if (editor) {
        editor.toTextArea()
      }
    })

    return {
      editorElement
    }
  }
})
</script>