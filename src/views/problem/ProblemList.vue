<template>
  <div class="problem-list-container">
    <Card>
      <template #title>
        <h2>{{ t('Problem_List') }}</h2>
      </template>

      <Row :gutter="16" class="filter-row">
        <Col :xs="24" :sm="12" :md="8" :lg="6">
          <Input 
            v-model="searchParams.keyword"
            :placeholder="t('keywordPlaceholder')"
            clearable
            @on-enter="applyFilters"
            @on-clear="applyFilters"
          />
        </Col>
        <Col :xs="24" :sm="12" :md="8" :lg="6">
          <Select 
            v-model="searchParams.difficulty"
            :placeholder="t('Difficulty')"
            clearable
            @on-change="applyFilters"
          >
            <Option value="All">{{ t('All') }}</Option>
            <Option value="Low">{{ t('Low') }}</Option>
            <Option value="Mid">{{ t('Mid') }}</Option>
            <Option value="High">{{ t('High') }}</Option>
          </Select>
        </Col>
        <Col :xs="24" :sm="24" :md="8" :lg="8">
          <Select 
            v-model="searchParams.tag"
            :placeholder="t('Tags')"
            multiple
            filterable
            clearable
            @on-change="applyFilters"
          >
            <Option v-for="tag in problemStore.problemTags" :key="tag.id" :value="tag.name">
              {{ tag.name }}
            </Option>
          </Select>
        </Col>
        <Col :xs="24" :sm="12" :md="6" :lg="4" class="button-col">
          <Button type="primary" @click="applyFilters" icon="ios-search">{{ t('Search') }}</Button>
          <Button @click="resetFilters" icon="md-refresh">{{ t('Reset') }}</Button>
        </Col>
      </Row>
      
      <Row :gutter="16">
        <Col :xs="24" :sm="12" :md="12" :lg="12" class="pick-one-col">
            <Button type="info" @click="handlePickOneProblem" :loading="problemStore.isLoading" icon="md-bulb">
                {{ t('Pick_One') }}
            </Button>
        </Col>
      </Row>

      <div v-if="problemStore.isLoading && !problemStore.problems.length" class="loading-spinner">
        <Spin size="large"></Spin>
      </div>
      <div v-else-if="problemStore.error" class="error-message">
        <Alert type="error" show-icon>
          {{ t('Error_Fetching_Problem_List') }}: {{ problemStore.error }}
        </Alert>
      </div>
      <div>
        <Table :columns="columns" :data="problemStore.problems" :loading="problemStore.isLoading" stripe class="problem-table">
          <template #empty>
            <tr>
              <td :colspan="columns.length" style="text-align:center;">{{ t('No_Problems_Found') }}</td>
            </tr>
          </template>
        </Table>
        <div class="pagination-container">
          <Page 
            :total="problemStore.totalProblems"
            v-model:current="currentPage"
            :page-size="pageSize"
            show-sizer
            show-total
            @on-change="handlePageChange"
            @on-page-size-change="handlePageSizeChange"
          />
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useProblemStore } from '@/stores/problemStore';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const { t } = useI18n();
const problemStore = useProblemStore();
const router = useRouter();

const searchParams = ref({
  keyword: '',
  difficulty: 'All',
  tag: [],
});

const currentPage = ref(1);
const pageSize = ref(20);

const columns = computed(() => [
  {
    title: '#',
    key: 'display_id',
    width: 100,
    render: (h, params) => {
      return h('span', params.row._id);
    }
  },
  {
    title: t('Title'),
    key: 'title',
    render: (h, params) => {
      return h('Button', {
        type: 'text',
        size: 'small',
        onClick: () => {
          router.push({ name: 'ProblemDetails', params: { problemID: params.row._id } });
        }
      }, params.row.title);
    }
  },
  {
    title: t('Level'),
    key: 'difficulty',
    width: 120,
    filters: [
      { label: t('Low'), value: 'Low' },
      { label: t('Mid'), value: 'Medium' },
      { label: t('High'), value: 'High' }
    ],
    filterMultiple: false,
    filterMethod (value, row) {
        return row.difficulty === value;
    },
    render: (h, params) => {
      let color = 'green';
      if (params.row.difficulty === 'Mid') color = 'orange';
      if (params.row.difficulty === 'High') color = 'red';
      return h('Tag', { color: color }, t(params.row.difficulty));
    }
  },
  {
    title: t('Tags'),
    key: 'tags',
    render: (h, params) => {
      return h('div', params.row.tags.map(tag => {
        return h('Tag', { style: { marginRight: '5px' } }, tag);
      }));
    }
  },
  {
    title: t('Total'),
    key: 'submission_number',
    width: 100,
  },
  {
    title: t('AC_Rate'),
    key: 'ac_rate',
    width: 120,
    render: (h, params) => {
        return h('span', `${(params.row.accepted_number / params.row.submission_number * 100 || 0).toFixed(2)}%`);
    }
  },
]);

const fetchData = () => {
  const offset = (currentPage.value - 1) * pageSize.value;
  let apiSearchParams = {
    keyword: searchParams.value.keyword || undefined,
    difficulty: searchParams.value.difficulty === 'All' ? undefined : searchParams.value.difficulty,
    tag: searchParams.value.tag.length > 0 ? searchParams.value.tag.join(',') : undefined,
  };
  Object.keys(apiSearchParams).forEach(key => apiSearchParams[key] === undefined && delete apiSearchParams[key]);

  problemStore.fetchProblems(offset, pageSize.value, apiSearchParams);
};

const applyFilters = () => {
  currentPage.value = 1;
  fetchData();
};

const resetFilters = () => {
  searchParams.value = {
    keyword: '',
    difficulty: 'All',
    tag: [],
  };
  currentPage.value = 1;
  fetchData();
};

const handlePageChange = (page) => {
  currentPage.value = page;
  fetchData();
};

const handlePageSizeChange = (size) => {
  pageSize.value = size;
  currentPage.value = 1;
  fetchData();
};

const handlePickOneProblem = async () => {
    const problem = await problemStore.pickOneProblem();
    if (problem && problem.id) {
        router.push({ name: 'ProblemDetails', params: { problemID: problem.id } });
    } else if (problem) {
        console.error(t('Error_Picking_Problem'));
    }
};

onMounted(() => {
  problemStore.fetchProblemTags();
  fetchData();
});

</script>

<style scoped>
.problem-list-container {
  margin: 20px;
}

.filter-row {
  margin-bottom: 20px;
}

.button-col {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.pick-one-col {
    margin-bottom: 20px;
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

:deep(.ivu-table td) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.ivu-table th) {
  white-space: nowrap;
}

:deep(.ivu-table-cell .ivu-btn-text) {
  padding: 0;
  color: #2d8cf0;
}
:deep(.ivu-table-cell .ivu-btn-text:hover) {
  color: #5cadff;
}

</style> 