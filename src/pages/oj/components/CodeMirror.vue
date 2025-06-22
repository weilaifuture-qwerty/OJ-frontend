<template>
  <div style="margin: 0px 0px 15px 0px">
    <Row type="flex" justify="space-between" class="header">
      <Col :span=12>
      <div>
        <span>{{$t('m.Language')}}:</span>
        <Select :value="language" @update:modelValue="onLangChange" class="adjust">
          <Option v-for="item in languages" :key="item" :value="item">{{item}}
          </Option>
        </Select>

        <Tooltip :content="this.$i18n.t('m.Reset_to_default_code_definition')" placement="top" style="margin-left: 10px">
          <Button icon="md-refresh" @click="onResetClick"></Button>
        </Tooltip>

        <Tooltip :content="this.$i18n.t('m.Upload_file')" placement="top" style="margin-left: 10px">
          <Button icon="md-cloud-upload" @click="onUploadFile"></Button>
        </Tooltip>

        <input type="file" id="file-uploader" style="display: none" @change="onUploadFileDone">
      </div>
      </Col>
      <Col :span=12>
      <div class="fl-right">
        <span>{{$t('m.Theme')}}:</span>
        <Select :value="theme" @update:modelValue="onThemeChange" class="adjust">
          <Option v-for="item in themes" :key="item.label" :value="item.value">{{item.label}}
          </Option>
        </Select>
      </div>
      </Col>
    </Row>
    <div class="code-editor-wrapper">
      <textarea
        ref="codeEditor"
        v-model="code"
        class="code-editor"
        :class="'theme-' + theme"
        @input="onEditorChange"
      ></textarea>
    </div>
  </div>
</template>

<script>
import utils from '@/utils/utils'

export default {
  name: 'CodeMirror',
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
    }
  },
  data() {
    return {
      code: this.value,
      editor: null,
      theme: 'solarized',
      themes: [
        { label: this.$i18n.t('m.Monokai'), value: 'monokai' },
        { label: this.$i18n.t('m.Solarized_Light'), value: 'solarized' },
        { label: this.$i18n.t('m.Material'), value: 'material' }
      ]
    }
  },
  mounted() {
    utils.getLanguages().then(res => {
      let data = res.data.data
      let supported_languages = data.languages
      let languages = []
      for (let lang of supported_languages) {
        if (lang.name && lang.content_type) {
          languages.push(lang.name)
        }
      }
      this.languages = languages
      this.$emit('changeLang', this.language)
    })
  },
  watch: {
    value(newVal) {
      if (this.code !== newVal) {
        this.code = newVal
      }
    }
  },
  methods: {
    onEditorChange() {
      this.$emit('input', this.code)
      this.$emit('change', this.code)
    },
    onLangChange(newLang) {
      if (newLang !== this.language) {
        this.$emit('changeLang', newLang)
      }
      this.$emit('resetCode')
    },
    onThemeChange(newTheme) {
      this.theme = newTheme
    },
    onResetClick() {
      this.$emit('resetCode')
    },
    onUploadFile() {
      document.getElementById('file-uploader').click()
    },
    onUploadFileDone() {
      let f = document.getElementById('file-uploader').files[0]
      let fileReader = new window.FileReader()
      let self = this
      fileReader.onload = function (e) {
        self.code = e.target.result
        self.onEditorChange()
      }
      fileReader.readAsText(f, 'UTF-8')
    }
  }
}
</script>

<style lang="less" scoped>
.header {
  font-size: 12px;
  margin: 0 0 15px 0;
  
  .adjust {
    width: 150px;
    margin-left: 10px;
  }
  .fl-right {
    float: right;
  }
}

.code-editor-wrapper {
  width: 100%;
  position: relative;
}

.code-editor {
  width: 100%;
  min-height: 400px;
  padding: 10px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 14px;
  line-height: 1.5;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  resize: vertical;
  tab-size: 4;
  -moz-tab-size: 4;
  -o-tab-size: 4;
  -webkit-tab-size: 4;
}

.code-editor:focus {
  outline: none;
  border-color: #409eff;
}

/* Theme styles */
.theme-monokai {
  background-color: #272822;
  color: #f8f8f2;
}

.theme-solarized {
  background-color: #fdf6e3;
  color: #657b83;
}

.theme-material {
  background-color: #263238;
  color: #aabfc9;
}
</style>