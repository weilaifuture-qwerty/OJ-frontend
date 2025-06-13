<template>
  <div class="submission-list-container">
    <Card>
      <template #title>
        <h2>{{ pageTitle }}</h2>
      </template>

      <Form :model="searchParams" layout="inline" class="filter-form">
        <Row :gutter="16">
          <Col :xs="24" :sm="12" :md="8" :lg="6">
            <FormItem :label="t('Problem_ID')">
              <Input v-model="searchParams.problem_id" :placeholder="t('Filter_By_Problem_ID')" clearable @on-enter="applyFilters" @on-clear="applyFilters" />
            </FormItem>
          </Col>
          <Col :xs="24" :sm="12" :md="8" :lg="6">
            <FormItem :label="t('Username')">
              <Input v-model="searchParams.username" :placeholder="t('Filter_By_Username')" clearable @on-enter="applyFilters" @on-clear="applyFilters" />
            </FormItem>
          </Col>
          <Col :xs="24" :sm="12" :md="8" :lg="6">
            <FormItem :label="t('Language')">
              <Select v-model="searchParams.language" :placeholder="t('Filter_By_Language')" clearable @on-change="applyFilters">
                <Option v-for="lang in problemStore.languages" :key="lang.value || lang.id" :value="lang.value || lang.id">{{ lang.name }}</Option>
              </Select>
            </FormItem>
          </Col>
          <Col :xs="24" :sm="12" :md="8" :lg="6">
            <FormItem :label="t('Status')">
              <Select v-model="searchParams.result" :placeholder="t('Filter_By_Status')" clearable @on-change="applyFilters">
                <Option v-for="(status, key) in JUDGE_STATUS_OPTIONS" :key="key" :value="status.code">{{ status.text }}</Option>
              </Select>
            </FormItem>
          </Col>
          <Col :xs="24" :sm="24" :md="24" :lg="24" style="text-align: right;">
            <Button type="primary" @click="applyFilters" icon="ios-search" style="margin-right: 8px;">{{ t('Search') }}</Button>
            <Button @click="resetFilters" icon="md-refresh">{{ t('Reset') }}</Button>
          </Col>
        </Row>
      </Form>

      <div v-if="submissionStore.isLoadingList && !submissionStore.submissions.length" class="loading-spinner">
        <Spin size="large"></Spin>
      </div>
      <div v-else-if="submissionStore.error" class="error-message">
        <Alert type="error" show-icon>
          {{ t('Error_Fetching_Submissions') }}: {{ submissionStore.error }}
        </Alert>
      </div>
       <div v-else-if="!submissionStore.submissions.length" class="no-data">
        <p>{{ t('No_Submissions_Found') }}</p>
      </div>
      <template v-else>
        <Table :columns="columns" :data="submissionStore.submissions" :loading="submissionStore.isLoadingList" stripe class="submission-table"></Table>
        <div class="pagination-container">
          <Page 
            :total="submissionStore.totalSubmissions"
            v-model:current="currentPage"
            :page-size="pageSize"
            show-sizer
            show-total
            @on-change="handlePageChange"
            @on-page-size-change="handlePageSizeChange"
          />
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useSubmissionStore } from '@/stores/submissionStore';
import { useProblemStore } from '@/stores/problemStore'; // For languages filter
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import { JUDGE_STATUS } from '@/utils/constants'; // Assuming JUDGE_STATUS is moved to constants
import { time } from '@/utils/time'; // For formatting date/time

const { t } = useI18n();
const submissionStore = useSubmissionStore();
const problemStore = useProblemStore(); // For language dropdown
const router = useRouter();
const route = useRoute();

const searchParams = ref({
  problem_id: route.query.problem_id || '',
  username: route.query.username || '',
  language: route.query.language || null,
  result: route.query.result ? parseInt(route.query.result) : null,
  // Add contest_id if viewing contest submissions specifically, passed via props or route query
  contest_id: route.params.contestID || route.query.contest_id || null 
});

