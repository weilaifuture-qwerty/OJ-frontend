<template>
  <div class="stylesheet-monitor" v-if="visible">
    <div class="monitor-header">
      <h4>Active Stylesheets Monitor</h4>
      <button @click="refresh">Refresh</button>
      <button @click="visible = false">Close</button>
    </div>
    
    <div class="monitor-content">
      <div class="monitor-section">
        <h5>Loaded Stylesheets ({{ stylesheets.length }})</h5>
        <div v-for="(sheet, index) in stylesheets" :key="index" class="stylesheet-item">
          <div class="sheet-info">
            <span class="sheet-index">{{ index + 1 }}.</span>
            <span class="sheet-url">{{ getSheetUrl(sheet) }}</span>
          </div>
          <div class="sheet-rules" v-if="sheet.rules">
            Rules: {{ sheet.rules.length }}
          </div>
        </div>
      </div>
      
      <div class="monitor-section">
        <h5>Computed Styles for Key Elements</h5>
        <div v-for="(styles, element) in computedStyles" :key="element" class="computed-item">
          <strong>{{ element }}:</strong>
          <div class="style-props">
            <div v-for="(value, prop) in styles" :key="prop" class="style-prop">
              {{ prop }}: {{ value }}
            </div>
          </div>
        </div>
      </div>
      
      <div class="monitor-section">
        <h5>Route: {{ currentRoute }}</h5>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StylesheetMonitor',
  data() {
    return {
      visible: true,
      stylesheets: [],
      computedStyles: {},
      currentRoute: ''
    }
  },
  mounted() {
    this.refresh()
    
    // Listen for keyboard shortcut
    window.addEventListener('keydown', this.handleKeydown)
    
    // Watch route changes
    this.$watch(
      () => this.$route.path,
      (newPath) => {
        this.currentRoute = newPath
        setTimeout(() => this.refresh(), 100)
      },
      { immediate: true }
    )
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKeydown)
  },
  methods: {
    handleKeydown(e) {
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault()
        this.visible = !this.visible
        if (this.visible) this.refresh()
      }
    },
    
    refresh() {
      // Get all stylesheets
      this.stylesheets = Array.from(document.styleSheets).map(sheet => {
        try {
          return {
            href: sheet.href,
            rules: sheet.cssRules || sheet.rules,
            disabled: sheet.disabled,
            media: sheet.media.mediaText
          }
        } catch (e) {
          // Cross-origin stylesheets might throw
          return {
            href: sheet.href,
            error: 'Cannot access rules (cross-origin)',
            disabled: sheet.disabled
          }
        }
      })
      
      // Get computed styles for key elements
      const elements = [
        { selector: '#header', name: 'header' },
        { selector: '.oj-menu', name: 'navbar' },
        { selector: '.content-app', name: 'content-app' },
        { selector: '.home-container', name: 'home' },
        { selector: '.homework-index-container', name: 'homework' }
      ]
      
      this.computedStyles = {}
      elements.forEach(({ selector, name }) => {
        const el = document.querySelector(selector)
        if (el) {
          const computed = window.getComputedStyle(el)
          this.computedStyles[name] = {
            width: computed.width,
            maxWidth: computed.maxWidth,
            minWidth: computed.minWidth,
            margin: computed.margin,
            padding: computed.padding
          }
        }
      })
    },
    
    getSheetUrl(sheet) {
      if (sheet.href) {
        return sheet.href.split('/').pop()
      }
      return '<inline styles>'
    }
  }
}
</script>

<style scoped>
.stylesheet-monitor {
  position: fixed;
  top: 70px;
  left: 10px;
  width: 400px;
  max-height: 600px;
  background: rgba(0, 0, 0, 0.95);
  color: #00ff00;
  padding: 15px;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  z-index: 10001;
  overflow: auto;
  box-shadow: 0 4px 12px rgba(0, 255, 0, 0.2);
}

.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #00ff00;
}

.monitor-header h4 {
  margin: 0;
  color: #00ff00;
  font-size: 14px;
}

.monitor-header button {
  background: #003300;
  color: #00ff00;
  border: 1px solid #00ff00;
  padding: 4px 8px;
  cursor: pointer;
  font-family: inherit;
  font-size: 11px;
}

.monitor-header button:hover {
  background: #00ff00;
  color: #000;
}

.monitor-section {
  margin-bottom: 20px;
}

.monitor-section h5 {
  color: #00ffff;
  margin: 0 0 10px 0;
  font-size: 12px;
}

.stylesheet-item {
  margin-bottom: 8px;
  padding: 5px;
  background: rgba(0, 255, 0, 0.05);
  border: 1px solid rgba(0, 255, 0, 0.2);
}

.sheet-info {
  display: flex;
  gap: 10px;
}

.sheet-index {
  color: #ffff00;
}

.sheet-url {
  color: #00ff00;
  word-break: break-all;
}

.sheet-rules {
  color: #999;
  font-size: 10px;
  margin-top: 3px;
}

.computed-item {
  margin-bottom: 12px;
  padding: 8px;
  background: rgba(0, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.2);
}

.computed-item strong {
  color: #00ffff;
  display: block;
  margin-bottom: 5px;
}

.style-props {
  padding-left: 10px;
}

.style-prop {
  color: #00ff00;
  line-height: 1.4;
}
</style>