<template>
  <div class="problem-selector">
    <!-- Search Bar -->
    <el-form :inline="true" class="search-form">
      <el-form-item>
        <el-input
          v-model="searchKeyword"
          :placeholder="$t('m.Search_Problem')"
          @keyup.enter.native="searchProblems"
          clearable
        >
          <i slot="prefix" class="el-input__icon el-icon-search"></i>
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-select
          v-model="difficulty"
          :placeholder="$t('m.Difficulty')"
          clearable
        >
          <el-option :label="$t('m.All')" value=""></el-option>
          <el-option :label="$t('m.Low')" value="Low"></el-option>
          <el-option :label="$t('m.Mid')" value="Mid"></el-option>
          <el-option :label="$t('m.High')" value="High"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select
          v-model="selectedTag"
          :placeholder="$t('m.Tag')"
          clearable
        >
          <el-option :label="$t('m.All')" value=""></el-option>
          <el-option
            v-for="tag in tagList"
            :key="tag"
            :label="tag"
            :value="tag"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="searchProblems">{{ $t('m.Search') }}</el-button>
      </el-form-item>
    </el-form>
    
    <!-- Problem Table -->
    <el-table
      ref="problemTable"
      :data="problemList"
      v-loading="loading"
      @selection-change="handleSelectionChange"
      style="width: 100%"
      max-height="400"
    >
      <el-table-column
        type="selection"
        width="55"
        :selectable="checkSelectable"
      />
      <el-table-column
        prop="_id"
        :label="$t('m.ID')"
        width="80"
      />
      <el-table-column
        prop="title"
        :label="$t('m.Title')"
        min-width="200"
      />
      <el-table-column
        prop="difficulty"
        :label="$t('m.Difficulty')"
        width="100"
      >
        <template #default="scope">
          <el-tag
            :type="scope.row.difficulty === 'Low' ? 'success' : scope.row.difficulty === 'Mid' ? 'warning' : 'danger'"
            size="small"
          >
            {{ $t('m.' + scope.row.difficulty) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="tags"
        :label="$t('m.Tags')"
        min-width="150"
      >
        <template #default="scope">
          <el-tag
            v-for="tag in scope.row.tags"
            :key="tag"
            size="small"
            style="margin-right: 5px"
          >
            {{ tag }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- Pagination -->
    <div class="pagination">
      <el-pagination
        @current-change="handlePageChange"
        :current-page="currentPage"
        :page-size="pageSize"
        layout="total, prev, pager, next"
        :total="total"
      />
    </div>
    
    <!-- Actions -->
    <div class="dialog-actions">
      <span class="selected-info">
        {{ $t('m.Selected') }}: {{ selectedProblems.length }} {{ $t('m.Problems') }}
      </span>
      <div>
        <el-button @click="$emit('cancel')">{{ $t('m.Cancel') }}</el-button>
        <el-button
          type="primary"
          @click="confirmSelection"
          :disabled="selectedProblems.length === 0"
        >
          {{ $t('m.Confirm') }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@admin/api'

export default {
  name: 'ProblemSelector',
  props: {
    selectedProblems: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      loading: false,
      problemList: [],
      selectedProblems: [],
      searchKeyword: '',
      difficulty: '',
      selectedTag: '',
      tagList: [],
      currentPage: 1,
      pageSize: 10,
      total: 0
    }
  },
  mounted() {
    this.loadTags()
    this.searchProblems()
  },
  methods: {
    async loadTags() {
      try {
        const res = await api.getProblemTagList()
        this.tagList = res.data.data || []
      } catch (err) {
        console.error('Failed to load tags:', err)
      }
    },
    
    async searchProblems() {
      this.loading = true
      try {
        const params = {
          page: this.currentPage,
          limit: this.pageSize,
          visible: true
        }
        
        if (this.searchKeyword) {
          params.keyword = this.searchKeyword
        }
        if (this.difficulty) {
          params.difficulty = this.difficulty
        }
        if (this.selectedTag) {
          params.tag = this.selectedTag
        }
        
        const res = await api.getProblemList(params)
        this.problemList = res.data.data.results || []
        this.total = res.data.data.total || 0
        
        // Restore previous selections
        this.$nextTick(() => {
          this.problemList.forEach(problem => {
            if (this.isAlreadySelected(problem)) {
              this.$refs.problemTable.toggleRowSelection(problem, true)
            }
          })
        })
      } catch (err) {
        this.$error(err.data?.data || 'Failed to load problems')
      } finally {
        this.loading = false
      }
    },
    
    handlePageChange(page) {
      this.currentPage = page
      this.searchProblems()
    },
    
    handleSelectionChange(selection) {
      this.selectedProblems = selection
    },
    
    checkSelectable(row) {
      // Disable selection for already selected problems
      return !this.isAlreadySelected(row)
    },
    
    isAlreadySelected(problem) {
      return this.selectedProblems.some(p => p.id === problem.id)
    },
    
    confirmSelection() {
      this.$emit('select', this.selectedProblems)
    }
  }
}
</script>

<style lang="scss" scoped>
.problem-selector {
  .search-form {
    margin-bottom: 20px;
  }
  
  .pagination {
    margin: 20px 0;
    text-align: center;
  }
  
  .dialog-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;
    
    .selected-info {
      color: #606266;
      font-size: 14px;
    }
  }
}
</style>