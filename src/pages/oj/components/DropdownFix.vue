<template>
  <div></div>
</template>

<script>
export default {
  name: 'DropdownFix',
  mounted() {
    // Fix for ViewUI Plus dropdowns in Vue 3
    this.$nextTick(() => {
      // Override ViewUI dropdown behavior
      document.addEventListener('click', (e) => {
        if (!e.target || typeof e.target.closest !== 'function') return
        const dropdown = e.target.closest('.ivu-dropdown')
        const isDropdownTrigger = e.target.closest('.ivu-dropdown > a, .ivu-dropdown > button, .ivu-dropdown-rel')
        
        if (isDropdownTrigger && dropdown) {
          e.preventDefault()
          e.stopPropagation()
          
          const menu = dropdown.querySelector('.ivu-dropdown-menu, .ivu-select-dropdown')
          if (menu) {
            const isVisible = dropdown.classList.contains('ivu-dropdown-visible')
            
            // Close all other dropdowns
            document.querySelectorAll('.ivu-dropdown').forEach(d => {
              if (d !== dropdown) {
                d.classList.remove('ivu-dropdown-visible')
              }
            })
            
            // Toggle current dropdown
            dropdown.classList.toggle('ivu-dropdown-visible', !isVisible)
            
            if (!isVisible) {
              // Position the menu
              const rect = dropdown.getBoundingClientRect()
              menu.style.position = 'absolute'
              menu.style.top = '100%'
              menu.style.left = '0'
              menu.style.display = 'block'
              menu.style.zIndex = '1050'
              
              // Handle click outside
              const clickOutside = (evt) => {
                if (!dropdown.contains(evt.target)) {
                  dropdown.classList.remove('ivu-dropdown-visible')
                  menu.style.display = 'none'
                  document.removeEventListener('click', clickOutside)
                }
              }
              
              setTimeout(() => {
                document.addEventListener('click', clickOutside)
              }, 0)
            } else {
              menu.style.display = 'none'
            }
          }
        }
      }, true)
      
      // Handle submenu dropdowns
      document.addEventListener('mouseenter', (e) => {
        if (!e.target || typeof e.target.closest !== 'function') return
        const submenu = e.target.closest('.ivu-menu-submenu')
        if (submenu) {
          const submenuDropdown = submenu.querySelector('.ivu-menu')
          if (submenuDropdown) {
            submenu.classList.add('ivu-menu-opened')
            submenuDropdown.style.display = 'block'
          }
        }
      }, true)
      
      document.addEventListener('mouseleave', (e) => {
        if (!e.target || typeof e.target.closest !== 'function') return
        const submenu = e.target.closest('.ivu-menu-submenu')
        if (submenu) {
          setTimeout(() => {
            if (!submenu.matches(':hover')) {
              const submenuDropdown = submenu.querySelector('.ivu-menu')
              if (submenuDropdown) {
                submenu.classList.remove('ivu-menu-opened')
                submenuDropdown.style.display = 'none'
              }
            }
          }, 100)
        }
      }, true)
    })
  }
}
</script>