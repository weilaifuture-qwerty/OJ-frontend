<template>
  <div style="padding: 20px;">
    <h2>Test Student Dropdown</h2>
    
    <Card>
      <p>Students loaded: {{ students.length }}</p>
      <p>Selected IDs: {{ selectedIds }}</p>
      
      <Form :label-width="120">
        <FormItem label="Method 1">
          <Select 
            v-model="selectedIds" 
            multiple 
            style="width: 100%;"
          >
            <Option 
              v-for="student in students" 
              :key="student.id" 
              :value="student.id"
            >
              {{ student.username }}
            </Option>
          </Select>
        </FormItem>
        
        <FormItem label="Method 2">
          <Select 
            v-model="selectedIds2" 
            multiple 
            transfer
            style="width: 100%;"
          >
            <Option 
              v-for="student in students" 
              :key="`m2-${student.id}`" 
              :value="student.id"
              :label="student.username"
            />
          </Select>
        </FormItem>
        
        <FormItem label="Method 3">
          <Select 
            v-model="selectedStrings" 
            multiple 
            style="width: 100%;"
          >
            <Option 
              v-for="student in students" 
              :key="`m3-${student.id}`" 
              :value="String(student.id)"
            >
              {{ student.username }}
            </Option>
          </Select>
        </FormItem>
      </Form>
      
      <Button @click="loadRealData">Load Real Data</Button>
      <Button @click="testSelection">Test Selection</Button>
    </Card>
  </div>
</template>

<script>
import { Select, Option, Card, Form, FormItem, Button } from 'view-ui-plus'
import api from '@oj/api'

export default {
  components: { Select, Option, Card, Form, FormItem, Button },
  data() {
    return {
      students: [
        { id: 1, username: 'test1' },
        { id: 2, username: 'test2' },
        { id: 3, username: 'test3' }
      ],
      selectedIds: [],
      selectedIds2: [],
      selectedStrings: []
    }
  },
  mounted() {
    console.log('Test component mounted')
  },
  methods: {
    async loadRealData() {
      try {
        const res = await api.getAvailableStudents()
        if (res?.data?.data) {
          this.students = res.data.data
          this.$Message.success(`Loaded ${this.students.length} students`)
        }
      } catch (err) {
        this.$Message.error('Failed to load students')
      }
    },
    testSelection() {
      this.selectedIds = [1, 2]
      this.selectedIds2 = [1, 2]
      this.selectedStrings = ['1', '2']
    }
  }
}
</script>