<template>
  <div class="submission-details-container">
    <Card v-if="!submissionStore.isLoadingDetails && submissionStore.currentSubmission">
      <template #title>
        <h2>{{ t('Submission_Details') }} - ID: {{ submissionId }}</h2>
      </template>
      <p><strong>{{ t('Status') }}:</strong> <Tag :color="getResultTagColor(submissionStore.currentSubmission.result)">{{ getResultText(submissionStore.currentSubmission.result) }}</Tag></p>
      <p><strong>{{ t('Problem_ID') }}:</strong> 
        <router-link :to="{ name: 'problem-details', params: { problemID: submissionStore.currentSubmission.problem } }">
          {{ submissionStore.currentSubmission.problem }}
        </router-link>
      </p>
      <p><strong>{{ t('User') }}:</strong> 
         <router-link :to="{ name: 'user-home', query: { username: submissionStore.currentSubmission.username } }">
            {{ submissionStore.currentSubmission.username }}
        </router-link>
      </p>
      <p><strong>{{ t('Language') }}:</strong> {{ submissionStore.currentSubmission.language }}</p>
      <p><strong>{{ t('Submission_Time') }}:</strong> {{ submissionTime }}</p>
      <div v-if="submissionStore.currentSubmission.statistic_info">
        <p><strong>{{ t('Time_Cost') }}:</strong> {{ submissionStore.currentSubmission.statistic_info.time_cost || 0 }} ms</p>
        <p><strong>{{ t('Memory_Cost') }}:</strong> {{ submissionStore.currentSubmission.statistic_info.memory_cost || 0 }} MB</p>
      </div>
      
      <div v-if="submissionStore.currentSubmission.result === JUDGE_STATUS.COMPILE_ERROR && submissionStore.currentSubmission.statistic_info && submissionStore.currentSubmission.statistic_info.err_info" class="compile-error-section">
        <h3>{{ t('Compile_Error_Info') }}</h3>
        <pre class="compile-error-output">{{ submissionStore.currentSubmission.statistic_info.err_info }}</pre>
      </div>

      <h3>{{ t('Code') }}</h3>
      <Codemirror
        :modelValue="submissionStore.currentSubmission.code"
        :extensions="displayExtensions"
        disabled
        class="code-display"
      />

       <div v-if="submissionStore.currentSubmission.result === JUDGE_STATUS.WRONG_ANSWER && submissionStore.currentSubmission.info && submissionStore.currentSubmission.info.data">
            <h3>{{ t('Test_Case_Details') }}</h3>
            <div v-for="(testCase, index) in submissionStore.currentSubmission.info.data" :key="index" class="test-case-card">
                <p><strong>{{ t('Test_Case') }} #{{ index + 1 }}</strong></p>
                <p><strong>{{ t('Result') }}:</strong> {{ getResultText(testCase.result) }}</p>
                <div v-if="testCase.input" class="test-case-section">
                    <strong>{{ t('Input_Preview') }}:</strong>
                    <pre class="test-case-io">{{ truncate(testCase.input, 200) }}</pre>
                </div>
                <div v-if="testCase.output" class="test-case-section">
                    <strong>{{ t('Actual_Output_Preview') }}:</strong>
                    <pre class="test-case-io">{{ truncate(testCase.output, 200) }}</pre>
                </div>
                <div v-if="testCase.expected_output" class="test-case-section">
                    <strong>{{ t('Expected_Output_Preview') }}:</strong>
                    <pre class="test-case-io">{{ truncate(testCase.expected_output, 200) }}</pre>
                </div>
                <p v-if="testCase.message"><strong>{{ t('Message') }}:</strong> {{ testCase.message }}</p>
            </div>
        </div>

    </Card>
    <div v-else-if="submissionStore.isLoadingDetails" class="loading-spinner">
      <Spin size="large"></Spin>
      <p>{{ t('Loading_Submission_Details') }}...</p>
    </div>
    <Alert v-else-if="submissionStore.error" type="error" show-icon>
      {{ t('Error_Fetching_Submission_Details') }}: {{ submissionStore.error }}
    </Alert>
    <Alert v-else type="warning" show-icon>
      {{ t('Submission_Not_Found') }}
    </Alert>

    <div class="actions-bar">
        <Button @click="goBack" type="default" icon="ios-arrow-back" style="margin-right: 10px;">{{ t('Back_To_List') }}</Button>
        <Button v-if="canRejudge && submissionStore.currentSubmission" @click="handleRejudge" type="warning" icon="md-refresh-circle">{{ t('Rejudge') }}</Button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSubmissionStore } from '@/stores/submissionStore';
