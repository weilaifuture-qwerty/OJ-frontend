<template>
  <div class="admin-student-management">
    <Panel :title="$t('m.Admin_Student_Management')">
      <div class="panel-header" slot="header">
        <el-button type="primary" size="small" @click="showAssignStudentsDialog" icon="el-icon-plus">
          {{ $t('m.Assign_Students') }}
        </el-button>
      </div>
      
      <!-- Admin List with Student Counts -->
      <el-table
        :data="adminList"
        v-loading="loadingAdmins"
        style="width: 100%"
      >
        <el-table-column
          prop="username"
          :label="$t('m.Admin_Username')"
          min-width="150"
        />
        <el-table-column
          prop="real_name"
          :label="$t('m.Real_Name')"
          min-width="150"
        />
        <el-table-column
          prop="email"
          :label="$t('m.Email')"
          min-width="200"
        />
        <el-table-column
          prop="student_count"
          :label="$t('m.Assigned_Students')"
          width="150"
          align="center"
        >
          <template #default="scope">
            <el-tag type="primary">{{ scope.row.student_count || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('m.Actions')"
          width="200"
          align="center"
        >
          <template #default="scope">
            <el-button
              type="primary"
              link
              size="small"
              @click="viewAdminStudents(scope.row)"
            >
              {{ $t('m.View_Students') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- Admin-Student Relations -->
      <div class="relations-section" v-if="selectedAdmin">
        <h3>{{ $t('m.Students_Assigned_To') }} {{ selectedAdmin.username }}</h3>
        <el-table
          :data="adminStudentRelations"
          v-loading="loadingRelations"
          style="width: 100%"
        >
          <el-table-column
            prop="student.username"
            :label="$t('m.Student_Username')"
            min-width="150"
          />
          <el-table-column
            prop="student.real_name"
            :label="$t('m.Real_Name')"
            min-width="150"
          />
          <el-table-column
            prop="student.email"
            :label="$t('m.Email')"
            min-width="200"
          />
          <el-table-column
            prop="assigned_at"
            :label="$t('m.Assigned_Date')"
            width="180"
          >
            <template #default="scope">
              {{ formatDate(scope.row.assigned_at) }}
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('m.Actions')"
            width="150"
            align="center"
          >
            <template #default="scope">
              <el-popconfirm
                :title="$t('m.Remove_Assignment_Confirm')"
                @confirm="removeAssignment(scope.row.id)"
              >
                <template #reference>
                  <el-button type="danger" size="small" plain>
                    {{ $t('m.Remove') }}
                  </el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </Panel>
    
    <!-- Assign Students Dialog -->
    <el-dialog
      :title="$t('m.Assign_Students_To_Admin')"
      v-model="showAssignDialog"
      width="800px"
      @close="resetAssignForm"
    >
      <el-form ref="assignForm" :model="assignForm" label-width="120px">
        <el-form-item :label="$t('m.Select_Admin')" required>
          <el-select
            v-model="assignForm.admin_id"
            :placeholder="$t('m.Select_Admin')"
            style="width: 100%"
          >
            <el-option
              v-for="admin in adminList"
              :key="admin.id"
              :label="`${admin.username} (${admin.real_name})`"
              :value="admin.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item :label="$t('m.Select_Students')" required>
          <el-transfer
            v-model="assignForm.student_ids"
            :data="availableStudents"
            :titles="[$t('m.Available_Students'), $t('m.Selected_Students')]"
            :props="{
              key: 'id',
              label: 'display_name'
            }"
            filterable
            :filter-placeholder="$t('m.Search_Students')"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showAssignDialog = false">{{ $t('m.Cancel') }}</el-button>
        <el-button type="primary" @click="assignStudents" :loading="assignLoading">
          {{ $t('m.Assign') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import api from '@admin/api'
import { useAdminStore } from '@/stores/admin'
import time from '@/utils/time'

export default {
  name: 'AdminStudentManagement',
  data() {
    return {
      loadingAdmins: false,
      loadingRelations: false,
      assignLoading: false,
      adminList: [],
      adminStudentRelations: [],
      selectedAdmin: null,
      showAssignDialog: false,
      assignForm: {
        admin_id: null,
        student_ids: []
      },
      availableStudents: [],
      allUsers: []
    }
  },
  computed: {
    isSuperAdmin() {
      const adminStore = useAdminStore()
      return adminStore.isSuperAdmin
    }
  },
  mounted() {
    if (!this.isSuperAdmin) {
      this.$error(this.$t('m.Super_Admin_Only'))
      this.$router.push('/admin/')
      return
    }
    this.loadAdminList()
    this.loadAllUsers()
  },
  methods: {
    async loadAdminList() {
      this.loadingAdmins = true
      try {
        const res = await api.getAdminList()
        console.log('[AdminStudentManagement] Admin list response:', res.data)
        // Handle both array and object response formats
        if (Array.isArray(res.data.data)) {
          this.adminList = res.data.data
        } else if (res.data.data && res.data.data.results) {
          this.adminList = res.data.data.results
        } else {
          this.adminList = []
        }
      } catch (err) {
        this.$error(err.data?.data || 'Failed to load admin list')
      } finally {
        this.loadingAdmins = false
      }
    },
    
    async loadAllUsers() {
      try {
        // Load all users for the transfer component
        const res = await api.getUserList(0, 1000)
        if (res.data.data && res.data.data.results) {
          // Filter for regular users only
          this.allUsers = res.data.data.results.filter(user => 
            user.admin_type === 'Regular User' || !user.admin_type
          )
        } else {
          this.allUsers = []
        }
      } catch (err) {
        console.error('Failed to load users:', err)
      }
    },
    
    async viewAdminStudents(admin) {
      this.selectedAdmin = admin
      this.loadingRelations = true
      try {
        const res = await api.getAdminStudentRelations({
          admin_id: admin.id
        })
        console.log('[AdminStudentManagement] Relations response:', res.data)
        // Handle both array and object response formats
        if (Array.isArray(res.data.data)) {
          this.adminStudentRelations = res.data.data
        } else if (res.data.data && res.data.data.results) {
          this.adminStudentRelations = res.data.data.results
        } else {
          this.adminStudentRelations = []
        }
      } catch (err) {
        this.$error(err.data?.data || 'Failed to load relations')
      } finally {
        this.loadingRelations = false
      }
    },
    
    async removeAssignment(relationId) {
      try {
        await api.deleteAdminStudentRelation(relationId)
        this.$success(this.$t('m.Assignment_Removed'))
        // Reload data
        this.loadAdminList()
        if (this.selectedAdmin) {
          this.viewAdminStudents(this.selectedAdmin)
        }
      } catch (err) {
        this.$error(err.data?.data || 'Failed to remove assignment')
      }
    },
    
    showAssignStudentsDialog() {
      // Get already assigned students
      api.getAdminStudentRelations({}).then(res => {
        console.log('[AdminStudentManagement] All relations response:', res.data)
        let relations = []
        if (Array.isArray(res.data.data)) {
          relations = res.data.data
        } else if (res.data.data && res.data.data.results) {
          relations = res.data.data.results
        }
        const assignedStudentIds = new Set(
          relations.map(r => r.student.id)
        )
        
        // Filter out already assigned students
        this.availableStudents = this.allUsers
          .filter(user => !assignedStudentIds.has(user.id))
          .map(user => ({
            id: user.id,
            display_name: `${user.username} (${user.real_name || 'N/A'})`
          }))
      })
      
      this.showAssignDialog = true
    },
    
    async assignStudents() {
      if (!this.assignForm.admin_id || !this.assignForm.student_ids.length) {
        this.$error(this.$t('m.Please_Select_Admin_And_Students'))
        return
      }
      
      this.assignLoading = true
      try {
        // Assign each student to the admin
        const promises = this.assignForm.student_ids.map(studentId => {
          // Ensure IDs are integers
          const adminId = parseInt(this.assignForm.admin_id)
          const studId = parseInt(studentId)
          console.log('[AdminStudentManagement] Assigning student:', studId, 'to admin:', adminId)
          return api.createAdminStudentRelation({
            admin_id: adminId,
            student_id: studId
          })
        })
        
        await Promise.all(promises)
        this.$success(this.$t('m.Students_Assigned_Successfully'))
        this.showAssignDialog = false
        this.resetAssignForm()
        this.loadAdminList()
        
        // Reload selected admin's students if applicable
        if (this.selectedAdmin && this.selectedAdmin.id === this.assignForm.admin_id) {
          this.viewAdminStudents(this.selectedAdmin)
        }
      } catch (err) {
        this.$error(err.data?.data || 'Failed to assign students')
      } finally {
        this.assignLoading = false
      }
    },
    
    resetAssignForm() {
      this.assignForm = {
        admin_id: null,
        student_ids: []
      }
    },
    
    formatDate(dateStr) {
      return time.utcToLocal(dateStr)
    }
  }
}
</script>

<style lang="scss" scoped>
.admin-student-management {
  .panel-header {
    margin-bottom: 20px;
  }
  
  .relations-section {
    margin-top: 40px;
    
    h3 {
      margin-bottom: 20px;
      color: #333;
    }
  }
  
  ::v-deep .el-transfer {
    .el-transfer-panel {
      width: 300px;
    }
  }
}
</style>