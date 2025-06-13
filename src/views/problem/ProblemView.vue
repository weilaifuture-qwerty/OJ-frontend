<template>
  <div class="problem-view-container">
    <Row :gutter="16">
      <Col :xs="24" :md="16">
        <Card :padding="20" class="problem-details-card">
          <div v-if="problemStore.isLoading && !problemStore.problem" class="loading-spinner">
            <Spin size="large"></Spin>
          </div>
          <div v-else-if="problemStore.error" class="error-message">
            <Alert type="error" show-icon>
              {{ t('Error_Fetching_Problem_Details') }}: {{ problemStore.error }}
            </Alert>
          </div>
          <div v-else-if="!problemStore.problem" class="no-data">
            <p>{{ t('Problem_Not_Found') }}</p> <!-- Add this translation -->
          </div>
          <template v-else>
            <h2 class="problem-title">{{ problemStore.problem.title }}</h2>
            
            <div class="tags-container">
              <Tag v-for="tag in problemStore.problem.tags" :key="tag" color="blue">{{ tag }}</Tag>
            </div>

            <Divider />
            <h3>{{ t('Description') }}</h3>
            <div v-html="problemStore.problem.description" class="problem-content-box"></div>

            <h3>{{ t('Input') }} {{ t('Description') }}</h3>
            <div v-html="problemStore.problem.input_description" class="problem-content-box"></div>

            <h3>{{ t('Output') }} {{ t('Description') }}</h3>
            <div v-html="problemStore.problem.output_description" class="problem-content-box"></div>

            <div v-for="(sample, index) in problemStore.problem.samples" :key="index" class="sample-box">
              <Row :gutter="16">
                <Col :span="12">
                  <h4>{{ t('Sample_Input') }} #{{ index + 1 }}</h4>
                  <pre class="sample-code">{{ sample.input }}</pre>
                </Col>
                <Col :span="12">
                  <h4>{{ t('Sample_Output') }} #{{ index + 1 }}</h4>
                  <pre class="sample-code">{{ sample.output }}</pre>
                </Col>
              </Row>
            </div>

            <div v-if="problemStore.problem.hint" class="hint-box">
              <h3>{{ t('Hint') }}</h3>
              <div v-html="problemStore.problem.hint" class="problem-content-box"></div>
            </div>
            
            <div v-if="problemStore.problem.source" class="source-box">
                <p><strong>{{ t('Source') }}:</strong> {{ problemStore.problem.source }}</p>
        </div>

          </template>
      </Card>
      </Col>
      <Col :xs="24" :md="8">
        <Card :padding="15" class="problem-info-card">
            <template #title>
                <h3>{{ t('Information') }}</h3>
            </template>
            <div v-if="problemStore.problem">
                <p><strong>ID:</strong> {{ problemStore.problem.display_id || problemStore.problem._id }}</p>
                <p><strong>{{ t('Time_Limit') }}:</strong> {{ problemStore.problem.time_limit }} ms</p>
                <p><strong>{{ t('Memory_Limit') }}:</strong> {{ problemStore.problem.memory_limit }} MB</p>
                <p><strong>{{ t('Difficulty') }}:</strong> <Tag :color="difficultyColor(problemStore.problem.difficulty)">{{ t(problemStore.problem.difficulty) }}</Tag></p>
                <p><strong>{{ t('Total') }} {{ t('Submissions') }}:</strong> {{ problemStore.problem.submission_number }}</p>
                <p><strong>{{ t('Accepted') }} {{ t('Submissions') }}:</strong> {{ problemStore.problem.accepted_number }}</p>
                <p><strong>{{ t('Created') }}:</strong> {{ problemStore.problem.created_by ? problemStore.problem.created_by.username : 'N/A' }}</p>
                <p v-if="problemStore.problem.my_status !== null && problemStore.problem.my_status !== undefined">
                    <strong>{{ t('My_Status') }}:</strong> 
                    <Tag :color="myStatusColor(problemStore.problem.my_status)">
                        {{ myStatusText(problemStore.problem.my_status) }}
                    </Tag>
                </p>
            </div>
            <Divider />
            <!-- Submission Section Placeholder -->
            <div class="submission-section">
              <h3>{{ t('Submit_Code') }}</h3>
              <Form :model="formSubmit" inline style="margin-bottom: 10px;">
              <FormItem :label="t('Language')" style="margin-bottom: 0;">
                  <Select v-model="language" @on-change="onLangChange" style="width:180px;" :placeholder="t('Select_Language')" :loading="problemStore.isLoading && !problemStore.languages.length">
                    <Option v-for="lang in mappedLanguages" :key="lang.value" :value="lang.value">{{ lang.name }}</Option>
                </Select>
              </FormItem>
              <!-- Optional: Theme Selector -->
                <!-- <FormItem :label="t('Theme')" style="margin-bottom: 0;">
                <Select v-model="theme" @on-change="onThemeChange" style="width:150px;">
                  <Option value="default">default</Option>
                  <Option value="material">material</Option>
                </Select>
              </FormItem> -->
            </Form>
              <Codemirror
                v-model="code"
                :extensions="extensions"
                @ready="onCmReady"
                class="code-editor"
              />
              <Button type="primary" long style="margin-top: 15px;" @click="handleSubmitCode" :loading="isSubmitting" :disabled="submissionInProgress">
                {{ submissionInProgress ? t('Submitting_Or_Waiting') : t('Submit') }}
              </Button>
              <div v-if="currentSubmissionId && problemStore.problem" class="submission-status-display">
                <Divider orientation="left">{{ t('Current_Submission_Status') }}</Divider>
                <p v-if="submissionStore.isLoadingDetails && !submissionStore.currentSubmission">
                    <Icon type="ios-loading" class="ivu-load-loop"></Icon> {{ t('Loading_Status') }}...
                </p>
                <Alert v-else-if="submissionStore.currentSubmission" :type="getSubmissionAlertType(submissionStore.currentSubmission.result)" show-icon>
                    {{ t('Status') }}: {{ getResultText(submissionStore.currentSubmission.result) }}
                    <template #desc v-if="submissionStore.currentSubmission.statistic_info">
                        Time: {{ submissionStore.currentSubmission.statistic_info.time_cost || 0 }} ms, 
                        Memory: {{ submissionStore.currentSubmission.statistic_info.memory_cost || 0 }} MB
                        <span v-if="submissionStore.currentSubmission.result === JUDGE_STATUS.CE"> <!-- Assuming JUDGE_STATUS.CE means Compile Error -->
                           <br/> <Button type="info" size="small" @click="showCompileErrorInfo">{{ t('View_Compile_Error') }}</Button>
                        </span>
              </template>
                </Alert>
                <p v-if="submissionStore.error && !submissionStore.isLoadingDetails">Error loading status: {{ submissionStore.error }}</p>
                <router-link :to="`/status/${currentSubmissionId}`" v-if="currentSubmissionId">
                    <Button type="default" long style="margin-top: 10px;">{{ t('View_Submission_Details') }}</Button>
                </router-link>
            </div>
            </div>
        </Card>
          </Col>
        </Row>
     <Modal v-model="showCEModal" :title="t('Compile_Error_Info')" width="600">
        <div v-if="submissionStore.currentSubmission && submissionStore.currentSubmission.statistic_info && submissionStore.currentSubmission.statistic_info.err_info">
            <pre class="compile-error-output">{{ submissionStore.currentSubmission.statistic_info.err_info }}</pre>
        </div>
        <div v-else>
            <p>{{ t('No_Compile_Error_Info') }}</p>
         </div>
         <template #footer>
            <Button type="primary" @click="showCEModal = false">{{ t('Close') }}</Button>
         </template>
      </Modal>
  </div>