const currentPage = ref(route.query.page ? parseInt(route.query.page) : 1);
const pageSize = ref(route.query.limit ? parseInt(route.query.limit) : 20);

const pageTitle = computed(() => {
  return searchParams.value.contest_id ? t('Contest_Submissions') : t('Submission_List');
});

// For Status Filter Dropdown
const JUDGE_STATUS_OPTIONS = computed(() => Object.keys(JUDGE_STATUS).map(key => ({
    text: t(key.charAt(0).toUpperCase() + key.slice(1).toLowerCase().replace(/_/g, ' ')), // e.g., Pending, Wrong Answer
    code: JUDGE_STATUS[key]
})));

const getResultText = (resultCode) => {
    const status = Object.keys(JUDGE_STATUS).find(key => JUDGE_STATUS[key] === resultCode);
    return status ? t(status.charAt(0).toUpperCase() + status.slice(1).toLowerCase().replace(/_/g, ' ')) : t('Unknown_Status');
};

const getResultTagColor = (resultCode) => {
    switch (resultCode) {
        case JUDGE_STATUS.ACCEPTED: return 'success';
        case JUDGE_STATUS.PENDING: case JUDGE_STATUS.JUDGING: return 'processing'; // View UI Plus specific color for Tag
        case JUDGE_STATUS.WRONG_ANSWER: return 'error';
        case JUDGE_STATUS.TIME_LIMIT_EXCEEDED: case JUDGE_STATUS.MEMORY_LIMIT_EXCEEDED: case JUDGE_STATUS.RUNTIME_ERROR: return 'warning';
        case JUDGE_STATUS.COMPILE_ERROR: return 'magenta';
        case JUDGE_STATUS.SYSTEM_ERROR: return 'volcano';
        case JUDGE_STATUS.PARTIALLY_ACCEPTED: return 'lime';
        default: return 'default';
    }
};

const columns = computed(() => [
  {
    title: t('Submission_Time'),
    key: 'create_time',
    minWidth: 150,
    render: (h, params) => {
      return h('span', time.utcToLocal(params.row.create_time));
    }
  },
  {
    title: t('Submission_ID'),
    key: 'id', // Or 'show_id' or '_id' depending on API
    minWidth: 100,
    render: (h, params) => {
        const submissionDisplayId = params.row.id || params.row._id || params.row.show_id;
        return h('Button', {
            type: 'text',
            size: 'small',
            onClick: () => {
                // If contest submission, route to contest submission details if such a route exists
                // Otherwise, general submission details
                if (searchParams.value.contest_id) {
                    // Example: router.push({ name: 'contest-submission-details', params: { contestID: searchParams.value.contest_id, submissionID: submissionDisplayId } });
                    // For now, assume general details page handles contest context if needed via query or store
                    router.push({ name: 'submission-details', params: { id: submissionDisplayId }, query: { contest_id: searchParams.value.contest_id } });
                } else {
                    router.push({ name: 'submission-details', params: { id: submissionDisplayId } });
                }
            }
        }, submissionDisplayId);
    }
  },
  {
    title: t('Status'),
    key: 'result',
    minWidth: 150,
    render: (h, params) => {
      return h('Tag', { color: getResultTagColor(params.row.result) }, getResultText(params.row.result));
    }
  },
  {
    title: t('Problem_ID'),
    key: 'problem', // Assuming 'problem' is an ID or an object with an ID
    minWidth: 100,
    render: (h, params) => {
      // Assuming problem is an ID string or an object with a display_id or _id
      const problemDisplayId = typeof params.row.problem === 'object' ? (params.row.problem.display_id || params.row.problem._id) : params.row.problem;
      return h('Button', {
        type: 'text',
        size: 'small',
        onClick: () => {
          router.push({ name: 'problem-details', params: { problemID: problemDisplayId } });
        }
      }, problemDisplayId);
    }
  },
  {
    title: t('Time'), // Time Cost
    key: 'time_cost',
    minWidth: 100,
    render: (h, params) => {
      return h('span', `${params.row.statistic_info?.time_cost || 0} ms`);
    }
  },
  {
    title: t('Memory'), // Memory Cost
    key: 'memory_cost',
    minWidth: 100,
    render: (h, params) => {
      return h('span', `${params.row.statistic_info?.memory_cost || 0} MB`);
    }
  },
  {
    title: t('Language'),
    key: 'language',
    minWidth: 100,
  },
  {
    title: t('Author'),
    key: 'username',
    minWidth: 120,
    render: (h, params) => {
        return h('Button', {
            type: 'text',
            size: 'small',
            onClick: () => {
                router.push({ name: 'user-home', query: { username: params.row.username } }); // Assuming a user-home route
            }
        }, params.row.username);
    }
  }
]);

