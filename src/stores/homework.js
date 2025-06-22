import { defineStore } from 'pinia'

export const useHomeworkStore = defineStore('homework', {
  state: () => ({
    homeworkList: [],
    currentHomework: null,
    homeworkProgress: {
      assigned: 0,
      in_progress: 0,
      submitted: 0,
      graded: 0
    }
  }),

  getters: {
    totalHomework: (state) => state.homeworkList.length,
    
    overdueHomework: (state) => {
      const now = new Date()
      return state.homeworkList.filter(hw => 
        new Date(hw.due_date) < now && 
        hw.status !== 'submitted' && 
        hw.status !== 'graded'
      ).length
    },
    
    activeHomework: (state) => {
      const now = new Date()
      return state.homeworkList.filter(hw => 
        new Date(hw.due_date) >= now && 
        (hw.status === 'assigned' || hw.status === 'in_progress')
      ).length
    }
  },

  actions: {
    setHomeworkList(list) {
      this.homeworkList = list
    },
    
    setCurrentHomework(homework) {
      this.currentHomework = homework
    },
    
    updateHomeworkStatus(homeworkId, status) {
      const homework = this.homeworkList.find(hw => hw.id === homeworkId)
      if (homework) {
        homework.status = status
      }
    },
    
    updateHomeworkProgress(progress) {
      this.homeworkProgress = progress
    },
    
    clearHomework() {
      this.homeworkList = []
      this.currentHomework = null
      this.homeworkProgress = {
        assigned: 0,
        in_progress: 0,
        submitted: 0,
        graded: 0
      }
    }
  }
})