<template>
  <div class="admin-homework-list">
    <div class="homework-list-container">
      <Card>
          <div slot="title">
            <Icon type="ios-paper-outline" />
            <span style="margin-left: 5px;">Homework Management</span>
          </div>
          <div slot="extra">
            <Button type="primary" @click="openQuickCreate">
              <Icon type="md-add" />
              Create Homework
            </Button>
          </div>
          
          <!-- Homework List -->
          <Table 
            :columns="columns" 
            :data="homeworkList"
            :loading="loading"
            style="margin-top: 10px;"
          />
          
          <div style="margin-top: 20px; text-align: right;">
            <Page
              :total="total"
              :current="currentPage"
              :page-size="pageSize"
              @on-change="handlePageChange"
              show-total
            />
          </div>
        </Card>
    </div>
    
    <!-- Create Homework Modal -->
    <Modal
      v-model="showCreateModal"
      title="Create Homework Assignment"
      :width="800"
      :mask-closable="false"
    >
      <Form ref="createForm" :model="createForm" :rules="createRules" :label-width="120">
        <FormItem label="Title" prop="title">
          <Input v-model="createForm.title" placeholder="Enter homework title" />
        </FormItem>
        
        <FormItem label="Description" prop="description">
          <Input 
            v-model="createForm.description" 
            type="textarea" 
            :rows="3"
            placeholder="Enter homework description (optional)"
          />
          <div style="margin-top: 5px; color: #999; font-size: 12px;">
            Provide instructions or additional information for students
          </div>
        </FormItem>
        
        <FormItem label="Due Date" prop="due_date">
          <!-- Native datetime input (always shown) -->
          <input 
            type="datetime-local" 
            v-model="dueDateString"
            @change="handleDueDateChange"
            style="width: 100%; padding: 7px 11px; border: 1px solid #dcdee2; border-radius: 4px; font-size: 14px;"
            required
          />
          <div style="margin-top: 5px; color: #999; font-size: 12px;">
            Select the due date and time for this homework assignment
          </div>
        </FormItem>
        
        <FormItem label="Select Problems" prop="problem_ids">
          <Button 
            type="dashed" 
            @click="showProblemSelector = true" 
            style="width: 100%;"
            :class="{ 'error-border': createForm.problem_ids.length === 0 }"
          >
            <Icon type="md-add" />
            {{ createForm.problems.length > 0 ? `${createForm.problems.length} problems selected` : 'Select OJ Problems' }}
          </Button>
          <div v-if="createForm.problems.length === 0" style="color: #ed4014; font-size: 12px; margin-top: 5px;">
            Please select at least one problem for the homework
          </div>
          <div v-if="createForm.problems.length > 0" style="margin-top: 10px;">
            <Tag 
              v-for="problem in createForm.problems" 
              :key="problem.id"
              closable
              @on-close="removeProblem(problem)"
              style="margin-right: 5px; margin-bottom: 5px;"
            >
              {{ problem._id }} - {{ problem.title }}
            </Tag>
          </div>
        </FormItem>
        
        <!-- Debug: Test basic select -->
        <FormItem label="Test Select" v-if="false">
          <Select v-model="testSelect" placeholder="Test basic select">
            <Option value="1">Option 1</Option>
            <Option value="2">Option 2</Option>
            <Option value="3">Option 3</Option>
          </Select>
        </FormItem>
        
        <FormItem label="Assign To" prop="student_ids">
          <!-- Group and Search Controls -->
          <div class="filter-controls">
            <div class="filter-group">
              <Select 
                v-model="selectedGroup" 
                @on-change="loadStudents"
                placeholder="Filter by group"
                style="width: 100%;"
                :clearable="true"
                :transfer="true"
              >
                <Option value="all" key="all">All Students</Option>
                <Option 
                  v-for="group in availableGroups" 
                  :key="`group-${group.name || group}`" 
                  :value="group.name || group"
                  :label="`${group.name || group} ${group.count ? `(${group.count} students)` : ''}`"
                >
                  {{ group.name || group }} {{ group.count ? `(${group.count} students)` : '' }}
                </Option>
              </Select>
            </div>
            <div class="filter-search">
              <Input 
                v-model="studentSearch" 
                placeholder="Search by name, username, or email..."
                @on-search="loadStudents"
                @on-enter="loadStudents"
                clearable
              >
                <Icon type="ios-search" slot="suffix" />
              </Input>
            </div>
            <div class="filter-action">
              <Button 
                @click="loadStudents" 
                :loading="loadingStudents"
                style="width: 100%;"
              >
                <Icon type="md-refresh" />
                Refresh
              </Button>
            </div>
          </div>
          
          <!-- Show prominent message if no students loaded -->
          <Alert v-if="studentList.length === 0 && !loadingStudents" type="warning" show-icon style="margin-bottom: 10px;">
            <template #desc>
              No students found. Try adjusting your filters or add students manually.
            </template>
          </Alert>
          
          <!-- Quick fix for dropdown issues -->
          <Alert v-if="studentList.length > 0 && !useAlternativeSelector" type="info" show-icon closable style="margin-bottom: 10px;">
            <template #desc>
              If the dropdown is not showing students, 
              <a @click="useAlternativeSelector = true" style="cursor: pointer; text-decoration: underline;">
                click here to use the alternative selector
              </a>
            </template>
          </Alert>
          
          <!-- Quick actions for student selection -->
          <div v-if="studentList.length > 0" style="margin-bottom: 10px;">
            <Checkbox v-model="assignToAll" @on-change="handleAssignToAllChange">
              Assign to all {{ selectedGroup === 'all' ? '' : 'filtered' }} students ({{ studentList.length }} students)
            </Checkbox>
          </div>
          
          <!-- Try different approach if main select doesn't work -->
          <div v-if="useAlternativeSelector">
            <SimpleStudentSelector v-model="createForm.student_ids" />
            <Button 
              type="text" 
              size="small" 
              @click="useAlternativeSelector = false"
              style="margin-top: 10px;"
            >
              <Icon type="ios-arrow-back" /> Back to dropdown selector
            </Button>
          </div>
          <div v-else>
            <!-- Native HTML select as ultimate fallback -->
            <div class="custom-select-wrapper">
              <label style="display: block; margin-bottom: 5px; color: #666;">
                Select Students (Hold Ctrl/Cmd to select multiple)
              </label>
              <select 
                v-model="createForm.student_ids" 
                multiple 
                style="width: 100%; height: 150px; padding: 5px; border: 1px solid #dcdee2; border-radius: 4px;"
                class="custom-student-select"
              >
                <option disabled value="">-- Select Students --</option>
                <option 
                  v-for="student in studentList" 
                  :key="student.id"
                  :value="student.id"
                >
                  {{ student.username }} ({{ student.email }})
                </option>
              </select>
              <div style="margin-top: 5px; font-size: 12px; color: #999;">
                Selected: {{ createForm.student_ids.length }} students
              </div>
            </div>
            
            <!-- Debug info and fallback -->
            <div style="margin-top: 5px;">
              <div v-if="studentList.length > 0" style="color: #666; font-size: 12px;">
                Debug: {{ studentList.length }} students loaded. 
                <Button size="small" @click="forceRefreshDropdown">Force Refresh Dropdown</Button>
              </div>
              <Alert v-if="studentList.length > 0 && showDropdownIssue" type="warning" show-icon closable>
                Having trouble with the dropdown? 
                <a @click="useAlternativeSelector = true" style="cursor: pointer;">Try alternative selector</a>
              </Alert>
            </div>
          </div>
          
          <div style="margin-top: 10px; background: #f5f7fa; padding: 10px; border-radius: 4px;">
            <div style="display: flex; gap: 10px; align-items: center; justify-content: space-between;">
              <div style="display: flex; gap: 10px; align-items: center;">
                <span v-if="studentList.length > 0" style="color: #666; font-size: 12px;">
                  <Icon type="ios-people" /> {{ createForm.student_ids.length }} of {{ studentList.length }} selected
                </span>
                <Button 
                  v-if="studentList.length > 0 && !assignToAll" 
                  type="text" 
                  size="small" 
                  @click="selectAllStudents"
                >
                  Select All
                </Button>
                <Button 
                  v-if="createForm.student_ids.length > 0 && !assignToAll" 
                  type="text" 
                  size="small" 
                  @click="clearStudents"
                >
                  Clear
                </Button>
              </div>
              
              <Button 
                type="primary" 
                size="small" 
                @click="showManualInput = !showManualInput"
                :icon="showManualInput ? 'ios-arrow-up' : 'ios-arrow-down'"
              >
                {{ showManualInput ? 'Hide' : 'Add' }} Manual Entry
              </Button>
            </div>
          </div>
          
          <!-- Manual username input -->
          <div v-if="showManualInput" style="margin-top: 10px; border: 1px solid #dcdee2; padding: 15px; border-radius: 4px; background: #fafafa;">
            <Alert type="info" show-icon closable>
              <template #desc>
                Enter student usernames separated by commas. Each username will be added as a student that can be assigned homework.
              </template>
            </Alert>
            <Input 
              v-model="manualUsernames" 
              type="textarea" 
              :rows="4"
              placeholder="Example: student1, student2, john_doe, jane_smith"
              style="margin-top: 10px;"
            />
            <div style="margin-top: 10px; display: flex; gap: 10px;">
              <Button 
                type="primary" 
                @click="addManualStudents"
                :disabled="!manualUsernames.trim()"
              >
                <Icon type="md-person-add" />
                Add Students
              </Button>
              <Button @click="manualUsernames = ''; showManualInput = false">
                Cancel
              </Button>
            </div>
          </div>
        </FormItem>
        
        <FormItem label="Auto Grade" prop="auto_grade">
          <i-switch v-model="createForm.auto_grade" />
          <span style="margin-left: 10px; color: #999;">
            Automatically calculate grades based on AC submissions
          </span>
        </FormItem>
      </Form>
      
      <div slot="footer">
        <Button @click="showCreateModal = false">Cancel</Button>
        <Button type="primary" @click="createHomework" :loading="creating">Create</Button>
      </div>
    </Modal>
    
    <!-- Problem Selector Modal -->
    <Modal
      v-model="showProblemSelector"
      title="Select OJ Problems"
      :width="900"
      :mask-closable="false"
    >
      <div style="margin-bottom: 15px;">
        <Input 
          v-model="problemSearch" 
          placeholder="Search problems by title or ID"
          style="width: 300px;"
        >
          <Icon type="ios-search" slot="prefix" />
        </Input>
      </div>
      
      <Table 
        :columns="problemColumns" 
        :data="filteredProblems"
        :loading="loadingProblems"
        height="400"
        @on-selection-change="onProblemSelectionChange"
      >
        <template #title="{ row }">
          <span>{{ row._id }} - {{ row.title }}</span>
        </template>
        
        <template #difficulty="{ row }">
          <Tag :color="getDifficultyColor(row.difficulty)">
            {{ row.difficulty }}
          </Tag>
        </template>
        
        <template #tags="{ row }">
          <Tag v-for="tag in row.tags" :key="tag" size="small">{{ tag }}</Tag>
        </template>
      </Table>
      
      <div slot="footer">
        <Button @click="showProblemSelector = false">Cancel</Button>
        <Button type="primary" @click="confirmProblemSelection">
          Confirm Selection ({{ selectedProblems.length }})
        </Button>
      </div>
    </Modal>
    
    <!-- Edit Homework Modal -->
    <Modal
      v-model="showEditModal"
      title="Edit Homework Assignment"
      :width="800"
      :mask-closable="false"
    >
      <Form ref="editForm" :model="editForm" :rules="createRules" :label-width="120">
        <FormItem label="Title" prop="title">
          <Input v-model="editForm.title" placeholder="Enter homework title" />
        </FormItem>
        
        <FormItem label="Description" prop="description">
          <Input 
            v-model="editForm.description" 
            type="textarea" 
            :rows="3"
            placeholder="Enter homework description (optional)"
          />
        </FormItem>
        
        <FormItem label="Due Date" prop="due_date">
          <input 
            type="datetime-local" 
            v-model="editDueDateString"
            @change="handleEditDueDateChange"
            style="width: 100%; padding: 7px 11px; border: 1px solid #dcdee2; border-radius: 4px; font-size: 14px;"
            required
          />
        </FormItem>
        
        <FormItem label="Selected Problems" prop="problem_ids">
          <Button type="dashed" @click="openProblemSelectorForEdit" style="width: 100%;">
            <Icon type="md-add" />
            {{ editForm.problems.length > 0 ? `${editForm.problems.length} problems selected` : 'Select OJ Problems' }}
          </Button>
          <div v-if="editForm.problems.length > 0" style="margin-top: 10px;">
            <Tag 
              v-for="problem in editForm.problems" 
              :key="problem.id"
              closable
              @on-close="removeEditProblem(problem)"
              style="margin-right: 5px; margin-bottom: 5px;"
            >
              {{ problem._id }} - {{ problem.title }}
            </Tag>
          </div>
        </FormItem>
        
        <FormItem label="Assigned Students">
          <div style="background: #f5f7fa; padding: 10px; border-radius: 4px;">
            <p style="margin-bottom: 10px;">
              Currently assigned to {{ editForm.student_ids.length }} students
            </p>
            <Alert type="info" show-icon>
              To change student assignments, use the assignment management feature after saving.
            </Alert>
          </div>
        </FormItem>
      </Form>
      
      <div slot="footer">
        <Button @click="cancelEdit">Cancel</Button>
        <Button type="primary" @click="updateHomework" :loading="editing">Update</Button>
      </div>
    </Modal>
    
    <!-- Quick Create Modal -->
    <Modal
      v-model="showQuickCreateModal"
      title="Create Homework Assignment"
      :width="1200"
      :mask-closable="false"
      :footer-hide="true"
    >
      <AdminHomeworkQuickCreate 
        @created="onHomeworkCreated"
      />
    </Modal>
  </div>