const fetchData = () => {
  const offset = (currentPage.value - 1) * pageSize.value;
  let apiSearchParams = { ...searchParams.value }; 

  // Clean up undefined or null params for the API
  Object.keys(apiSearchParams).forEach(key => {
    if (apiSearchParams[key] === null || apiSearchParams[key] === '' || apiSearchParams[key] === undefined) {
      delete apiSearchParams[key];
    }
  });
  
  submissionStore.fetchSubmissions(offset, pageSize.value, apiSearchParams);
};

const applyFilters = () => {
  currentPage.value = 1;
  // Update route query params for bookmarkability and direct navigation
  router.push({ query: { ...route.query, ...searchParams.value, page: currentPage.value, limit: pageSize.value } });
  // fetchData will be called by the watcher on route.query
};

const resetFilters = () => {
  const contestId = searchParams.value.contest_id; // Preserve contest_id if present
  searchParams.value = {
    problem_id: '',
    username: '',
    language: null,
    result: null,
    contest_id: contestId 
  };
  currentPage.value = 1;
  router.push({ query: { contest_id: contestId, page: currentPage.value, limit: pageSize.value  } }); // Reset query params
  // fetchData will be called by watcher
};

const handlePageChange = (page) => {
  currentPage.value = page;
  router.push({ query: { ...route.query, page: currentPage.value } });
  // fetchData will be called by watcher
};

const handlePageSizeChange = (size) => {
  pageSize.value = size;
  currentPage.value = 1; 
  router.push({ query: { ...route.query, limit: pageSize.value, page: currentPage.value } });
  // fetchData will be called by watcher
};

// Watch for route query changes to re-fetch data
watch(() => route.query, (newQuery) => {
    searchParams.value.problem_id = newQuery.problem_id || '';
    searchParams.value.username = newQuery.username || '';
    searchParams.value.language = newQuery.language || null;
    searchParams.value.result = newQuery.result ? parseInt(newQuery.result) : null;
    currentPage.value = newQuery.page ? parseInt(newQuery.page) : 1;
    pageSize.value = newQuery.limit ? parseInt(newQuery.limit) : 20;
    // contest_id is usually from route.params for a nested route, or can be a query param
    searchParams.value.contest_id = route.params.contestID || newQuery.contest_id || null;
    fetchData();
}, { immediate: true, deep: true }); // immediate to load on component mount based on initial URL query

onMounted(() => {
  problemStore.fetchLanguages(); // For language filter dropdown
  // Initial data fetch is handled by the watcher on route.query with immediate: true
});

</script>

<style scoped>
.submission-list-container {
  margin: 20px;
}

.filter-form {
  margin-bottom: 20px;
}

.filter-form .ivu-form-item {
    margin-bottom: 10px; /* Add some space between form items when they wrap */
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.loading-spinner,
.error-message,
.no-data {
  text-align: center;
  padding: 40px 0;
}

/* Custom styling for table cells if needed */
:deep(.ivu-table-cell .ivu-btn-text) {
  padding: 0 2px; /* Minimal padding for text buttons in table */
}
</style> 