</template>

<script setup>
import { onMounted, ref, watch, computed, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useProblemStore } from '@/stores/problemStore';
import { useSubmissionStore } from '@/stores/submissionStore';
import { useI18n } from 'vue-i18n';
import api from '@/api';
import { Message, Modal } from 'view-ui-plus';

// Import Codemirror (vue-codemirror and core)
import { Codemirror } from 'vue-codemirror'; // Named import
import { EditorView, keymap } from '@codemirror/view';
import { Compartment, EditorState } from '@codemirror/state';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp'; // For C, C++, Java (similar syntax)
import { java } from '@codemirror/lang-java';
import { go } from '@codemirror/lang-go';
import { rust } from '@codemirror/lang-rust';
import { oneDark } from '@codemirror/theme-one-dark'; // Example theme
import { bracketMatching } from '@codemirror/language';
import { autocompletion } from '@codemirror/autocomplete'; // For autoCloseBrackets behavior

// Basic setup extension
const basicSetup = [
  EditorView.lineWrapping,
  EditorView.theme({ // Basic styling, can be customized
    "&": {
      fontSize: "14px", // Example: Set font size
    },
    ".cm-gutters": {
      backgroundColor: "#f5f5f5", // Example: Gutter background
      borderRight: "1px solid #ddd",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "#e5f3ff"
    },
     // Ensure the active line highlight is visible with the chosen theme
    ".cm-activeLine": { backgroundColor: "rgba(200, 220, 255, 0.2)" } 
  }),
  EditorState.tabSize.of(4),
  keymap.of([...defaultKeymap, indentWithTab]), // Basic keymap + indent with tab
  bracketMatching(),
  autocompletion(), // Includes closeBrackets-like functionality
];

