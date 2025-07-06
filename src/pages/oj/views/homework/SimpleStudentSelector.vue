<template>
  <div class="simple-student-selector">
    <!-- Loading state -->
    <div v-if="loading" style="text-align: center; padding: 20px;">
      <Spin size="large" />
      <p>Loading students...</p>
    </div>
    
    <!-- Main content -->
    <div v-else>
      <!-- Controls -->
      <Row :gutter="10" style="margin-bottom: 15px;">
        <Col :span="8">
          <Select 
            v-model="groupFilter" 
            @on-change="filterStudents"
            placeholder="All Groups"
            clearable
            style="width: 100%;"
          >
            <Option value="">All Groups</Option>
            <Option 
              v-for="group in groups" 
              :key="group"
              :value="group"
            >
              {{ group }}
            </Option>
          </Select>
        </Col>
        <Col :span="8">
          <Input 
            v-model="searchQuery" 
            placeholder="Search students..."
            @on-change="filterStudents"
            clearable
          >
            <Icon type="ios-search" slot="suffix" />
          </Input>
        </Col>
        <Col :span="8">
          <div style="text-align: right;">
            <Checkbox v-model="selectAll" @on-change="handleSelectAll">
              Select All ({{ filteredStudents.length }})
            </Checkbox>
          </div>
        </Col>
      </Row>
      
      <!-- Student checkboxes -->
      <div style="max-height: 300px; overflow-y: auto; border: 1px solid #dcdee2; border-radius: 4px; padding: 10px;">
        <CheckboxGroup v-model="selectedIds" @on-change="handleSelectionChange">
          <div 
            v-for="student in filteredStudents" 
            :key="student.id"
            style="padding: 5px 0; border-bottom: 1px solid #f0f0f0;"
          >
            <Checkbox :label="student.id">
              <span style="font-weight: 500;">{{ student.username }}</span>
              <span v-if="student.real_name" style="color: #666; margin-left: 10px;">
                {{ student.real_name }}
              </span>
              <Tag v-if="student.group" size="small" style="margin-left: 10px;">
                {{ student.group }}
              </Tag>
            </Checkbox>
          </div>
        </CheckboxGroup>
        
        <div v-if="filteredStudents.length === 0" style="text-align: center; padding: 20px; color: #999;">
          No students found
        </div>
      </div>
      
      <!-- Summary -->
      <div style="margin-top: 10px; color: #666;">
        {{ selectedIds.length }} students selected
      </div>
    </div>
  </div>
</template>

<script>
import { Spin, Row, Col, Select, Option, Input, Icon, Checkbox, CheckboxGroup, Tag } from 'view-ui-plus'
import api from '@oj/api'

export default {
  name: 'SimpleStudentSelector',
  components: {
    Spin, Row, Col, Select, Option, Input, Icon, Checkbox, CheckboxGroup, Tag
  },
  props: {
    value: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      loading: false,
      allStudents: [],
      filteredStudents: [],
      selectedIds: [],
      groupFilter: '',
      searchQuery: '',
      selectAll: false,
      groups: []
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(newVal) {
        this.selectedIds = newVal || []
      }
    }
  },
  mounted() {
    this.loadStudents()
  },
  methods: {
    async loadStudents() {
      this.loading = true
      try {
        // Try available_students first
        const res = await api.getAvailableStudents({ include_stats: true })
        if (res && res.data && res.data.data) {
          this.allStudents = res.data.data
          this.processStudents()
        }
      } catch (err) {
        // Fallback to users endpoint
        try {
          const res = await api.getUsers({ type: 'student', limit: 1000 })
          if (res && res.data && res.data.data) {
            this.allStudents = res.data.data.results || []
            this.processStudents()
          }
        } catch (err2) {
          this.$Message.error('Failed to load students')
        }
      } finally {
        this.loading = false
      }
    },
    
    processStudents() {
      // Extract unique groups
      const groupSet = new Set()
      this.allStudents.forEach(student => {
        if (student.group) {
          groupSet.add(student.group)
        }
      })
      this.groups = Array.from(groupSet).sort()
      
      // Initial filter
      this.filterStudents()
    },
    
    filterStudents() {
      let filtered = [...this.allStudents]
      
      // Apply group filter
      if (this.groupFilter) {
        filtered = filtered.filter(s => s.group === this.groupFilter)
      }
      
      // Apply search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(s => 
          s.username.toLowerCase().includes(query) ||
          (s.real_name && s.real_name.toLowerCase().includes(query)) ||
          (s.email && s.email.toLowerCase().includes(query))
        )
      }
      
      this.filteredStudents = filtered
      this.updateSelectAll()
    },
    
    handleSelectAll(val) {
      if (val) {
        this.selectedIds = this.filteredStudents.map(s => s.id)
      } else {
        this.selectedIds = []
      }
      this.emitChange()
    },
    
    handleSelectionChange() {
      this.updateSelectAll()
      this.emitChange()
    },
    
    updateSelectAll() {
      const filteredIds = this.filteredStudents.map(s => s.id)
      this.selectAll = filteredIds.length > 0 && 
        filteredIds.every(id => this.selectedIds.includes(id))
    },
    
    emitChange() {
      this.$emit('input', this.selectedIds)
      this.$emit('change', this.selectedIds)
    }
  }
}
</script>

<style scoped>
.simple-student-selector {
  width: 100%;
}
</style>