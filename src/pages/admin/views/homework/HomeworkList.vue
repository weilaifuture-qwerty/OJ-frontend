<template>
  <div class="homework-list">
    <Panel :title="$t('m.Homework_Management')">
      <div class="panel-header" slot="header">
        <el-button type="primary" size="small" @click="createHomework" icon="el-icon-plus">
          {{ $t('m.Create_Homework') }}
        </el-button>
      </div>
      
      <!-- Filter Section -->
      <div class="filter-section">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-input
              v-model="searchKeyword"
              :placeholder="$t('m.Search_Homework')"
              @keyup.enter.native="loadHomeworkList"
              clearable
            >
              <i slot="prefix" class="el-input__icon el-icon-search"></i>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-select
              v-model="filterStatus"
              :placeholder="$t('m.Status')"
              @change="loadHomeworkList"
              clearable
            >
              <el-option :label="$t('m.All')" value=""></el-option>
              <el-option :label="$t('m.Active')" value="active"></el-option>
              <el-option :label="$t('m.Ended')" value="ended"></el-option>
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-button @click="loadHomeworkList">{{ $t('m.Search') }}</el-button>
          </el-col>
        </el-row>
      </div>
      
      <!-- Homework Table -->
      <el-table
        :data="homeworkList"
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column
          prop="title"
          :label="$t('m.Title')"
          min-width="200"
        >
          <template #default="scope">
            <router-link
              :to="{ name: 'admin-homework-detail', params: { id: scope.row.id } }"
              class="homework-title"
            >
              {{ scope.row.title }}
            </router-link>
          </template>
        </el-table-column>
        
        <el-table-column
          prop="problem_count"
          :label="$t('m.Problems')"
          width="100"
          align="center"
        />
        
        <el-table-column
          prop="assigned_count"
          :label="$t('m.Assigned_Students')"
          width="150"
          align="center"
        >
          <template #default="scope">
            <el-tag type="primary">{{ scope.row.assigned_count || 0 }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column
          prop="due_date"
          :label="$t('m.Due_Date')"
          width="180"
        >
          <template #default="scope">
            <span :class="{ 'overdue': isOverdue(scope.row.due_date) }">
              {{ formatDate(scope.row.due_date) }}
            </span>
          </template>
        </el-table-column>
        
        <el-table-column
          prop="status"
          :label="$t('m.Status')"
          width="120"
          align="center"
        >
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row)">
              {{ getStatusText(scope.row) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column
          prop="completion_rate"
          :label="$t('m.Completion_Rate')"
          width="150"
          align="center"
        >
          <template #default="scope">
            <el-progress
              :percentage="scope.row.completion_rate || 0"
              :status="scope.row.completion_rate === 100 ? 'success' : ''"
            />
          </template>
        </el-table-column>
        
        <el-table-column
          :label="$t('m.Actions')"
          width="250"
          align="center"
          fixed="right"
        >
          <template #default="scope">
            <el-button
              type="text"
              size="small"
              @click="editHomework(scope.row)"
            >
              {{ $t('m.Edit') }}
            </el-button>
            <el-button
              type="text"
              size="small"
              @click="viewProgress(scope.row)"
            >
              {{ $t('m.Progress') }}
            </el-button>
            <el-button
              type="text"
              size="small"
              @click="viewStudents(scope.row)"
            >
              {{ $t('m.Students') }}
            </el-button>
            <el-popconfirm
              :title="$t('m.Delete_Homework_Confirm')"
              @confirm="deleteHomework(scope.row)"
            >
              <template #reference>
                <el-button type="text" size="small" class="delete-btn">
                  {{ $t('m.Delete') }}
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- Pagination -->
      <div class="pagination">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 50]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next"
          :total="total"
        />
      </div>
    </Panel>
  </div>
</template>

<script>
import api from '@admin/api'
import time from '@/utils/time'
import dayjs from 'dayjs'

export default {
  name: 'HomeworkList',
  data() {
    return {
      loading: false,
      homeworkList: [],
      searchKeyword: '',
      filterStatus: '',
      currentPage: 1,
      pageSize: 20,
      total: 0
    }
  },
  mounted() {
    this.loadHomeworkList()
  },
  methods: {
    async loadHomeworkList() {
      this.loading = true
      try {
        const params = {
          page: this.currentPage,
          limit: this.pageSize
        }
        
        if (this.searchKeyword) {
          params.keyword = this.searchKeyword
        }
        if (this.filterStatus) {
          params.status = this.filterStatus
        }
        
        const res = await api.getHomeworkList(params)
        this.homeworkList = res.data.data.results || []
        this.total = res.data.data.total || 0
      } catch (err) {
        this.$error(err.data?.data || 'Failed to load homework list')
      } finally {
        this.loading = false
      }
    },
    
    createHomework() {
      this.$router.push({ name: 'admin-create-homework' })
    },
    
    editHomework(homework) {
      this.$router.push({
        name: 'admin-edit-homework',
        params: { id: homework.id }
      })
    },
    
    viewProgress(homework) {
      this.$router.push({
        name: 'admin-homework-progress',
        params: { id: homework.id }
      })
    },
    
    viewStudents(homework) {
      this.$router.push({
        name: 'admin-homework-students',
        params: { id: homework.id }
      })
    },
    
    async deleteHomework(homework) {
      try {
        await api.deleteHomework(homework.id)
        this.$success(this.$t('m.Homework_Deleted'))
        this.loadHomeworkList()
      } catch (err) {
        this.$error(err.data?.data || 'Failed to delete homework')
      }
    },
    
    isOverdue(dueDate) {
      return dayjs(dueDate).isBefore(dayjs())
    },
    
    isEnded(homework) {
      return this.isOverdue(homework.due_date)
    },
    
    getStatusType(homework) {
      if (this.isEnded(homework)) return 'info'
      if (homework.assigned_count === 0) return 'warning'
      return 'success'
    },
    
    getStatusText(homework) {
      if (this.isEnded(homework)) return this.$t('m.Ended')
      if (homework.assigned_count === 0) return this.$t('m.Not_Assigned')
      return this.$t('m.Active')
    },
    
    formatDate(dateStr) {
      return time.utcToLocal(dateStr, 'YYYY-MM-DD HH:mm')
    },
    
    handleSizeChange(size) {
      this.pageSize = size
      this.loadHomeworkList()
    },
    
    handlePageChange(page) {
      this.currentPage = page
      this.loadHomeworkList()
    }
  }
}
</script>

<style lang="scss" scoped>
.homework-list {
  .filter-section {
    margin-bottom: 20px;
  }
  
  .homework-title {
    color: #409eff;
    text-decoration: none;
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  .overdue {
    color: #f56c6c;
  }
  
  .delete-btn {
    color: #f56c6c;
  }
  
  .pagination {
    margin-top: 20px;
    text-align: right;
  }
}
</style>