// Define JUDGE_STATUS constants (mirroring backend or a shared constants file)
// These values should match what your backend returns for submission result/status
// const JUDGE_STATUS = {
//   PENDING: 0,
//   JUDGING: 1,
//   ACCEPTED: 2,
//   WRONG_ANSWER: 3,
//   TIME_LIMIT_EXCEEDED: 4,
//   MEMORY_LIMIT_EXCEEDED: 5,
//   RUNTIME_ERROR: 6,
//   COMPILE_ERROR: 7,
//   SYSTEM_ERROR: 8,
//   PARTIALLY_ACCEPTED: 9, // If you have this status
//   // Add any other specific statuses your OJ uses
// };
import { JUDGE_STATUS } from '@/utils/constants';

// Define finalStates at a scope accessible by both poll and submit functions
const finalStates = [
    JUDGE_STATUS.ACCEPTED,
    JUDGE_STATUS.WRONG_ANSWER,
    JUDGE_STATUS.TIME_LIMIT_EXCEEDED,
    JUDGE_STATUS.MEMORY_LIMIT_EXCEEDED,
    JUDGE_STATUS.RUNTIME_ERROR,
    JUDGE_STATUS.COMPILE_ERROR,
    JUDGE_STATUS.SYSTEM_ERROR,
    JUDGE_STATUS.PARTIALLY_ACCEPTED,
];

const route = useRoute();
const problemStore = useProblemStore();
const submissionStore = useSubmissionStore();
const { t } = useI18n();

const problemID = ref(route.params.problemID);
const contestID = ref(route.params.contestID);
const isSubmitting = ref(false);
const code = ref('');
const language = ref(null);
const theme = ref('oneDark'); // Default theme, matches import

// Re-add a minimal formSubmit for language, or integrate language directly if not used elsewhere in a Form
const formSubmit = ref({ language: null }); 

const currentSubmissionId = ref(null);
const submissionPollInterval = ref(null);
const submissionInProgress = ref(false); // Tracks if we are waiting for a final submission result
const showCEModal = ref(false);

const cmInstance = ref(null); // Will hold the CodeMirror EditorView instance

// For CM6, `options` is less used; configuration is via `extensions`
// The `vue-codemirror` component's :extensions prop will be used.
// We'll build the extensions array dynamically based on language and theme.
const languageConf = new Compartment();
const themeConf = new Compartment();

const extensions = ref([
  basicSetup,
  languageConf.of([]), // Placeholder for language
  themeConf.of(oneDark) // Default theme
]);

// Function to get CM6 language extension
const getCm6Language = (langValue) => {
  const lowerLang = langValue ? langValue.toLowerCase() : '';
  if (lowerLang.includes('c++') || lowerLang.includes('cpp')) return cpp();
  if (lowerLang.includes('java')) return java();
  if (lowerLang.includes('python')) return python();
  // Assuming 'c' uses cpp() for CM6, or find a specific C lang package if needed
  if (lowerLang.includes('c') && !lowerLang.includes('c#') && !lowerLang.includes('csharp')) return cpp(); 
  if (lowerLang.includes('javascript') || lowerLang.includes('js')) return javascript();
  if (lowerLang.includes('go')) return go();
  if (lowerLang.includes('rust')) return rust();
  return []; // Return empty array or a plain text language if available
};

