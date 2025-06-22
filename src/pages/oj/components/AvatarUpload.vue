<template>
  <div class="avatar-upload-container">
    <div class="current-avatar-section">
      <h4>Current Avatar</h4>
      <div class="avatar-preview">
        <img 
          :src="currentAvatar || '/default.png'" 
          alt="Current avatar"
          class="current-avatar"
        />
        <div class="avatar-actions">
          <Button 
            v-if="currentAvatar && !isDefaultAvatar" 
            @click="resetToDefault" 
            :loading="isResetting"
            type="warning"
            size="small">
            <Icon type="md-refresh"></Icon>
            Reset to Default
          </Button>
        </div>
      </div>
    </div>

    <div class="upload-section">
      <h4>Upload New Avatar</h4>
      <div v-if="!selectedFile" class="upload-area">
        <Upload
          type="drag"
          accept=".jpg,.jpeg,.png,.bmp,.gif"
          :before-upload="handleFileSelect"
          action=""
          class="avatar-uploader">
          <div class="upload-dragger">
            <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
            <p>Click or drag image here to upload</p>
            <p class="upload-hint">Supports JPG, PNG, GIF, BMP • Max 2MB • Auto-cropped to square</p>
          </div>
        </Upload>
      </div>

      <div v-else class="preview-section">
        <h5>Preview</h5>
        <div class="preview-container">
          <img :src="previewUrl" alt="Preview" class="preview-image" />
          <div class="preview-info">
            <p><strong>File:</strong> {{ selectedFile.name }}</p>
            <p><strong>Size:</strong> {{ formatFileSize(selectedFile.size) }}</p>
            <p class="auto-process-note">
              <Icon type="md-information-circle"></Icon>
              Image will be automatically cropped to square and resized to 200x200px
            </p>
          </div>
        </div>
        <div class="preview-actions">
          <Button @click="cancelUpload" size="large">
            <Icon type="md-close"></Icon>
            Cancel
          </Button>
          <Button 
            type="primary" 
            @click="uploadAvatar" 
            :loading="isUploading"
            size="large">
            <Icon type="md-checkmark"></Icon>
            Upload Avatar
          </Button>
        </div>
      </div>
    </div>

    <Alert type="info" show-icon style="margin-top: 20px;">
      <template #desc>
        <ul class="info-list">
          <li>Maximum file size: 2MB</li>
          <li>Supported formats: JPG, JPEG, PNG, GIF, BMP</li>
          <li>Images will be automatically cropped to square aspect ratio</li>
          <li>Final size: 200x200 pixels</li>
        </ul>
      </template>
    </Alert>
  </div>
</template>

<script>
import { ref, computed, onMounted, getCurrentInstance } from 'vue'
import { useUserStore } from '@/stores/user'
import api from '@oj/api'

