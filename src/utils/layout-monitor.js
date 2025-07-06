// Layout monitoring utility to track style changes
class LayoutMonitor {
  constructor() {
    this.baseline = {}
    this.changes = []
    this.isMonitoring = false
    this.observer = null
  }

  // Capture current layout state
  captureState(label = 'state') {
    const state = {
      label,
      timestamp: new Date().toISOString(),
      elements: {}
    }

    // Monitor key elements
    const elementsToMonitor = [
      { selector: '#header', name: 'header' },
      { selector: '.oj-menu', name: 'navbar' },
      { selector: '.content-app', name: 'content-app' },
      { selector: '.home-container', name: 'home-container' },
      { selector: '.homework-index-container', name: 'homework-container' },
      { selector: 'body', name: 'body' },
      { selector: 'html', name: 'html' }
    ]

    elementsToMonitor.forEach(({ selector, name }) => {
      const el = document.querySelector(selector)
      if (el) {
        const computed = window.getComputedStyle(el)
        const rect = el.getBoundingClientRect()
        
        state.elements[name] = {
          exists: true,
          // Dimensions
          width: el.offsetWidth,
          height: el.offsetHeight,
          clientWidth: el.clientWidth,
          offsetLeft: el.offsetLeft,
          scrollWidth: el.scrollWidth,
          // Computed styles
          computedWidth: computed.width,
          computedMaxWidth: computed.maxWidth,
          computedMinWidth: computed.minWidth,
          margin: computed.margin,
          padding: computed.padding,
          position: computed.position,
          display: computed.display,
          boxSizing: computed.boxSizing,
          overflow: computed.overflow,
          overflowX: computed.overflowX,
          // Classes
          className: el.className,
          classList: [...el.classList],
          // Inline styles
          inlineStyle: el.style.cssText,
          // Bounding rect
          rect: {
            left: rect.left,
            right: rect.right,
            width: rect.width
          }
        }
      } else {
        state.elements[name] = { exists: false }
      }
    })

    // Also capture viewport info
    state.viewport = {
      innerWidth: window.innerWidth,
      outerWidth: window.outerWidth,
      documentWidth: document.documentElement.clientWidth,
      bodyScrollWidth: document.body.scrollWidth,
      hasHorizontalScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth
    }

    return state
  }

  // Set baseline state
  setBaseline(label = 'baseline') {
    this.baseline = this.captureState(label)
    console.log('📏 Layout baseline set:', this.baseline)
  }

  // Compare current state with baseline
  compareWithBaseline(label = 'current') {
    const current = this.captureState(label)
    const differences = []

    // Compare each element
    Object.keys(this.baseline.elements).forEach(name => {
      const base = this.baseline.elements[name]
      const curr = current.elements[name]

      if (!base.exists && curr.exists) {
        differences.push({
          element: name,
          type: 'added',
          details: 'Element was added'
        })
      } else if (base.exists && !curr.exists) {
        differences.push({
          element: name,
          type: 'removed',
          details: 'Element was removed'
        })
      } else if (base.exists && curr.exists) {
        // Compare properties
        const changes = []
        
        // Check dimensions
        if (base.width !== curr.width) {
          changes.push(`width: ${base.width}px → ${curr.width}px`)
        }
        if (base.offsetLeft !== curr.offsetLeft) {
          changes.push(`offsetLeft: ${base.offsetLeft}px → ${curr.offsetLeft}px`)
        }
        if (base.computedMaxWidth !== curr.computedMaxWidth) {
          changes.push(`max-width: ${base.computedMaxWidth} → ${curr.computedMaxWidth}`)
        }
        if (base.computedMinWidth !== curr.computedMinWidth) {
          changes.push(`min-width: ${base.computedMinWidth} → ${curr.computedMinWidth}`)
        }
        if (base.margin !== curr.margin) {
          changes.push(`margin: ${base.margin} → ${curr.margin}`)
        }
        if (base.padding !== curr.padding) {
          changes.push(`padding: ${base.padding} → ${curr.padding}`)
        }
        if (base.className !== curr.className) {
          changes.push(`className: "${base.className}" → "${curr.className}"`)
        }
        if (base.inlineStyle !== curr.inlineStyle) {
          changes.push(`inline style: "${base.inlineStyle}" → "${curr.inlineStyle}"`)
        }

        if (changes.length > 0) {
          differences.push({
            element: name,
            type: 'modified',
            changes
          })
        }
      }
    })

    // Compare viewport
    if (this.baseline.viewport.hasHorizontalScroll !== current.viewport.hasHorizontalScroll) {
      differences.push({
        element: 'viewport',
        type: 'scroll',
        details: `Horizontal scroll: ${this.baseline.viewport.hasHorizontalScroll} → ${current.viewport.hasHorizontalScroll}`
      })
    }

    if (differences.length > 0) {
      console.log(`🔍 Layout differences found (${label}):`, differences)
      this.changes.push({ timestamp: new Date().toISOString(), label, differences })
    } else {
      console.log(`✅ No layout differences found (${label})`)
    }

    return { current, differences }
  }

