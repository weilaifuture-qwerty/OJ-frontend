<template>
  <div class="mood-status-component">
    <!-- Current Status Display -->
    <div class="current-status" @click="showStatusModal = true">
      <div class="status-indicator" :class="[statusClass, statusShape]" :style="{ color: currentStatusColor }">
        <div class="status-shape"></div>
      </div>
      <div class="status-content">
        <div class="status-text">
          <span class="status-emoji">{{ currentMood.emoji || currentStatusIcon }}</span>
          <span class="status-label">{{ statusLabel }}</span>
          <span v-if="displayMessage && displayMessage.trim()" class="status-message" :title="currentMood.message">{{ displayMessage }}</span>
        </div>
      </div>
      <Icon type="ios-arrow-down" size="14" class="dropdown-icon" />
    </div>

    <!-- Status Modal -->
    <Modal 
      v-model="showStatusModal"
      title="Set your problem-solving mood"
      :width="520"
      :closable="true"
      @on-cancel="resetForm">
      
      <div class="status-modal-content">
        <!-- Two Column Layout -->
        <div class="modal-layout">
          <!-- Left Column -->
          <div class="left-column">
            <!-- Problem Solving Mood Selector -->
            <div class="mood-type-selector">
              <h4>What are you doing?</h4>
              <div class="mood-grid">
                <div 
                  v-for="status in statusTypes" 
                  :key="status.value"
                  class="mood-type-option"
                  :class="{ active: form.status === status.value }"
                  @click="selectStatus(status)">
                  <div class="mood-icon">{{ status.icon }}</div>
                  <span class="mood-label">{{ status.label }}</span>
                </div>
              </div>
            </div>

            <!-- Status Message -->
            <div class="message-section">
              <h4>Status message</h4>
              <Input 
                v-model="form.message"
                type="textarea"
                :rows="2"
                placeholder="What are you working on?"
                maxlength="100"
                show-word-limit />
            </div>
          </div>

          <!-- Right Column -->
          <div class="right-column">
            <!-- Emoji & Color Section -->
            <div class="emoji-color-section">
              <h4>Customize</h4>
              
              <!-- Current Emoji -->
              <div class="current-emoji-row">
                <div class="emoji-display">
                  <span class="current-emoji">{{ form.emoji || statusTypes.find(s => s.value === form.status)?.icon || '🎯' }}</span>
                </div>
                <div class="color-display">
                  <div class="color-swatch" :style="{ backgroundColor: form.customColor }"></div>
                </div>
                <Button 
                  size="small"
                  type="text"
                  @click="showCustomization = !showCustomization">
                  <Icon type="md-settings" />
                  {{ showCustomization ? 'Hide' : 'Edit' }}
                </Button>
              </div>

              <!-- Customization Panel -->
              <div v-if="showCustomization" class="customization-panel">
                <!-- Quick Emojis -->
                <div class="quick-emojis">
                  <span 
                    v-for="emoji in getQuickEmojisForStatus(form.status)" 
                    :key="emoji"
                    class="emoji-option"
                    :class="{ selected: form.emoji === emoji }"
                    @click="form.emoji = emoji"
                    :title="getEmojiTitle(emoji, form.status)">
                    {{ emoji }}
                  </span>
                </div>
                
                <!-- Color Picker -->
                <div class="color-grid">
                  <div 
                    v-for="color in customColors" 
                    :key="color"
                    class="color-option"
                    :class="{ selected: form.customColor === color }"
                    :style="{ backgroundColor: color }"
                    @click="form.customColor = color">
                    <Icon v-if="form.customColor === color" type="md-checkmark" size="12" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Clear Timer -->
            <div class="clear-section">
              <h4>Clear after</h4>
              <Select v-model="form.clearAfter" size="small">
                <Option value="never">Don't clear</Option>
                <Option value="30min">30 minutes</Option>
                <Option value="1hour">1 hour</Option>
                <Option value="4hours">4 hours</Option>
                <Option value="today">Today</Option>
                <Option value="week">This week</Option>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <Button @click="clearStatus" :disabled="!hasCurrentStatus">Clear Status</Button>
        <Button type="primary" @click="saveStatus" :loading="isSaving">Save</Button>
      </template>
    </Modal>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, getCurrentInstance } from 'vue'