const mappedLanguages = computed(() => {
  if (!problemStore.languages || problemStore.languages.length === 0) return [];
  return problemStore.languages.map(lang => ({
    name: lang.name, 
    value: lang.value || lang.id,
    // mode: getCodeMirrorMode(lang.value || lang.id || lang.name) // Old CM5 way
    // For CM6, we handle language extension directly
  }));
});

watch(language, (newLangValue) => {
  formSubmit.value.language = newLangValue;
  const langExtension = getCm6Language(newLangValue);
  
  if (cmInstance.value) {
    cmInstance.value.dispatch({
      effects: languageConf.reconfigure(langExtension)
    });
  } else { 
     extensions.value = [basicSetup, languageConf.of(langExtension), themeConf.of(oneDark)]; 
  }

  if (problemStore.problem?.template && newLangValue && problemStore.problem.template[newLangValue]) {
    code.value = problemStore.problem.template[newLangValue];
  } else if (problemStore.problem?.template && !newLangValue) {
    // Optional: Clear code or set to a default if language is deselected and a template for it was shown
    // code.value = ''; 
  }
});

// Theme watching - for CM6, themes are also extensions
watch(theme, (/* newThemeName */) => { // Parameter removed or commented if not used
  let themeExtension = oneDark; // Default
  // Add more themes here if needed
  // e.g., if (newThemeName === 'light') themeExtension = someLightThemeExtension;
  
  if (cmInstance.value) {
    cmInstance.value.dispatch({
      effects: themeConf.reconfigure(themeExtension)
    });
  } else {
    extensions.value = [basicSetup, languageConf.of(getCm6Language(language.value)), themeConf.of(themeExtension)];
  }
});

const onCmReady = (editorView) => { 
  cmInstance.value = editorView;
  // Initial language and theme setup if not handled by watchers immediately
  const initialLangExt = getCm6Language(language.value);
  const initialThemeExt = oneDark; // Or based on theme.value
   editorView.dispatch({
    effects: [
      languageConf.reconfigure(initialLangExt),
      themeConf.reconfigure(initialThemeExt)
    ]
  });
};
const onLangChange = (newVal) => { console.log('Language selected:', newVal); };

const difficultyColor = (d) => (d === 'Low') ? 'green' : (d === 'Mid') ? 'orange' : (d === 'High') ? 'red' : 'default';
const myStatusColor = (s) => (s === 0) ? 'success' : (s === null || s === undefined) ? 'default' : 'error';

// Updated to use JUDGE_STATUS constants for result mapping
const getResultText = (resultCode) => {
    switch (resultCode) {
        case JUDGE_STATUS.PENDING: return t('Pending');
        case JUDGE_STATUS.JUDGING: return t('Judging');
        case JUDGE_STATUS.ACCEPTED: return t('Accepted');
        case JUDGE_STATUS.WRONG_ANSWER: return t('Wrong_Answer');
        case JUDGE_STATUS.TIME_LIMIT_EXCEEDED: return t('Time_Limit_Exceeded');
        case JUDGE_STATUS.MEMORY_LIMIT_EXCEEDED: return t('Memory_Limit_Exceeded');
        case JUDGE_STATUS.RUNTIME_ERROR: return t('Runtime_Error');
        case JUDGE_STATUS.COMPILE_ERROR: return t('Compile_Error');
        case JUDGE_STATUS.SYSTEM_ERROR: return t('System_Error');
        case JUDGE_STATUS.PARTIALLY_ACCEPTED: return t('Partially_Accepted');
        default: return t('Unknown_Status'); // Add this translation
    }
};

