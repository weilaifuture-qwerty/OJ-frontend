<template>
  <div style="margin: 0px 0px 15px 0px">
    <div style="border: 2px solid red; padding: 10px; margin-bottom: 10px;">
      <h4>Debug Info:</h4>
      <p>Current Language: {{ language }}</p>
      <p>Available Languages: {{ availableLanguages.join(', ') }}</p>
      <p>Local Languages: {{ localLanguages.join(', ') }}</p>
      <p>Props Languages: {{ languages.join(', ') }}</p>
    </div>
    
    <Row type="flex" justify="space-between" class="header">
      <Col :span=12>
      <div>
        <span>{{$t('m.Language')}}:</span>
        <Select :modelValue="language" @update:modelValue="onLangChangeDebug" class="adjust">
          <Option v-for="item in availableLanguages" :key="item" :value="item">{{item}}
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
        <Select :modelValue="localTheme" @update:modelValue="onThemeChange" class="adjust">
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
        :class="'theme-' + localTheme"
        @input="onEditorChange"
      ></textarea>
    </div>
    
    <div style="border: 2px solid blue; padding: 10px; margin-top: 10px;">
      <h4>Event Log:</h4>
      <div v-for="(event, index) in eventLog" :key="index">{{ event }}</div>
    </div>
  </div>
</template>

<script>
import utils from '@/utils/utils'

export default {
  name: 'CodeMirrorDebug',
  props: {
    modelValue: {
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
  emits: ['update:modelValue', 'changeLang', 'changeTheme', 'resetCode'],
  data() {
    return {
      code: this.modelValue,
      editor: null,
      localTheme: this.theme,
      themes: [
        { label: this.$i18n.t('m.Monokai'), value: 'monokai' },
        { label: this.$i18n.t('m.Solarized_Light'), value: 'solarized' },
        { label: this.$i18n.t('m.Material'), value: 'material' }
      ],
      localLanguages: [],
      eventLog: []
    }
  },
  computed: {
    availableLanguages() {
      return this.localLanguages.length > 0 ? this.localLanguages : this.languages
    }
  },
  mounted() {
    this.eventLog.push(`Component mounted at ${new Date().toLocaleTimeString()}`)
    utils.getLanguages().then(languages => {
      this.eventLog.push(`Languages loaded: ${languages.length} languages`)
      let languageList = []
      for (let lang of languages) {
        if (lang.name && lang.content_type) {
          languageList.push(lang.name)
        }
      }
      this.localLanguages = languageList
      this.eventLog.push(`Processed languages: ${languageList.join(', ')}`)
      this.$emit('changeLang', this.language)
    }).catch(err => {
      this.eventLog.push(`Error loading languages: ${err.message}`)
      console.error('Failed to load languages:', err)
      this.localLanguages = ['C', 'C++', 'Java', 'Python3', 'Python2', 'JavaScript']
      this.$emit('changeLang', this.language)
    })
  },
  watch: {
    modelValue(newVal) {
      if (this.code !== newVal) {
        this.code = newVal
      }
    },
    theme(newVal) {
      if (this.localTheme !== newVal) {
        this.localTheme = newVal
      }
    }
  },
  methods: {
    onEditorChange() {
      this.$emit('update:modelValue', this.code)
    },
    onLangChangeDebug(newLang) {
      this.eventLog.push(`Language change triggered: ${this.language} -> ${newLang}`)
      console.log('onLangChangeDebug called with:', newLang)
      console.log('Current language:', this.language)
      
      if (newLang !== this.language) {
        this.eventLog.push(`Emitting changeLang event with: ${newLang}`)
        this.$emit('changeLang', newLang)
      }
    },
    onThemeChange(newTheme) {
      this.localTheme = newTheme
      this.$emit('changeTheme', newTheme)
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