import { useUserStore } from '@/stores/user'
import api from '@oj/api'

// Status-specific emoji suggestions with meanings (default emoji first)
const statusEmojis = {
  practicing: ['🎯', '💡', '⚡', '🔥', '💪', '🚀', '💻', '🧠'],
  learning: ['📚', '📖', '📝', '✏️', '🧠', '💡', '🔬', '🎓'],
  competing: ['🏆', '🥇', '🏁', '⚔️', '🎖️', '🔥', '💯', '🚀'],
  debugging: ['🐛', '🔍', '🔧', '🛠️', '💻', '🤔', '😤', '💡'],
  reviewing: ['📝', '✅', '📊', '📈', '🔍', '📋', '✍️', '🧐'],
  resting: ['☕', '🍵', '😌', '🌸', '🎵', '🌿', '💤', '🍃']
}

// Emoji meanings for tooltips
const emojiMeanings = {
  practicing: {
    '🎯': 'Focused on target',
    '💡': 'Having ideas',
    '⚡': 'Fast progress',
    '🔥': 'On fire',
    '💪': 'Working hard',
    '🚀': 'Making progress',
    '💻': 'Coding',
    '🧠': 'Thinking hard'
  },
  learning: {
    '📚': 'Studying books',
    '📖': 'Reading',
    '📝': 'Taking notes',
    '✏️': 'Writing',
    '🧠': 'Understanding',
    '💡': 'Getting insights',
    '🔬': 'Researching',
    '🎓': 'Academic study'
  },
  competing: {
    '🏆': 'Going for trophy',
    '🥇': 'Aiming for gold',
    '🏁': 'Racing',
    '⚔️': 'Fighting',
    '🎖️': 'Achieving',
    '🔥': 'Intense',
    '💯': 'Perfect score',
    '🚀': 'Speed run'
  },
  debugging: {
    '🐛': 'Finding bugs',
    '🔍': 'Investigating',
    '🔧': 'Fixing',
    '🛠️': 'Using tools',
    '💻': 'Code review',
    '🤔': 'Analyzing',
    '😤': 'Determined',
    '💡': 'Finding solution'
  },
  reviewing: {
    '📝': 'Writing review',
    '✅': 'Checking',
    '📊': 'Analyzing stats',
    '📈': 'Tracking progress',
    '🔍': 'Examining',
    '📋': 'Making lists',
    '✍️': 'Taking notes',
    '🧐': 'Studying closely'
  },
  resting: {
    '☕': 'Coffee break',
    '🍵': 'Tea time',
    '😌': 'Relaxing',
    '🌸': 'Peaceful',
    '🎵': 'Listening to music',
    '🌿': 'In nature',
    '💤': 'Sleeping',
    '🍃': 'Fresh air'
  }
}

// Suggested messages for each status type
const suggestedMessages = {
  practicing: [
    'Solving daily problems',
    'Working on algorithms',
    'Practicing for contest',
    'Improving my skills',
    'Tackling hard problems'
  ],
  learning: [
    'Studying data structures',
    'Learning new concepts',
    'Reading algorithm books',
    'Watching tutorials',
    'Exploring new topics'
  ],
  competing: [
    'Live in contest!',
    'Fighting for the leaderboard',
    'Contest mode activated',
    'Racing against time',
    'Going for gold!'
  ],
  debugging: [
    'Fixing edge cases',
    'Hunting down bugs',
    'Optimizing solution',
    'Working on TLE',
    'Debugging test cases'
  ],
  reviewing: [
    'Reviewing solutions',
    'Analyzing approaches',
    'Learning from others',
    'Studying editorials',
    'Improving my code'
  ],
  resting: [
    'Taking a break',
    'Recharging my brain',
    'Coffee time',
    'Away from keyboard',
    'Back in a bit'
  ]
}

