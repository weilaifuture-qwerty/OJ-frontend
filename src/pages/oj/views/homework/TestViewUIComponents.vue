<template>
  <div style="padding: 20px;">
    <h2>ViewUI Plus Component Test</h2>
    
    <Card title="Component Testing">
      <Form :label-width="120">
        <!-- Test DatePicker -->
        <FormItem label="DatePicker Test">
          <DatePicker 
            v-model="testDate" 
            type="datetime"
            placeholder="Select date and time"
            format="yyyy-MM-dd HH:mm"
            style="width: 300px;"
            :transfer="true"
            @on-change="handleDateChange"
          ></DatePicker>
          <div style="margin-top: 5px;">
            Selected: {{ testDate }}
          </div>
        </FormItem>
        
        <!-- Test Select -->
        <FormItem label="Select Test">
          <Select 
            v-model="testSelect" 
            placeholder="Select an option"
            style="width: 300px;"
            :transfer="true"
          >
            <Option value="1" key="opt1">Option 1</Option>
            <Option value="2" key="opt2">Option 2</Option>
            <Option value="3" key="opt3">Option 3</Option>
          </Select>
          <div style="margin-top: 5px;">
            Selected: {{ testSelect }}
          </div>
        </FormItem>
        
        <!-- Test Multiple Select -->
        <FormItem label="Multiple Select">
          <Select 
            v-model="testMultiple" 
            multiple
            placeholder="Select multiple options"
            style="width: 300px;"
            :transfer="true"
          >
            <Option value="a" key="ma">Item A</Option>
            <Option value="b" key="mb">Item B</Option>
            <Option value="c" key="mc">Item C</Option>
            <Option value="d" key="md">Item D</Option>
          </Select>
          <div style="margin-top: 5px;">
            Selected: {{ testMultiple }}
          </div>
        </FormItem>
        
        <!-- Test with dynamic data -->
        <FormItem label="Dynamic Select">
          <Select 
            v-model="dynamicSelect" 
            placeholder="Dynamic options"
            style="width: 300px;"
            :transfer="true"
          >
            <Option 
              v-for="item in dynamicOptions" 
              :key="item.id"
              :value="item.id"
              :label="item.name"
            >
              {{ item.name }}
            </Option>
          </Select>
          <div style="margin-top: 5px;">
            Selected: {{ dynamicSelect }}
          </div>
        </FormItem>
        
        <!-- Native select for comparison -->
        <FormItem label="Native Select">
          <select v-model="nativeSelect" style="width: 300px; padding: 7px 11px; border: 1px solid #dcdee2; border-radius: 4px;">
            <option value="">Select an option</option>
            <option value="1">Native Option 1</option>
            <option value="2">Native Option 2</option>
            <option value="3">Native Option 3</option>
          </select>
          <div style="margin-top: 5px;">
            Selected: {{ nativeSelect }}
          </div>
        </FormItem>
      </Form>
      
      <div style="margin-top: 20px;">
        <Button type="primary" @click="testComponents">Test All Components</Button>
        <Button @click="loadDynamicData" style="margin-left: 10px;">Load Dynamic Data</Button>
      </div>
      
      <Alert v-if="message" :type="messageType" style="margin-top: 20px;">
        {{ message }}
      </Alert>
    </Card>
  </div>
</template>

<script>
import { Card, Form, FormItem, DatePicker, Select, Option, Button, Alert } from 'view-ui-plus'

export default {
  name: 'TestViewUIComponents',
  components: {
    Card, Form, FormItem, DatePicker, Select, Option, Button, Alert
  },
  data() {
    return {
      testDate: null,
      testSelect: '',
      testMultiple: [],
      dynamicSelect: '',
      nativeSelect: '',
      dynamicOptions: [],
      message: '',
      messageType: 'info'
    }
  },
  mounted() {
    console.log('[TestViewUIComponents] Mounted')
    console.log('[TestViewUIComponents] Components:', {
      Card: !!Card,
      DatePicker: !!DatePicker,
      Select: !!Select,
      Option: !!Option
    })
    
    // Test with initial data
    this.dynamicOptions = [
      { id: 1, name: 'Dynamic Item 1' },
      { id: 2, name: 'Dynamic Item 2' },
      { id: 3, name: 'Dynamic Item 3' }
    ]
  },
  methods: {
    handleDateChange(date, dateString) {
      console.log('[TestViewUIComponents] Date changed:', date, dateString)
      this.message = `Date changed: ${dateString}`
      this.messageType = 'success'
    },
    
    testComponents() {
      console.log('[TestViewUIComponents] Testing all components')
      console.log('Date:', this.testDate)
      console.log('Select:', this.testSelect)
      console.log('Multiple:', this.testMultiple)
      console.log('Dynamic:', this.dynamicSelect)
      console.log('Native:', this.nativeSelect)
      
      // Set test values
      this.testDate = new Date()
      this.testSelect = '2'
      this.testMultiple = ['a', 'c']
      this.dynamicSelect = 2
      this.nativeSelect = '1'
      
      this.message = 'All components tested - check console for values'
      this.messageType = 'success'
    },
    
    loadDynamicData() {
      // Simulate loading data
      this.dynamicOptions = [
        { id: 10, name: 'Loaded Item 1' },
        { id: 20, name: 'Loaded Item 2' },
        { id: 30, name: 'Loaded Item 3' },
        { id: 40, name: 'Loaded Item 4' }
      ]
      this.message = 'Dynamic data loaded'
      this.messageType = 'info'
    }
  }
}
</script>