const getSubmissionAlertType = (resultCode) => {
    switch (resultCode) {
        case JUDGE_STATUS.ACCEPTED: return 'success';
        case JUDGE_STATUS.PENDING:
        case JUDGE_STATUS.JUDGING: return 'info';
        case JUDGE_STATUS.WRONG_ANSWER:
        case JUDGE_STATUS.TIME_LIMIT_EXCEEDED:
        case JUDGE_STATUS.MEMORY_LIMIT_EXCEEDED:
        case JUDGE_STATUS.RUNTIME_ERROR:
        case JUDGE_STATUS.COMPILE_ERROR:
        case JUDGE_STATUS.SYSTEM_ERROR:
        case JUDGE_STATUS.PARTIALLY_ACCEPTED: return 'warning';
        default: return 'error';
    }
};

const myStatusText = (status) => { // This is for problem.my_status, not submission result
    if (status === 0) return t('Accepted'); // 0 often means solved for problem.my_status
    // Add other mappings for problem.my_status if backend provides them
    if (status === null || status === undefined) return t('Not_Attempted'); 
    return t('Attempted_Not_Solved'); // Example for other non-zero statuses. Add this translation
};

const pollSubmissionStatus = async () => {
    if (!currentSubmissionId.value) return;
    try {
        const submission = await submissionStore.fetchSubmissionDetails(currentSubmissionId.value);
        if (finalStates.includes(submission.result)) {
            clearInterval(submissionPollInterval.value);
            submissionPollInterval.value = null;
            submissionInProgress.value = false;
            problemStore.fetchProblemDetails(problemID.value);
    } else {
            if (!submissionPollInterval.value) { 
                 submissionPollInterval.value = setInterval(pollSubmissionStatus, 3000);
            }
        }
    } catch (error) {
        console.error('Polling error:', error);
        Message.error(t('Error_Polling_Status'));
        clearInterval(submissionPollInterval.value);
        submissionPollInterval.value = null;
        submissionInProgress.value = false;
    }
};

const handleSubmitCode = async () => {
  if (!problemStore.problem?._id) { Message.error(t('Error_Problem_Not_Loaded')); return; }
  if (!language.value) { Message.warning(t('Please_Select_Language')); return; }
  if (!code.value.trim()) { Message.warning(t('Code_Cannot_Be_Empty')); return; }

  isSubmitting.value = true;
  submissionInProgress.value = true;
  if (submissionPollInterval.value) clearInterval(submissionPollInterval.value);
  submissionStore.clearCurrentSubmission();

  try {
    const submissionData = { problem_id: problemStore.problem._id, language: language.value, code: code.value, contest_id: contestID.value || null };
    const response = await api.submitCode(submissionData);
    Message.success(t('Submission_Sent_Successfully'));
    currentSubmissionId.value = response.submission_id || response.id || response.data?.submission_id || response.data?.id;
    
    if (currentSubmissionId.value) {
        await pollSubmissionStatus(); 
        // Check if submission status is already final after the first poll
        if (submissionStore.currentSubmission && !finalStates.includes(submissionStore.currentSubmission.result)) {
             submissionPollInterval.value = setInterval(pollSubmissionStatus, 3000);
      }
    } else {
        Message.error(t('Submission_ID_Missing'));
        submissionInProgress.value = false;
    }
  } catch (error) {
    console.error("Submission error:", error);
    Message.error(error.data?.message || error.message || t('Submission_Failed'));
    submissionInProgress.value = false;
  } finally {
    isSubmitting.value = false;
  }
};

const showCompileErrorInfo = () => {
    showCEModal.value = true;
};