// Extended emoji list for problem solving
const allEmojis = [
  // Problem Solving & Progress
  { char: '💡', name: 'idea' },
  { char: '🧠', name: 'brain' },
  { char: '🎯', name: 'target' },
  { char: '📈', name: 'chart increasing' },
  { char: '📊', name: 'bar chart' },
  { char: '✅', name: 'solved' },
  { char: '❌', name: 'wrong answer' },
  { char: '⏰', name: 'time limit' },
  { char: '💾', name: 'memory' },
  { char: '🏆', name: 'trophy' },
  { char: '🥇', name: 'gold medal' },
  { char: '🥈', name: 'silver medal' },
  { char: '🥉', name: 'bronze medal' },
  { char: '🎖️', name: 'medal' },
  // Coding & Tech
  { char: '💻', name: 'laptop' },
  { char: '⌨️', name: 'keyboard' },
  { char: '🖥️', name: 'desktop' },
  { char: '📱', name: 'mobile' },
  { char: '🔧', name: 'debugging' },
  { char: '🔨', name: 'building' },
  { char: '⚙️', name: 'settings' },
  { char: '🛠️', name: 'tools' },
  { char: '🐛', name: 'bug' },
  { char: '🚀', name: 'deploy' },
  // Study & Learning
  { char: '📚', name: 'books' },
  { char: '📖', name: 'reading' },
  { char: '📝', name: 'notes' },
  { char: '✏️', name: 'pencil' },
  { char: '🖊️', name: 'pen' },
  { char: '📐', name: 'geometry' },
  { char: '📏', name: 'ruler' },
  { char: '🧮', name: 'abacus' },
  { char: '🔬', name: 'science' },
  { char: '🔭', name: 'telescope' },
  // Energy & Mood
  { char: '⚡', name: 'lightning' },
  { char: '🔥', name: 'fire' },
  { char: '✨', name: 'sparkles' },
  { char: '💪', name: 'strong' },
  { char: '🌟', name: 'star' },
  { char: '☕', name: 'coffee' },
  { char: '🍵', name: 'tea' },
  { char: '😎', name: 'cool' },
  { char: '🤓', name: 'nerd' },
  { char: '🧐', name: 'analyzing' },
  { char: '🤔', name: 'thinking' },
  { char: '😤', name: 'determined' },
  // Status
  { char: '🟢', name: 'accepted' },
  { char: '🔴', name: 'failed' },
  { char: '🟡', name: 'pending' },
  { char: '🔵', name: 'running' },
  { char: '⏱️', name: 'timer' },
  { char: '📊', name: 'statistics' },
  { char: '🎲', name: 'random' },
  { char: '🔢', name: 'numbers' }
]

