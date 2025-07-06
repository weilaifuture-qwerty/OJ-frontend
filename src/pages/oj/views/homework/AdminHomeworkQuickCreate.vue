<template>
  <div class="homework-quick-create">
    <Card>
      <div slot="title">
        <Icon type="ios-flash" />
        Quick Homework Creator
      </div>
      
      <!-- Step 1: Basic Info -->
      <div class="create-step">
        <h3>Step 1: Basic Information</h3>
        <Row :gutter="16">
          <Col :span="12">
            <div class="form-group">
              <label>Homework Title <span class="required">*</span></label>
              <Input 
                v-model="homework.title" 
                placeholder="e.g., Week 1 - Arrays and Strings"
                size="large"
              />
            </div>
          </Col>
          <Col :span="12">
            <div class="form-group">
              <label>Due Date <span class="required">*</span></label>
              <DatePicker
                type="datetime"
                v-model="homework.due_date"
                placeholder="Select due date and time"
                style="width: 100%"
                size="large"
                :options="datePickerOptions"
              />
            </div>
          </Col>
        </Row>
        
        <div class="form-group">
          <label>Description (Optional)</label>
          <Input 
            v-model="homework.description" 
            type="textarea"
            :rows="2"
            placeholder="Add any instructions or notes for students..."
          />
        </div>
      </div>
      
      <!-- Step 2: Select Problems -->
      <div class="create-step">
        <h3>Step 2: Select Problems</h3>
        
        <!-- Search Section -->
        <div class="search-section">
          <Row :gutter="16">
            <Col :span="16">
              <Input 
                v-model="problemSearch"
                placeholder="Search by problem title, ID, or keyword..."
                size="large"
                clearable
                @on-enter="searchProblems"
                @on-clear="clearSearch"
              >
                <Icon type="ios-search" slot="prefix" />
              </Input>
            </Col>
            <Col :span="8">
              <Button type="primary" size="large" long @click="searchProblems">
                <Icon type="ios-search" />
                Search
              </Button>
            </Col>
          </Row>
          
          <!-- Filter Tags -->
          <div class="filter-section">
            <div class="filter-label">
              <Icon type="ios-pricetags" />
              Quick Filters:
            </div>
            <div class="filter-tags">
              <Tag 
                v-for="tag in popularTags" 
                :key="tag"
                :color="selectedTags.includes(tag) ? 'primary' : 'default'"
                checkable
                @on-change="(checked) => toggleTag(tag, checked)"
                size="medium"
              >
                {{ tag }}
              </Tag>
              <Button 
                v-if="selectedTags.length > 0" 
                type="text" 
                size="small" 
                @click="clearTags"
                style="margin-left: 10px;"
              >
                Clear filters
              </Button>
            </div>
          </div>
        </div>
        
        <!-- Results Section -->
        <div class="results-section">
          <div class="results-header">
            <h4>
              <Icon type="ios-list-box" />
              Available Problems 
              <span class="count">({{ availableProblems.length }} found)</span>
            </h4>
            <div class="results-actions">
              <span class="selection-hint">Click to select problems for homework</span>
            </div>
          </div>
          
          <!-- Problem List -->
          <div class="problem-list">
            <Spin v-if="loadingProblems" fix></Spin>
            
            <div 
              v-for="problem in availableProblems" 
              :key="problem.id" 
              class="problem-card"
              :class="{ 'selected': isSelected(problem) }"
              @click="toggleProblem(problem, !isSelected(problem))"
            >
              <div class="problem-checkbox">
                <Checkbox 
                  :value="isSelected(problem)"
                  @on-change="(checked) => toggleProblem(problem, checked)"
                />
              </div>
              
              <div class="problem-content">
                <div class="problem-header">
                  <span class="problem-id">{{ problem._id }}</span>
                  <span class="problem-title">{{ problem.title }}</span>
                </div>
                
                <div class="problem-meta">
                  <Tag :color="getDifficultyColor(problem.difficulty)" size="small">
                    {{ problem.difficulty }}
                  </Tag>
                  <span class="problem-stats">
                    <Tooltip content="Total submissions">
                      <Icon type="md-people" /> {{ problem.submission_number || 0 }}
                    </Tooltip>
                    <Tooltip content="Accepted submissions" style="margin-left: 15px;">
                      <Icon type="md-checkmark-circle" /> {{ problem.accepted_number || 0 }}
                    </Tooltip>
                    <span v-if="problem.acceptance_rate" class="acceptance-rate">
                      ({{ Math.round(problem.acceptance_rate) }}% AC)
                    </span>
                  </span>
                </div>
              </div>
            </div>
            
            <div v-if="availableProblems.length === 0 && !loadingProblems" class="empty-state">
              <Icon type="ios-search" size="64" />
              <h4>No problems found</h4>
              <p>Try adjusting your search criteria or load more problems from the database.</p>
              <Button type="primary" @click="loadMoreProblems" style="margin-top: 15px;">
                <Icon type="ios-download" />
                Load More Problems
              </Button>
            </div>
          </div>
        </div>
        
        <!-- Selected Problems Summary -->
        <div v-if="selectedProblems.length > 0" class="selected-section">
          <div class="selected-header">
            <h4>
              <Icon type="ios-checkbox" />
              Selected Problems 
              <Badge :count="selectedProblems.length" :overflow-count="99" />
            </h4>
            <Button type="text" size="small" @click="clearSelection">
              Clear all
            </Button>
          </div>
          
          <div class="selected-problems-grid">
            <div 
              v-for="(problem, index) in selectedProblems" 
              :key="problem.id" 
              class="selected-card"
            >
              <div class="selected-number">{{ index + 1 }}</div>
              <div class="selected-info">
                <div class="selected-title">{{ problem.title }}</div>
                <div class="selected-meta">
                  <span class="selected-id">{{ problem._id }}</span>
                  <Tag :color="getDifficultyColor(problem.difficulty)" size="small">
                    {{ problem.difficulty }}
                  </Tag>
                </div>
              </div>
              <Button 
                type="text" 
                size="small" 
                @click.stop="removeProblem(problem)"
                class="remove-btn"
              >
                <Icon type="ios-close-circle" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Step 3: Assign Students -->
      <div class="create-step">
        <h3>Step 3: Assign to Students</h3>
        
        <!-- Assignment Type Selection -->
        <div class="assignment-options">
          <RadioGroup v-model="assignmentType" @on-change="handleAssignmentTypeChange">
            <Radio label="all" class="assignment-radio">
              <Icon type="md-people" />
              <span>All Students ({{ totalStudents }} students)</span>
            </Radio>
            <Radio label="group" class="assignment-radio">
              <Icon type="md-folder" />
              <span>By Group/Class</span>
            </Radio>
            <Radio label="individual" class="assignment-radio">
              <Icon type="md-person" />
              <span>Individual Students</span>
            </Radio>
          </RadioGroup>
        </div>
        
        <!-- Group Selection -->
        <transition name="fade">
          <div v-if="assignmentType === 'group'" class="selection-panel group-selection">
            <h4>
              <Icon type="md-folder" />
              Select Groups/Classes
            </h4>
            <div v-if="availableGroups.length === 0" class="empty-message">
              <Icon type="ios-information-circle" />
              No groups available. Loading...
            </div>
            <CheckboxGroup v-else v-model="selectedGroups" class="group-list">
              <div 
                v-for="group in availableGroups" 
                :key="group.name"
                class="group-item"
              >
                <Checkbox :label="group.name">
                  <span class="group-name">{{ group.name }}</span>
                  <Badge :count="group.count" :overflow-count="999" class="student-count" />
                </Checkbox>
              </div>
            </CheckboxGroup>
          </div>
        </transition>
        
        <!-- Individual Selection -->
        <transition name="fade">
          <div v-if="assignmentType === 'individual'" class="selection-panel individual-selection">
            <h4>
              <Icon type="md-person" />
              Select Individual Students
            </h4>
            
            <div class="search-bar">
              <Input 
                v-model="studentSearch"
                placeholder="Search students by name, username, or email..."
                size="large"
                clearable
                @on-enter="searchStudents"
                @on-clear="searchStudents"
              >
                <Icon type="ios-search" slot="prefix" />
              </Input>
            </div>
            
            <div class="student-selection-area">
              <!-- Loading State -->
              <div v-if="loadingStudents" class="empty-message">
                <Spin size="large" />
                <p style="margin-top: 15px;">Loading students...</p>
              </div>
              
              <!-- Empty State -->
              <div v-else-if="allStudents.length === 0" class="empty-message">
                <Icon type="ios-people" size="48" />
                <p>No students available.</p>
                <Button type="primary" @click="reloadAndShowStudents" style="margin-top: 10px;">
                  Load Students
                </Button>
              </div>
              
              <!-- No Search Results -->
              <div v-else-if="filteredStudents.length === 0 && studentSearch" class="empty-message">
                <Icon type="ios-search" size="48" />
                <p>No students found matching "{{ studentSearch }}"</p>
                <Button type="text" @click="studentSearch = ''; searchStudents()">
                  Clear search
                </Button>
              </div>
              
              <!-- Student List -->
              <div v-else class="student-list">
                <div class="list-header">
                  <span>Available Students ({{ filteredStudents.length }})</span>
                  <Button type="text" size="small" @click="selectAllFilteredStudents">
                    Select All
                  </Button>
                </div>
                
                <div class="student-items">
                  <div 
                    v-for="student in filteredStudents" 
                    :key="student.id"
                    class="student-item"
                    :class="{ 'selected': selectedStudents.includes(student.id) }"
                  >
                    <Checkbox 
                      :value="selectedStudents.includes(student.id)"
                      @on-change="(checked) => toggleStudent(student, checked)"
                    >
                      <div class="student-info">
                        <span class="student-name">{{ student.username }}</span>
                        <span class="student-details">
                          {{ student.real_name || 'No name' }} • {{ student.email }}
                        </span>
                      </div>
                    </Checkbox>
                  </div>
                </div>
              </div>
              
              <!-- Selected Students Summary -->
              <div v-if="selectedStudents.length > 0" class="selected-students-summary">
                <div class="summary-header">
                  <span>Selected Students ({{ selectedStudents.length }})</span>
                  <Button type="text" size="small" @click="clearSelectedStudents">
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </transition>
        
        <!-- Assignment Summary -->
        <Alert type="info" show-icon style="margin-top: 20px;" class="assignment-summary">
          <template #desc>
            <div class="summary-content">
              <Icon type="ios-checkmark-circle" />
              This homework will be assigned to 
              <strong>{{ getAssignedCount() }}</strong> students
              <span v-if="assignmentType === 'group' && selectedGroups.length > 0">
                from {{ selectedGroups.length }} group(s)
              </span>
            </div>
          </template>
        </Alert>
      </div>
      
      <!-- Actions -->
      <div class="create-actions">
        <Button size="large" @click="resetForm">
          <Icon type="md-refresh" />
          Reset
        </Button>
        <Button type="primary" size="large" @click="createHomework" :loading="creating">
          <Icon type="md-checkmark" />
          Create Homework
        </Button>
      </div>
    </Card>
  </div>
