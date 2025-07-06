<template>
  <div style="margin: 0px 0px 15px 0px">
    <Row type="flex" justify="space-between" class="header">
      <Col :span=12>
      <div>
        <span>{{$t('m.Language')}}:</span>
        <i-select 
          v-model="localLanguage" 
          @on-change="onLangChange" 
          class="adjust"
          :transfer="false"
          placement="bottom-start"
          ref="languageSelect">
          <i-option v-for="item in availableLanguages" :key="item" :value="item">{{item}}
          </i-option>
        </i-select>

        <Tooltip :content="this.$i18n.t('m.Reset_to_default_code_definition')" placement="top" style="margin-left: 10px">
          <Button icon="md-refresh" @click="onResetClick"></Button>
        </Tooltip>

        <Tooltip :content="this.$i18n.t('m.Upload_file')" placement="top" style="margin-left: 10px">
          <Button icon="md-cloud-upload" @click="onUploadFile"></Button>
        </Tooltip>
        
        <!-- Temporary debug info -->
        <span style="margin-left: 10px; font-size: 12px; color: #666;">
          Languages: {{ availableLanguages.length }}
        </span>

        <input type="file" id="file-uploader" style="display: none" @change="onUploadFileDone">
      </div>
      </Col>
      <Col :span=12>
      <div class="fl-right">
        <span>{{$t('m.Theme')}}:</span>
        <i-select 
          :model-value="localTheme" 
          @on-change="onThemeChange" 
          class="adjust"
          :transfer="false"
          placement="bottom-start">
          <i-option v-for="item in themes" :key="item.label" :value="item.value">{{item.label}}
          </i-option>
        </i-select>
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
  </div>
</template>

<script>
import utils from '@/utils/utils'

export default {
  name: 'CodeMirror',
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
      localLanguage: this.language, // Add local language state
      themes: [
        { label: this.$i18n.t('m.Monokai'), value: 'monokai' },
        { label: this.$i18n.t('m.Solarized_Light'), value: 'solarized' },
        { label: this.$i18n.t('m.Material'), value: 'material' }
      ],
      // Create a local copy of languages to avoid mutating props
      localLanguages: []
    }
  },
  computed: {
    // Use computed property to handle languages
    availableLanguages() {
      return this.localLanguages.length > 0 ? this.localLanguages : this.languages
    }
  },
  mounted() {
    console.log('[CodeMirror] Component mounted')
    console.log('[CodeMirror] Initial language:', this.language)
    console.log('[CodeMirror] Languages from props:', this.languages)
    
    utils.getLanguages().then(languages => {
      console.log('[CodeMirror] Languages loaded from API:', languages)
      // The languages array is returned directly from utils.getLanguages
      let languageList = []
      for (let lang of languages) {
        if (lang.name && lang.content_type) {
          languageList.push(lang.name)
        }
      }
      this.localLanguages = languageList
      console.log('[CodeMirror] Processed languages:', this.localLanguages)
    }).catch(err => {
      console.error('[CodeMirror] Failed to load languages:', err)
      // Use default languages if loading fails
      this.localLanguages = ['C', 'C++', 'Java', 'Python3', 'Python2', 'JavaScript']
      console.log('[CodeMirror] Using default languages:', this.localLanguages)
    })
    
    // Add a global style check after mount
    this.$nextTick(() => {
      const testDropdown = document.createElement('div')
      testDropdown.className = 'ivu-select-dropdown'
      testDropdown.setAttribute('x-placement', 'bottom')
      document.body.appendChild(testDropdown)
      
      const computed = window.getComputedStyle(testDropdown)
      console.log('[CodeMirror] Test dropdown styles:', {
        display: computed.display,
        visibility: computed.visibility,
        opacity: computed.opacity,
        position: computed.position,
        zIndex: computed.zIndex
      })
      
      document.body.removeChild(testDropdown)
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
    },
    language(newVal) {
      console.log('[CodeMirror] Language prop changed to:', newVal)
      // Update local language when prop changes
      if (this.localLanguage !== newVal) {
        this.localLanguage = newVal
      }
    }
  },
  methods: {
    onEditorChange() {
      this.$emit('update:modelValue', this.code)
    },
    onLangChange(newLang) {
      console.log('[CodeMirror] onLangChange called with:', newLang)
      
      // Update local state
      this.localLanguage = newLang
      
      // Emit to parent
      if (newLang && newLang !== this.language) {
        console.log('[CodeMirror] Emitting changeLang event with:', newLang)
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
    },
    debugDropdown() {
      console.log('[CodeMirror] === DEBUG DROPDOWN ===')
      console.log('[CodeMirror] Languages available:', this.availableLanguages)
      console.log('[CodeMirror] Current language:', this.language)
      console.log('[CodeMirror] Language Select ref:', this.$refs.languageSelect)
      
      // Check all Select components
      const selects = document.querySelectorAll('.ivu-select')
      console.log('[CodeMirror] All Select elements:', selects.length)
      
      selects.forEach((select, index) => {
        console.log(`[CodeMirror] Select ${index}:`, {
          classList: select.classList.toString(),
          visible: select.classList.contains('ivu-select-visible'),
          hasDropdown: select.querySelector('.ivu-select-dropdown') !== null
        })
      })
      
      // Check CSS rules
      const testDiv = document.createElement('div')
      testDiv.className = 'ivu-select-dropdown'
      document.body.appendChild(testDiv)
      const computedStyle = window.getComputedStyle(testDiv)
      console.log('[CodeMirror] Test dropdown CSS:', {
        display: computedStyle.display,
        visibility: computedStyle.visibility,
        opacity: computedStyle.opacity,
        zIndex: computedStyle.zIndex
      })
      document.body.removeChild(testDiv)
      
      // Try to manually trigger dropdown
      if (this.$refs.languageSelect) {
        console.log('[CodeMirror] Attempting to manually open dropdown...')
        // ViewUI Plus Select might have internal methods
        if (this.$refs.languageSelect.toggleMenu) {
          this.$refs.languageSelect.toggleMenu()
        }
      }
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