export default {
  name: 'MoodStatus',
  setup() {
    const userStore = useUserStore()
    const { proxy } = getCurrentInstance()
    
    // State
    const showStatusModal = ref(false)
    const showEmojiPicker = ref(false)
    const showColorPicker = ref(false)
    const showCustomization = ref(false)
    const emojiSearch = ref('')
    const isSaving = ref(false)
    
    // Form data
    const form = ref({
      status: 'practicing',
      emoji: '',
      message: '',
      clearAfter: 'never',
      customColor: '#52c41a'
    })
    
    // Problem-solving mood types with unique shapes
    const statusTypes = [
      { value: 'practicing', label: 'Practicing', color: '#52c41a', shape: 'hexagon', icon: '🎯' },
      { value: 'learning', label: 'Learning', color: '#1890ff', shape: 'book', icon: '📚' },
      { value: 'competing', label: 'In Contest', color: '#f5222d', shape: 'star', icon: '🏆' },
      { value: 'debugging', label: 'Debugging', color: '#fa8c16', shape: 'gear', icon: '🐛' },
      { value: 'reviewing', label: 'Reviewing', color: '#722ed1', shape: 'circle', icon: '📝' },
      { value: 'resting', label: 'Taking Break', color: '#13c2c2', shape: 'square', icon: '☕' }
    ]
    
    // Custom color options
    const customColors = [
      '#52c41a', '#13c2c2', '#1890ff', '#2f54eb', '#722ed1',
      '#eb2f96', '#f5222d', '#fa541c', '#fa8c16', '#faad14',
      '#8c8c8c', '#262626'
    ]
    
    // Current mood from store
    const currentMood = computed(() => {
      const profile = userStore.profile
      return {
        status: profile?.status || 'practicing',
        emoji: profile?.mood_emoji || '',
        message: profile?.mood || '',
        clearAt: profile?.mood_clear_at || null,
        customColor: profile?.status_color || '#52c41a'
      }
    })
    
    // Computed
    const statusClass = computed(() => `status-${currentMood.value.status}`)
    
    const statusShape = computed(() => {
      const status = statusTypes.find(s => s.value === currentMood.value.status)
      return status ? `shape-${status.shape}` : 'shape-hexagon'
    })
    
    const currentStatusColor = computed(() => currentMood.value.customColor || '#52c41a')
    
    const statusLabel = computed(() => {
      const status = statusTypes.find(s => s.value === currentMood.value.status)
      return status ? status.label : 'Practicing'
    })
    
    const currentStatusIcon = computed(() => {
      const status = statusTypes.find(s => s.value === currentMood.value.status)
      return status ? status.icon : '🎯'
    })
    
    const statusMessage = computed(() => {
      if (currentMood.value.message) {
        return currentMood.value.message
      }
      return 'Set your problem-solving status'
    })
    
    const displayMessage = computed(() => {
      const message = currentMood.value.message
      if (!message) return ''
      
      // If message is short enough, show it with a dash
      if (message.length <= 20) {
        return ` - ${message}`
      }
      
      // If message is medium length, truncate it
      if (message.length <= 30) {
        return ` - ${message.substring(0, 20)}...`
      }
      
      // For long messages, don't show on navbar (user can see in dropdown/sidebar)
      return ''
    })
    
    const hasCurrentStatus = computed(() => {
      return currentMood.value.emoji || currentMood.value.message
    })
    
    const filteredEmojis = computed(() => {
      if (!emojiSearch.value) return allEmojis
      const search = emojiSearch.value.toLowerCase()
      return allEmojis.filter(emoji => 
        emoji.name.toLowerCase().includes(search) ||
        emoji.char.includes(search)
      )
    })
    
    // Methods
    const loadCurrentStatus = () => {
      const currentStatus = currentMood.value.status || 'practicing'
      const statusType = statusTypes.find(s => s.value === currentStatus)
      form.value = {
        status: currentStatus,
        emoji: currentMood.value.emoji || statusType?.icon || '🎯',
        message: currentMood.value.message || '',
        clearAfter: 'never',
        customColor: currentMood.value.customColor || statusType?.color || '#52c41a'
      }
    }
    
    const selectStatus = (status) => {
      form.value.status = status.value
      form.value.customColor = status.color
      // Always set the default emoji for the selected status
      form.value.emoji = status.icon
      // Suggest a random message if none exists
      if (!form.value.message && suggestedMessages[status.value]) {
        const messages = suggestedMessages[status.value]
        form.value.message = messages[Math.floor(Math.random() * messages.length)]
      }
    }
    
    const getQuickEmojisForStatus = (status) => {
      return statusEmojis[status] || statusEmojis.practicing
    }
    
    const getEmojiTitle = (emoji, status) => {
      return emojiMeanings[status]?.[emoji] || ''
    }
    
    const getEmojiSuggestionText = () => {
      const status = statusTypes.find(s => s.value === form.value.status)
      const label = status ? status.label : 'status'
      return `Suggested emojis for ${label}:`
    }
    
    const getDefaultColorForStatus = (statusValue) => {
      const status = statusTypes.find(s => s.value === statusValue)
      return status ? status.color : '#52c41a'
    }
    
    const getStatusShape = (statusValue) => {
      const status = statusTypes.find(s => s.value === statusValue)
      return status ? status.shape : 'hexagon'
    }
    
    const onCustomColorInput = (event) => {
      form.value.customColor = event.target.value
    }
    
    const saveStatus = async () => {
      isSaving.value = true
      try {
        // Calculate clear time
        let clearAt = null
        const now = new Date()
        
        switch (form.value.clearAfter) {
          case '30min':
            clearAt = new Date(now.getTime() + 30 * 60 * 1000)
            break
          case '1hour':
            clearAt = new Date(now.getTime() + 60 * 60 * 1000)
            break
          case '4hours':
            clearAt = new Date(now.getTime() + 4 * 60 * 60 * 1000)
            break
          case 'today':
            clearAt = new Date(now)
            clearAt.setHours(23, 59, 59, 999)
            break
          case 'week':
            clearAt = new Date(now)
            clearAt.setDate(now.getDate() + (7 - now.getDay()))
            clearAt.setHours(23, 59, 59, 999)
            break
        }
        
        const data = {
          status: form.value.status,
          mood: form.value.message,
          mood_emoji: form.value.emoji || statusTypes.find(s => s.value === form.value.status)?.icon || '',
          mood_clear_at: clearAt ? clearAt.toISOString() : null,
          status_color: form.value.customColor
        }
        
        await api.updateProfile(data)
        await userStore.getProfile()
        
        showStatusModal.value = false
        proxy.$Message.success('Status updated successfully')
      } catch (error) {
        console.error('Failed to update status:', error)
        proxy.$Message.error('Failed to update status')
      } finally {
        isSaving.value = false
      }
    }
    
    const clearStatus = async () => {
      isSaving.value = true
      try {
        await api.updateProfile({
          mood: '',
          mood_emoji: '',
          mood_clear_at: null
        })
        await userStore.getProfile()
        
        showStatusModal.value = false
        proxy.$Message.success('Status cleared')
      } catch (error) {
        console.error('Failed to clear status:', error)
        proxy.$Message.error('Failed to clear status')
      } finally {
        isSaving.value = false
      }
    }
    
    const resetForm = () => {
      loadCurrentStatus()
      showEmojiPicker.value = false
      showColorPicker.value = false
      showCustomization.value = false
      emojiSearch.value = ''
    }
    
    // Watch for modal open
    watch(showStatusModal, (newVal) => {
      if (newVal) {
        loadCurrentStatus()
      }
    })
    
    // Load profile on mount
    onMounted(() => {
      userStore.getProfile()
    })
    
    return {
      // State
      showStatusModal,
      showEmojiPicker,
      showColorPicker,
      showCustomization,
      emojiSearch,
      isSaving,
      form,
      
      // Data
      statusTypes,
      statusEmojis,
      allEmojis,
      customColors,
      suggestedMessages,
      
      // Computed
      currentMood,
      statusClass,
      statusShape,
      currentStatusColor,
      statusLabel,
      currentStatusIcon,
      statusMessage,
      displayMessage,
      hasCurrentStatus,
      filteredEmojis,
      
      // Methods
      selectStatus,
      getQuickEmojisForStatus,
      getEmojiTitle,
      getEmojiSuggestionText,
      getStatusShape,
      onCustomColorInput,
      saveStatus,
      clearStatus,
      resetForm
    }
  }
}
</script>