import { useUserStore } from '@/stores/userStore';
import { useI18n } from 'vue-i18n';
import { JUDGE_STATUS } from '@/utils/constants';
import { time } from '@/utils/time';
import api from '@/api'; // For rejudge
import { Message } from 'view-ui-plus';

// Import Codemirror (vue-codemirror and core CM6 components)
import { Codemirror } from 'vue-codemirror'; // Named import
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { go } from '@codemirror/lang-go';
import { rust } from '@codemirror/lang-rust';
import { oneDark } from '@codemirror/theme-one-dark'; // Default theme

const route = useRoute();
const router = useRouter();
const submissionStore = useSubmissionStore();
const userStore = useUserStore();
const { t } = useI18n();

const submissionId = ref(route.params.id);
const submissionPollInterval = ref(null);
const displayExtensions = ref([]); // Use a ref for extensions

// Function to get CM6 language extension (can be shared or adapted from ProblemView)
const getCm6Language = (langValue) => {
  const lowerLang = langValue ? langValue.toLowerCase() : '';
  if (lowerLang.includes('c++') || lowerLang.includes('cpp')) return cpp();
  if (lowerLang.includes('java')) return java();
  if (lowerLang.includes('python')) return python();
  if (lowerLang.includes('c') && !lowerLang.includes('c#') && !lowerLang.includes('csharp')) return cpp();
  if (lowerLang.includes('javascript') || lowerLang.includes('js')) return javascript();
  if (lowerLang.includes('go')) return go();
  if (lowerLang.includes('rust')) return rust();
  return []; // Default to no specific language highlighting
};

const setupDisplayExtensions = (languageStr) => {
  const langExtension = getCm6Language(languageStr);
  displayExtensions.value = [
    EditorState.readOnly.of(true),
    EditorView.lineWrapping,
    oneDark, // Apply theme
    langExtension, // Apply language
    EditorView.theme({ // Basic styling for read-only display
      "&": {
        fontSize: "13px",
      },
      ".cm-gutters": { display: "none" }, // Optionally hide gutters for read-only display
    }),
  ];
};

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

const pollDetails = async () => {
    if (!submissionId.value) return;
    try {
        const submission = await submissionStore.fetchSubmissionDetails(submissionId.value);
        if (submission && finalStates.includes(submission.result)) {
            stopPolling();
        }
    } catch (error) {
        console.error('Error polling submission details:', error);
        // Potentially stop polling on certain errors like 404
        if (error.response?.status === 404) {
            stopPolling();
        }
    }
};

const stopPolling = () => {
    if (submissionPollInterval.value) {
        clearInterval(submissionPollInterval.value);
        submissionPollInterval.value = null;
    }
};

const submissionTime = computed(() => {
    return submissionStore.currentSubmission ? time.utcToLocal(submissionStore.currentSubmission.create_time) : 'N/A';
});

const getResultText = (resultCode) => {
    const statusKey = Object.keys(JUDGE_STATUS).find(key => JUDGE_STATUS[key] === resultCode);
    return statusKey ? t(statusKey.charAt(0).toUpperCase() + statusKey.slice(1).toLowerCase().replace(/_/g, ' ')) : t('Unknown_Status');
};