  // Start monitoring DOM mutations
  startMutationObserver() {
    if (this.observer) {
      this.observer.disconnect()
    }

    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes') {
          const target = mutation.target
          if (target.id === 'header' || 
              target.className?.includes('oj-menu') || 
              target.className?.includes('content-app')) {
            console.log('🔄 Style mutation detected:', {
              element: target.tagName,
              id: target.id,
              className: target.className,
              attribute: mutation.attributeName,
              oldValue: mutation.oldValue,
              newValue: target.getAttribute(mutation.attributeName)
            })
          }
        }
      })
    })

    // Start observing
    this.observer.observe(document.body, {
      attributes: true,
      attributeOldValue: true,
      attributeFilter: ['style', 'class'],
      subtree: true
    })

    console.log('👁️ Mutation observer started')
  }

  // Stop monitoring
  stopMutationObserver() {
    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
      console.log('🛑 Mutation observer stopped')
    }
  }

  // Get all changes
  getChanges() {
    return this.changes
  }

  // Clear changes
  clearChanges() {
    this.changes = []
  }
}

// Create global instance
window.layoutMonitor = new LayoutMonitor()

// Function to set up route monitoring
function setupRouteMonitoring(router) {
  let previousRoute = null
  
  router.beforeEach((to, from, next) => {
    console.log(`📍 Route change: ${from.path} → ${to.path}`)
    
    // Capture baseline before leaving home
    if (from.path === '/' && to.path === '/homework') {
      console.log('📸 Capturing baseline before leaving home page')
      window.layoutMonitor.setBaseline('before-homework')
      window.layoutMonitor.startMutationObserver()
    }
    
    previousRoute = from.path
    next()
  })
  
  router.afterEach((to, from) => {
    // Check for changes after navigation
    setTimeout(() => {
      if (from.path === '/' && to.path === '/homework') {
        console.log('🔍 Checking layout after homework navigation')
        window.layoutMonitor.compareWithBaseline('after-homework-navigation')
      } else if (from.path === '/homework' && to.path !== '/homework') {
        console.log('🔍 Checking layout after leaving homework')
        window.layoutMonitor.compareWithBaseline('after-leaving-homework')
        window.layoutMonitor.stopMutationObserver()
      }
    }, 500) // Wait for any async rendering
  })
}

// Wait for router to be available
setTimeout(() => {
  // Try to find router from Vue app instance
  const app = document.querySelector('#app')?.__vue_app__
  if (app && app.config.globalProperties.$router) {
    const router = app.config.globalProperties.$router
    setupRouteMonitoring(router)
    window.layoutMonitor.router = router
    console.log('📱 Layout monitor connected to router')
  } else {
    console.warn('⚠️ Router not found for layout monitor')
  }
}, 1000)

// Export for manual use
export default LayoutMonitor