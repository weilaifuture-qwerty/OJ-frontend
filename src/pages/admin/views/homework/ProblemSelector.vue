<template>
  <div class="problem-selector">
    <div class="selector-header">
      <el-input
        v-model="searchKeyword"
        placeholder="Search problems by title or ID..."
        prefix-icon="el-icon-search"
        clearable
        @input="searchProblems"
      />
      <el-select
        v-model="difficultyFilter"
        placeholder="All Difficulties"
        clearable
        @change="filterProblems"
        style="width: 180px; margin-left: 10px;"
      >
        <el-option label="All Difficulties" value=""></el-option>
        <el-option label="Low" value="Low"></el-option>
        <el-option label="Mid" value="Mid"></el-option>
        <el-option label="High" value="High"></el-option>
      </el-select>
    </div>
    
    <div class="selector-content">
      <el-table
        ref="problemTable"
        :data="filteredProblems"
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
          label="ID"
          width="100"
        />
        <el-table-column
          prop="title"
          label="Title"
          min-width="250"
        />
        <el-table-column
          prop="difficulty"
          label="Difficulty"
          width="100"
        >
          <template #default="scope">
            <el-tag
              :type="scope.row.difficulty === 'Low' ? 'success' : scope.row.difficulty === 'Mid' ? 'warning' : 'danger'"
              size="small"
            >
              {{ scope.row.difficulty }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="submission_number"
          label="Submissions"
          width="120"
          align="center"
        />
        <el-table-column
          prop="accepted_number"
          label="Accepted"
          width="100"
          align="center"
        />
      </el-table>
    </div>
    
    <div class="selector-footer">
      <div class="selected-info">
        <span>Selected: <strong>{{ tempSelected.length }}</strong> problems</span>
      </div>
      <div class="action-buttons">
        <el-button @click="$emit('cancel')">Cancel</el-button>
        <el-button type="primary" @click="confirmSelection">
          Confirm Selection
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
      problems: [],
      filteredProblems: [],
      tempSelected: [],
      searchKeyword: '',
      difficultyFilter: ''
    }
  },
  mounted() {
    this.loadProblems()
    this.tempSelected = [...this.selectedProblems]
  },
  methods: {
    async loadProblems() {
      this.loading = true
      try {
        const res = await api.getProblemList({
          limit: 1000,
          offset: 0
        })
        this.problems = res.data.data.results || []
        this.filteredProblems = [...this.problems]
        this.restoreSelection()
      } catch (err) {
        this.$error('Failed to load problems')
      } finally {
        this.loading = false
      }
    },
    
    restoreSelection() {
      this.$nextTick(() => {
        this.tempSelected.forEach(problem => {
          const row = this.problems.find(p => p.id === problem.id)
          if (row) {
            this.$refs.problemTable.toggleRowSelection(row, true)
          }
        })
      })
    },
    
    searchProblems() {
      this.filterProblems()
    },
    
    filterProblems() {
      let filtered = [...this.problems]
      
      if (this.searchKeyword) {
        const keyword = this.searchKeyword.toLowerCase()
        filtered = filtered.filter(p => 
          p.title.toLowerCase().includes(keyword) || 
          p._id.toLowerCase().includes(keyword)
        )
      }
      
      if (this.difficultyFilter) {
        filtered = filtered.filter(p => p.difficulty === this.difficultyFilter)
      }
      
      this.filteredProblems = filtered
    },
    
    checkSelectable(row) {
      return true
    },
    
    handleSelectionChange(selection) {
      this.tempSelected = selection
    },
    
    confirmSelection() {
      this.$emit('confirm', this.tempSelected)
    }
  }
}
</script>

<style lang="scss" scoped>
.problem-selector {
  .selector-header {
    display: flex;
    margin-bottom: 20px;
  }
  
  .selector-content {
    margin-bottom: 20px;
  }
  
  .selector-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 20px;
    border-top: 1px solid #ebeef5;
    
    .selected-info {
      color: #606266;
      
      strong {
        color: #409eff;
      }
    }
    
    .action-buttons {
      display: flex;
      gap: 10px;
    }
  }
}
</style>