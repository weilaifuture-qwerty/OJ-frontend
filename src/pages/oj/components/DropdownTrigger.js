// Dropdown trigger directive for ViewUI Plus compatibility
export default {
  mounted(el, binding) {
    // Ensure dropdown trigger works properly
    const dropdown = el.querySelector('.ivu-dropdown-rel') || el
    
    if (dropdown) {
      dropdown.addEventListener('click', (e) => {
        e.stopPropagation()
        
        // Toggle dropdown visibility
        const parent = el.closest('.ivu-dropdown') || el.parentElement
        if (parent) {
          const isVisible = parent.classList.contains('ivu-dropdown-visible')
          
          // Close all other dropdowns
          document.querySelectorAll('.ivu-dropdown.ivu-dropdown-visible').forEach(d => {
            if (d !== parent) {
              d.classList.remove('ivu-dropdown-visible')
            }
          })
          
          // Toggle current dropdown
          if (!isVisible) {
            parent.classList.add('ivu-dropdown-visible')
            
            // Add click outside handler
            const clickOutside = (evt) => {
              if (!parent.contains(evt.target)) {
                parent.classList.remove('ivu-dropdown-visible')
                document.removeEventListener('click', clickOutside)
              }
            }
            
            setTimeout(() => {
              document.addEventListener('click', clickOutside)
            }, 0)
          } else {
            parent.classList.remove('ivu-dropdown-visible')
          }
        }
      })
    }
  }
}