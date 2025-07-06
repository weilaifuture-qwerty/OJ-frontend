// Global mixin to ensure layout fixes are applied
export default {
  mounted() {
    // Apply layout fixes when any component mounts
    this.$nextTick(() => {
      this.ensureLayoutAlignment()
    })
  },
  updated() {
    // Reapply on updates
    this.$nextTick(() => {
      this.ensureLayoutAlignment()
    })
  },
  methods: {
    ensureLayoutAlignment() {
      // Find all ViewUI Row elements and fix their margins
      const rows = document.querySelectorAll('.ivu-row, .ivu-row-flex, [class*="ivu-row-flex-"]')
      rows.forEach(row => {
        row.style.marginLeft = '0'
        row.style.marginRight = '0'
        row.style.width = '100%'
      })
      
      // Ensure content-app is centered
      const contentApp = document.querySelector('.content-app')
      if (contentApp) {
        contentApp.style.marginLeft = 'auto'
        contentApp.style.marginRight = 'auto'
      }
    }
  }
}