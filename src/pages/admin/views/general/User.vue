<template>
  <div class="user-management-page">
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">
            <i class="el-icon-user-solid"></i>
            User Management
          </h1>
          <p class="page-subtitle">Manage user accounts, permissions, and access control</p>
        </div>
        <div class="stats-section">
          <div class="stat-card">
            <div class="stat-value">{{ total }}</div>
            <div class="stat-label">Total Users</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ selectedUsers.length }}</div>
            <div class="stat-label">Selected</div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="content-wrapper">
      <div class="action-bar">
        <div class="action-left">
          <el-button 
            size="large"
            @click="openUserDialog()"
            class="create-btn">
            <span class="btn-text">Create New User</span>
          </el-button>
          <transition name="slide-fade">
            <el-button 
              v-if="selectedUsers.length"
              type="danger" 
              size="large"
              icon="el-icon-delete"
              @click="deleteUsers(selectedUserIDs)"
              class="delete-btn">
              Delete Selected ({{ selectedUsers.length }})
            </el-button>
          </transition>
        </div>
        <div class="action-right">
          <el-select 
            v-model="filterRole" 
            placeholder="All Roles" 
            size="large"
            clearable
            class="role-filter">
            <el-option label="All Roles" value=""></el-option>
            <el-option label="Regular User" value="Regular User"></el-option>
            <el-option label="Admin" value="Admin"></el-option>
            <el-option label="Super Admin" value="Super Admin"></el-option>
          </el-select>
          <el-input 
            v-model="keyword" 
            prefix-icon="el-icon-search" 
            placeholder="Search users by name, email, or username..." 
            size="large"
            clearable
            class="search-input">
          </el-input>
        </div>
      </div>
      <div class="table-container">
        <el-table
          v-loading="loadingTable"
          element-loading-text="Loading users..."
          element-loading-background="rgba(255, 255, 255, 0.8)"
          @selection-change="handleSelectionChange"
          ref="table"
          :data="userList"
          class="modern-table"
          :row-class-name="getRowClassName"
          empty-text="No users found">
          
          <el-table-column type="selection" width="50" align="center"></el-table-column>

          <el-table-column prop="id" label="ID" width="80" align="center">
            <template #default="scope">
              <el-tag size="small" type="info">#{{ scope.row.id }}</el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="username" label="User" min-width="200">
            <template #default="scope">
              <div class="user-cell">
                <div class="user-avatar">
                  <i class="el-icon-user-solid"></i>
                </div>
                <div class="user-info">
                  <div class="username">{{ scope.row.username }}</div>
                  <div class="real-name">{{ scope.row.real_name }}</div>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="email" label="Email" min-width="200">
            <template #default="scope">
              <div class="email-cell">
                <i class="el-icon-message"></i>
                {{ scope.row.email }}
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="admin_type" label="Role" width="140" align="center">
            <template #default="scope">
              <el-tag 
                :class="getUserTypeClass(scope.row.admin_type)"
                size="small">
                <i :class="getUserTypeIcon(scope.row.admin_type)"></i>
                {{ scope.row.admin_type }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="create_time" label="Created" width="140" align="center">
            <template #default="scope">
              <div class="date-cell">
                <i class="el-icon-time"></i>
                {{ $filters.localtime(scope.row.create_time) }}
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="last_login" label="Last Login" width="140" align="center">
            <template #default="scope">
              <div class="date-cell">
                <i class="el-icon-clock"></i>
                {{ scope.row.last_login ? $filters.localtime(scope.row.last_login) : 'Never' }}
              </div>
            </template>
          </el-table-column>

          <el-table-column fixed="right" label="Actions" width="140" align="center">
            <template #default="{row}">
              <div class="action-buttons">
                <el-button 
                  size="small" 
                  link
                  icon="el-icon-edit"
                  @click="openUserDialog(row.id)"
                  class="edit-text-btn">
                  Edit
                </el-button>
                <el-button 
                  size="small" 
                  type="danger"
                  link
                  icon="el-icon-delete"
                  @click="deleteUsers([row.id])"
                  class="delete-text-btn">
                  Delete
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pagination-container">
        <el-pagination
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="currentChange"
          @size-change="handleSizeChange"
          :page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          background
          class="modern-pagination">
        </el-pagination>
      </div>
    </div>
    
    <!--对话框-->
    <el-dialog 
      :title="user.id ? $t('m.User_Info') : 'Create New User'" 
      v-model="showUserDialog" 
      :close-on-click-modal="false"
      width="500px"
      :center="true">
      <div class="user-form-container">
        <el-form :model="user" label-width="0" label-position="top" ref="userForm">
          <!-- Create User - Simple Form -->
          <template v-if="!user.id">
            <div class="form-header">
              <i class="el-icon-user-solid" style="font-size: 48px; color: #409eff;"></i>
              <p class="form-subtitle">Create a new user account</p>
            </div>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item prop="first_name" :rules="[{ required: true, message: 'First name is required', trigger: 'blur' }]">
                  <label class="form-label">
                    <i class="el-icon-user"></i> First Name
                    <span class="required-star">*</span>
                  </label>
                  <el-input 
                    v-model="user.first_name" 
                    placeholder="Enter first name"
                    size="large"
                    @input="generateUsername"
                    clearable>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item prop="last_name" :rules="[{ required: true, message: 'Last name is required', trigger: 'blur' }]">
                  <label class="form-label">
                    <i class="el-icon-user"></i> Last Name
                    <span class="required-star">*</span>
                  </label>
                  <el-input 
                    v-model="user.last_name" 
                    placeholder="Enter last name"
                    size="large"
                    @input="generateUsername"
                    clearable>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-form-item prop="username" :rules="[{ required: true, message: 'Username is required', trigger: 'blur' }]">
              <label class="form-label">
                <i class="el-icon-postcard"></i> Username
                <span class="required-star">*</span>
              </label>
              <el-input 
                v-model="user.username" 
                placeholder="Username will be generated"
                size="large"
                :prefix-icon="user.username_locked ? 'el-icon-lock' : 'el-icon-unlock'"
                clearable>
                <template #append>
                  <el-button 
                    :icon="user.username_locked ? 'el-icon-unlock' : 'el-icon-lock'"
                    @click="toggleUsernameLock">
                    {{ user.username_locked ? 'Unlock' : 'Lock' }}
                  </el-button>
                </template>
              </el-input>
              <span class="field-hint">
                {{ user.username_locked ? 'Username is locked and will not change automatically' : 'Username is auto-generated from name (click lock to edit manually)' }}
              </span>
            </el-form-item>
            
            <el-form-item prop="password" :rules="[{ required: true, message: 'Password is required', trigger: 'blur' }, { min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' }]">
              <label class="form-label">
                <i class="el-icon-lock"></i> Password
                <span class="required-star">*</span>
              </label>
              <el-input 
                type="password" 
                v-model="user.password" 
                placeholder="Set a secure password"
                size="large"
                show-password
                clearable>
              </el-input>
              <span class="field-hint">Minimum 6 characters</span>
            </el-form-item>
            
            <el-form-item prop="admin_type">
              <label class="form-label">
                <i class="el-icon-user-solid"></i> User Type
              </label>
              <el-radio-group v-model="user.admin_type" size="large" style="width: 100%;">
                <el-radio-button value="Regular User" style="width: 33.33%;">
                  <i class="el-icon-user"></i> Regular User
                </el-radio-button>
                <el-radio-button value="Admin" style="width: 33.33%;">
                  <i class="el-icon-s-custom"></i> Admin
                </el-radio-button>
                <el-radio-button value="Super Admin" style="width: 33.33%;">
                  <i class="el-icon-s-tools"></i> Super Admin
                </el-radio-button>
              </el-radio-group>
              <span class="field-hint">Select the user's permission level</span>
            </el-form-item>
            
            <div class="form-info">
              <el-alert
                :type="getUserTypeAlertType()"
                :closable="false"
                show-icon>
                <template #default>
                  <span style="font-size: 13px;" v-html="getUserTypeDescription()"></span>
                </template>
              </el-alert>
            </div>
            
            <!-- Assign to Admin (only for Regular Users and if current user is Super Admin) -->
            <el-form-item v-if="user.admin_type === 'Regular User' && isSuperAdmin" :label="$t('m.Assign_To_Admin')">
              <el-select v-model="user.assigned_admin_id" clearable placeholder="Select an admin (optional)" size="large">
                <el-option
                  v-for="admin in adminList"
                  :key="admin.id"
                  :label="`${admin.username} (${admin.real_name || 'N/A'})`"
                  :value="admin.id"
                />
              </el-select>
              <span class="field-hint">Optionally assign this student to an admin for homework management</span>
            </el-form-item>
          </template>
        
        <!-- Edit User - Full Form -->
        <template v-else>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item :label="$t('m.User_Username')" required>
                <el-input v-model="user.username"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="$t('m.User_Real_Name')" required>
                <el-input v-model="user.real_name"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="$t('m.User_Email')" required>
                <el-input v-model="user.email"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="$t('m.User_New_Password')">
                <el-input v-model="user.password"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="$t('m.User_Type')">
                <el-select v-model="user.admin_type">
                  <el-option label="Regular User" value="Regular User"></el-option>
                  <el-option label="Admin" value="Admin"></el-option>
                  <el-option label="Super Admin" value="Super Admin"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="$t('m.Problem_Permission')">
                <el-select v-model="user.problem_permission" :disabled="user.admin_type!=='Admin'">
                  <el-option label="None" value="None"></el-option>
                  <el-option label="Own" value="Own"></el-option>
                  <el-option label="All" value="All"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item :label="$t('m.Two_Factor_Auth')">
                <el-switch
                  v-model="user.two_factor_auth"
                  :disabled="!user.real_tfa"
                  active-color="#13ce66"
                  inactive-color="#ff4949">
                </el-switch>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="Open Api">
                <el-switch
                  v-model="user.open_api"
                  active-color="#13ce66"
                  inactive-color="#ff4949">
                </el-switch>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item :label="$t('m.Is_Disabled')">
                <el-switch
                  v-model="user.is_disabled">
                </el-switch>
              </el-form-item>
            </el-col>
          </el-row>
        </template>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showUserDialog = false" size="large">
            <i class="el-icon-close"></i> Cancel
          </el-button>
          <el-button type="primary" @click="saveUser()" size="large" :loading="loading">
            <i class="el-icon-check"></i> {{ user.id ? 'Update User' : 'Create User' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
  import api from '../../api.js'
  import IconBtn from '../../components/btn/IconBtn.vue'
  import Cancel from '../../components/btn/Cancel.vue'
  import Save from '../../components/btn/Save.vue'
  import { useAdminStore } from '@/stores/admin'

  export default {
    name: 'User',
    components: {
      IconBtn,
      Cancel,
      Save
    },
    data () {
      return {
        // 一页显示的用户数
        pageSize: 10,
        // 用户总数
        total: 0,
        // 用户列表
        userList: [],
        // 搜索关键字
        keyword: '',
        // 是否显示用户对话框
        showUserDialog: false,
        // 当前用户model
        user: {},
        loadingTable: false,
        loading: false,
        // 当前页码
        currentPage: 0,
        selectedUsers: [],
        filterRole: '',
        adminList: []
      }
    },
    mounted () {
      this.getUserList(1)
      this.loadAdminList()
    },
    methods: {
      // 切换页码回调
      currentChange (page) {
        this.currentPage = page
        this.getUserList(page)
      },
      handleSizeChange(size) {
        this.pageSize = size
        this.getUserList(1)
      },
      getRowClassName({row, rowIndex}) {
        if (row.admin_type === 'Super Admin') return 'super-admin-row'
        if (row.admin_type === 'Admin') return 'admin-row'
        return 'regular-user-row'
      },
      getUserTypeTagType(adminType) {
        switch (adminType) {
          case 'Regular User': return 'info'
          case 'Admin': return 'warning'
          case 'Super Admin': return 'danger'
          default: return 'info'
        }
      },
      getUserTypeIcon(adminType) {
        switch (adminType) {
          case 'Regular User': return 'el-icon-user'
          case 'Admin': return 'el-icon-s-custom'
          case 'Super Admin': return 'el-icon-s-tools'
          default: return 'el-icon-user'
        }
      },
      getUserTypeClass(adminType) {
        switch (adminType) {
          case 'Regular User': return 'role-tag-regular'
          case 'Admin': return 'role-tag-admin'
          case 'Super Admin': return 'role-tag-super'
          default: return 'role-tag-regular'
        }
      },
      // 提交修改用户的信息
      saveUser () {
        console.log('saveUser called', this.user)
        
        // Use form validation
        this.$refs.userForm.validate((valid) => {
          if (!valid) {
            this.$message.error('Please fill in all required fields correctly')
            return false
          }
          
          // Ensure real_name is properly set from first and last name
          if (!this.user.id && this.user.first_name && this.user.last_name) {
            this.user.real_name = `${this.user.first_name.trim()} ${this.user.last_name.trim()}`
          }
          
          this.loading = true
          
          if (this.user.id) {
            // Edit existing user
            api.editUser(this.user).then(res => {
              this.$message.success('User updated successfully!')
              this.getUserList(this.currentPage)
              this.showUserDialog = false
              this.loading = false
            }).catch(err => {
              console.error('Edit user error:', err)
              this.$message.error('Failed to update user: ' + (err.response?.data?.data || err.message))
              this.loading = false
            })
          } else {
            // Create new user
            console.log('Creating user with data:', this.user)
            api.createUser(this.user).then(async res => {
              console.log('Create user response:', res)
              
              // If user is assigned to an admin, create the admin-student relation
              if (this.user.admin_type === 'Regular User' && this.user.assigned_admin_id) {
                api.createAdminStudentRelation({
                  admin_id: this.user.assigned_admin_id,
                  student_id: res.data.data.id
                }).then(() => {
                  this.$message.success('User created and assigned to admin successfully!')
                }).catch(err => {
                  console.error('Failed to assign user to admin:', err)
                  this.$message.warning('User created but failed to assign to admin: ' + (err.data?.data || err.message))
                })
              } else {
                this.$message.success('User created successfully!')
              }
              
              this.getUserList(this.currentPage)
              this.showUserDialog = false
              this.loading = false
            }).catch(err => {
              console.error('Create user error:', err)
              this.$message.error('Failed to create user: ' + (err.response?.data?.data || err.message))
              this.loading = false
            })
          }
        })
      },
      // 打开用户对话框
      openUserDialog (id) {
        console.log('openUserDialog called with id:', id)
        this.showUserDialog = true
        if (id) {
          // Edit existing user
          console.log('Editing existing user')
          api.getUser(id).then(res => {
            this.user = res.data.data
            this.user.password = ''
            this.user.real_tfa = this.user.two_factor_auth
            console.log('Loaded user for editing:', this.user)
          })
        } else {
          // Create new user - simplified for new API
          console.log('Creating new user')
          this.user = {
            id: null,
            first_name: '',
            last_name: '',
            username: '',
            real_name: '',
            password: '',
            admin_type: 'Regular User',
            username_locked: false,
            assigned_admin_id: null
          }
          console.log('Initialized new user:', this.user)
        }
      },
      // 获取用户列表
      getUserList (page) {
        this.loadingTable = true
        api.getUserList((page - 1) * this.pageSize, this.pageSize, this.keyword).then(res => {
          this.loadingTable = false
          this.total = res.data.data.total
          let results = res.data.data.results
          // Apply role filter if selected
          if (this.filterRole) {
            results = results.filter(user => user.admin_type === this.filterRole)
          }
          this.userList = results
        }, res => {
          this.loadingTable = false
        })
      },
      deleteUsers (ids) {
        this.$confirm('Sure to delete the user? The associated resources created by this user will be deleted as well, like problem, contest, announcement, etc.', 'confirm', {
          type: 'warning'
        }).then(() => {
          api.deleteUsers(ids.join(',')).then(res => {
            this.getUserList(this.currentPage)
          }).catch(() => {
            this.getUserList(this.currentPage)
          })
        }, () => {
        })
      },
      handleSelectionChange (val) {
        this.selectedUsers = val
      },
      generateUsername() {
        if (this.user.username_locked) return
        
        const firstName = this.user.first_name?.trim() || ''
        const lastName = this.user.last_name?.trim() || ''
        
        if (firstName && lastName) {
          // Generate username: firstname.lastname (lowercase, no spaces)
          let username = `${firstName}.${lastName}`.toLowerCase()
          // Remove any special characters except dots and numbers
          username = username.replace(/[^a-z0-9.]/g, '')
          this.user.username = username
          this.user.real_name = `${firstName} ${lastName}`
        } else if (firstName) {
          // If only first name, use that
          let username = firstName.toLowerCase().replace(/[^a-z0-9]/g, '')
          this.user.username = username
          this.user.real_name = firstName
        } else {
          this.user.username = ''
          this.user.real_name = ''
        }
      },
      toggleUsernameLock() {
        this.user.username_locked = !this.user.username_locked
        if (!this.user.username_locked) {
          // If unlocking, regenerate username
          this.generateUsername()
        }
      },
      getUserTypeAlertType() {
        switch (this.user.admin_type) {
          case 'Regular User': return 'info'
          case 'Admin': return 'warning'
          case 'Super Admin': return 'error'
          default: return 'info'
        }
      },
      getUserTypeDescription() {
        switch (this.user.admin_type) {
          case 'Regular User':
            return '<strong>Regular User:</strong> Can participate in contests, submit solutions, and view public problems. No administrative privileges.'
          case 'Admin':
            return '<strong>Admin:</strong> Can manage problems, contests, and announcements. Has access to most administrative features except system configuration.'
          case 'Super Admin':
            return '<strong>Super Admin:</strong> Full system access including user management, system configuration, and all administrative features. Use with caution.'
          default:
            return 'Select a user type to see permissions.'
        }
      },
      async loadAdminList() {
        try {
          // Check if we have the getAdminList API
          if (api.getAdminList) {
            const res = await api.getAdminList()
            console.log('[User.vue] Admin list API response:', res.data)
            if (Array.isArray(res.data.data)) {
              this.adminList = res.data.data
            } else if (res.data.data && res.data.data.results) {
              this.adminList = res.data.data.results
            } else {
              throw new Error('Invalid response format')
            }
          } else {
            throw new Error('getAdminList API not available')
          }
        } catch (err) {
          console.log('[User.vue] Primary admin list failed, falling back to getUserList:', err.message)
          try {
            // Fallback: get all users and filter for admins
            const userRes = await api.getUserList(0, 1000)
            if (userRes.data.data && userRes.data.data.results) {
              this.adminList = userRes.data.data.results.filter(u => u.admin_type === 'Admin')
              console.log('[User.vue] Found admins from user list:', this.adminList)
            }
          } catch (fallbackErr) {
            console.error('Fallback also failed:', fallbackErr)
            this.adminList = []
          }
        }
        console.log('[User.vue] Final admin list:', this.adminList)
        console.log('[User.vue] Is super admin:', this.isSuperAdmin)
      }
    },
    computed: {
      selectedUserIDs () {
        let ids = []
        for (let user of this.selectedUsers) {
          ids.push(user.id)
        }
        return ids
      },
      isSuperAdmin() {
        // Check if current user is super admin
        const adminStore = useAdminStore()
        return adminStore.isSuperAdmin
      }
    },
    watch: {
      'keyword' () {
        this.currentChange(1)
      },
      'filterRole' () {
        this.currentChange(1)
      },
      'user.admin_type' () {
        if (this.user.admin_type === 'Super Admin') {
          this.user.problem_permission = 'All'
        } else if (this.user.admin_type === 'Regular User') {
          this.user.problem_permission = 'None'
        }
      },
      'uploadUsersCurrentPage' (page) {
        this.uploadUsersPage = this.uploadUsers.slice((page - 1) * this.uploadUsersPageSize, page * this.uploadUsersPageSize)
      }
    }
  }
</script>

<style scoped>
/* Main page layout */
.user-management-page {
  min-height: 100vh;
  background: #ffffff;
  padding: 0;
}

.page-header {
  background: #ffffff;
  border-bottom: 1px solid #e5e5e5;
  padding: 30px 40px;
  margin-bottom: 30px;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-section {
  flex: 1;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #000000;
  margin: 0 0 4px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-title i {
  color: #333333;
  font-size: 24px;
}

.page-subtitle {
  font-size: 14px;
  color: #666666;
  margin: 8px 0 0 0;
  font-weight: 400;
}

.stats-section {
  display: flex;
  gap: 20px;
}

.stat-card {
  background: #fafafa;
  color: #000000;
  padding: 20px 24px;
  border-radius: 8px;
  text-align: center;
  min-width: 120px;
  border: 1px solid #e5e5e5;
  transition: all 0.2s ease;
}

.stat-card:hover {
  background: #f5f5f5;
  border-color: #d0d0d0;
}

.stat-value {
  font-size: 32px;
  font-weight: 600;
  line-height: 1;
  color: #000000;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 13px;
  color: #666666;
  font-weight: 400;
  text-transform: capitalize;
}

.content-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background: #ffffff;
  padding: 20px 24px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
}

.action-left {
  display: flex;
  gap: 12px;
  align-items: center;
}

.action-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.role-filter {
  width: 150px;
}

.create-btn {
  background: #f5f5f5 !important;
  color: #000000 !important;
  border: 1px solid #e0e0e0 !important;
  font-weight: 500;
  padding: 10px 24px;
  border-radius: 6px;
  transition: all 0.2s ease;
  text-align: center;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.create-btn .btn-text {
  display: inline-block;
  text-align: center;
}

.create-btn:hover {
  background: #e0e0e0 !important;
  border-color: #d0d0d0 !important;
  color: #000000 !important;
}

.delete-btn {
  background: #ffffff;
  color: #000000;
  border: 1px solid #000000;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.delete-btn:hover {
  background: #f5f5f5;
}

.search-input {
  border-radius: 4px;
  flex: 1;
  min-width: 300px;
}

/* Role tag colors */
.role-tag-regular {
  background-color: #e8f4fd !important;
  color: #409eff !important;
  border: 1px solid #b3d8ff !important;
}

.role-tag-admin {
  background-color: #fdf6ec !important;
  color: #e6a23c !important;
  border: 1px solid #f5dab1 !important;
}

.role-tag-super {
  background-color: #fef0f0 !important;
  color: #f56c6c !important;
  border: 1px solid #fbc4c4 !important;
}

/* Table styling */
.table-container {
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 0;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.modern-table {
  border-radius: 4px;
  overflow: hidden;
}

/* User cell styling */
.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f5f5f5;
  border: 1px solid #e5e5e5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666666;
  font-size: 14px;
}

.user-info {
  flex: 1;
}

.username {
  font-weight: 500;
  color: #000000;
  font-size: 14px;
}

.real-name {
  font-size: 12px;
  color: #666666;
  margin-top: 2px;
}

.email-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #333333;
  font-size: 13px;
}

.email-cell i {
  color: #666666;
}

.date-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 12px;
  color: #666666;
}

.date-cell i {
  color: #999999;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

/* Global override for all link buttons in action column */
.action-buttons .el-button[class*="link"] {
  background: transparent !important;
  background-color: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

.action-buttons .el-button[class*="link"]::before,
.action-buttons .el-button[class*="link"]::after {
  display: none !important;
}

/* Edit button styling */
.edit-text-btn {
  color: #409eff !important;
  font-weight: 500;
  padding: 5px 10px;
  background: transparent !important;
  background-color: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

.edit-text-btn::before,
.edit-text-btn::after {
  display: none !important;
}

.edit-text-btn,
.edit-text-btn.el-button,
.edit-text-btn.el-button--link {
  background: transparent !important;
  background-color: transparent !important;
}

.edit-text-btn span,
.edit-text-btn .el-icon,
.edit-text-btn :deep(*) {
  color: #409eff !important;
}

.edit-text-btn:hover,
.edit-text-btn:focus,
.edit-text-btn.el-button--link:hover,
.edit-text-btn.el-button--link:focus {
  color: #66b1ff !important;
  background-color: #f5f7fa !important;
  background: #f5f7fa !important;
  border: none !important;
  box-shadow: none !important;
}

.edit-text-btn:hover span,
.edit-text-btn:focus span,
.edit-text-btn:hover .el-icon,
.edit-text-btn:focus .el-icon,
.edit-text-btn:hover :deep(*),
.edit-text-btn:focus :deep(*) {
  color: #66b1ff !important;
}

/* Delete button styling */
.delete-text-btn {
  color: #f56c6c !important;
  font-weight: 500;
  padding: 5px 10px;
  background: transparent !important;
  background-color: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

.delete-text-btn::before,
.delete-text-btn::after {
  display: none !important;
}

.delete-text-btn,
.delete-text-btn.el-button,
.delete-text-btn.el-button--link {
  background: transparent !important;
  background-color: transparent !important;
}

.delete-text-btn span,
.delete-text-btn .el-icon,
.delete-text-btn :deep(*) {
  color: #f56c6c !important;
}

.delete-text-btn:hover,
.delete-text-btn:focus,
.delete-text-btn.el-button--link:hover,
.delete-text-btn.el-button--link:focus {
  color: #f78989 !important;
  background-color: #fef0f0 !important;
  background: #fef0f0 !important;
  border: none !important;
  box-shadow: none !important;
}

.delete-text-btn:hover span,
.delete-text-btn:focus span,
.delete-text-btn:hover .el-icon,
.delete-text-btn:focus .el-icon,
.delete-text-btn:hover :deep(*),
.delete-text-btn:focus :deep(*) {
  color: #f78989 !important;
}

/* Row styling */
.regular-user-row {
  background-color: #ffffff;
}

.admin-row {
  background-color: #fafafa;
}

.super-admin-row {
  background-color: #f5f5f5;
}

/* Pagination */
.pagination-container {
  display: flex;
  justify-content: center;
  padding: 24px 0 32px 0;
}

.modern-pagination {
  background: #ffffff;
  border-radius: 4px;
  padding: 12px 16px;
}

/* Transitions */
.slide-fade-enter-active {
  transition: all 0.3s ease;
}

.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(10px);
  opacity: 0;
}

/* Dialog form styling */
.user-form-container {
  padding: 20px;
}

.form-header {
  text-align: center;
  margin-bottom: 30px;
}

.form-subtitle {
  margin: 15px 0 0 0;
  font-size: 16px;
  color: #606266;
  font-weight: 500;
}

.form-label {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 14px;
  color: #303133;
}

.form-label i {
  margin-right: 8px;
  color: #409eff;
}

.required-star {
  color: #f56c6c;
  margin-left: 4px;
}

.field-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  display: block;
}

.form-info {
  margin-top: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 0 0 0;
}

.el-form-item {
  margin-bottom: 24px;
}

/* User type radio buttons */
:deep(.el-radio-group) {
  width: 100%;
  display: flex;
}

:deep(.el-radio-button) {
  flex: 1;
}

:deep(.el-radio-button__inner) {
  width: 100%;
  text-align: center;
  padding: 12px 8px;
  font-size: 13px;
  border-radius: 4px !important;
  transition: all 0.3s ease;
}

:deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-left: 1px solid #dcdfe6;
  border-radius: 4px 0 0 4px !important;
}

:deep(.el-radio-button:last-child .el-radio-button__inner) {
  border-radius: 0 4px 4px 0 !important;
}

:deep(.el-radio-button__inner i) {
  margin-right: 6px;
  font-size: 14px;
}

:deep(.el-radio-button__orig-radio:checked + .el-radio-button__inner) {
  background-color: #409eff;
  border-color: #409eff;
  color: #fff;
  box-shadow: -1px 0 0 0 #409eff;
}

/* Different colors for different user types */
:deep(.el-radio-button:nth-child(1) .el-radio-button__orig-radio:checked + .el-radio-button__inner) {
  background-color: #67c23a;
  border-color: #67c23a;
  box-shadow: -1px 0 0 0 #67c23a;
}

:deep(.el-radio-button:nth-child(2) .el-radio-button__orig-radio:checked + .el-radio-button__inner) {
  background-color: #e6a23c;
  border-color: #e6a23c;
  box-shadow: -1px 0 0 0 #e6a23c;
}

:deep(.el-radio-button:nth-child(3) .el-radio-button__orig-radio:checked + .el-radio-button__inner) {
  background-color: #f56c6c;
  border-color: #f56c6c;
  box-shadow: -1px 0 0 0 #f56c6c;
}

/* Element Plus overrides */
:deep(.el-dialog) {
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

:deep(.el-table) {
  border-radius: 4px;
  border: 1px solid #e5e5e5;
}

:deep(.el-table th) {
  background: #fafafa;
  color: #000000;
  font-weight: 500;
  font-size: 13px;
  padding: 16px 12px;
  border-bottom: 1px solid #e5e5e5;
}

:deep(.el-table td) {
  padding: 16px 12px;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.el-table__empty-text) {
  color: #666666;
}

:deep(.el-pagination) {
  font-weight: 400;
}

:deep(.el-input__inner) {
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  padding: 0 15px;
  height: 40px;
  line-height: 40px;
}

:deep(.el-input__inner:focus) {
  border-color: #000000;
}

:deep(.el-input--large .el-input__inner) {
  height: 40px;
  line-height: 40px;
}

:deep(.el-input__wrapper) {
  box-shadow: none !important;
  padding: 1px 0;
}

:deep(.el-input--large) {
  font-size: 14px;
}

:deep(.el-select .el-input__inner) {
  height: 40px;
  line-height: 40px;
}

:deep(.el-button) {
  border-radius: 4px;
}

:deep(.el-button--primary) {
  background: #000000;
  border-color: #000000;
  color: #ffffff;
}

:deep(.el-button--primary:hover) {
  background: #333333;
  border-color: #333333;
  color: #ffffff;
}

:deep(.el-button--small.is-circle) {
  width: 32px;
  height: 32px;
}

:deep(.el-tag) {
  border-radius: 2px;
}

:deep(.el-tag--info) {
  background: #f5f5f5;
  color: #666666;
  border: 1px solid #e5e5e5;
}

:deep(.el-tag--warning) {
  background: #fafafa;
  color: #000000;
  border: 1px solid #d9d9d9;
}

:deep(.el-tag--danger) {
  background: #f0f0f0;
  color: #000000;
  border: 1px solid #d9d9d9;
}
</style>

<style scoped lang="less">
  .import-user-icon {
    color: #555555;
    margin-left: 4px;
  }

  .userPreview {
    padding-left: 10px;
  }

  .notification {
    p {
      margin: 0;
      text-align: left;
    }
  }
</style>
