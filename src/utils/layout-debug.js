// Layout debugging utility
export function debugLayout() {
  console.log('=== LAYOUT DEBUG ===')
  
  // Check content-app
  const contentApp = document.querySelector('.content-app')
  if (contentApp) {
    const contentAppStyles = window.getComputedStyle(contentApp)
    console.log('content-app:', {
      width: contentAppStyles.width,
      maxWidth: contentAppStyles.maxWidth,
      margin: contentAppStyles.margin,
      marginLeft: contentAppStyles.marginLeft,
      marginRight: contentAppStyles.marginRight,
      padding: contentAppStyles.padding,
      position: contentAppStyles.position,
      left: contentAppStyles.left,
      right: contentAppStyles.right,
      transform: contentAppStyles.transform,
      offsetWidth: contentApp.offsetWidth,
      offsetLeft: contentApp.offsetLeft,
      clientWidth: contentApp.clientWidth,
      scrollWidth: contentApp.scrollWidth,
      boundingRect: contentApp.getBoundingClientRect()
    })
  }
  
  // Check home container
  const homeContainer = document.querySelector('.home-container')
  if (homeContainer) {
    const homeStyles = window.getComputedStyle(homeContainer)
    console.log('home-container:', {
      width: homeStyles.width,
      maxWidth: homeStyles.maxWidth,
      margin: homeStyles.margin,
      marginLeft: homeStyles.marginLeft,
      marginRight: homeStyles.marginRight,
      padding: homeStyles.padding,
      paddingLeft: homeStyles.paddingLeft,
      paddingRight: homeStyles.paddingRight,
      position: homeStyles.position,
      offsetWidth: homeContainer.offsetWidth,
      offsetLeft: homeContainer.offsetLeft,
      boundingRect: homeContainer.getBoundingClientRect()
    })
  }
  
  // Check home content
  const homeContent = document.querySelector('.home-content')
  if (homeContent) {
    const contentStyles = window.getComputedStyle(homeContent)
    console.log('home-content:', {
      width: contentStyles.width,
      maxWidth: contentStyles.maxWidth,
      margin: contentStyles.margin,
      marginLeft: contentStyles.marginLeft,
      marginRight: contentStyles.marginRight,
      padding: contentStyles.padding,
      offsetWidth: homeContent.offsetWidth,
      offsetLeft: homeContent.offsetLeft,
      boundingRect: homeContent.getBoundingClientRect()
    })
  }
  
  // Check ViewUI Row elements
  const rows = document.querySelectorAll('.ivu-row')
  rows.forEach((row, index) => {
    const rowStyles = window.getComputedStyle(row)
    if (row.closest('.home-container')) {
      console.log(`Row ${index} in home:`, {
        className: row.className,
        display: rowStyles.display,
        justifyContent: rowStyles.justifyContent,
        margin: rowStyles.margin,
        marginLeft: rowStyles.marginLeft,
        marginRight: rowStyles.marginRight,
        width: rowStyles.width,
        offsetWidth: row.offsetWidth,
        offsetLeft: row.offsetLeft
      })
    }
  })
  
  // Check body and html
  const bodyStyles = window.getComputedStyle(document.body)
  const htmlStyles = window.getComputedStyle(document.documentElement)
  console.log('body:', {
    margin: bodyStyles.margin,
    padding: bodyStyles.padding,
    width: bodyStyles.width,
    overflowX: bodyStyles.overflowX
  })
  console.log('html:', {
    margin: htmlStyles.margin,
    padding: htmlStyles.padding,
    width: htmlStyles.width,
    overflowX: htmlStyles.overflowX
  })
  
  // Check viewport
  console.log('viewport:', {
    innerWidth: window.innerWidth,
    outerWidth: window.outerWidth,
    documentWidth: document.documentElement.clientWidth,
    bodyWidth: document.body.clientWidth,
    scrollBarWidth: window.innerWidth - document.documentElement.clientWidth
  })
  
  // Visual debug overlay
  addDebugOverlay()
}

export function addDebugOverlay() {
  // Remove existing overlay
  const existing = document.getElementById('layout-debug-overlay')
  if (existing) existing.remove()
  
  const overlay = document.createElement('div')
  overlay.id = 'layout-debug-overlay'
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 9999;
  `
  
  // Add center line
  const centerLine = document.createElement('div')
  centerLine.style.cssText = `
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 0;
    width: 2px;
    background: red;
    opacity: 0.5;
  `
  overlay.appendChild(centerLine)
  
  // Add viewport edges
  const leftEdge = document.createElement('div')
  leftEdge.style.cssText = `
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background: blue;
    opacity: 0.5;
  `
  overlay.appendChild(leftEdge)
  
  const rightEdge = document.createElement('div')
  rightEdge.style.cssText = `
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background: blue;
    opacity: 0.5;
  `
  overlay.appendChild(rightEdge)
  
  // Add measurements
  const measurements = document.createElement('div')
  measurements.style.cssText = `
    position: fixed;
    top: 10px;
    left: 10px;
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 10px;
    font-family: monospace;
    font-size: 12px;
    border-radius: 4px;
    pointer-events: auto;
  `
  
  const contentApp = document.querySelector('.content-app')
  const homeContainer = document.querySelector('.home-container')
  
  measurements.innerHTML = `
    <div>Viewport: ${window.innerWidth}px</div>
    <div>Body: ${document.body.clientWidth}px</div>
    ${contentApp ? `<div>content-app: ${contentApp.offsetWidth}px @ ${contentApp.offsetLeft}px</div>` : ''}
    ${homeContainer ? `<div>home-container: ${homeContainer.offsetWidth}px @ ${homeContainer.offsetLeft}px</div>` : ''}
    <button onclick="document.getElementById('layout-debug-overlay').remove()" style="margin-top: 10px;">Close</button>
  `
  
  overlay.appendChild(measurements)
  document.body.appendChild(overlay)
}

// Auto-run on page load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(debugLayout, 100)
  })
  
  // Also run on route change
  if (window.router) {
    window.router.afterEach(() => {
      setTimeout(debugLayout, 100)
    })
  }
}

// Export for manual use
window.debugLayout = debugLayout
window.addDebugOverlay = addDebugOverlay

// Toggle debug mode with Ctrl+Shift+D
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'D') {
    e.preventDefault()
    document.body.classList.toggle('debug-mode')
    console.log('Debug mode:', document.body.classList.contains('debug-mode') ? 'ON' : 'OFF')
    if (document.body.classList.contains('debug-mode')) {
      debugLayout()
    }
  }
})