<template>
  <div class="create-edit-homework">
    <Panel :title="title">
      <el-form
        ref="homeworkForm"
        :model="homework"
        :rules="rules"
        label-width="150px"
      >
        <!-- Basic Information -->
        <el-card class="section-card">
          <div slot="header">
            <span>{{ $t('m.Basic_Information') }}</span>
          </div>
          
          <el-form-item :label="$t('m.Title')" prop="title">
            <el-input
              v-model="homework.title"
              :placeholder="$t('m.Homework_Title')"
              maxlength="100"
              show-word-limit
            />
          </el-form-item>
          
          <el-form-item :label="$t('m.Description')" prop="description">
            <el-input
              type="textarea"
              v-model="homework.description"
              :placeholder="$t('m.Homework_Description')"
              :rows="4"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
          
          <el-form-item :label="$t('m.Due_Date')" prop="due_date">
            <el-date-picker
              v-model="homework.due_date"
              type="datetime"
              :placeholder="$t('m.Select_Due_Date')"
              :picker-options="datePickerOptions"
              value-format="yyyy-MM-dd HH:mm:ss"
            />
          </el-form-item>
        </el-card>
        
        <!-- Student Selection -->
        <el-card class="section-card">
          <div slot="header">
            <span>{{ $t('m.Student_Selection') }}</span>
            <el-tag type="warning" size="small" style="margin-left: 10px;">
              {{ $t('m.Required') }}
            </el-tag>
          </div>
          
          <el-form-item :label="$t('m.Assign_To_Students')" prop="student_ids" required>
            <StudentSelector
              v-model="homework.student_ids"
              @change="validateStudentSelection"
            />
          </el-form-item>
        </el-card>
        
        <!-- Problem Selection -->
        <el-card class="section-card">
          <div slot="header">
            <span>{{ $t('m.Problem_Selection') }}</span>
            <el-button
              type="primary"
              size="small"
              style="float: right"
              @click="showProblemSelector = true"
            >
              {{ $t('m.Add_Problems') }}
            </el-button>
          </div>
          
          <el-table
            :data="homework.problems"
            style="width: 100%"
            v-if="homework.problems.length > 0"
          >
            <el-table-column
              type="index"
              :label="$t('m.Order')"
              width="60"
            />
            <el-table-column
              prop="_id"
              :label="$t('m.Problem_ID')"
              width="100"
            />
            <el-table-column
              prop="title"
              :label="$t('m.Title')"
              min-width="200"
            />
            <el-table-column
              prop="difficulty"
              :label="$t('m.Difficulty')"
              width="100"
            >
              <template #default="scope">
                <el-tag
                  :type="scope.row.difficulty === 'Low' ? 'success' : scope.row.difficulty === 'Mid' ? 'warning' : 'danger'"
                  size="small"
                >
                  {{ $t('m.' + scope.row.difficulty) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="score"
              :label="$t('m.Score')"
              width="120"
            >
              <template #default="scope">
                <el-input-number
                  v-model="scope.row.score"
                  :min="1"
                  :max="100"
                  size="small"
                />
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('m.Actions')"
              width="100"
              align="center"
            >
              <template #default="scope">
                <el-button
                  type="text"
                  size="small"
                  @click="removeProblem(scope.$index)"
                  class="delete-btn"
                >
                  {{ $t('m.Remove') }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <div v-else class="no-problems">
            <i class="el-icon-info"></i>
            {{ $t('m.No_Problems_Added') }}
          </div>
        </el-card>
        
        <!-- Settings -->
        <el-card class="section-card">
          <div slot="header">
            <span>{{ $t('m.Settings') }}</span>
          </div>
          
          <el-form-item :label="$t('m.Allow_Late_Submit')">
            <el-switch v-model="homework.allow_late_submit" />
            <span class="switch-hint">
              {{ $t('m.Allow_Late_Submit_Hint') }}
            </span>
          </el-form-item>
          
          <el-form-item
            :label="$t('m.Late_Penalty')"
            v-if="homework.allow_late_submit"
          >
            <el-input-number
              v-model="homework.late_penalty_percent"
              :min="0"
              :max="100"
              :step="5"
            />
            <span class="input-hint">%</span>
          </el-form-item>
          
          <el-form-item :label="$t('m.Max_Attempts')">
            <el-input-number
              v-model="homework.max_attempts"
              :min="1"
              :max="99"
            />
            <span class="input-hint">
              {{ $t('m.Max_Attempts_Hint') }}
            </span>
          </el-form-item>
          
          <el-form-item :label="$t('m.Show_Result')">
            <el-switch v-model="homework.show_result" />
            <span class="switch-hint">
              {{ $t('m.Show_Result_Hint') }}
            </span>
          </el-form-item>
        </el-card>
        
        <!-- Actions -->
        <div class="form-actions">
          <el-button @click="cancel">{{ $t('m.Cancel') }}</el-button>
          <el-button type="primary" @click="saveHomework" :loading="saving">
            {{ isEdit ? $t('m.Save') : $t('m.Create') }}
          </el-button>
        </div>
      </el-form>
    </Panel>
    
    <!-- Problem Selector Dialog -->
    <el-dialog
      :title="$t('m.Select_Problems')"
      :visible.sync="showProblemSelector"
      width="900px"
      append-to-body
    >
      <ProblemSelector
        :selected-problems="homework.problems"
        @select="addProblems"
      />
    </el-dialog>
  </div>
</template>

<script>
import api from '@admin/api'
import ProblemSelector from './components/ProblemSelector.vue'
import StudentSelector from './components/StudentSelector.vue'
import dayjs from 'dayjs'

export default {
  name: 'CreateEditHomework',
  components: {
    ProblemSelector,
    StudentSelector
  },
  data() {
    const validateProblems = (rule, value, callback) => {
      if (!value || value.length === 0) {
        callback(new Error(this.$t('m.Please_Add_Problems')))
      } else {
        callback()
      }
    }
    
    const validateStudents = (rule, value, callback) => {
      if (!value || value.length === 0) {
        callback(new Error(this.$t('m.Please_Select_Students')))
      } else {
        callback()
      }
    }
    
    return {
      saving: false,
      showProblemSelector: false,
      homework: {
        title: '',
        description: '',
        due_date: '',
        problems: [],
        student_ids: [],
        allow_late_submit: true,
        late_penalty_percent: 10,
        max_attempts: 3,
        show_result: true
      },
      rules: {
        title: [
          { required: true, message: this.$t('m.Title_Required'), trigger: 'blur' }
        ],
        description: [
          { required: true, message: this.$t('m.Description_Required'), trigger: 'blur' }
        ],
        due_date: [
          { required: true, message: this.$t('m.Due_Date_Required'), trigger: 'change' }
        ],
        problems: [
          { validator: validateProblems, trigger: 'change' }
        ],
        student_ids: [
          { validator: validateStudents, trigger: 'change' }
        ]
      },
      datePickerOptions: {
        disabledDate(date) {
          // Can't select past dates
          return date < new Date()
        }
      }
    }
  },
  computed: {
    isEdit() {
      return !!this.$route.params.id
    },
    title() {
      return this.isEdit ? this.$t('m.Edit_Homework') : this.$t('m.Create_Homework')
    }
  },
  mounted() {
    if (this.isEdit) {
      this.loadHomework()
    }
  },
  methods: {
    async loadHomework() {
      try {
        const res = await api.getHomeworkDetail(this.$route.params.id)
        const data = res.data.data
        
        // Format data for editing
        this.homework = {
          id: data.id,
          title: data.title,
          description: data.description,
          due_date: data.due_date,
          problems: data.problems.map(p => ({
            ...p.problem,
            score: p.score
          })),
          student_ids: data.student_ids || [],
          allow_late_submit: data.allow_late_submit,
          late_penalty_percent: data.late_penalty_percent,
          max_attempts: data.max_attempts,
          show_result: data.show_result
        }
      } catch (err) {
        this.$error(err.data?.data || 'Failed to load homework')
        this.$router.back()
      }
    },
    
    addProblems(problems) {
      // Add new problems with default score
      problems.forEach(problem => {
        if (!this.homework.problems.find(p => p.id === problem.id)) {
          this.homework.problems.push({
            ...problem,
            score: 10
          })
        }
      })
      this.showProblemSelector = false
    },
    
    removeProblem(index) {
      this.homework.problems.splice(index, 1)
    },
    
    validateStudentSelection() {
      // Trigger validation when students are selected/deselected
      this.$refs.homeworkForm.validateField('student_ids')
    },
    
    async saveHomework() {
      this.$refs.homeworkForm.validate(async valid => {
        if (!valid) return
        
        this.saving = true
        try {
          const data = {
            title: this.homework.title,
            description: this.homework.description,
            due_date: this.homework.due_date,
            problems: this.homework.problems.map(p => ({
              problem_id: p.id,
              score: p.score
            })),
            student_ids: this.homework.student_ids,
            allow_late_submit: this.homework.allow_late_submit,
            late_penalty_percent: this.homework.late_penalty_percent,
            max_attempts: this.homework.max_attempts,
            show_result: this.homework.show_result
          }
          
          if (this.isEdit) {
            data.id = this.homework.id
            await api.updateHomework(data)
            this.$success(this.$t('m.Homework_Updated'))
          } else {
            await api.createHomework(data)
            this.$success(this.$t('m.Homework_Created'))
            // The assignHomework endpoint might not be needed if creation handles assignment
            // But if it's separate, we can call it here:
            // await api.assignHomework({
            //   homework_id: response.data.data.id,
            //   student_ids: this.homework.student_ids
            // })
          }
          
          this.$router.push({ name: 'admin-homework-list' })
        } catch (err) {
          this.$error(err.data?.data || 'Failed to save homework')
        } finally {
          this.saving = false
        }
      })
    },
    
    cancel() {
      this.$router.back()
    }
  }
}
</script>

<style lang="scss" scoped>
.create-edit-homework {
  .section-card {
    margin-bottom: 20px;
  }
  
  .no-problems {
    text-align: center;
    color: #909399;
    padding: 40px;
    
    i {
      font-size: 48px;
      display: block;
      margin-bottom: 10px;
    }
  }
  
  .switch-hint,
  .input-hint {
    color: #909399;
    font-size: 12px;
    margin-left: 10px;
  }
  
  .delete-btn {
    color: #f56c6c;
  }
  
  .form-actions {
    text-align: center;
    margin-top: 30px;
  }
}
</style>