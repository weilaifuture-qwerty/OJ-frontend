<template>
  <div class="layout-debugger" v-if="visible">
    <div class="debug-info">
      <h4>Layout Debug Info</h4>
      <div class="debug-section">
        <strong>Viewport:</strong>
        <div>Width: {{ viewport.width }}px</div>
        <div>Height: {{ viewport.height }}px</div>
      </div>
      
      <div class="debug-section" v-if="contentApp">
        <strong>content-app:</strong>
        <div>Width: {{ contentApp.width }}px</div>
        <div>Offset Left: {{ contentApp.offsetLeft }}px</div>
        <div>Offset Right: {{ viewport.width - contentApp.offsetLeft - contentApp.width }}px</div>
        <div :class="{ 'error': !contentApp.centered }">
          Centered: {{ contentApp.centered ? 'YES' : 'NO' }}
        </div>
      </div>
      
      <div class="debug-section" v-if="currentContainer">
        <strong>{{ currentContainer.name }}:</strong>
        <div>Width: {{ currentContainer.width }}px</div>
        <div>Offset Left: {{ currentContainer.offsetLeft }}px</div>
        <div>Offset Right: {{ viewport.width - currentContainer.offsetLeft - currentContainer.width }}px</div>
        <div :class="{ 'error': !currentContainer.centered }">
          Centered: {{ currentContainer.centered ? 'YES' : 'NO' }}
        </div>
      </div>
      
      <div class="debug-actions">
        <button @click="refresh">Refresh</button>
        <button @click="close">Close</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LayoutDebugger',
  data() {
    return {
      visible: true,
      viewport: { width: 0, height: 0 },
      contentApp: null,
      currentContainer: null,
      updateInterval: null
    }
  },
  mounted() {
    this.startUpdating()
    
    // Listen for keyboard shortcut
    window.addEventListener('keydown', this.handleKeydown)
  },
  beforeUnmount() {
    this.stopUpdating()
    window.removeEventListener('keydown', this.handleKeydown)
  },
  methods: {
    handleKeydown(e) {
      if (e.ctrlKey && e.shiftKey && e.key === 'L') {
        e.preventDefault()
        this.visible = !this.visible
        if (this.visible) {
          this.startUpdating()
        } else {
          this.stopUpdating()
        }
      }
    },
    
    startUpdating() {
      this.update()
      this.updateInterval = setInterval(() => {
        this.update()
      }, 500)
    },
    
    stopUpdating() {
      if (this.updateInterval) {
        clearInterval(this.updateInterval)
        this.updateInterval = null
      }
    },
    
    update() {
      // Viewport
      this.viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      }
      
      // content-app
      const contentAppEl = document.querySelector('.content-app')
      if (contentAppEl) {
        const rect = contentAppEl.getBoundingClientRect()
        this.contentApp = {
          width: contentAppEl.offsetWidth,
          offsetLeft: contentAppEl.offsetLeft,
          centered: this.isCentered(contentAppEl)
        }
      }
      
      // Current page container
      const containers = ['.home-container', '.homework-index-container', '.problem-list-container']
      for (const selector of containers) {
        const el = document.querySelector(selector)
        if (el) {
          const rect = el.getBoundingClientRect()
          this.currentContainer = {
            name: selector.replace('.', '').replace('-', ' '),
            width: el.offsetWidth,
            offsetLeft: el.offsetLeft,
            centered: this.isCentered(el)
          }
          break
        }
      }
    },
    
    isCentered(element) {
      const leftOffset = element.offsetLeft
      const rightOffset = window.innerWidth - element.offsetLeft - element.offsetWidth
      const difference = Math.abs(leftOffset - rightOffset)
      return difference < 10 // Allow 10px tolerance
    },
    
    refresh() {
      this.update()
    },
    
    close() {
      this.visible = false
      this.stopUpdating()
    }
  }
}
</script>

<style scoped>
.layout-debugger {
  position: fixed;
  top: 70px;
  right: 10px;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 15px;
  border-radius: 8px;
  font-family: monospace;
  font-size: 12px;
  z-index: 10000;
  max-width: 300px;
}

.debug-info h4 {
  margin: 0 0 10px 0;
  color: #00ff00;
}

.debug-section {
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #333;
}

.debug-section strong {
  color: #00bfff;
  display: block;
  margin-bottom: 5px;
}

.error {
  color: #ff4444;
  font-weight: bold;
}

.debug-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.debug-actions button {
  flex: 1;
  padding: 5px 10px;
  background: #333;
  color: white;
  border: 1px solid #666;
  border-radius: 4px;
  cursor: pointer;
}

.debug-actions button:hover {
  background: #444;
}
</style>