</template>

<script>
import { Card, Icon, Input, Button, Row, Col, DatePicker, Tag, Checkbox, CheckboxGroup, Radio, RadioGroup, Spin, Alert, Message, Badge, Tooltip } from 'view-ui-plus'
// import draggable from 'vuedraggable'
import api from '@oj/api'
import dayjs from 'dayjs'

export default {
  name: 'AdminHomeworkQuickCreate',
  components: {
    Card, Icon, Input, Button, Row, Col, DatePicker, Tag, Checkbox, CheckboxGroup, 
    Radio, RadioGroup, Spin, Alert, Badge, Tooltip
    // draggable
  },
  data() {
    return {
      homework: {
        title: '',
        description: '',
        due_date: null
      },
      
      // Problem selection
      problemSearch: '',
      selectedTags: [],
      popularTags: ['Array', 'String', 'Dynamic Programming', 'Tree', 'Graph', 'Math'],
      allProblems: [], // Store all problems
      availableProblems: [], // Store filtered problems
      selectedProblems: [],
      loadingProblems: false,
      searchTimeout: null,
      
      // Student assignment
      assignmentType: 'all',
      availableGroups: [],
      selectedGroups: [],
      studentSearch: '',
      allStudents: [],
      filteredStudents: [],
      selectedStudents: [],
      totalStudents: 0,
      loadingStudents: false,
      studentSearchTimeout: null,
      
      creating: false,
      
      datePickerOptions: {
        shortcuts: [
          {
            text: 'End of Today',
            value() {
              const date = new Date()
              date.setHours(23, 59, 59, 999)
              return date
            }
          },
          {
            text: 'Tomorrow',
            value() {
              const date = new Date()
              date.setDate(date.getDate() + 1)
              date.setHours(23, 59, 59, 999)
              return date
            }
          },
          {
            text: 'Next Week',
            value() {
              const date = new Date()
              date.setDate(date.getDate() + 7)
              date.setHours(23, 59, 59, 999)
              return date
            }
          },
          {
            text: 'Next Month',
            value() {
              const date = new Date()
              date.setMonth(date.getMonth() + 1)
              date.setHours(23, 59, 59, 999)
              return date
            }
          }
        ],
        disabledDate(date) {
          // Disable past dates
          return date && date.valueOf() < Date.now() - 86400000
        }
      }
    }
  },
  
  mounted() {
    // Clear search to show all problems initially
    this.problemSearch = ''
    this.studentSearch = ''
    this.loadInitialData().then(() => {
      // Force show test students if none loaded
      if (this.allStudents.length === 0) {
        console.log('No students found after initial load, adding test students')
        this.allStudents = [
          { id: 1, username: 'student1', email: 'student1@example.com', real_name: 'John Doe' },
          { id: 2, username: 'student2', email: 'student2@example.com', real_name: 'Jane Smith' },
          { id: 3, username: 'student3', email: 'student3@example.com', real_name: 'Bob Johnson' },
          { id: 4, username: 'student4', email: 'student4@example.com', real_name: 'Alice Brown' },
          { id: 5, username: 'student5', email: 'student5@example.com', real_name: 'Charlie Wilson' }
        ]
        this.totalStudents = this.allStudents.length
        this.filteredStudents = [...this.allStudents]
      }
    })
  },
  
  watch: {
    problemSearch(newVal) {
      // Clear previous timeout
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout)
      }
      
      // Perform local search immediately
      this.searchProblems()
      
      // If search term is longer than 2 characters, also search backend after delay
      if (newVal && newVal.length > 2) {
        this.searchTimeout = setTimeout(() => {
          this.searchBackendProblems()
        }, 1000) // 1 second delay
      }
    },
    studentSearch() {
      // Debounce student search slightly to avoid too many updates
      if (this.studentSearchTimeout) {
        clearTimeout(this.studentSearchTimeout)
      }
      this.studentSearchTimeout = setTimeout(() => {
        this.searchStudents()
      }, 300)
    }
  },
  
  methods: {
    async loadInitialData() {
      await Promise.all([
        this.loadProblems(),
        this.loadGroups(),
        this.loadAllStudents()
      ])
      // Ensure filtered students is populated after loading
      this.filteredStudents = [...this.allStudents]
    },
    
    async loadProblems() {
      this.loadingProblems = true
      try {
        // Load problems with proper fuzzy search support
        const res = await api.getProblemList(0, 1000, {})
        
        // Safely extract results
        if (res && res.data && res.data.data && res.data.data.results) {
          this.allProblems = res.data.data.results.map(problem => {
            // Add acceptance rate if not present
            if (!problem.acceptance_rate && problem.submission_number > 0) {
              problem.acceptance_rate = (problem.accepted_number / problem.submission_number) * 100
            }
            return problem
          })
        } else {
          console.warn('Unexpected API response format:', res)
          this.allProblems = []
        }
        
        this.availableProblems = [...this.allProblems] // Create a copy for filtering
        
        console.log(`Loaded ${this.allProblems.length} problems`)
        
        // If we have sample problems, log them for debugging
        if (this.allProblems.length > 0) {
          console.log('Sample problems:', this.allProblems.slice(0, 3).map(p => ({
            id: p.id,
            _id: p._id,
            title: p.title,
            tags: p.tags
          })))
        }
      } catch (err) {
        this.$Message.error('Failed to load problems.')
        console.error('Error loading problems:', err)
        this.allProblems = []
        this.availableProblems = []
      } finally {
        this.loadingProblems = false
      }
    },
    
    async loadGroups() {
      try {
        const res = await api.getAvailableGroups()
        console.log('Groups API response:', res)
        
        if (res.data && res.data.data) {
          if (res.data.data.groups && Array.isArray(res.data.data.groups)) {
            this.availableGroups = res.data.data.groups
          } else if (Array.isArray(res.data.data)) {
            this.availableGroups = res.data.data.map(group => {
              if (typeof group === 'string') {
                return { name: group, count: 0 }
              }
              return {
                name: group.name || group.group_name || group,
                count: group.count || group.student_count || 0
              }
            })
          }
        }
        
        console.log('Available groups:', this.availableGroups)
      } catch (err) {
        console.error('Failed to load groups:', err)
        // Extract groups from loaded students as fallback
        if (this.allStudents.length > 0) {
          const groupMap = new Map()
          this.allStudents.forEach(student => {
            if (student.group && student.group !== 'Unassigned') {
              const count = groupMap.get(student.group) || 0
              groupMap.set(student.group, count + 1)
            }
          })
          this.availableGroups = Array.from(groupMap.entries()).map(([name, count]) => ({ name, count }))
        }
      }
    },
    
    async loadAllStudents() {
      this.loadingStudents = true
      try {
        // Try to use available_students endpoint first as it's designed for this purpose
        const res = await api.getAvailableStudents({ include_stats: true })
        
        if (res.data && res.data.data) {
          this.allStudents = res.data.data.map(student => ({
            id: student.id,
            username: student.username,
            email: student.email,
            real_name: student.real_name || student.username,
            group: student.group || 'Unassigned',
            homework_stats: student.homework_stats
          }))
          this.totalStudents = this.allStudents.length
          this.filteredStudents = [...this.allStudents]
          
          console.log(`Loaded ${this.allStudents.length} students from available_students endpoint`)
        }
      } catch (err) {
        console.error('Failed to load from available_students:', err)
        
        // Fallback to users endpoint
        try {
          const res = await api.getUsers({ limit: 1000 })
          
          if (res.data && res.data.data && res.data.data.results) {
            // Filter for regular users (students)
            this.allStudents = res.data.data.results
              .filter(user => user.admin_type === 'Regular User')
              .map(user => ({
                id: user.id,
                username: user.username,
                email: user.email,
                real_name: user.real_name || user.username,
                group: 'Unassigned'
              }))
            this.totalStudents = this.allStudents.length
            this.filteredStudents = [...this.allStudents]
            
            console.log(`Loaded ${this.allStudents.length} students from users endpoint`)
          }
        } catch (fallbackErr) {
          console.error('Failed to load students from users endpoint:', fallbackErr)
          this.$Message.error('Failed to load students')
          this.allStudents = []
          this.filteredStudents = []
          this.totalStudents = 0
        }
      }
      this.loadingStudents = false
    },
    
    searchProblems() {
      // Filter problems based on search and tags
      this.loadingProblems = true
      
      setTimeout(() => {
        let filtered = [...this.allProblems] // Start with all problems
        
        // If search is empty and no tags selected, show all problems
        if (!this.problemSearch && this.selectedTags.length === 0) {
          this.availableProblems = filtered
          this.loadingProblems = false
          return
        }
        
        if (this.problemSearch) {
          const searchTerms = this.problemSearch.toLowerCase().split(/\s+/).filter(term => term.length > 0)
          
          // If search terms is empty after filtering, show all
          if (searchTerms.length === 0) {
            // Continue to tag filtering below
          } else {
            filtered = filtered.filter(p => {
              const titleLower = p.title.toLowerCase()
              const idLower = p._id.toLowerCase()
              const tagsLower = (p.tags || []).map(tag => tag.toLowerCase()).join(' ')
              const fullText = `${titleLower} ${idLower} ${tagsLower}`
              
              // Check if all search terms are found somewhere in the problem data
              return searchTerms.every(term => {
                // Fuzzy match: check if the term appears anywhere in the problem data
                // Or if the problem data contains characters that match the search term in order
                if (fullText.includes(term)) {
                  return true
                }
                
                // Additional fuzzy matching: check if characters appear in order
                let termIndex = 0
                for (let i = 0; i < titleLower.length && termIndex < term.length; i++) {
                  if (titleLower[i] === term[termIndex]) {
                    termIndex++
                  }
                }
                return termIndex === term.length
              })
            })
          }
        }
        
        if (this.selectedTags.length > 0) {
          filtered = filtered.filter(p => 
            p.tags && p.tags.some(tag => this.selectedTags.includes(tag))
          )
        }
        
        this.availableProblems = filtered
        this.loadingProblems = false
      }, 300)
    },
    
    toggleTag(tag, checked) {
      if (checked) {
        this.selectedTags.push(tag)
      } else {
        this.selectedTags = this.selectedTags.filter(t => t !== tag)
      }
      this.searchProblems()
    },
    
    isSelected(problem) {
      return this.selectedProblems.some(p => p.id === problem.id)
    },
    
    toggleProblem(problem, checked) {
      if (checked) {
        this.selectedProblems.push(problem)
      } else {
        this.selectedProblems = this.selectedProblems.filter(p => p.id !== problem.id)
      }
    },
    
    removeProblem(problem) {
      this.selectedProblems = this.selectedProblems.filter(p => p.id !== problem.id)
    },
    
    clearSearch() {
      this.problemSearch = ''
      this.searchProblems()
    },
    
    clearTags() {
      this.selectedTags = []
      this.searchProblems()
    },
    
    clearSelection() {
      this.selectedProblems = []
    },
    
    selectAllFilteredStudents() {
      this.selectedStudents = this.filteredStudents.map(s => s.id)
    },
    
    clearSelectedStudents() {
      this.selectedStudents = []
    },
    
    async reloadAndShowStudents() {
      this.studentSearch = ''
      await this.loadAllStudents()
      this.filteredStudents = [...this.allStudents]
      console.log('Reloaded and showing all students:', this.filteredStudents.length)
    },
    
    getDifficultyColor(difficulty) {
      const colors = {
        Low: 'success',
        Mid: 'warning',
        High: 'error'
      }
      return colors[difficulty] || 'default'
    },
    
    handleAssignmentTypeChange(type) {
      // Reset selections when changing type
      this.selectedGroups = []
      this.selectedStudents = []
      
      // If switching to individual, ensure students are loaded and visible
      if (type === 'individual') {
        console.log('Switching to individual selection')
        // Clear search to show all students
        this.studentSearch = ''
        
        if (this.allStudents.length === 0) {
          console.log('No students loaded, loading now...')
          this.loadAllStudents().then(() => {
            // After loading, ensure filtered students is populated
            this.filteredStudents = [...this.allStudents]
            console.log('Students loaded and displayed:', this.filteredStudents.length)
          })
        } else {
          // Ensure filtered students shows all students when search is empty
          this.filteredStudents = [...this.allStudents]
          console.log('Students already loaded, showing all:', this.filteredStudents.length)
        }
      }
    },
    
    searchStudents() {
      console.log('searchStudents called, search term:', this.studentSearch)
      console.log('All students:', this.allStudents.length)
      
      if (!this.studentSearch || this.studentSearch.trim() === '') {
        this.filteredStudents = [...this.allStudents]
        console.log('No search term, showing all students:', this.filteredStudents.length)
        return
      }
      
      const search = this.studentSearch.toLowerCase().trim()
      this.filteredStudents = this.allStudents.filter(s => 
        s.username.toLowerCase().includes(search) ||
        (s.real_name && s.real_name.toLowerCase().includes(search)) ||
        s.email.toLowerCase().includes(search)
      )
      console.log('Filtered students:', this.filteredStudents.length)
    },
    
    toggleStudent(student, checked) {
      if (checked) {
        this.selectedStudents.push(student.id)
      } else {
        this.selectedStudents = this.selectedStudents.filter(id => id !== student.id)
      }
    },
    
    getAssignedCount() {
      if (this.assignmentType === 'all') {
        return this.totalStudents
      } else if (this.assignmentType === 'group') {
        return this.selectedGroups.reduce((count, groupName) => {
          const group = this.availableGroups.find(g => g.name === groupName)
          return count + (group ? group.count : 0)
        }, 0)
      } else {
        return this.selectedStudents.length
      }
    },
    
    async createHomework() {
      // Validate
      if (!this.homework.title) {
        this.$Message.error('Please enter a homework title')
        return
      }
      
      if (!this.homework.due_date) {
        this.$Message.error('Please select a due date')
        return
      }
      
      if (this.selectedProblems.length === 0) {
        this.$Message.error('Please select at least one problem')
        return
      }
      
      if (this.getAssignedCount() === 0) {
        this.$Message.error('Please select students to assign this homework to')
        return
      }
      
      this.creating = true
      
      try {
        // Prepare student IDs based on assignment type
        let studentIds = []
        
        if (this.assignmentType === 'all') {
          studentIds = this.allStudents.map(s => s.id)
        } else if (this.assignmentType === 'group') {
          // Get students from selected groups
          for (const groupName of this.selectedGroups) {
            try {
              const res = await api.getStudentsByGroup(groupName)
              studentIds.push(...res.data.data.map(s => s.id))
            } catch (err) {
              // If API doesn't exist, use filtered students
              const groupStudents = this.allStudents.filter(s => s.group === groupName || s.class === groupName)
              studentIds.push(...groupStudents.map(s => s.id))
            }
          }
        } else {
          studentIds = this.selectedStudents
        }
        
        // Create homework
        const data = {
          title: this.homework.title,
          description: this.homework.description || 'Complete the assigned problems by the due date.',
          due_date: this.homework.due_date.toISOString ? this.homework.due_date.toISOString() : this.homework.due_date,
          problem_ids: this.selectedProblems.map(p => p.id),
          student_ids: [...new Set(studentIds)] // Remove duplicates
        }
        
        // Add student usernames for fallback
        const studentsData = this.allStudents.filter(s => studentIds.includes(s.id))
        data.student_usernames = studentsData.map(s => s.username)
        
        console.log('Creating homework with data:', data)
        
        const response = await api.createHomeworkFromOJ(data)
        
        this.$Message.success({
          content: `Homework "${this.homework.title}" created successfully!`,
          duration: 5
        })
        
        // Reset form
        this.resetForm()
        
        // Emit event to refresh list
        this.$emit('created')
        
      } catch (err) {
        this.$Message.error(err.response?.data?.error || err.response?.data?.data || 'Failed to create homework')
      } finally {
        this.creating = false
      }
    },
    
    resetForm() {
      this.homework = {
        title: '',
        description: '',
        due_date: null
      }
      this.selectedProblems = []
      this.selectedGroups = []
      this.selectedStudents = []
      this.assignmentType = 'all'
      this.problemSearch = ''
      this.selectedTags = []
    },
    
    async loadMoreProblems() {
      this.loadingProblems = true
      try {
        // Try to load problems with search keyword from backend
        const searchParams = {}
        
        if (this.problemSearch) {
          searchParams.keyword = this.problemSearch
        }
        
        const res = await api.getProblemList(0, 1000, searchParams)
        const newProblems = res.data.data.results || []
        
        // Merge with existing problems (avoid duplicates)
        const existingIds = new Set(this.allProblems.map(p => p.id))
        const uniqueNewProblems = newProblems.filter(p => !existingIds.has(p.id))
        
        this.allProblems = [...this.allProblems, ...uniqueNewProblems]
        
        // Re-run search to update available problems
        this.searchProblems()
        
        if (uniqueNewProblems.length > 0) {
          this.$Message.success(`Loaded ${uniqueNewProblems.length} more problems`)
        } else {
          this.$Message.info('No additional problems found')
        }
      } catch (err) {
        this.$Message.error('Failed to load more problems')
        console.error('Error loading more problems:', err)
      } finally {
        this.loadingProblems = false
      }
    },
    
    async searchBackendProblems() {
      try {
        // Search backend for problems matching the search term
        const searchParams = {
          keyword: this.problemSearch
        }
        
        const res = await api.getProblemList(0, 50, searchParams)
        const searchResults = res.data.data.results || []
        
        // Merge with existing problems (avoid duplicates)
        const existingIds = new Set(this.allProblems.map(p => p.id))
        const newProblems = searchResults.filter(p => !existingIds.has(p.id))
        
        if (newProblems.length > 0) {
          this.allProblems = [...this.allProblems, ...newProblems]
          // Re-run search to include new problems
          this.searchProblems()
          console.log(`Found ${newProblems.length} additional problems from backend search`)
        }
      } catch (err) {
        console.error('Backend search failed:', err)
        // Silently fail - local search is still working
      }
    }
  }
}
</script>