export default {
  name: 'AvatarUpload',
  setup() {
    const userStore = useUserStore()
    const { proxy } = getCurrentInstance()
    
    // Reactive data
    const selectedFile = ref(null)
    const previewUrl = ref('')
    const isUploading = ref(false)
    const isResetting = ref(false)
    
    // Computed
    const currentAvatar = computed(() => userStore.profile?.avatar)
    const isDefaultAvatar = computed(() => {
      return !currentAvatar.value || currentAvatar.value.includes('default')
    })
    
    // Methods
    const handleFileSelect = (file) => {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp']
      if (!validTypes.includes(file.type)) {
        proxy.$Message.error('Please select a valid image file (JPG, PNG, GIF, BMP)')
        return false
      }
      
      // Validate file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        proxy.$Message.error('File size must be less than 2MB')
        return false
      }
      
      selectedFile.value = file
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        previewUrl.value = e.target.result
      }
      reader.readAsDataURL(file)
      
      return false // Prevent auto upload
    }
    
    const uploadAvatar = async () => {
      if (!selectedFile.value) return
      
      isUploading.value = true
      try {
        const formData = new FormData()
        formData.append('image', selectedFile.value)
        
        const response = await api.uploadAvatar(formData)
        
        proxy.$Message.success('Avatar uploaded successfully!')
        
        // Refresh user profile to get new avatar URL
        await userStore.getProfile()
        
        // Reset upload state
        cancelUpload()
      } catch (error) {
        console.error('Avatar upload failed:', error)
        proxy.$Message.error(error.response?.data?.data || 'Failed to upload avatar')
      } finally {
        isUploading.value = false
      }
    }
    
    const resetToDefault = async () => {
      isResetting.value = true
      try {
        await api.deleteAvatar()
        proxy.$Message.success('Avatar reset to default')
        
        // Refresh user profile
        await userStore.getProfile()
      } catch (error) {
        console.error('Failed to reset avatar:', error)
        proxy.$Message.error('Failed to reset avatar')
      } finally {
        isResetting.value = false
      }
    }
    
    const cancelUpload = () => {
      selectedFile.value = null
      previewUrl.value = ''
    }
    
    const formatFileSize = (bytes) => {
      if (bytes < 1024) return bytes + ' B'
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }
    
    // Load current profile on mount
    onMounted(() => {
      userStore.getProfile()
    })
    
    return {
      selectedFile,
      previewUrl,
      isUploading,
      isResetting,
      currentAvatar,
      isDefaultAvatar,
      handleFileSelect,
      uploadAvatar,
      resetToDefault,
      cancelUpload,
      formatFileSize
    }
  }
}
</script>

<style lang="less" scoped>
.avatar-upload-container {
  max-width: 600px;
  
  .current-avatar-section {
    margin-bottom: 30px;
    
    h4 {
      margin-bottom: 15px;
      color: #17233d;
      font-size: 16px;
    }
    
    .avatar-preview {
      display: flex;
      align-items: center;
      gap: 20px;
      
      .current-avatar {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        object-fit: cover;
        border: 3px solid #e8eaec;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
      
      .avatar-actions {
        flex: 1;
      }
    }
  }
  
  .upload-section {
    h4 {
      margin-bottom: 15px;
      color: #17233d;
      font-size: 16px;
    }
    
    .upload-area {
      .avatar-uploader {
        width: 100%;
        
        .upload-dragger {
          padding: 40px;
          text-align: center;
          background: #fafafa;
          border: 2px dashed #d9d9d9;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
          
          &:hover {
            border-color: #2d8cf0;
            background: #f0f9ff;
          }
          
          p {
            margin: 8px 0;
            color: #515a6e;
          }
          
          .upload-hint {
            font-size: 12px;
            color: #808695;
          }
        }
      }
    }
    
    .preview-section {
      h5 {
        margin-bottom: 10px;
        color: #515a6e;
      }
      
      .preview-container {
        display: flex;
        gap: 20px;
        padding: 20px;
        background: #f8f8f9;
        border-radius: 8px;
        margin-bottom: 20px;
        
        .preview-image {
          width: 120px;
          height: 120px;
          object-fit: cover;
          border-radius: 8px;
          border: 1px solid #e8eaec;
        }
        
        .preview-info {
          flex: 1;
          
          p {
            margin: 5px 0;
            color: #515a6e;
            
            strong {
              color: #17233d;
            }
          }
          
          .auto-process-note {
            margin-top: 10px;
            padding: 8px 12px;
            background: #e6f7ff;
            border-radius: 4px;
            font-size: 13px;
            color: #1890ff;
            display: flex;
            align-items: center;
            gap: 5px;
          }
        }
      }
      
      .preview-actions {
        display: flex;
        gap: 10px;
        justify-content: center;
      }
    }
  }
  
  .info-list {
    list-style: none;
    padding: 0;
    margin: 0;
    
    li {
      padding: 3px 0;
      color: #515a6e;
      
      &:before {
        content: "•";
        color: #2d8cf0;
        font-weight: bold;
        margin-right: 8px;
      }
    }
  }
}
</style>