<style lang="less" scoped>
.mood-status-component {
  display: inline-block;
  vertical-align: middle;
}

// Current status display
.current-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  background: #f7f8fa;
  border: 1px solid transparent;
  height: 36px;
  vertical-align: middle;
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
  
  &:hover {
    background: #e8f4ff;
    border-color: #d1e9ff;
    
    .dropdown-icon {
      color: #1890ff;
    }
  }
  
  .status-content {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
    
    .status-text {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: #515a6e;
      white-space: nowrap;
      overflow: hidden;
      
      .status-emoji {
        font-size: 14px;
        line-height: 1;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
      }
      
      .status-label {
        font-weight: 500;
        color: #515a6e;
        line-height: 1;
      }
      
      .status-message {
        color: #808695;
        font-weight: 400;
        font-size: 12px;
        margin-left: 2px;
        transition: all 0.2s;
        display: inline;
        
        @media (max-width: 768px) {
          display: none;
        }
      }
    }
    
    .status-meta {
      display: none; // Hide the meta text for cleaner look
    }
  }
  
  .dropdown-icon {
    color: #808695;
    transition: all 0.2s;
    margin-left: 2px;
    line-height: 1;
    display: flex;
    align-items: center;
  }
}

// Status indicator styles
.status-indicator {
  position: relative;
  width: 10px;
  height: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  .status-shape {
    width: 100%;
    height: 100%;
    background: currentColor;
    transition: all 0.2s;
  }
  
  // Shape styles
  &.shape-hexagon .status-shape {
    width: 8px;
    height: 8px;
    clip-path: polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%);
  }
  
  &.shape-square .status-shape {
    width: 8px;
    height: 8px;
    border-radius: 2px;
  }
  
  &.shape-triangle .status-shape {
    width: 0;
    height: 0;
    background: transparent;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-bottom: 9px solid currentColor;
  }
  
  &.shape-diamond .status-shape {
    width: 8px;
    height: 8px;
    transform: rotate(45deg);
    border-radius: 1px;
  }
  
  &.shape-circle .status-shape {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
  
  &.shape-star .status-shape {
    width: 10px;
    height: 10px;
    clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
  }
  
  &.shape-book .status-shape {
    width: 10px;
    height: 8px;
    border-radius: 1px;
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      top: 1px;
      left: 50%;
      width: 1px;
      height: 6px;
      background: rgba(255, 255, 255, 0.4);
    }
  }
  
  &.shape-gear .status-shape {
    width: 10px;
    height: 10px;
    clip-path: polygon(
      42% 0%, 58% 0%, 58% 28%, 70% 28%, 70% 42%, 100% 42%, 100% 58%, 70% 58%, 70% 72%, 58% 72%, 58% 100%, 42% 100%, 42% 72%, 30% 72%, 30% 58%, 0% 58%, 0% 42%, 30% 42%, 30% 28%, 42% 28%
    );
  }
  
  // Special status effects
  &.status-idle.shape-square .status-shape {
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 4px;
      height: 4px;
      background: white;
    }
  }
  
  &.status-busy.shape-triangle .status-shape {
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 3px;
      left: -2px;
      width: 4px;
      height: 1px;
      background: white;
    }
  }
  
  &.status-invisible.shape-diamond .status-shape {
    background: transparent;
    border: 2px solid currentColor;
  }
}