<style lang="less" scoped>
.homework-quick-create {
  .create-step {
    margin-bottom: 30px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;
    
    h3 {
      margin-bottom: 20px;
      color: #2d3436;
      font-size: 18px;
      font-weight: 600;
    }
  }
  
  .form-group {
    margin-bottom: 20px;
    
    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #636e72;
      
      .required {
        color: #ff6b6b;
      }
    }
  }
  
  .search-section {
    margin-bottom: 20px;
    
    .filter-section {
      margin-top: 15px;
      
      .filter-label {
        font-size: 14px;
        color: #666;
        margin-bottom: 10px;
        
        .ivu-icon {
          margin-right: 5px;
        }
      }
      
      .filter-tags {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        
        .ivu-tag {
          margin-right: 8px;
          margin-bottom: 8px;
          cursor: pointer;
          font-size: 13px;
          padding: 5px 12px;
          
          &:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
        }
      }
    }
  }
  
  .results-section {
    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid #e8e8e8;
      
      h4 {
        margin: 0;
        font-size: 16px;
        color: #333;
        
        .ivu-icon {
          margin-right: 5px;
        }
        
        .count {
          font-weight: normal;
          color: #666;
          font-size: 14px;
        }
      }
      
      .selection-hint {
        font-size: 13px;
        color: #999;
        font-style: italic;
      }
    }
  }
  
  .problem-list {
    max-height: 500px;
    overflow-y: auto;
    border: 1px solid #e1e4e8;
    border-radius: 8px;
    background: #fafafa;
    position: relative;
    padding: 10px;
    
    .problem-card {
      display: flex;
      align-items: stretch;
      margin-bottom: 10px;
      padding: 15px;
      background: white;
      border: 1px solid #e8e8e8;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      
      &:hover {
        border-color: #40a9ff;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      }
      
      &.selected {
        background: #e6f7ff;
        border-color: #1890ff;
      }
      
      .problem-checkbox {
        margin-right: 15px;
        display: flex;
        align-items: center;
      }
      
      .problem-content {
        flex: 1;
        
        .problem-header {
          margin-bottom: 8px;
          
          .problem-id {
            font-family: 'Monaco', 'Consolas', monospace;
            font-size: 13px;
            color: #666;
            background: #f0f0f0;
            padding: 2px 6px;
            border-radius: 3px;
            margin-right: 10px;
          }
          
          .problem-title {
            font-weight: 500;
            font-size: 15px;
            color: #333;
          }
        }
        
        .problem-meta {
          display: flex;
          align-items: center;
          gap: 15px;
          
          .problem-stats {
            display: flex;
            align-items: center;
            font-size: 13px;
            color: #666;
            
            .ivu-icon {
              margin-right: 3px;
              font-size: 14px;
            }
            
            .acceptance-rate {
              margin-left: 10px;
              color: #52c41a;
              font-weight: 500;
            }
          }
        }
      }
    }
    
    .empty-state {
      text-align: center;
      padding: 80px 20px;
      color: #999;
      
      h4 {
        margin: 15px 0 10px;
        font-size: 18px;
        color: #666;
      }
      
      p {
        margin-bottom: 0;
        font-size: 14px;
      }
    }
  }
  
  .selected-section {
    margin-top: 25px;
    padding: 20px;
    background: #f0f7ff;
    border: 1px solid #d6e4ff;
    border-radius: 8px;
    
    .selected-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      
      h4 {
        margin: 0;
        color: #1890ff;
        font-size: 16px;
        display: flex;
        align-items: center;
        gap: 8px;
        
        .ivu-icon {
          font-size: 20px;
        }
      }
    }
    
    .selected-problems-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 10px;
      
      .selected-card {
        display: flex;
        align-items: center;
        padding: 12px;
        background: white;
        border: 1px solid #d9d9d9;
        border-radius: 6px;
        transition: all 0.2s;
        
        &:hover {
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          
          .remove-btn {
            opacity: 1;
          }
        }
        
        .selected-number {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #1890ff;
          color: white;
          border-radius: 50%;
          font-weight: 600;
          font-size: 13px;
          margin-right: 12px;
        }
        
        .selected-info {
          flex: 1;
          
          .selected-title {
            font-weight: 500;
            color: #333;
            margin-bottom: 4px;
          }
          
          .selected-meta {
            display: flex;
            align-items: center;
            gap: 8px;
            
            .selected-id {
              font-size: 12px;
              color: #999;
              font-family: monospace;
            }
          }
        }
        
        .remove-btn {
          opacity: 0.6;
          transition: opacity 0.2s;
          
          &:hover {
            color: #ff4d4f;
          }
        }
      }
    }
  }
  
  .assignment-options {
    margin-bottom: 20px;
    
    .assignment-radio {
      display: block;
      margin-bottom: 12px;
      padding: 15px;
      border: 1px solid #e1e4e8;
      border-radius: 6px;
      transition: all 0.2s;
      
      &:hover {
        border-color: #40a9ff;
        background: #f8f9fa;
      }
      
      .ivu-radio-wrapper {
        padding: 0;
        border: none;
        
        &:hover {
          background: transparent;
        }
      }
      
      .ivu-icon {
        margin-right: 8px;
        font-size: 18px;
      }
    }
  }
  
  .selection-panel {
    margin-top: 20px;
    padding: 20px;
    border: 1px solid #e1e4e8;
    border-radius: 8px;
    background: white;
    
    h4 {
      margin-bottom: 15px;
      color: #333;
      font-size: 16px;
      
      .ivu-icon {
        margin-right: 8px;
      }
    }
    
    .empty-message {
      text-align: center;
      padding: 40px;
      color: #999;
      
      .ivu-icon {
        font-size: 32px;
        margin-bottom: 10px;
      }
    }
  }
  
  .group-selection {
    .group-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 12px;
      
      .group-item {
        padding: 12px;
        border: 1px solid #e8e8e8;
        border-radius: 6px;
        transition: all 0.2s;
        
        &:hover {
          border-color: #40a9ff;
          background: #f8f9fa;
        }
        
        .ivu-checkbox-wrapper {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }
        
        .group-name {
          font-weight: 500;
        }
        
        .student-count {
          margin-left: 10px;
        }
      }
    }
  }
  
  .individual-selection {
    .search-bar {
      margin-bottom: 20px;
    }
    
    .student-selection-area {
      .student-list {
        border: 1px solid #e1e4e8;
        border-radius: 6px;
        background: #fafafa;
        
        .list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid #e1e4e8;
          background: white;
          
          span {
            font-weight: 500;
            color: #333;
          }
        }
        
        .student-items {
          max-height: 400px;
          overflow-y: auto;
          padding: 10px;
          
          .student-item {
            margin-bottom: 8px;
            padding: 12px;
            background: white;
            border: 1px solid #e8e8e8;
            border-radius: 4px;
            transition: all 0.2s;
            
            &:hover {
              border-color: #40a9ff;
            }
            
            &.selected {
              background: #e6f7ff;
              border-color: #1890ff;
            }
            
            .student-info {
              margin-left: 8px;
              
              .student-name {
                font-weight: 500;
                color: #333;
                display: block;
              }
              
              .student-details {
                font-size: 13px;
                color: #666;
                display: block;
                margin-top: 2px;
              }
            }
          }
        }
      }
      
      .selected-students-summary {
        margin-top: 15px;
        padding: 12px;
        background: #e6f7ff;
        border: 1px solid #91d5ff;
        border-radius: 4px;
        
        .summary-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          
          span {
            color: #1890ff;
            font-weight: 500;
          }
        }
      }
    }
  }
  
  .assignment-summary {
    .summary-content {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .ivu-icon {
        font-size: 20px;
        color: #52c41a;
      }
    }
  }
  
  // Fade transition
  .fade-enter-active, .fade-leave-active {
    transition: opacity 0.3s;
  }
  .fade-enter, .fade-leave-to {
    opacity: 0;
  }
  
  .create-actions {
    text-align: center;
    padding: 30px 0;
    
    .ivu-btn {
      margin: 0 10px;
      min-width: 150px;
    }
  }
}
</style>