const getResultTagColor = (resultCode) => {
    switch (resultCode) {
        case JUDGE_STATUS.ACCEPTED: return 'success';
        case JUDGE_STATUS.PENDING: case JUDGE_STATUS.JUDGING: return 'processing';
        case JUDGE_STATUS.WRONG_ANSWER: return 'error';
        case JUDGE_STATUS.TIME_LIMIT_EXCEEDED:
        case JUDGE_STATUS.MEMORY_LIMIT_EXCEEDED:
        case JUDGE_STATUS.RUNTIME_ERROR: return 'warning';
        case JUDGE_STATUS.COMPILE_ERROR: return 'magenta';
        case JUDGE_STATUS.SYSTEM_ERROR: return 'volcano';
        case JUDGE_STATUS.PARTIALLY_ACCEPTED: return 'lime';
        default: return 'default';
    }
};

const canRejudge = computed(() => {
    // Only admins or the submission owner (if allowed by config) can rejudge.
    // For simplicity, let's assume only admins can rejudge for now.
    return userStore.isAdminRole;
});

const handleRejudge = async () => {
    if (!submissionStore.currentSubmission?._id) {
        Message.error(t('Submission_data_not_available_for_rejudge'));
        return;
    }
    try {
        await api.rejudgeSubmission(submissionStore.currentSubmission._id);
        Message.success(t('Rejudge_request_sent'));
        submissionStore.fetchSubmissionDetails(submissionId.value); // Refresh details
        startPollingIfNeeded(); // Restart polling if it was stopped
    } catch (error) {
        Message.error(error.data?.message || t('Failed_to_send_rejudge_request'));
        console.error('Rejudge error:', error);
    }
};

const goBack = () => {
    // If coming from a contest, go back to contest submissions
    if (route.query.contest_id) {
        router.push({ name: 'contest-submission-list', params: { contestID: route.query.contest_id } });
    } else {
        router.push({ name: 'submission-list' });
    }
};

const truncate = (text, length) => {
    if (!text) return '';
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
};

const startPollingIfNeeded = () => {
    if (submissionStore.currentSubmission && !finalStates.includes(submissionStore.currentSubmission.result)) {
        if (!submissionPollInterval.value) {
             submissionPollInterval.value = setInterval(pollDetails, 3000);
        }
    }
}

watch(() => submissionStore.currentSubmission, (newSubmission) => {
    if (newSubmission && newSubmission.language) {
        setupDisplayExtensions(newSubmission.language); // New CM6 way
    }
    startPollingIfNeeded();
}, { immediate: true, deep: true }); // Added deep:true for robust watching if language is nested


onMounted(async () => {
    submissionStore.clearCurrentSubmission(); // Clear previous details
    await submissionStore.fetchSubmissionDetails(submissionId.value);
    // Polling is now started by the watcher on currentSubmission
});

onUnmounted(() => {
    stopPolling();
});

</script>

<style scoped>
.submission-details-container {
  margin: 20px;
}

.submission-details-container .ivu-card {
    margin-bottom: 20px;
}

.compile-error-section {
  margin-top: 20px;
}

.compile-error-output {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e8eaec;
}

.code-display {
  border: 1px solid #dcdee2;
  border-radius: 4px;
}

:deep(.CodeMirror) {
  min-height: 100px; /* Adjust as needed for display */
  height: auto; /* Fit content */
}

.loading-spinner {
  text-align: center;
  padding: 40px 0;
}

.actions-bar {
    margin-top: 20px;
}

.test-case-card {
    border: 1px solid #e8eaec;
    padding: 15px;
    margin-bottom: 10px;
    border-radius: 4px;
    background-color: #f9f9f9;
}

.test-case-io {
    background-color: #fff;
    border: 1px solid #eee;
    padding: 8px;
    border-radius: 3px;
    white-space: pre-wrap;
    word-break: break-all;
    max-height: 150px;
    overflow-y: auto;
}

.test-case-section {
    margin: 10px 0;
}

.test-case-section strong {
    display: block;
    margin-bottom: 5px;
}
</style> 