// Modal content
.status-modal-content {
  h4 {
    margin-bottom: 10px;
    color: #17233d;
    font-size: 13px;
    font-weight: 500;
  }
  
  .modal-layout {
    display: flex;
    gap: 20px;
  }
  
  .left-column {
    flex: 1;
  }
  
  .right-column {
    width: 200px;
  }
  
  // Mood type selector
  .mood-type-selector {
    margin-bottom: 20px;
    
    .mood-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-top: 8px;
    }
    
    .mood-type-option {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 12px 6px;
      border: 1px solid #e8eaec;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      text-align: center;
      
      &:hover {
        border-color: #40a9ff;
        background: #f7f8fa;
        transform: translateY(-1px);
      }
      
      &.active {
        border-color: #1890ff;
        background: #e6f7ff;
      }
      
      .mood-icon {
        font-size: 20px;
        line-height: 1;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
      }
      
      .mood-label {
        font-size: 11px;
        font-weight: 500;
        color: #515a6e;
      }
    }
  }
  
  // Message section
  .message-section {
    margin-bottom: 20px;
  }
  
  // Emoji and color customization
  .emoji-color-section {
    margin-bottom: 20px;
    
    .current-emoji-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
      
      .emoji-display {
        width: 36px;
        height: 36px;
        background: #f7f8fa;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        
        .current-emoji {
          font-size: 20px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
        }
      }
      
      .color-display {
        flex: 1;
        
        .color-swatch {
          width: 100%;
          height: 36px;
          border-radius: 6px;
          border: 1px solid #e8eaec;
        }
      }
      
      .ivu-btn {
        font-size: 12px;
        padding: 4px 8px;
      }
    }
    
    .customization-panel {
      padding: 10px;
      background: #f7f8fa;
      border-radius: 6px;
      
      .quick-emojis {
        display: flex;
        gap: 4px;
        margin-bottom: 10px;
        flex-wrap: wrap;
        
        .emoji-option {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.2s;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
          
          &:hover {
            background: #e8eaec;
            transform: scale(1.1);
          }
          
          &.selected {
            background: #e6f7ff;
            border: 1px solid #1890ff;
          }
        }
      }
      
      .color-grid {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        gap: 6px;
        
        .color-option {
          width: 24px;
          height: 24px;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          border: 2px solid transparent;
          
          &:hover {
            transform: scale(1.1);
            border-color: #d9d9d9;
          }
          
          &.selected {
            border-color: #1890ff;
          }
          
          i {
            color: white;
          }
        }
      }
    }
  }
  
  .clear-section {
    .ivu-select {
      width: 100%;
    }
  }
}
</style>