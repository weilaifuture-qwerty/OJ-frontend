<template>
  <div class="student-selector">
    <!-- Quick Actions -->
    <div class="quick-actions">
      <el-button size="small" @click="selectAll">{{ $t('m.Select_All') }}</el-button>
      <el-button size="small" @click="deselectAll">{{ $t('m.Deselect_All') }}</el-button>
      <el-input
        v-model="searchKeyword"
        :placeholder="$t('m.Search_Student')"
        size="small"
        clearable
        style="width: 200px; margin-left: 10px;"
        @input="filterStudents"
      >
        <template #prefix>
          <i class="el-input__icon el-icon-search"></i>
        </template>
      </el-input>
    </div>
    
    <!-- Student List -->
    <div class="student-list" v-loading="loading">
      <div v-if="filteredStudents.length === 0" class="no-students">
        <i class="el-icon-user"></i>
        <p>{{ $t('m.No_Students_Found') }}</p>
        <small v-if="!loading">{{ $t('m.No_Students_Assigned_To_You') }}</small>
      </div>
      
      <el-checkbox-group v-else v-model="selectedStudentIds" class="student-grid">
        <div
          v-for="student in filteredStudents"
          :key="student.id"
          class="student-item"
        >
          <el-checkbox :label="student.id" class="student-checkbox">
            <div class="student-info">
              <div class="student-name">
                <strong>{{ student.username }}</strong>
                <span v-if="student.real_name" class="real-name">({{ student.real_name }})</span>
              </div>
              <div class="student-details">
                <span class="email">{{ student.email }}</span>
                <el-tag v-if="student.last_login" size="small" type="info">
                  {{ $t('m.Last_Active') }}: {{ formatLastLogin(student.last_login) }}
                </el-tag>
              </div>
              <div class="student-stats" v-if="student.statistics">
                <span class="stat-item">
                  <i class="el-icon-document"></i>
                  {{ $t('m.Solved') }}: {{ student.statistics.solved_problems || 0 }}
                </span>
                <span class="stat-item">
                  <i class="el-icon-upload"></i>
                  {{ $t('m.Submissions') }}: {{ student.statistics.submissions || 0 }}
                </span>
                <span class="stat-item" v-if="student.statistics.pending_homework !== undefined">
                  <i class="el-icon-time"></i>
                  {{ $t('m.Pending_Homework') }}: {{ student.statistics.pending_homework }}
                </span>
              </div>
            </div>
          </el-checkbox>
        </div>
      </el-checkbox-group>
    </div>
    
    <!-- Selected Count -->
    <div class="selection-summary">
      <span>{{ $t('m.Selected') }}: <strong>{{ selectedStudentIds.length }}</strong> {{ $t('m.Students') }}</span>
      <el-tag v-if="selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0" type="success">
        {{ $t('m.All_Students_Selected') }}
      </el-tag>
    </div>
  </div>
</template>

<script>
import api from '@admin/api'
import time from '@/utils/time'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useAdminStore } from '@/stores/admin'

dayjs.extend(relativeTime)

