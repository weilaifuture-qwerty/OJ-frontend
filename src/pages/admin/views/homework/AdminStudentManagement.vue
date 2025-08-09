<!-- unplugin-vue-components disabled -->
<template>
  <div class="admin-student-management">
    <Panel :title="$t('m.Admin_Student_Management')">
      <!-- Tab navigation for Admin and Student management -->
      <el-tabs v-model="activeTab" class="management-tabs">
        <el-tab-pane label="Student Assignments" name="assignments">
          <!-- Modern redesigned admin list -->
      <el-table
        ref="adminTable"
        :data="adminList"
        v-loading="loadingAdmins"
        style="width: 100%"
        :row-class-name="tableRowClassName"
        @expand-change="handleExpandChange"
      >
        <!-- Expandable row to show assigned students -->
        <el-table-column type="expand">
          <template #default="props">
            <div class="expand-content" v-loading="expandedLoadingStates[props.row.id]">
              <div class="assigned-students-header">
                <h4>
                  <Icon type="md-people" />
                  Assigned Students ({{ getAdminStudentCount(props.row.id) }})
                </h4>
                <el-button
                  type="primary"
                  size="small"
                  @click="showAssignDialogForAdmin(props.row)"
                >
                  <Icon type="md-add" />
                  Add Students
                </el-button>
              </div>
              
              <el-table
                :data="expandedStudentData[props.row.id] || []"
                size="small"
                :empty-text="'No students assigned to this admin'"
                class="nested-table"
              >
                <el-table-column
                  prop="student_username"
                  label="Username"
                  min-width="120"
                />
                <el-table-column
                  prop="student"
                  label="ID"
                  width="80"
                  align="center"
                />
                <el-table-column
                  prop="assigned_at"
                  label="Assigned Date"
                  width="180"
                >
                  <template #default="scope">
                    {{ formatDate(scope.row.assigned_at) }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="is_active"
                  label="Status"
                  width="100"
                  align="center"
                >
                  <template #default="scope">
                    <el-tag :type="scope.row.is_active ? 'success' : 'danger'" size="small">
                      {{ scope.row.is_active ? 'Active' : 'Inactive' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column
                  label="Actions"
                  width="100"
                  align="center"
                >
                  <template #default="scope">
                    <el-popconfirm
                      :title="$t('m.Remove_Assignment_Confirm')"
                      @confirm="removeAssignment(scope.row.id, props.row.id)"
                    >
                      <template #reference>
                        <el-button type="danger" :link="true" size="small">
                          <Icon type="md-trash" />
                          Remove
                        </el-button>
                      </template>
                    </el-popconfirm>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </template>
        </el-table-column>
        
        <!-- Admin info columns -->
        <el-table-column
          prop="username"
          :label="$t('m.Username')"
          min-width="150"
        >
          <template #default="scope">
            <div class="username-cell">
              <Icon type="md-person" />
              <strong>{{ scope.row.username }}</strong>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="real_name"
          :label="$t('m.Real_Name')"
          min-width="150"
        />
        <el-table-column
          prop="email"
          :label="$t('m.Email')"
          min-width="200"
          show-overflow-tooltip
        />
        <el-table-column
          :label="$t('m.Actions')"
          width="250"
          align="center"
          fixed="right"
        >
          <template #default="scope">
            <el-button-group>
              <el-button
                type="primary"
                size="small"
                @click="showAssignDialogForAdmin(scope.row)"
              >
                <Icon type="md-person-add" />
                Assign Students
              </el-button>
              <el-button
                type="info"
                size="small"
                @click="toggleRowExpansion(scope.row)"
              >
                <Icon :type="isRowExpanded(scope.row) ? 'md-eye-off' : 'md-eye'" />
                {{ isRowExpanded(scope.row) ? 'Hide' : 'View' }}
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
        </el-tab-pane>
        
        <el-tab-pane label="Admin Users" name="admins">
          <div class="admin-management-section">
            <div class="section-header">
              <h3>
                <Icon type="md-people" />
                Admin User Management
              </h3>
              <el-button
                type="primary"
                @click="showCreateAdminDialog = true"
              >
                <Icon type="md-add" />
                Create Admin User
              </el-button>
            </div>
            
            <el-table
              :data="adminUserList"
              v-loading="loadingAdminUsers"
              style="width: 100%"
              class="admin-users-table"
            >
              <el-table-column
                prop="username"
                label="Username"
                min-width="150"
              />
              <el-table-column
                prop="real_name"
                label="Real Name"
                min-width="150"
              />
              <el-table-column
                prop="email"
                label="Email"
                min-width="200"
                show-overflow-tooltip
              />
              <el-table-column
                prop="admin_type"
                label="Admin Type"
                width="140"
                align="center"
              >
                <template #default="scope">
                  <el-tag :type="getAdminTypeTagType(scope.row.admin_type)">
                    {{ scope.row.admin_type }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column
                prop="problem_permission"
                label="Problem Permission"
                width="160"
                align="center"
              >
                <template #default="scope">
                  <el-tag size="small">
                    {{ scope.row.problem_permission || 'None' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column
                label="Actions"
                width="200"
                align="center"
                fixed="right"
              >
                <template #default="scope">
                  <el-button
                    type="primary"
                    size="small"
                    @click="editAdminUser(scope.row)"
                  >
                    <Icon type="md-create" />
                    Edit
                  </el-button>
                  <el-popconfirm
                    :title="'Are you sure you want to delete this admin user?'"
                    @confirm="deleteAdminUser(scope.row.id)"
                  >
                    <template #reference>
                      <el-button
                        type="danger"
                        size="small"
                        :disabled="scope.row.admin_type === 'Super Admin'"
                      >
                        <Icon type="md-trash" />
                        Delete
                      </el-button>
                    </template>
                  </el-popconfirm>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </Panel>
    
    <!-- Redesigned Assign Students Dialog -->
    <el-dialog
      :title="assignDialogTitle"
      v-model="showAssignDialog"
      width="900px"
      @close="resetAssignForm"
      custom-class="assign-dialog"
    >
      <div class="assign-dialog-content">
        <!-- Selected Admin Display -->
        <div class="selected-admin-display" v-if="assignForm.admin_id">
          <Icon type="md-person" size="20" />
          <span>Assigning students to: <strong>{{ getAdminName(assignForm.admin_id) }}</strong></span>
        </div>
        
        <!-- Compact Student Selection -->
        <div class="student-selection-grid">
          <!-- Available Students -->
          <div class="student-panel available-panel">
            <div class="panel-header">
              <h4>
                <Icon type="md-people-outline" />
                Available Students
                <el-tag size="small" type="info">{{ filteredAvailableStudents.length }}</el-tag>
              </h4>
              <el-input
                v-model="availableSearch"
                size="small"
                placeholder="Search students..."
                prefix-icon="el-icon-search"
                clearable
              />
            </div>
            <div class="student-list">
              <el-checkbox-group v-model="tempSelectedIds" class="student-checkbox-group">
                <div
                  v-for="student in filteredAvailableStudents"
                  :key="student.id"
                  class="student-item"
                >
                  <el-checkbox :label="student.id">
                    <div class="student-info">
                      <span class="student-name">{{ student.username }}</span>
                      <span class="student-detail">{{ student.real_name || 'No name' }}</span>
                    </div>
                  </el-checkbox>
                </div>
              </el-checkbox-group>
              <el-empty 
                v-if="filteredAvailableStudents.length === 0" 
                description="No available students"
                :image-size="60"
              />
            </div>
          </div>
          
          <!-- Transfer Buttons -->
          <div class="transfer-buttons">
            <el-button 
              type="primary" 
              circle 
              @click="addSelectedStudents"
              :disabled="tempSelectedIds.length === 0"
            >
              <Icon type="md-arrow-forward" />
            </el-button>
            <el-button 
              circle 
              @click="removeSelectedStudents"
              :disabled="tempRemovedIds.length === 0"
            >
              <Icon type="md-arrow-back" />
            </el-button>
          </div>
          
          <!-- Selected Students -->
          <div class="student-panel selected-panel">
            <div class="panel-header">
              <h4>
                <Icon type="md-people" />
                Selected Students
                <el-tag size="small" type="success">{{ assignForm.student_ids.length }}</el-tag>
              </h4>
              <el-button
                v-if="assignForm.student_ids.length > 0"
                type=""
                size="small"
                @click="clearAllSelected"
              >
                Clear All
              </el-button>
            </div>
            <div class="student-list">
              <el-checkbox-group v-model="tempRemovedIds" class="student-checkbox-group">
                <div
                  v-for="studentId in assignForm.student_ids"
                  :key="studentId"
                  class="student-item selected"
                >
                  <el-checkbox :label="studentId">
                    <div class="student-info">
                      <span class="student-name">{{ getStudentInfo(studentId).username }}</span>
                      <span class="student-detail">{{ getStudentInfo(studentId).real_name || 'No name' }}</span>
                    </div>
                  </el-checkbox>
                </div>
              </el-checkbox-group>
              <el-empty 
                v-if="assignForm.student_ids.length === 0" 
                description="No students selected"
                :image-size="60"
              />
            </div>
          </div>
        </div>
        
        <!-- Quick Actions -->
        <div class="quick-actions">
          <el-button size="small" @click="selectAllAvailable">
            Select All Available
          </el-button>
          <span class="action-hint">
            <Icon type="md-information-circle" />
            Use checkboxes to select multiple students at once
          </span>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showAssignDialog = false">Cancel</el-button>
          <el-button 
            type="primary" 
            @click="assignStudents" 
            :loading="assignLoading"
            :disabled="assignForm.student_ids.length === 0"
          >
            <Icon type="md-checkmark" />
            Assign {{ assignForm.student_ids.length }} Student{{ assignForm.student_ids.length !== 1 ? 's' : '' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- Create Admin Dialog -->
    <el-dialog
      title="Create Admin User"
      v-model="showCreateAdminDialog"
      width="600px"
      @close="resetAdminForm"
    >
      <el-form :model="adminForm" label-width="140px" ref="adminForm">
        <el-form-item label="Username" :rules="[{ required: true, message: 'Username is required' }]">
          <el-input v-model="adminForm.username" placeholder="Enter username" />
        </el-form-item>
        <el-form-item label="Real Name" :rules="[{ required: true, message: 'Real name is required' }]">
          <el-input v-model="adminForm.real_name" placeholder="Enter real name" />
        </el-form-item>
        <el-form-item label="Email" :rules="[{ required: true, type: 'email', message: 'Valid email is required' }]">
          <el-input v-model="adminForm.email" placeholder="Enter email address" />
        </el-form-item>
        <el-form-item label="Password" :rules="[{ required: true, message: 'Password is required' }]">
          <el-input v-model="adminForm.password" type="password" placeholder="Enter password" show-password />
        </el-form-item>
        <el-form-item label="Admin Type">
          <el-select v-model="adminForm.admin_type" style="width: 100%">
            <el-option label="Admin" value="Admin" />
            <el-option label="Super Admin" value="Super Admin" />
          </el-select>
        </el-form-item>
        <el-form-item label="Problem Permission">
          <el-select v-model="adminForm.problem_permission" style="width: 100%" :disabled="adminForm.admin_type !== 'Admin'">
            <el-option label="None" value="None" />
            <el-option label="Own" value="Own" />
            <el-option label="All" value="All" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showCreateAdminDialog = false">Cancel</el-button>
          <el-button type="primary" @click="saveAdminUser">
            <Icon type="md-checkmark" />
            Create Admin
          </el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- Edit Admin Dialog -->
    <el-dialog
      title="Edit Admin User"
      v-model="showEditAdminDialog"
      width="600px"
      @close="resetAdminForm"
    >
      <el-form :model="adminForm" label-width="140px" ref="editAdminForm">
        <el-form-item label="Username">
          <el-input v-model="adminForm.username" disabled />
        </el-form-item>
        <el-form-item label="Real Name" :rules="[{ required: true, message: 'Real name is required' }]">
          <el-input v-model="adminForm.real_name" placeholder="Enter real name" />
        </el-form-item>
        <el-form-item label="Email" :rules="[{ required: true, type: 'email', message: 'Valid email is required' }]">
          <el-input v-model="adminForm.email" placeholder="Enter email address" />
        </el-form-item>
        <el-form-item label="New Password">
          <el-input v-model="adminForm.password" type="password" placeholder="Leave blank to keep current password" show-password />
        </el-form-item>
        <el-form-item label="Admin Type">
          <el-select v-model="adminForm.admin_type" style="width: 100%">
            <el-option label="Admin" value="Admin" />
            <el-option label="Super Admin" value="Super Admin" />
          </el-select>
        </el-form-item>
        <el-form-item label="Problem Permission">
          <el-select v-model="adminForm.problem_permission" style="width: 100%" :disabled="adminForm.admin_type !== 'Admin'">
            <el-option label="None" value="None" />
            <el-option label="Own" value="Own" />
            <el-option label="All" value="All" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showEditAdminDialog = false">Cancel</el-button>
          <el-button type="primary" @click="saveAdminUser">
            <Icon type="md-checkmark" />
            Update Admin
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import api from '@admin/api'
import { useAdminStore } from '@/stores/admin'
import time from '@/utils/time'
import { Icon } from 'view-ui-plus'

export default {
  name: 'AdminStudentManagement',
  components: {
    Icon
  },
  data() {
    return {
      loadingAdmins: false,
      loadingRelations: false,
      expandedRows: [],
      expandedLoadingStates: {},
      expandedStudentData: {},
      tableRef: null,
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
      allUsers: [],
      availableSearch: '',
      tempSelectedIds: [],
      tempRemovedIds: [],
      activeTab: 'assignments',
      adminUserList: [],
      loadingAdminUsers: false,
      showCreateAdminDialog: false,
      showEditAdminDialog: false,
      adminForm: {
        id: null,
        username: '',
        real_name: '',
        email: '',
        password: '',
        admin_type: 'Admin',
        problem_permission: 'None'
      }
    }
  },
  computed: {
    isSuperAdmin() {
      const adminStore = useAdminStore()
      return adminStore.isSuperAdmin
    },
    assignDialogTitle() {
      if (this.assignForm.admin_id) {
        const admin = this.adminList.find(a => a.id === this.assignForm.admin_id)
        return admin ? `Assign Students to ${admin.username}` : 'Assign Students'
      }
      return 'Assign Students'
    },
    filteredAvailableStudents() {
      if (!this.availableSearch) {
        return this.availableStudents
      }
      const search = this.availableSearch.toLowerCase()
      return this.availableStudents.filter(student => 
        student.username.toLowerCase().includes(search) ||
        (student.real_name && student.real_name.toLowerCase().includes(search))
      )
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
    this.loadAdminUsers()
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
        console.log('[AdminStudentManagement] User list response:', res.data)
        
        if (res.data.data && res.data.data.results) {
          const allResults = res.data.data.results
          console.log('[AdminStudentManagement] All users before filter:', allResults)
          console.log('[AdminStudentManagement] User admin types:', allResults.map(u => ({ id: u.id, username: u.username, admin_type: u.admin_type })))
          
          // Only show regular users (students)
          this.allUsers = allResults.filter(user => {
            const adminType = user.admin_type || (user.user && user.user.admin_type)
            // Only include Regular Users or users without admin_type (which are regular users)
            return !adminType || adminType === 'Regular User'
          })
          
          console.log('[AdminStudentManagement] Filtered users (students):', this.allUsers)
        } else {
          this.allUsers = []
        }
      } catch (err) {
        console.error('[AdminStudentManagement] Failed to load users:', err)
        this.allUsers = []
      }
    },
    
    async viewAdminStudents(admin) {
      this.selectedAdmin = admin
      this.loadingRelations = true
      try {
        const res = await api.getAdminStudentRelations({
          admin_id: admin.id
        })
        console.log('[AdminStudentManagement] View admin students - Admin ID:', admin.id)
        console.log('[AdminStudentManagement] Relations response:', res)
        console.log('[AdminStudentManagement] Relations data:', res.data)
        console.log('[AdminStudentManagement] Relations data.data:', res.data?.data)
        
        // Handle both array and object response formats
        if (res.data && Array.isArray(res.data)) {
          this.adminStudentRelations = res.data
        } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
          this.adminStudentRelations = res.data.data
        } else if (res.data && res.data.data && res.data.data.results) {
          this.adminStudentRelations = res.data.data.results
        } else if (res.data && res.data.results) {
          this.adminStudentRelations = res.data.results
        } else {
          console.warn('[AdminStudentManagement] Unexpected response structure:', res)
          this.adminStudentRelations = []
        }
        
        console.log('[AdminStudentManagement] Final relations array:', this.adminStudentRelations)
        if (this.adminStudentRelations.length > 0) {
          console.log('[AdminStudentManagement] First relation object keys:', Object.keys(this.adminStudentRelations[0]))
          console.log('[AdminStudentManagement] First relation object:', this.adminStudentRelations[0])
        }
      } catch (err) {
        console.error('[AdminStudentManagement] Error loading relations:', err)
        this.$error(err.data?.data || 'Failed to load relations')
      } finally {
        this.loadingRelations = false
      }
    },
    
    async removeAssignment(relationId, adminId) {
      try {
        await api.deleteAdminStudentRelation(relationId)
        this.$success(this.$t('m.Assignment_Removed'))
        // Reload data for this admin
        if (adminId && this.expandedStudentData[adminId]) {
          await this.loadAdminStudents(adminId)
        }
        this.loadAdminList()
      } catch (err) {
        this.$error(err.data?.data || 'Failed to remove assignment')
      }
    },
    
    // New methods for expandable table
    handleExpandChange(row, expandedRows) {
      this.expandedRows = expandedRows
      const isExpanded = expandedRows.some(r => r.id === row.id)
      if (isExpanded) {
        // Row is being expanded
        this.loadAdminStudents(row.id)
      }
    },
    
    async loadAdminStudents(adminId) {
      this.expandedLoadingStates[adminId] = true
      try {
        const res = await api.getAdminStudentRelations({
          admin_id: adminId
        })
        
        let relations = []
        if (res.data && res.data.data) {
          if (Array.isArray(res.data.data)) {
            relations = res.data.data
          } else if (res.data.data.results) {
            relations = res.data.data.results
          }
        }
        
        this.expandedStudentData[adminId] = relations
      } catch (err) {
        console.error('Failed to load admin students:', err)
        this.expandedStudentData[adminId] = []
      } finally {
        this.expandedLoadingStates[adminId] = false
      }
    },
    
    toggleRowExpansion(row) {
      this.$refs.adminTable?.toggleRowExpansion(row)
    },
    
    isRowExpanded(row) {
      return this.expandedRows.some(r => r.id === row.id)
    },
    
    getAdminStudentCount(adminId) {
      const students = this.expandedStudentData[adminId]
      return students ? students.length : 0
    },
    
    showAssignDialogForAdmin(admin) {
      this.assignForm.admin_id = admin.id
      this.showAssignStudentsDialog()
    },
    
    tableRowClassName({row, rowIndex}) {
      return ''
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
        
        // student field is the student ID, not an object
        const assignedStudentIds = new Set(
          relations.map(r => r.student)
        )
        
        console.log('[AdminStudentManagement] Assigned student IDs:', Array.from(assignedStudentIds))
        console.log('[AdminStudentManagement] All users:', this.allUsers)
        
        // Filter out already assigned students
        this.availableStudents = this.allUsers
          .filter(user => !assignedStudentIds.has(user.id))
          .map(user => ({
            id: user.id,
            username: user.username,
            real_name: user.real_name,
            display_name: `${user.username} (${user.real_name || 'N/A'})`
          }))
          
        console.log('[AdminStudentManagement] Available students:', this.availableStudents)
      }).catch(err => {
        console.error('[AdminStudentManagement] Error loading relations:', err)
        // If error, show all users as available
        this.availableStudents = this.allUsers.map(user => ({
          id: user.id,
          username: user.username,
          real_name: user.real_name,
          display_name: `${user.username} (${user.real_name || 'N/A'})`
        }))
      })
      
      this.showAssignDialog = true
    },
    
    async assignStudents() {
      // Clear any existing validation errors
      if (this.$refs.assignForm) {
        this.$refs.assignForm.clearValidate()
      }
      
      if (!this.assignForm.admin_id || !this.assignForm.student_ids.length) {
        this.$error(this.$t('m.Please_Select_Admin_And_Students'))
        return
      }
      
      this.assignLoading = true
      try {
        // Try sending all student IDs at once
        const adminId = parseInt(this.assignForm.admin_id)
        const studentIds = this.assignForm.student_ids.map(id => parseInt(id))
        
        console.log('[AdminStudentManagement] Assigning students:', studentIds, 'to admin:', adminId)
        
        // Try sending with student_ids as an array
        const payload = {
          admin_id: adminId,
          student_ids: studentIds
        }
        console.log('[AdminStudentManagement] API payload:', payload)
        
        await api.createAdminStudentRelation(payload)
        this.$success(this.$t('m.Students_Assigned_Successfully'))
        this.showAssignDialog = false
        
        // Reload the admin's expanded data if it's currently expanded
        if (this.expandedStudentData[adminId]) {
          await this.loadAdminStudents(adminId)
        }
        
        this.resetAssignForm()
        this.loadAdminList()
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
      this.availableSearch = ''
      this.tempSelectedIds = []
      this.tempRemovedIds = []
    },
    
    // New methods for redesigned dialog
    getAdminName(adminId) {
      const admin = this.adminList.find(a => a.id === adminId)
      return admin ? `${admin.username} (${admin.real_name || 'No name'})` : ''
    },
    
    getStudentInfo(studentId) {
      const student = this.allUsers.find(u => u.id === studentId)
      return student || { username: `Student ${studentId}`, real_name: '' }
    },
    
    addSelectedStudents() {
      this.assignForm.student_ids = [
        ...this.assignForm.student_ids,
        ...this.tempSelectedIds.filter(id => !this.assignForm.student_ids.includes(id))
      ]
      this.tempSelectedIds = []
    },
    
    removeSelectedStudents() {
      this.assignForm.student_ids = this.assignForm.student_ids.filter(
        id => !this.tempRemovedIds.includes(id)
      )
      this.tempRemovedIds = []
    },
    
    selectAllAvailable() {
      const availableIds = this.filteredAvailableStudents.map(s => s.id)
      this.assignForm.student_ids = [
        ...this.assignForm.student_ids,
        ...availableIds.filter(id => !this.assignForm.student_ids.includes(id))
      ]
    },
    
    clearAllSelected() {
      this.assignForm.student_ids = []
      this.tempRemovedIds = []
    },
    
    formatDate(dateStr) {
      return time.utcToLocal(dateStr)
    },
    
    // Admin user management methods
    async loadAdminUsers() {
      this.loadingAdminUsers = true
      try {
        const res = await api.getUserList(0, 1000)
        if (res.data.data && res.data.data.results) {
          // Filter to show only Admin and Super Admin users
          this.adminUserList = res.data.data.results.filter(user => {
            const adminType = user.admin_type || ''
            return adminType === 'Admin' || adminType === 'Super Admin'
          })
        }
      } catch (err) {
        this.$error('Failed to load admin users')
      } finally {
        this.loadingAdminUsers = false
      }
    },
    
    getAdminTypeTagType(adminType) {
      return adminType === 'Super Admin' ? 'danger' : 'warning'
    },
    
    editAdminUser(admin) {
      this.adminForm = {
        id: admin.id,
        username: admin.username,
        real_name: admin.real_name,
        email: admin.email,
        password: '',
        admin_type: admin.admin_type,
        problem_permission: admin.problem_permission || 'None'
      }
      this.showEditAdminDialog = true
    },
    
    async deleteAdminUser(adminId) {
      try {
        await api.deleteUsers(String(adminId))
        this.$success('Admin user deleted successfully')
        this.loadAdminUsers()
        this.loadAdminList()
      } catch (err) {
        this.$error(err.data?.data || 'Failed to delete admin user')
      }
    },
    
    resetAdminForm() {
      this.adminForm = {
        id: null,
        username: '',
        real_name: '',
        email: '',
        password: '',
        admin_type: 'Admin',
        problem_permission: 'None'
      }
    },
    
    async saveAdminUser() {
      try {
        if (this.adminForm.id) {
          // Edit existing admin
          await api.editUser(this.adminForm)
          this.$success('Admin user updated successfully')
          this.showEditAdminDialog = false
        } else {
          // Create new admin
          await api.createUser({
            username: this.adminForm.username,
            real_name: this.adminForm.real_name,
            email: this.adminForm.email,
            password: this.adminForm.password,
            admin_type: this.adminForm.admin_type,
            problem_permission: this.adminForm.problem_permission
          })
          this.$success('Admin user created successfully')
          this.showCreateAdminDialog = false
        }
        this.resetAdminForm()
        this.loadAdminUsers()
        this.loadAdminList()
      } catch (err) {
        this.$error(err.data?.data || 'Failed to save admin user')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.admin-student-management {
  ::v-deep .ivu-card-body {
    padding: 30px;
  }
  
  ::v-deep .el-table {
    font-size: 15px;
    
    .el-table__header th {
      padding: 16px 0;
      font-size: 14px;
      font-weight: 600;
      background-color: #f8f9fb;
    }
    
    .el-table__body td {
      padding: 20px 0;
    }
    
    .el-table__row {
      &:hover {
        background-color: #f5f7fa;
      }
    }
  }
  
  .username-cell {
    display: flex;
    align-items: center;
    gap: 12px;
    
    i {
      color: #2d8cf0;
      font-size: 18px;
    }
    
    strong {
      font-size: 15px;
    }
  }
  
  .expand-content {
    padding: 30px 50px;
    background-color: #f8f9fa;
    
    .assigned-students-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid #e4e7ed;
      
      h4 {
        margin: 0;
        color: #17233d;
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 18px;
        
        i {
          color: #2d8cf0;
          font-size: 22px;
        }
      }
      
      .el-button {
        padding: 10px 20px;
        font-size: 14px;
      }
    }
    
    .nested-table {
      background-color: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      
      ::v-deep .el-table__header th {
        padding: 14px 0;
        background-color: #f5f7fa;
      }
      
      ::v-deep .el-table__body td {
        padding: 16px 0;
      }
    }
  }
  
  ::v-deep .el-table__expanded-cell {
    padding: 0 !important;
  }
  
  ::v-deep .el-badge__content {
    height: 18px;
    line-height: 18px;
    padding: 0 6px;
    font-size: 11px;
  }
  
  ::v-deep .el-button-group {
    display: flex;
    gap: 0;
    
    .el-button {
      padding: 10px 20px;
      font-size: 14px;
      
      &:first-child {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }
      
      &:last-child {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
        border-left: none;
      }
    }
  }
  
  // Action buttons spacing
  .el-button {
    i {
      margin-right: 6px;
      font-size: 16px;
    }
  }
  
  // Table row spacing
  ::v-deep .el-table__body-wrapper {
    .el-table__row {
      &:not(:last-child) {
        border-bottom: 1px solid #f0f0f0;
      }
    }
  }
  
  ::v-deep .el-transfer {
    .el-transfer-panel {
      width: 300px;
    }
  }
}

// Assign Dialog Redesign Styles
.assign-dialog {
  ::v-deep .el-dialog__header {
    padding: 24px 24px 20px;
    font-size: 18px;
  }
  
  ::v-deep .el-dialog__body {
    padding: 0 30px 30px;
  }
  
  ::v-deep .el-dialog__footer {
    padding: 20px 30px;
    border-top: 1px solid #e4e7ed;
  }
}

.assign-dialog-content {
  .selected-admin-display {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    background: #f0f2f5;
    border-radius: 8px;
    margin-bottom: 30px;
    font-size: 15px;
    
    i {
      color: #667eea;
    }
    
    strong {
      color: #2c3e50;
    }
  }
  
  .student-selection-grid {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 20px;
    height: 400px;
    margin-bottom: 16px;
  }
  
  .student-panel {
    display: flex;
    flex-direction: column;
    border: 1px solid #e4e7ed;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
    
    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      background: #f5f7fa;
      border-bottom: 1px solid #e4e7ed;
      
      h4 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 10px;
        
        i {
          font-size: 20px;
          color: #667eea;
        }
        
        .el-tag {
          margin-left: 10px;
          font-size: 13px;
        }
      }
      
      .el-input {
        width: 200px;
      }
    }
    
    .student-list {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      background: white;
    }
    
    &.selected-panel {
      .panel-header {
        background: #f0f9ff;
        
        h4 i {
          color: #52c41a;
        }
      }
    }
  }
  
  .transfer-buttons {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 10px;
  }
  
  .student-checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .student-item {
    padding: 12px 16px;
    margin-bottom: 8px;
    border-radius: 8px;
    border: 1px solid transparent;
    transition: all 0.2s ease;
    
    &:hover {
      background: #f5f7fa;
      border-color: #e4e7ed;
    }
    
    &.selected {
      background: #f0f9ff;
      border-color: #d0e9ff;
      
      &:hover {
        background: #e6f7ff;
        border-color: #b3d8ff;
      }
    }
    
    .el-checkbox {
      width: 100%;
      
      ::v-deep .el-checkbox__label {
        width: calc(100% - 24px);
      }
    }
    
    .student-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      
      .student-name {
        font-weight: 500;
        color: #303133;
        font-size: 15px;
      }
      
      .student-detail {
        font-size: 13px;
        color: #909399;
      }
    }
  }
  
  .quick-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 20px;
    margin-top: 20px;
    border-top: 1px solid #e4e7ed;
    
    .el-button {
      padding: 10px 16px;
      font-size: 14px;
    }
    
    .action-hint {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #909399;
      
      i {
        font-size: 18px;
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

// Admin Management Styles
.management-tabs {
  ::v-deep .el-tabs__header {
    margin-bottom: 30px;
  }
  
  ::v-deep .el-tabs__nav-wrap::after {
    height: 1px;
  }
  
  ::v-deep .el-tabs__active-bar {
    height: 3px;
  }
}

.admin-management-section {
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 1px solid #e4e7ed;
    
    h3 {
      margin: 0;
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 20px;
      color: #17233d;
      
      i {
        color: #2d8cf0;
        font-size: 24px;
      }
    }
    
    .el-button {
      padding: 12px 24px;
      font-size: 14px;
    }
  }
  
  .admin-users-table {
    ::v-deep .el-table__header th {
      padding: 16px 0;
      background-color: #f8f9fb;
    }
    
    ::v-deep .el-table__body td {
      padding: 20px 0;
    }
  }
}
</style>