</template>

<script>
// Import ViewUI Plus components
import { Card, Button, Icon, Table, Tag, Page, Modal, Form, FormItem, Input, DatePicker, Select, Option, Switch as iSwitch, Alert, Checkbox } from 'view-ui-plus'
import api from '@oj/api'
import adminApi from '@/pages/admin/api'
import time from '@/utils/time'
import dayjs from 'dayjs'
import SimpleStudentSelector from './SimpleStudentSelector.vue'
import AdminHomeworkQuickCreate from './AdminHomeworkQuickCreate.vue'

export default {
  name: 'AdminHomeworkList',
  components: {
    Card, 
    Button, 
    Icon, 
    Table, 
    Tag, 
    Page, 
    Modal, 
    Form, 
    FormItem, 
    Input, 
    DatePicker, 
    Select, 
    Option, 
    'i-switch': iSwitch, 
    Alert, 
    Checkbox, 
    SimpleStudentSelector,
    AdminHomeworkQuickCreate
  },
  data() {
    return {
      loading: false,
      homeworkList: [],
      total: 0,
      currentPage: 1,
      pageSize: 10,
      
      // Create modal
      showCreateModal: false,
      showQuickCreateModal: false,
      creating: false,
      createForm: {
        title: '',
        description: 'Complete the assigned problems by the due date.',
        due_date: null,
        problems: [],
        problem_ids: [],
        student_ids: []
        // auto_grade removed - all homeworks are autograded
      },
      
      // Edit modal
      showEditModal: false,
      editing: false,
      editingHomeworkId: null,
      editForm: {
        title: '',
        description: '',
        due_date: null,
        problems: [],
        problem_ids: [],
        student_ids: []
      },
      editDueDateString: '',
      createRules: {
        title: [
          { required: true, message: 'Please enter homework title', trigger: 'blur' }
        ],
        due_date: [
          { required: true, type: 'date', message: 'Please select due date', trigger: 'change' }
        ],
        problem_ids: [
          { 
            type: 'array', 
            min: 1, 
            message: 'Please select at least one problem', 
            trigger: 'change',
            required: true,
            validator: (rule, value, callback) => {
              if (!value || value.length === 0) {
                callback(new Error('Please select at least one problem'))
              } else {
                callback()
              }
            }
          }
        ],
        student_ids: [
          { 
            type: 'array', 
            min: 1, 
            message: 'Please select at least one student', 
            trigger: 'change',
            validator: (rule, value, callback) => {
              if (this.assignToAll || (value && value.length > 0)) {
                callback()
              } else {
                callback(new Error('Please select at least one student'))
              }
            }
          }
        ]
      },
      
      // Problem selector
      showProblemSelector: false,
      problemSearch: '',
      problemList: [],
      selectedProblems: [],
      loadingProblems: false,
      problemSelectorMode: 'create', // 'create' or 'edit'
      
      // Student list
      studentList: [],
      showManualInput: false,
      manualUsernames: '',
      assignToAll: false,
      
      // Group management
      studentGroups: [],
      selectedGroup: 'all',
      availableGroups: [],
      studentSearch: '',
      loadingStudents: false,
      
      // UI state
      useAlternativeSelector: false,
      showDropdownIssue: false,
      dropdownOpenCount: 0,
      dropdownKey: 1,
      dueDateString: '',
      
      // Date picker options
      datePickerOptions: {
        disabledDate(date) {
          // Disable past dates
          return date && date.valueOf() < Date.now() - 86400000
        },
        shortcuts: [
          {
            text: 'Today',
            value() {
              const today = new Date()
              today.setHours(23, 59, 59, 999)
              return today
            }
          },
          {
            text: 'Tomorrow',
            value() {
              const date = new Date()
              date.setTime(date.getTime() + 3600 * 1000 * 24)
              return date
            }
          },
          {
            text: 'Next Week',
            value() {
              const date = new Date()
              date.setTime(date.getTime() + 3600 * 1000 * 24 * 7)
              return date
            }
          }
        ]
      },
      
      // Table columns
      columns: [
        {
          title: 'Title',
          key: 'title',
          minWidth: 200,
          render: (h, params) => {
            return h('a', {
              style: {
                color: '#2d8cf0',
                cursor: 'pointer'
              },
              on: {
                click: () => {
                  this.viewDetails(params.row)
                }
              }
            }, params.row.title)
          }
        },
        {
          title: 'Problems',
          key: 'problems',
          minWidth: 250,
          render: (h, params) => {
            const problems = params.row.problems || []
            const tags = problems.slice(0, 3).map((problem, index) => {
              return h('Tag', {
                key: problem.id || index,
                style: { marginRight: '4px' }
              }, problem.title || problem._id)
            })
            
            if (problems.length > 3) {
              tags.push(h('span', ` +${problems.length - 3} more`))
            }
            
            return h('div', tags)
          }
        },
        {
          title: 'Due Date',
          key: 'due_date',
          width: 150,
          render: (h, params) => {
            return h('span', {
              class: { 'text-error': this.isOverdue(params.row) }
            }, this.formatDate(params.row.due_date))
          }
        },
        {
          title: 'Assigned To',
          key: 'assigned_students',
          minWidth: 200,
          render: (h, params) => {
            const students = params.row.assigned_students || []
            if (students.length === 0) {
              return h('span', { style: { color: '#999' } }, 'No students assigned')
            }
            
            const tags = students.slice(0, 3).map((student, index) => {
              return h('Tag', {
                key: student.id || index,
                props: { size: 'small' },
                style: { marginRight: '3px' }
              }, student.username)
            })
            
            if (students.length > 3) {
              tags.push(h('span', { style: { color: '#999' } }, ` +${students.length - 3} more`))
            }
            
            return h('div', tags)
          }
        },
        {
          title: 'Status',
          key: 'is_active',
          width: 100,
          render: (h, params) => {
            return h('Tag', {
              props: {
                color: params.row.is_active ? 'success' : 'default'
              }
            }, params.row.is_active ? 'Active' : 'Ended')
          }
        },
        {
          title: 'Action',
          key: 'action',
          width: 200,
          fixed: 'right',
          render: (h, params) => {
            return h('div', {
              style: {
                display: 'flex',
                gap: '8px'
              }
            }, [
              h('a', {
                style: {
                  color: '#2d8cf0',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500'
                },
                on: {
                  click: (e) => {
                    e.preventDefault()
                    this.viewDetails(params.row)
                  }
                }
              }, 'View'),
              h('a', {
                style: {
                  color: '#19be6b',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500'
                },
                on: {
                  click: (e) => {
                    e.preventDefault()
                    this.editHomework(params.row)
                  }
                }
              }, 'Edit'),
              h('a', {
                style: {
                  color: '#ed4014',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500'
                },
                on: {
                  click: (e) => {
                    e.preventDefault()
                    this.deleteHomework(params.row)
                  }
                }
              }, 'Delete')
            ])
          }
        }
      ],
      
      problemColumns: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        {
          title: 'Problem',
          slot: 'title',
          minWidth: 300
        },
        {
          title: 'Difficulty',
          slot: 'difficulty',
          width: 100
        },
        {
          title: 'Tags',
          slot: 'tags',
          minWidth: 200
        }
      ]
    }
  },
  computed: {
    filteredProblems() {
      if (!this.problemSearch) return this.problemList
      
      const search = this.problemSearch.toLowerCase()
      return this.problemList.filter(problem => 
        problem.title.toLowerCase().includes(search) ||
        problem._id.toLowerCase().includes(search) ||
        (problem.tags && problem.tags.some(tag => tag.toLowerCase().includes(search)))
      )
    },
    maxTagPlaceholder() {
      return (num) => `+${num} more students`
    },
    debugStudentList() {
      console.log('[debugStudentList] Computing student list for dropdown')
      console.log('[debugStudentList] Raw studentList:', this.studentList)
      console.log('[debugStudentList] studentList length:', this.studentList.length)
      console.log('[debugStudentList] studentList is Array:', Array.isArray(this.studentList))
      
      if (this.studentList && this.studentList.length > 0) {
        console.log('[debugStudentList] First student:', this.studentList[0])
        console.log('[debugStudentList] Student IDs:', this.studentList.map(s => s.id))
        console.log('[debugStudentList] Student usernames:', this.studentList.map(s => s.username))
      }
      
      // Return a clean array to ensure no proxy issues
      const cleanList = this.studentList.map(student => ({
        id: student.id,
        username: student.username || 'Unknown',
        email: student.email || '',
        real_name: student.real_name || ''
      }))
      
      console.log('[debugStudentList] Clean list:', cleanList)
      return cleanList
    }
  },
  mounted() {
    console.log('[AdminHomeworkList] Component mounted')
    console.log('[AdminHomeworkList] ViewUI Plus components available:', {
      DatePicker: !!DatePicker,
      Select: !!Select,
      Option: !!Option
    })
    
    // Initialize date with proper Date object
    this.createForm.due_date = null
    
    // Ensure ViewUI Plus is properly initialized
    this.$nextTick(() => {
      console.log('[AdminHomeworkList] After nextTick - checking components')
      this.loadHomework()
      this.loadStudents()
      this.loadProblems()
    })
  },
  watch: {
    studentList(newVal) {
      console.log('[AdminHomeworkList] Student list updated:', newVal.length, 'students')
    },
    'createForm.student_ids'(newVal) {
      console.log('[AdminHomeworkList] Selected students:', newVal)
    }
  },
  methods: {
    async loadHomework() {
      this.loading = true
      try {
        // Try admin API first
        const res = await adminApi.getHomeworkList({
          page: this.currentPage,
          limit: this.pageSize
        })
        
        if (res && res.data && res.data.data) {
          this.homeworkList = res.data.data.results || []
          this.total = res.data.data.total || 0
        }
      } catch (err) {
        if (err.response?.status === 404) {
          // Try OJ endpoint as fallback
          try {
            const ojRes = await api.getAdminHomeworkList({
              page: this.currentPage,
              limit: this.pageSize
            })
            
            if (ojRes && ojRes.data && ojRes.data.data) {
              this.homeworkList = ojRes.data.data.results || []
              this.total = ojRes.data.data.total || 0
            }
          } catch (ojErr) {
            this.$Message.warning('Homework API not found. Please ensure homework URLs are configured.')
            console.error('Homework endpoints not found:', ojErr)
            this.homeworkList = []
            this.total = 0
          }
        } else {
          this.$Message.error('Failed to load homework list')
          this.homeworkList = []
          this.total = 0
        }
      } finally {
        this.loading = false
      }
    },
    
    async loadStudents() {
      this.loadingStudents = true
      try {
        // Try the new enhanced available_students endpoint first
        const params = {
          include_stats: true
        }
        
        // Only add search if not empty
        if (this.studentSearch && this.studentSearch.trim()) {
          params.search = this.studentSearch.trim()
        }
        
        // Only add group if not 'all'
        if (this.selectedGroup && this.selectedGroup !== 'all') {
          params.group = this.selectedGroup
        }
        
        console.log('[loadStudents] Request params:', params)
        const res = await api.getAvailableStudents(params)
        
        if (res && res.data && res.data.data) {
          // Ensure IDs are numbers
          this.studentList = res.data.data.map(student => ({
            ...student,
            id: typeof student.id === 'string' ? parseInt(student.id, 10) : student.id
          }))
          console.log('[loadStudents] Loaded students:', this.studentList)
          console.log('[loadStudents] Sample student:', this.studentList[0])
          this.$Message.success(`Loaded ${this.studentList.length} students`)
          
          // Load available groups
          this.loadGroups()
        }
      } catch (err) {
        if (err.response?.status === 404) {
          // Try the new /api/users endpoint
          console.log('Trying new /api/users endpoint...')
          try {
            const userRes = await api.getUsers({
              type: 'student',
              search: this.studentSearch,
              page: 1,
              limit: 1000
            })
            
            if (userRes && userRes.data && userRes.data.data) {
              // Ensure IDs are numbers
              this.studentList = (userRes.data.data.results || []).map(student => ({
                ...student,
                id: typeof student.id === 'string' ? parseInt(student.id, 10) : student.id
              }))
              const total = userRes.data.data.total || this.studentList.length
              
              if (this.studentList.length > 0) {
                console.log('[loadStudents from /api/users] Loaded students:', this.studentList)
                this.$Message.success(`Loaded ${this.studentList.length} of ${total} students`)
                // Load groups if we have students
                this.loadGroups()
              } else {
                this.$Message.warning('No students found. You may need to add users first.')
                this.showManualInput = true
              }
            }
          } catch (usersErr) {
            console.error('Users API also failed:', usersErr)
            // Final fallback - still show manual input
            this.$Message.warning('Student APIs not available. Please add students manually.')
            this.studentList = []
            this.showManualInput = true
          }
        } else {
          console.error('Failed to load students:', err)
          this.$Message.error('Failed to load students')
        }
      } finally {
        this.loadingStudents = false
      }
    },
    
    async loadGroups() {
      try {
        const res = await api.getAvailableGroups()
        if (res && res.data) {
          // Handle the actual API response format: {groups: Array, count: number}
          const groupsData = res.data.data?.groups || res.data.groups || []
          
          console.log('[loadGroups] Raw response:', res.data)
          console.log('[loadGroups] Groups data:', groupsData)
          
          // Process groups data
          this.availableGroups = groupsData.filter(group => {
            if (typeof group === 'string') {
              return group.length > 0
            }
            return group && (group.name || group.group_name)
          }).map(group => {
            if (typeof group === 'string') {
              return { name: group, count: 0 }
            }
            return {
              name: group.name || group.group_name || group,
              count: group.count || group.student_count || 0
            }
          })
          
          console.log('[loadGroups] Processed groups:', this.availableGroups)
        }
      } catch (err) {
        console.log('Groups API error:', err)
        this.availableGroups = []
      }
    },
    
    async loadStudentsByGroup() {
      this.loadingStudents = true
      try {
        const res = await api.getStudentsByGroup()
        if (res && res.data && res.data.data) {
          this.studentGroups = res.data.data
          
          // Flatten all students for the select
          if (this.selectedGroup === 'all') {
            this.studentList = []
            this.studentGroups.forEach(group => {
              this.studentList = [...this.studentList, ...group.students]
            })
          } else {
            const group = this.studentGroups.find(g => g.group_name === this.selectedGroup)
            this.studentList = group ? group.students : []
          }
          
          this.$Message.success(`Loaded ${this.studentList.length} students`)
        }
      } catch (err) {
        console.error('Failed to load students by group:', err)
        // Fallback to regular student loading
        this.loadStudents()
      } finally {
        this.loadingStudents = false
      }
    },
    
    async loadProblems() {
      this.loadingProblems = true
      try {
        const res = await api.getProblemList(0, 1000, {})
        
        if (res && res.data && res.data.data) {
          this.problemList = res.data.data.results || []
        }
      } catch (err) {
        console.error('Failed to load problems:', err)
        this.$Message.error('Failed to load problems')
      } finally {
        this.loadingProblems = false
      }
    },
    
    handlePageChange(page) {
      this.currentPage = page
      this.loadHomework()
    },
    
    viewDetails(homework) {
      // Show homework details in a modal for admin view
      this.showHomeworkDetailModal(homework)
    },
    
    showHomeworkDetailModal(homework) {
      this.$Modal.info({
        title: `Homework Details: ${homework.title}`,
        width: 700,
        render: (h) => {
          return h('div', [
            h('div', { style: { marginBottom: '15px' } }, [
              h('h4', 'Description'),
              h('p', homework.description || 'No description provided')
            ]),
            h('div', { style: { marginBottom: '15px' } }, [
              h('h4', 'Due Date'),
              h('p', this.formatDate(homework.due_date))
            ]),
            h('div', { style: { marginBottom: '15px' } }, [
              h('h4', 'Problems'),
              h('div', (homework.problems || []).map(problem => 
                h('Tag', { 
                  props: { color: 'blue' },
                  style: { margin: '5px' }
                }, `${problem._id} - ${problem.title}`)
              ))
            ]),
            h('div', { style: { marginBottom: '15px' } }, [
              h('h4', 'Assigned Students'),
              h('p', `${(homework.assigned_students || []).length} students assigned`),
              h('div', { style: { marginTop: '10px', maxHeight: '200px', overflowY: 'auto' } }, 
                (homework.assigned_students || []).length > 0 
                  ? (homework.assigned_students || []).map(student => 
                      h('Tag', { 
                        props: { color: 'default' },
                        style: { margin: '3px' }
                      }, `${student.username} (${student.email || 'No email'})`)
                    )
                  : h('p', { style: { color: '#999' } }, 'No students assigned yet')
              )
            ]),
            h('div', [
              h('h4', 'Status'),
              h('Tag', {
                props: {
                  color: homework.is_active ? 'success' : 'default'
                }
              }, homework.is_active ? 'Active' : 'Ended')
            ])
          ])
        }
      })
    },
    
    async editHomework(homework) {
      // Load the homework details
      this.editingHomeworkId = homework.id
      this.editForm.title = homework.title
      this.editForm.description = homework.description || ''
      this.editForm.due_date = new Date(homework.due_date)
      
      // Format date for datetime-local input
      const date = new Date(homework.due_date)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      this.editDueDateString = `${year}-${month}-${day}T${hours}:${minutes}`
      
      // Load problems
      this.editForm.problems = homework.problems || []
      this.editForm.problem_ids = homework.problems ? homework.problems.map(p => p.id) : []
      
      // Load student IDs
      this.editForm.student_ids = homework.assigned_students ? homework.assigned_students.map(s => s.id) : []
      
      // Load students and problems if needed
      if (this.studentList.length === 0) {
        await this.loadStudents()
      }
      if (this.problemList.length === 0) {
        await this.loadProblems()
      }
      
      this.showEditModal = true
    },
    
    deleteHomework(homework) {
      this.$Modal.confirm({
        title: 'Delete Homework',
        content: `Are you sure you want to delete "${homework.title}"?`,
        onOk: async () => {
          try {
            console.log('Deleting homework with ID:', homework.id)
            // Try admin API first
            try {
              await adminApi.deleteHomework(homework.id)
            } catch (adminErr) {
              // Fallback to OJ API
              await api.deleteHomework(homework.id)
            }
            this.$Message.success('Homework deleted successfully')
            this.loadHomework()
          } catch (err) {
            console.error('Failed to delete homework:', err)
            console.error('Error response:', err.response)
            
            if (err.response?.status === 404) {
              this.$Message.error('Homework not found')
            } else if (err.response?.status === 403) {
              this.$Message.error('You do not have permission to delete this homework')
            } else if (err.response?.status === 500) {
              this.$Message.error('Server error while deleting homework')
            } else {
              this.$Message.error('Failed to delete homework')
            }
          }
        }
      })
    },
    
    removeProblem(problem) {
      const index = this.createForm.problems.findIndex(p => p.id === problem.id)
      if (index > -1) {
        this.createForm.problems.splice(index, 1)
        this.createForm.problem_ids = this.createForm.problems.map(p => p.id)
      }
    },
    
    onProblemSelectionChange(selection) {
      this.selectedProblems = selection
    },
    
    confirmProblemSelection() {
      if (this.problemSelectorMode === 'edit') {
        this.editForm.problems = [...this.selectedProblems]
        this.editForm.problem_ids = this.selectedProblems.map(p => p.id)
      } else {
        this.createForm.problems = [...this.selectedProblems]
        this.createForm.problem_ids = this.selectedProblems.map(p => p.id)
      }
      this.showProblemSelector = false
      this.problemSelectorMode = 'create' // Reset to default
    },
    
    selectAllStudents() {
      this.createForm.student_ids = this.studentList.map(s => s.id)
    },
    
    clearStudents() {
      this.createForm.student_ids = []
      this.assignToAll = false
    },
    
    handleAssignToAllChange(val) {
      if (val) {
        // Select all students when checkbox is checked
        this.createForm.student_ids = this.studentList.map(s => s.id)
        console.log('[handleAssignToAllChange] Selected all:', this.createForm.student_ids)
      } else {
        // Clear selection when unchecked
        this.createForm.student_ids = []
      }
    },
    
    addManualStudents() {
      if (!this.manualUsernames.trim()) {
        this.$Message.warning('Please enter at least one username')
        return
      }
      
      // Parse usernames
      const usernames = this.manualUsernames
        .split(',')
        .map(u => u.trim())
        .filter(u => u.length > 0)
      
      // Create student entries with temporary IDs
      let nextId = Math.max(...this.studentList.map(s => s.id || 0), 1000) + 1
      
      usernames.forEach(username => {
        // Check if username already exists
        if (!this.studentList.find(s => s.username === username)) {
          const student = {
            id: nextId++,
            username: username,
            email: `${username}@example.com`,
            isManual: true
          }
          this.studentList.push(student)
          this.createForm.student_ids.push(student.id)
        }
      })
      
      this.$Message.success(`Added ${usernames.length} students`)
      this.manualUsernames = ''
      this.showManualInput = false
    },
    
    async createHomework() {
      console.log('createForm state before validation:', {
        title: this.createForm.title,
        description: this.createForm.description,
        due_date: this.createForm.due_date,
        problem_ids: this.createForm.problem_ids,
        student_ids: this.createForm.student_ids,
        assignToAll: this.assignToAll
      })
      
      this.$refs.createForm.validate(async (valid) => {
        if (!valid) {
          console.log('Form validation failed')
          // Get validation errors
          const fields = this.$refs.createForm.fields
          fields.forEach(field => {
            if (field.validateState === 'error') {
              console.log(`Validation error on field ${field.prop}:`, field.validateMessage)
            }
          })
          return
        }
        
        this.creating = true
        try {
          // For manually added students, we might need to use usernames instead of IDs
          const manualStudentIds = this.createForm.student_ids
            .filter(id => {
              const student = this.studentList.find(s => s.id === id)
              return student && student.isManual
            })
          
          const regularStudentIds = this.createForm.student_ids
            .filter(id => {
              const student = this.studentList.find(s => s.id === id)
              return student && !student.isManual
            })
          
          // Get usernames for manual students
          const manualUsernames = manualStudentIds.map(id => {
            const student = this.studentList.find(s => s.id === id)
            return student ? student.username : null
          }).filter(Boolean)
          
          // Ensure arrays are actual arrays, not proxies
          const problemIds = [...this.createForm.problem_ids]
          const studentIds = [...regularStudentIds]
          
          const data = {
            title: this.createForm.title,
            description: this.createForm.description || 'Complete the assigned problems by the due date.',
            due_date: dayjs(this.createForm.due_date).toISOString(),
            problem_ids: problemIds,
            student_ids: studentIds,
            student_usernames: manualUsernames // Send usernames for manual students
            // auto_grade removed - all homeworks are autograded by default
          }
          
          console.log('Creating homework with data:', JSON.stringify(data, null, 2))
          console.log('Problem IDs array:', problemIds)
          console.log('Student IDs array:', studentIds)
          
          // Try admin API first
          try {
            await adminApi.createHomework(data)
          } catch (adminErr) {
            // Fallback to OJ API
            await api.createHomeworkFromOJ(data)
          }
          
          this.$Message.success('Homework created successfully')
          
          this.showCreateModal = false
          this.resetCreateForm()
          this.loadHomework() // Refresh the list
        } catch (err) {
          console.error('Failed to create homework:', err)
          console.error('Full error object:', err)
          
          // The error shows that problem_ids is empty
          if (this.createForm.problem_ids.length === 0) {
            this.$Message.error('Please select at least one problem before creating homework')
            // Focus on the problem selector
            this.showProblemSelector = true
            return
          }
          
          // Handle different error types
          if (err.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Error response:', err.response)
            console.error('Error status:', err.response.status)
            console.error('Error data:', err.response.data)
            
            if (err.response.status === 500) {
              this.$Message.error('Server error (500): The backend encountered an error. Please check the Django server logs for details.')
              console.error('Backend 500 error - check Django logs for:', {
                endpoint: '/api/admin_create_homework',
                method: 'POST',
                data: data
              })
            } else if (err.response.data?.error === 'server-error' && err.response.data?.data) {
              this.$Message.error(`Server error: ${err.response.data.data}`)
            } else if (err.response.data?.error) {
              this.$Message.error(`Failed to create homework: ${err.response.data.error}`)
            } else if (err.response.data?.message) {
              this.$Message.error(`Failed to create homework: ${err.response.data.message}`)
            } else {
              this.$Message.error(`Failed to create homework (HTTP ${err.response.status})`)
            }
          } else if (err.request) {
            // The request was made but no response was received
            this.$Message.error('No response from server. Please check if the backend is running.')
          } else {
            // Something happened in setting up the request that triggered an Error
            this.$Message.error('Failed to create homework. Please try again.')
          }
        } finally {
          this.creating = false
        }
      })
    },
    
    resetCreateForm() {
      this.createForm = {
        title: '',
        description: 'Complete the assigned problems by the due date.',
        due_date: null,
        problems: [],
        problem_ids: [],
        student_ids: []
        // auto_grade removed - all homeworks are autograded
      }
      this.assignToAll = false
      this.showManualInput = false
      this.manualUsernames = ''
      this.$refs.createForm.resetFields()
    },
    
    isOverdue(homework) {
      return dayjs(homework.due_date).isBefore(dayjs()) && homework.is_active
    },
    
    formatDate(dateStr) {
      return time.utcToLocal(dateStr, 'YYYY-MM-DD HH:mm')
    },
    
    getDifficultyColor(difficulty) {
      const colors = {
        'Low': 'success',
        'Mid': 'warning',
        'High': 'error'
      }
      return colors[difficulty] || 'default'
    },
    
    handleDropdownOpen(isOpen) {
      console.log('[handleDropdownOpen] Dropdown opened:', isOpen)
      console.log('[handleDropdownOpen] Current studentList:', this.studentList)
      console.log('[handleDropdownOpen] Current studentList length:', this.studentList.length)
      console.log('[handleDropdownOpen] Current selected IDs:', this.createForm.student_ids)
      console.log('[handleDropdownOpen] Dropdown element exists:', !!this.$refs.studentSelect)
      
      if (isOpen) {
        this.dropdownOpenCount++
        console.log('[handleDropdownOpen] Dropdown open count:', this.dropdownOpenCount)
        
        // Force a re-render of the dropdown
        this.$nextTick(() => {
          console.log('[handleDropdownOpen] After nextTick - checking dropdown content')
          const dropdownEl = document.querySelector('.ivu-select-dropdown')
          console.log('[handleDropdownOpen] Dropdown element found:', !!dropdownEl)
          if (dropdownEl) {
            console.log('[handleDropdownOpen] Dropdown innerHTML length:', dropdownEl.innerHTML.length)
            console.log('[handleDropdownOpen] Dropdown children count:', dropdownEl.children.length)
          }
        })
        
        // If user has tried to open dropdown 3+ times and no selection, show alternative
        if (this.dropdownOpenCount >= 3 && this.createForm.student_ids.length === 0) {
          this.showDropdownIssue = true
        }
      }
    },
    
    handleStudentSelectionChange(selectedIds) {
      console.log('[handleStudentSelectionChange] Selection changed:', selectedIds)
      this.showDropdownIssue = false
    },
    
    forceRefreshDropdown() {
      console.log('[forceRefreshDropdown] Forcing dropdown refresh')
      
      // Method 1: Force re-render by changing key
      this.dropdownKey = Date.now()
      
      // Method 2: Create a new array reference
      const tempList = [...this.studentList]
      this.studentList = []
      this.$nextTick(() => {
        this.studentList = tempList
        console.log('[forceRefreshDropdown] Student list refreshed:', this.studentList)
      })
      
      // Method 3: Try to manually trigger dropdown update
      if (this.$refs.studentSelect) {
        console.log('[forceRefreshDropdown] Found select ref, attempting manual update')
        this.$refs.studentSelect.$forceUpdate()
      }
    },
    
    handleDateChange(date, dateString) {
      console.log('[handleDateChange] Date selected:', date, dateString)
      this.createForm.due_date = date
    },
    
    handleDatePickerOpen(isOpen) {
      console.log('[handleDatePickerOpen] DatePicker opened:', isOpen)
    },
    
    handleDueDateChange(event) {
      const dateValue = event.target.value
      console.log('[handleDueDateChange] Native date selected:', dateValue)
      if (dateValue) {
        // Keep the string value for the input
        this.dueDateString = dateValue
        // Convert to Date object for the form
        this.createForm.due_date = new Date(dateValue)
        console.log('[handleDueDateChange] Converted to Date:', this.createForm.due_date)
      }
    },
    
    openCreateModal() {
      // Reset form first
      this.resetCreateForm()
      
      // Set default due date to tomorrow at 11:59 PM
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(23, 59, 0, 0)
      
      // Format for datetime-local input (YYYY-MM-DDTHH:mm)
      const year = tomorrow.getFullYear()
      const month = String(tomorrow.getMonth() + 1).padStart(2, '0')
      const day = String(tomorrow.getDate()).padStart(2, '0')
      const hours = String(tomorrow.getHours()).padStart(2, '0')
      const minutes = String(tomorrow.getMinutes()).padStart(2, '0')
      
      this.dueDateString = `${year}-${month}-${day}T${hours}:${minutes}`
      this.createForm.due_date = tomorrow
      
      console.log('[openCreateModal] Set default due date:', this.dueDateString)
      
      // Load students if not loaded
      if (this.studentList.length === 0) {
        this.loadStudents()
      }
      
      // Load problems if not loaded
      if (this.problemList.length === 0) {
        this.loadProblems()
      }
      
      // Open the modal
      this.showCreateModal = true
    },
    
    // Edit modal methods
    handleEditDueDateChange(event) {
      const dateValue = event.target.value
      if (dateValue) {
        this.editDueDateString = dateValue
        this.editForm.due_date = new Date(dateValue)
      }
    },
    
    openProblemSelectorForEdit() {
      this.problemSelectorMode = 'edit'
      this.selectedProblems = [...this.editForm.problems]
      this.showProblemSelector = true
    },
    
    removeEditProblem(problem) {
      const index = this.editForm.problems.findIndex(p => p.id === problem.id)
      if (index > -1) {
        this.editForm.problems.splice(index, 1)
        this.editForm.problem_ids = this.editForm.problems.map(p => p.id)
      }
    },
    
    cancelEdit() {
      this.showEditModal = false
      this.editingHomeworkId = null
      this.resetEditForm()
    },
    
    resetEditForm() {
      this.editForm = {
        title: '',
        description: '',
        due_date: null,
        problems: [],
        problem_ids: [],
        student_ids: []
      }
      this.editDueDateString = ''
    },
    
    async updateHomework() {
      this.$refs.editForm.validate(async (valid) => {
        if (!valid) {
          return
        }
        
        this.editing = true
        try {
          const data = {
            title: this.editForm.title,
            description: this.editForm.description || 'Complete the assigned problems by the due date.',
            due_date: dayjs(this.editForm.due_date).toISOString(),
            problem_ids: [...this.editForm.problem_ids]
          }
          
          // Try admin API first
          try {
            await adminApi.updateHomework(this.editingHomeworkId, data)
          } catch (adminErr) {
            // Fallback to OJ API
            await api.updateHomework(this.editingHomeworkId, data)
          }
          this.$Message.success('Homework updated successfully')
          
          this.showEditModal = false
          this.resetEditForm()
          this.loadHomework() // Refresh the list
        } catch (err) {
          console.error('Failed to update homework:', err)
          if (err.response?.status === 404) {
            this.$Message.error('Homework not found')
          } else if (err.response?.status === 403) {
            this.$Message.error('You do not have permission to edit this homework')
          } else if (err.response?.status === 500) {
            this.$Message.error('Server error while updating homework')
          } else {
            this.$Message.error('Failed to update homework')
          }
        } finally {
          this.editing = false
        }
      })
    },
    
    openQuickCreate() {
      this.showQuickCreateModal = true
    },
    
    onHomeworkCreated() {
      this.showQuickCreateModal = false
      this.loadHomework()
      this.$Message.success('Homework created successfully!')
    }
  }
}
</script>