onMounted(async () => {
  await problemStore.fetchLanguages();
  if (problemID.value) {
    await problemStore.fetchProblemDetails(problemID.value);
  }

  if (mappedLanguages.value.length > 0) {
    let initialLangValue = mappedLanguages.value[0].value;
    if (problemStore.problem?.languages?.length > 0) {
      const problemSpecificLangName = problemStore.problem.languages[0];
      const matchingFrontendLang = mappedLanguages.value.find(fl => 
          fl.name.toLowerCase() === problemSpecificLangName.toLowerCase() || 
          (fl.value && fl.value.toString().toLowerCase() === problemSpecificLangName.toLowerCase())
      );
      if (matchingFrontendLang) initialLangValue = matchingFrontendLang.value;
    }
    language.value = initialLangValue;
  } else if (problemStore.languages?.length > 0) {
    language.value = problemStore.languages[0].value || problemStore.languages[0].id;
  }

  // The initial mode/language setting is handled by onCmReady or the language watcher now.
  // The old cmOptions.mode logic is removed.
  // if (language.value) {
  //   const selectedLangConfig = mappedLanguages.value.find(l => l.value === language.value);
  //   if (selectedLangConfig) {
  //     // cmOptions.mode = selectedLangConfig.mode; // This was the error line
  //     // if (cmInstance.value) cmInstance.value.setOption('mode', selectedLangConfig.mode);
  //   }
  // }

  if (problemStore.problem?.template && language.value) { // Ensure language.value exists before accessing template
      const templateCode = problemStore.problem.template[language.value];
      if (templateCode) code.value = templateCode;
  }

  if (!problemID.value) console.error('No problem ID found in route params');
});

onUnmounted(() => {
  if (submissionPollInterval.value) {
    clearInterval(submissionPollInterval.value);
  }
  submissionStore.clearCurrentSubmission();
});

</script>

<style scoped>
.problem-view-container {
  margin: 20px;
}

.problem-details-card, .problem-info-card {
  margin-bottom: 20px;
}

.problem-title {
  text-align: center;
  margin-bottom: 15px;
}

.tags-container {
  text-align: center;
  margin-bottom: 15px;
}

.tags-container .ivu-tag {
  margin: 0 3px;
}

.problem-content-box {
        padding: 10px;
  border: 1px solid #e8eaec;
        border-radius: 4px;
  background-color: #fdfdfd;
  margin-bottom: 15px;
  word-wrap: break-word; /* Ensure long words break */
  white-space: pre-wrap; /* Respect whitespace and newlines from HTML content */
}

.problem-content-box :deep(pre) {
        white-space: pre-wrap; 
        word-wrap: break-word; 
  background-color: #f0f0f0;  
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto; /* Add scroll for very long lines in pre */
}

.sample-box {
  margin-bottom: 20px;
  border: 1px solid #e8eaec;
  padding: 15px;
  border-radius: 4px;
}

.sample-box h4 {
  margin-bottom: 8px;
}

.sample-code {
  background-color: #f9f9f9;
      padding: 10px;
      border-radius: 4px;
      white-space: pre-wrap; 
  word-break: break-all;
  max-height: 300px; /* Limit sample box height */
  overflow-y: auto; /* Add scroll if content exceeds max height */
}

.hint-box, .source-box {
  margin-top: 20px;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 4px;
  background-color: #f9f9f9;
}

.hint-box h3, .source-box strong {
  margin-bottom: 5px;
}

.loading-spinner,
.error-message,
.no-data {
  text-align: center;
  padding: 40px 0;
}

.problem-info-card p {
      margin-bottom: 8px;
    font-size: 14px;
}

.problem-info-card strong {
    margin-right: 5px;
}

.submission-section h3 {
    margin-bottom: 10px;
}

/* Deep selectors for rendered HTML if needed (e.g., for markdown) */
:deep(.problem-content-box p) {
  margin-bottom: 0.5em;
}
:deep(.problem-content-box ul),
:deep(.problem-content-box ol) {
  padding-left: 20px;
  margin-bottom: 0.5em;
}

.code-editor {
  border: 1px solid #dcdee2; /* From View UI Plus inputs */
  border-radius: 4px;
  min-height: 300px; /* Minimum height for the editor */
}

/* To ensure CodeMirror takes full height within its container if needed */
:deep(.CodeMirror) {
  height: 100%;
  min-height: 300px; /* Ensure inner CM also has min-height */
}

/* Adjust FormItem margin if it's part of submission section */
.submission-section .ivu-form-item {
  margin-bottom: 10px;
}

.submission-status-display {
    margin-top: 20px;
    padding: 15px;
    border: 1px solid #e8eaec;
    border-radius: 4px;
    background-color: #f9f9f9;
}
.compile-error-output {
    background-color: #333;
    color: #f1f1f1;
    padding: 10px;
    border-radius: 4px;
    white-space: pre-wrap;
    word-break: break-all;
    max-height: 400px;
    overflow-y: auto;
}
</style> 