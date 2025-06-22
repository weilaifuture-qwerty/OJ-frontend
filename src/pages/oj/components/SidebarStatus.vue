<template>
  <Card dis-hover class="status-card" v-if="isAuthenticated && userProfile">
    <template #title>
      <div class="card-title">
        <Icon type="md-pulse" size="18" />
        <span>My Status</span>
      </div>
    </template>
    
    <div class="status-display">
      <!-- Status Indicator and Type -->
      <div class="status-header">
        <div class="status-indicator" :class="[statusClass, statusShape]" :style="{ color: currentStatusColor }">
          <div class="status-shape"></div>
        </div>
        <span class="status-type">{{ statusLabel }}</span>
        <Button 
          size="small" 
          type="text" 
          @click="showStatusModal = true"
          class="edit-btn">
          <Icon type="md-create" size="14" />
        </Button>
      </div>
      
      <!-- Status Message -->
      <div class="status-body" v-if="currentMood.message || currentMood.emoji || currentMood.status">
        <div class="status-message">
          <span class="message-emoji">{{ currentMood.emoji || currentStatusIcon }}</span>
          <span class="message-text">{{ currentMood.message || 'No status message' }}</span>
        </div>
        <div class="status-time" v-if="currentMood.clearAt">
          <Icon type="md-time" size="12" />
          <span>Clears {{ formatClearTime(currentMood.clearAt) }}</span>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-else class="empty-state">
        <p>Share what you're working on!</p>
        <Button size="small" @click="showStatusModal = true">Set Status</Button>
      </div>
    </div>
    
    <!-- Status Modal -->
    <Modal 
      v-model="showStatusModal"
      title="Set your problem-solving mood"
      :width="480"
      :closable="true"
      @on-cancel="resetForm">
      
      <div class="status-modal-content">
        <!-- Problem Solving Mood Selector -->
        <div class="mood-type-selector">
          <h4>What are you working on?</h4>
          <div class="mood-grid">
            <div 
              v-for="status in statusTypes" 
              :key="status.value"
              class="mood-type-option"
              :class="{ active: form.status === status.value }"
              @click="selectStatus(status)">
              <div class="mood-icon">{{ status.icon }}</div>
              <div class="mood-indicator" :class="[`status-${status.value}`, `shape-${status.shape}`]" :style="{ color: status.color }">
                <div class="status-shape"></div>
              </div>
              <span class="mood-label">{{ status.label }}</span>
            </div>
          </div>
        </div>

        <!-- Status Message -->
        <div class="message-section">
          <h4>What's your status?</h4>
          <Input 
            v-model="form.message"
            type="textarea"
            :rows="2"
            placeholder="What are you working on?"
            maxlength="100"
            show-word-limit />
        </div>
      </div>

      <template #footer>
        <Button @click="clearStatus" :disabled="!hasCurrentStatus">Clear Status</Button>
        <Button type="primary" @click="saveStatus" :loading="isSaving">Save</Button>
      </template>
    </Modal>
  </Card>
</template>