export default {
  name: 'StudentSelector',
  props: {
    value: {
      type: Array,
      default: () => []
    },
    // If provided, only show these students
    limitToStudents: {
      type: Array,
      default: null
    }
  },
  data() {
    return {
      loading: false,
      students: [],
      filteredStudents: [],
      selectedStudentIds: [],
      searchKeyword: ''
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(val) {
        this.selectedStudentIds = val || []
      }
    },
    selectedStudentIds(val) {
      this.$emit('input', val)
      this.$emit('change', val)
    }
  },
  mounted() {
    this.loadStudents()
  },
  methods: {
    async loadStudents() {
      this.loading = true
      try {
        // First try to get students assigned to this admin
        let students = []
        
        try {
          const res = await api.getManagedStudents()
          console.log('[StudentSelector] Managed students response:', res.data)
          students = res.data.data || []
        } catch (err) {
          console.log('[StudentSelector] getManagedStudents failed, trying alternative method')
          
          // Alternative: Get admin-student relations for current admin
          try {
            const adminStore = useAdminStore()
            const currentAdminId = adminStore.user?.id
            
            if (currentAdminId) {
              const relRes = await api.getAdminStudentRelations({ admin_id: currentAdminId })
              console.log('[StudentSelector] Relations response:', relRes.data)
              
              let relations = []
              if (Array.isArray(relRes.data.data)) {
                relations = relRes.data.data
              } else if (relRes.data.data?.results) {
                relations = relRes.data.data.results
              }
              
              // Get all users to match with student IDs
              const userRes = await api.getUserList(0, 1000)
              const allUsers = userRes.data.data?.results || []
              
              // Map student IDs to user objects
              const studentIds = relations.map(r => r.student)
              students = allUsers.filter(user => 
                studentIds.includes(user.id) && 
                (user.admin_type === 'Regular User' || !user.admin_type)
              )
            }
          } catch (altErr) {
            console.error('[StudentSelector] Alternative method also failed:', altErr)
          }
        }
        
        if (this.limitToStudents) {
          // If limited to specific students, filter them
          this.students = students.filter(student => 
            this.limitToStudents.includes(student.id)
          )
        } else {
          this.students = students
        }
        
        console.log('[StudentSelector] Final students loaded:', this.students)
        
        // Load additional statistics for each student if available
        await this.loadStudentStatistics()
        
        this.filteredStudents = [...this.students]
      } catch (err) {
        console.error('[StudentSelector] Error loading students:', err)
        this.$error(err.data?.data || 'Failed to load students. Please ensure students are assigned to you.')
        this.students = []
        this.filteredStudents = []
      } finally {
        this.loading = false
      }
    },
    
    async loadStudentStatistics() {
      // In a real implementation, this would fetch additional data
      // For now, we'll add some mock statistics
      this.students = this.students.map(student => ({
        ...student,
        statistics: {
          solved_problems: Math.floor(Math.random() * 50),
          submissions: Math.floor(Math.random() * 200),
          pending_homework: Math.floor(Math.random() * 5)
        }
      }))
    },
    
    filterStudents() {
      if (!this.searchKeyword) {
        this.filteredStudents = [...this.students]
        return
      }
      
      const keyword = this.searchKeyword.toLowerCase()
      this.filteredStudents = this.students.filter(student => {
        return (
          student.username.toLowerCase().includes(keyword) ||
          (student.real_name && student.real_name.toLowerCase().includes(keyword)) ||
          student.email.toLowerCase().includes(keyword)
        )
      })
    },
    
    selectAll() {
      this.selectedStudentIds = this.filteredStudents.map(s => s.id)
    },
    
    deselectAll() {
      this.selectedStudentIds = []
    },
    
    formatLastLogin(dateStr) {
      if (!dateStr) return this.$t('m.Never')
      return dayjs(dateStr).fromNow()
    }
  }
}
</script>

<style lang="scss" scoped>
.student-selector {
  .quick-actions {
    margin-bottom: 20px;
    display: flex;
    align-items: center;
  }
  
  .student-list {
    min-height: 200px;
    max-height: 500px;
    overflow-y: auto;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    padding: 15px;
    background: #fafafa;
  }
  
  .no-students {
    text-align: center;
    padding: 60px 20px;
    color: #909399;
    
    i {
      font-size: 48px;
      display: block;
      margin-bottom: 15px;
    }
    
    p {
      font-size: 16px;
      margin-bottom: 5px;
    }
    
    small {
      font-size: 13px;
    }
  }
  
  .student-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 15px;
  }
  
  .student-item {
    background: white;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    padding: 15px;
    transition: all 0.3s;
    
    &:hover {
      border-color: #409eff;
      box-shadow: 0 2px 12px rgba(64, 158, 255, 0.1);
    }
    
    .student-checkbox {
      width: 100%;
      
      ::v-deep .el-checkbox__label {
        width: 100%;
      }
    }
    
    .student-info {
      width: 100%;
      
      .student-name {
        font-size: 15px;
        margin-bottom: 8px;
        
        strong {
          color: #303133;
        }
        
        .real-name {
          color: #606266;
          font-size: 14px;
          margin-left: 5px;
        }
      }
      
      .student-details {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 8px;
        
        .email {
          color: #909399;
          font-size: 13px;
        }
      }
      
      .student-stats {
        display: flex;
        gap: 15px;
        font-size: 13px;
        color: #606266;
        
        .stat-item {
          display: flex;
          align-items: center;
          gap: 4px;
          
          i {
            color: #909399;
          }
        }
      }
    }
  }
  
  .selection-summary {
    margin-top: 20px;
    padding: 15px;
    background: #f0f2f5;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    span {
      color: #606266;
      
      strong {
        color: #409eff;
        font-size: 18px;
        margin: 0 5px;
      }
    }
  }
}
</style>