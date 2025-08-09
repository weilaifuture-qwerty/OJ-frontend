<template>
  <div class="live-code-container">
    <Card>
      <template #title>
        <Icon type="code"></Icon>
        <span class="card-title">{{$t('m.Live_Code')}}</span>
      </template>
      <div class="live-code-content">
        <div class="editor-section">
          <div class="language-selector">
            <Select v-model="language" style="width: 120px">
              <Option v-for="lang in languages" :key="lang" :value="lang">{{lang}}</Option>
            </Select>
          </div>
          <CodeMirror
            v-model="code"
            :mode="language"
            :theme="theme"
            @update:modelValue="onCodeChange"
          ></CodeMirror>
        </div>
        <div class="test-section">
          <div class="test-input">
            <div class="section-title">{{$t('m.Test_Input')}}</div>
            <Input
              v-model="testInput"
              type="textarea"
              :rows="6"
              :placeholder="$t('m.Enter_Test_Case')"
            ></Input>
          </div>
          <div class="test-output">
            <div class="section-title">{{$t('m.Test_Output')}}</div>
            <div class="output-content" v-html="formattedOutput"></div>
          </div>
        </div>
        <div class="action-buttons">
          <Button type="primary" @click="runCode" :loading="running">
            {{$t('m.Run_Code')}}
          </Button>
          <Button @click="resetCode" style="margin-left: 10px">
            {{$t('m.Reset')}}
          </Button>
        </div>
      </div>
    </Card>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import CodeMirror from '@/pages/oj/components/CodeMirror.vue'
import api from '@/api'

export default defineComponent({
  name: 'LiveCode',
  components: {
    CodeMirror
  },
  props: {
    problem: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const store = useStore()
    const { t } = useI18n()
    
    const code = ref('')
    const language = ref('C++')
    const theme = ref('solarized')
    const testInput = ref('')
    const output = ref('')
    const running = ref(false)
    const languages = ref([])

    const isAuthenticated = computed(() => store.getters.isAuthenticated)
    const formattedOutput = computed(() => {
      if (!output.value) return ''
      return output.value.replace(/\n/g, '<br>')
    })

    onMounted(() => {
      languages.value = props.problem.languages || []
      if (languages.value.length > 0) {
        language.value = languages.value[0]
      }
      // Load template if available
      if (props.problem.template && props.problem.template[language.value]) {
        code.value = props.problem.template[language.value]
      }
    })

    const onCodeChange = (newCode) => {
      code.value = newCode
    }

    const runCode = async () => {
      if (!isAuthenticated.value) {
        Message.warning(t('m.Please_login_first'))
        return
      }
      
      running.value = true
      try {
        const response = await api.runCode({
          problem_id: props.problem._id,
          language: language.value,
          code: code.value,
          test_input: testInput.value
        })
        
        if (response.data.error) {
          output.value = response.data.error
        } else {
          output.value = response.data.output
        }
      } catch (error) {
        output.value = (error.response && error.response.data && error.response.data.message) || t('m.Run_Error')
      } finally {
        running.value = false
      }
    }

    const resetCode = () => {
      if (props.problem.template && props.problem.template[language.value]) {
        code.value = props.problem.template[language.value]
      } else {
        code.value = ''
      }
      testInput.value = ''
      output.value = ''
    }

    return {
      code,
      language,
      theme,
      testInput,
      output,
      running,
      languages,
      isAuthenticated,
      formattedOutput,
      onCodeChange,
      runCode,
      resetCode
    }
  }
})
</script>

<style lang="less" scoped>
.live-code-container {
  margin-top: 20px;
  
  .live-code-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .editor-section {
    position: relative;
    
    .language-selector {
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 1;
    }
  }

  .test-section {
    display: flex;
    gap: 20px;
    
    .test-input, .test-output {
      flex: 1;
      
      .section-title {
        margin-bottom: 10px;
        font-weight: bold;
      }
    }
    
    .output-content {
      min-height: 150px;
      padding: 10px;
      background: #f8f8f8;
      border: 1px solid #dcdee2;
      border-radius: 4px;
    }
  }

  .action-buttons {
    display: flex;
    justify-content: flex-end;
  }
}
</style> 