<script>
import { ref, computed, getCurrentInstance, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import api from '@oj/api'

export default {
  name: 'SidebarStatus',
  setup() {
    const userStore = useUserStore()
    const { proxy } = getCurrentInstance()
    const showStatusModal = ref(false)
    const isSaving = ref(false)
    
    // Form data
    const form = ref({
      status: 'practicing',
      emoji: '',
      message: '',
      clearAfter: 'never',
      customColor: '#52c41a'
    })
    
    // Status types configuration (same as MoodStatus)
    const statusTypes = [
      { value: 'practicing', label: 'Practicing', color: '#52c41a', shape: 'hexagon', icon: '🎯' },
      { value: 'learning', label: 'Learning', color: '#1890ff', shape: 'book', icon: '📚' },
      { value: 'competing', label: 'In Contest', color: '#f5222d', shape: 'star', icon: '🏆' },
      { value: 'debugging', label: 'Debugging', color: '#fa8c16', shape: 'gear', icon: '🐛' },
      { value: 'reviewing', label: 'Reviewing', color: '#722ed1', shape: 'circle', icon: '📝' },
      { value: 'resting', label: 'Taking Break', color: '#13c2c2', shape: 'square', icon: '☕' }
    ]
    
    const isAuthenticated = computed(() => userStore.isAuthenticated)
    const userProfile = computed(() => userStore.profile)
    
    const currentMood = computed(() => {
      const profile = userProfile.value
      return {
        status: profile?.status || 'practicing',
        emoji: profile?.mood_emoji || '',
        message: profile?.mood || '',
        clearAt: profile?.mood_clear_at || null,
        customColor: profile?.status_color || '#52c41a'
      }
    })
    
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
    
    const hasCurrentStatus = computed(() => {
      return currentMood.value.emoji || currentMood.value.message
    })
    
    const formatClearTime = (clearAt) => {
      if (!clearAt) return ''
      const clear = new Date(clearAt)
      const now = new Date()
      const diff = clear - now
      
      if (diff < 0) return 'soon'
      
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      
      if (hours > 24) {
        const days = Math.floor(hours / 24)
        return `in ${days} day${days > 1 ? 's' : ''}`
      } else if (hours > 0) {
        return `in ${hours}h ${minutes}m`
      } else {
        return `in ${minutes}m`
      }
    }
    
    // Methods
    const selectStatus = (status) => {
      form.value.status = status.value
      form.value.customColor = status.color
    }
    
    const saveStatus = async () => {
      isSaving.value = true
      try {
        const data = {
          status: form.value.status,
          mood: form.value.message,
          mood_emoji: form.value.emoji || statusTypes.find(s => s.value === form.value.status)?.icon || '',
          mood_clear_at: null,
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
      form.value = {
        status: currentMood.value.status || 'practicing',
        emoji: currentMood.value.emoji || '',
        message: currentMood.value.message || '',
        clearAfter: 'never',
        customColor: currentMood.value.customColor || '#52c41a'
      }
    }
    
    // Load profile on mount
    onMounted(() => {
      if (userStore.isAuthenticated) {
        userStore.getProfile()
      }
    })
    
    return {
      isAuthenticated,
      userProfile,
      currentMood,
      statusClass,
      statusShape,
      currentStatusColor,
      statusLabel,
      currentStatusIcon,
      statusTypes,
      showStatusModal,
      isSaving,
      form,
      hasCurrentStatus,
      formatClearTime,
      selectStatus,
      saveStatus,
      clearStatus,
      resetForm
    }
  },
  watch: {
    showStatusModal(val) {
      if (val) {
        this.resetForm()
      }
    }
  }
}
</script>

<style lang="less" scoped>
.status-card {
  margin-bottom: 20px;
  
  :deep(.ivu-card-body) {
    padding: 16px;
  }
  
  .card-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 500;
    
    i {
      color: #1890ff;
    }
  }
}

.status-display {
  .status-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
    
    .status-type {
      flex: 1;
      font-weight: 500;
      font-size: 14px;
      color: #17233d;
    }
    
    .edit-btn {
      padding: 4px 8px;
      color: #808695;
      
      &:hover {
        color: #1890ff;
      }
    }
  }
  
  .status-body {
    .status-message {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 10px 12px;
      background: #f7f8fa;
      border-radius: 12px;
      margin-bottom: 8px;
      
      .message-emoji {
        font-size: 18px;
        line-height: 1.4;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
      }
      
      .message-text {
        flex: 1;
        font-size: 14px;
        line-height: 1.4;
        color: #515a6e;
        word-break: break-word;
      }
    }
    
    .status-time {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #808695;
      
      i {
        color: #808695;
      }
    }
  }
  
  .empty-state {
    text-align: center;
    padding: 20px 0;
    
    p {
      color: #808695;
      margin-bottom: 12px;
      font-size: 13px;
    }
  }
}

// Status indicator styles (same as MoodStatus but slightly larger)
.status-indicator {
  position: relative;
  width: 16px;
  height: 16px;
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
    width: 12px;
    height: 12px;
    clip-path: polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%);
  }
  
  &.shape-square .status-shape {
    width: 12px;
    height: 12px;
    border-radius: 3px;
  }
  
  &.shape-circle .status-shape {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }
  
  &.shape-star .status-shape {
    width: 14px;
    height: 14px;
    clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
  }
  
  &.shape-book .status-shape {
    width: 14px;
    height: 12px;
    border-radius: 2px;
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      top: 2px;
      left: 50%;
      width: 1px;
      height: 8px;
      background: rgba(255, 255, 255, 0.4);
    }
  }
  
  &.shape-gear .status-shape {
    width: 14px;
    height: 14px;
    clip-path: polygon(
      42% 0%, 58% 0%, 58% 28%, 70% 28%, 70% 42%, 100% 42%, 100% 58%, 70% 58%, 70% 72%, 58% 72%, 58% 100%, 42% 100%, 42% 72%, 30% 72%, 30% 58%, 0% 58%, 0% 42%, 30% 42%, 30% 28%, 42% 28%
    );
  }
}

// Modal styles
.status-modal-content {
  h4 {
    margin-bottom: 12px;
    color: #17233d;
    font-size: 14px;
    font-weight: 500;
  }
  
  .mood-type-selector {
    margin-bottom: 24px;
    
    .mood-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-top: 8px;
    }
    
    .mood-type-option {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 16px 8px;
      border: 1px solid #e8eaec;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;
      text-align: center;
      
      &:hover {
        border-color: #40a9ff;
        background: #f7f8fa;
        transform: translateY(-2px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }
      
      &.active {
        border-color: #1890ff;
        background: #e6f7ff;
        box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
      }
      
      .mood-icon {
        font-size: 24px;
        line-height: 1;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
      }
      
      .mood-label {
        font-size: 12px;
        font-weight: 500;
        color: #515a6e;
      }
      
      .mood-indicator {
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        
        .status-shape {
          background: currentColor;
        }
      }
    }
  }
  
  .message-section {
    margin-bottom: 24px;
  }
}
</style>