<template>
  <div style="margin: 0px 0px 15px 0px">
    <Row type="flex" justify="space-between" class="header">
      <Col :span=12>
      <div>
        <span>{{$t('m.Language')}}:</span>
        <Select :model-value="language" @update:model-value="onLangChange" class="adjust">
          <Option v-for="item in languages" :key="item" :value="item">{{item}}
          </Option>
        </Select>

        <Tooltip :content="$t('m.Reset_to_default_code_definition')" placement="top" style="margin-left: 10px">
          <Button icon="refresh" @click="onResetClick"></Button>
        </Tooltip>

        <Tooltip :content="$t('m.Upload_file')" placement="top" style="margin-left: 10px">
          <Button icon="upload" @click="onUploadFile"></Button>
        </Tooltip>

        <input type="file" id="file-uploader" style="display: none" @change="onUploadFileDone">

      </div>
      </Col>
      <Col :span=12>
      <div class="fl-right">
        <span>{{$t('m.Theme')}}:</span>
        <Select :model-value="theme" @update:model-value="onThemeChange" class="adjust">
          <Option v-for="item in themes" :key="item.label" :value="item.value">{{item.label}}
          </Option>
        </Select>
      </div>
      </Col>
    </Row>
    <Codemirror :model-value="value" :options="options" @update:model-value="onEditorCodeChange" ref="myEditor">
    </Codemirror>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import utils from '@/utils/utils'
import { Codemirror } from 'vue-codemirror'

// theme
import 'codemirror/theme/monokai.css'
import 'codemirror/theme/solarized.css'
import 'codemirror/theme/material.css'

// mode
import 'codemirror/mode/clike/clike.js'
import 'codemirror/mode/python/python.js'
import 'codemirror/mode/go/go.js'
import 'codemirror/mode/javascript/javascript.js'

// active-line.js
import 'codemirror/addon/selection/active-line.js'

// foldGutter
import 'codemirror/addon/fold/foldgutter.css'
import 'codemirror/addon/fold/foldgutter.js'
import 'codemirror/addon/fold/brace-fold.js'
import 'codemirror/addon/fold/indent-fold.js'

export default defineComponent({
  name: 'CodeMirror',
  components: {
    Codemirror
  },
  props: {
    value: {
      type: String,
      default: ''
    },
    languages: {
      type: Array,
      default: () => {
        return ['C', 'C++', 'Java', 'Python2']
      }
    },
    language: {
      type: String,
      default: 'C++'
    },
    theme: {
      type: String,
      default: 'solarized'
    }
  },
  emits: ['update:model-value', 'changeLang', 'changeTheme', 'resetCode'],
  setup(props, { emit }) {
    const { t } = useI18n()
    const myEditor = ref(null)

    const options = ref({
      // codemirror options
      tabSize: 4,
      mode: 'text/x-csrc',
      theme: 'solarized',
      lineNumbers: true,
      line: true,
      // 代码折叠
      foldGutter: true,
      gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
      // 选中文本自动高亮，及高亮方式
      styleSelectedText: true,
      lineWrapping: true,
      highlightSelectionMatches: {showToken: /\w/, annotateScrollbar: true}
    })

    const mode = ref({
      'C++': 'text/x-csrc'
    })

    const themes = ref([
      {label: t('m.Monokai'), value: 'monokai'},
      {label: t('m.Solarized_Light'), value: 'solarized'},
      {label: t('m.Material'), value: 'material'}
    ])

    const editor = computed(() => {
      return myEditor.value?.editor
    })

    onMounted(() => {
      utils.getLanguages().then(languages => {
        let modeMap = {}
        languages.forEach(lang => {
          modeMap[lang.name] = lang.content_type
        })
        mode.value = modeMap
        editor.value?.setOption('mode', mode.value[props.language])
      })
      editor.value?.focus()
    })

    watch(() => props.theme, (newVal) => {
      editor.value?.setOption('theme', newVal)
    })

    const onEditorCodeChange = (newCode) => {
      emit('update:model-value', newCode)
    }

    const onLangChange = (newVal) => {
      editor.value?.setOption('mode', mode.value[newVal])
      emit('changeLang', newVal)
    }

    const onThemeChange = (newTheme) => {
      editor.value?.setOption('theme', newTheme)
      emit('changeTheme', newTheme)
    }

    const onResetClick = () => {
      emit('resetCode')
    }

    const onUploadFile = () => {
      document.getElementById('file-uploader').click()
    }

    const onUploadFileDone = () => {
      let f = document.getElementById('file-uploader').files[0]
      let fileReader = new window.FileReader()
      fileReader.onload = function (e) {
        var text = e.target.result
        editor.value?.setValue(text)
        document.getElementById('file-uploader').value = ''
      }
      fileReader.readAsText(f, 'UTF-8')
    }

    return {
      myEditor,
      options,
      mode,
      themes,
      editor,
      onEditorCodeChange,
      onLangChange,
      onThemeChange,
      onResetClick,
      onUploadFile,
      onUploadFileDone
    }
  }
})
</script>

<style lang="less" scoped>
  .header {
    margin: 5px 5px 15px 5px;
    .adjust {
      width: 150px;
      margin-left: 10px;
    }
    .fl-right {
      float: right;
    }
  }
</style>

<style>
  .CodeMirror {
    height: auto !important;
  }
  .CodeMirror-scroll {
    min-height: 300px;
    max-height: 1000px;
  }
</style>