<style lang="less" scoped>
.admin-homework-list {
  padding: 20px 0;
  width: 100%;
  
  .homework-list-container {
    width: 100%;
    max-width: 1600px;
    margin: 0 auto;
    padding: 0 20px;
  }
  
  .filter-controls {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
    
    .filter-group {
      flex: 0 0 40%;
    }
    
    .filter-search {
      flex: 0 0 40%;
    }
    
    .filter-action {
      flex: 0 0 15%;
    }
    
    @media (max-width: 768px) {
      flex-direction: column;
      
      .filter-group,
      .filter-search,
      .filter-action {
        flex: 1 1 auto;
        width: 100%;
      }
    }
  }
  
  .text-error {
    color: #f56c6c;
  }
  
  // Ensure Select and DatePicker components render properly
  .ivu-select,
  .ivu-date-picker {
    width: 100%;
  }
  
  // Fix for dropdown visibility in modals
  .ivu-modal-body {
    .ivu-select-dropdown,
    .ivu-date-picker-transfer {
      z-index: 2050 !important;
    }
  }
  
  // Custom select wrapper styling
  .custom-select-wrapper {
    select {
      &:focus {
        outline: 0;
        border-color: #57a3f3;
        box-shadow: 0 0 0 2px rgba(45,140,240,.2);
      }
    }
  }
  
  // Error border for required fields
  .error-border {
    border-color: #ed4014 !important;
  }
}
</style>