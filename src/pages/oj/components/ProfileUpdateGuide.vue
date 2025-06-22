<template>
  <Card class="profile-update-guide" :padding="30">
    <div class="guide-header">
      <Icon type="md-information-circle-outline" size="32" color="#2d8cf0" />
      <h2>Profile Management Guide</h2>
    </div>
    
    <div class="guide-content">
      <Alert type="info" show-icon>
        <template #desc>
          <p>You can update your profile information in the following locations:</p>
        </template>
      </Alert>
      
      <Row :gutter="20" style="margin-top: 20px;">
        <Col :span="8">
          <div class="feature-card">
            <div class="feature-icon">
              <Icon type="md-image" size="48" color="#19be6b" />
            </div>
            <h3>Profile Picture</h3>
            <p>Upload and crop your avatar</p>
            <div class="feature-details">
              <ul>
                <li>Supported formats: JPG, PNG, GIF, BMP</li>
                <li>Maximum size: 2MB</li>
                <li>Automatic cropping tool</li>
              </ul>
            </div>
            <Button type="primary" @click="goToSettings('profile')" long>
              <Icon type="md-camera" /> Change Avatar
            </Button>
          </div>
        </Col>
        
        <Col :span="8">
          <div class="feature-card">
            <div class="feature-icon">
              <Icon type="md-person" size="48" color="#ff9900" />
            </div>
            <h3>Username & Profile</h3>
            <p>Update your personal information</p>
            <div class="feature-details">
              <ul>
                <li>Change username (once per 30 days)</li>
                <li>Update real name, school, major</li>
                <li>Add social links (GitHub, Blog)</li>
                <li>Set your mood/status</li>
              </ul>
            </div>
            <Button type="primary" @click="goToSettings('profile')" long>
              <Icon type="md-create" /> Edit Profile
            </Button>
          </div>
        </Col>
        
        <Col :span="8">
          <div class="feature-card">
            <div class="feature-icon">
              <Icon type="md-lock" size="48" color="#ed4014" />
            </div>
            <h3>Account Security</h3>
            <p>Manage your login credentials</p>
            <div class="feature-details">
              <ul>
                <li>Change password</li>
                <li>Update email address</li>
                <li>Two-factor authentication</li>
                <li>Manage active sessions</li>
              </ul>
            </div>
            <Button type="primary" @click="goToSettings('account')" long>
              <Icon type="md-key" /> Security Settings
            </Button>
          </div>
        </Col>
      </Row>
      
      <div class="quick-access">
        <h4>Quick Access:</h4>
        <p>Click on your username in the top-right corner of any page and select "Settings" from the dropdown menu.</p>
        <div class="access-path">
          <Tag color="blue">{{ user.username || 'Your Username' }}</Tag>
          <Icon type="md-arrow-forward" />
          <Tag color="green">Settings</Tag>
          <Icon type="md-arrow-forward" />
          <Tag color="orange">Profile / Account / Security</Tag>
        </div>
      </div>
    </div>
  </Card>
</template>

<script>
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

export default {
  name: 'ProfileUpdateGuide',
  setup() {
    const userStore = useUserStore()
    
    return {
      user: computed(() => userStore.user)
    }
  },
  methods: {
    goToSettings(tab) {
      if (tab === 'profile') {
        this.$router.push('/setting/profile')
      } else if (tab === 'account') {
        this.$router.push('/setting/account')
      } else if (tab === 'security') {
        this.$router.push('/setting/security')
      }
    }
  }
}
</script>

<style lang="less" scoped>
.profile-update-guide {
  max-width: 1200px;
  margin: 20px auto;
  
  .guide-header {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 25px;
    
    h2 {
      margin: 0;
      font-size: 24px;
      color: #17233d;
    }
  }
  
  .feature-card {
    background: #f8f8f9;
    border: 1px solid #e8eaec;
    border-radius: 8px;
    padding: 25px;
    height: 100%;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
    }
    
    .feature-icon {
      text-align: center;
      margin-bottom: 15px;
    }
    
    h3 {
      text-align: center;
      font-size: 18px;
      margin-bottom: 10px;
      color: #17233d;
    }
    
    p {
      text-align: center;
      color: #808695;
      margin-bottom: 15px;
    }
    
    .feature-details {
      margin-bottom: 20px;
      
      ul {
        list-style: none;
        padding: 0;
        
        li {
          padding: 5px 0;
          color: #515a6e;
          font-size: 14px;
          
          &:before {
            content: "✓";
            color: #19be6b;
            font-weight: bold;
            margin-right: 8px;
          }
        }
      }
    }
  }
  
  .quick-access {
    margin-top: 30px;
    padding: 20px;
    background: #f0faff;
    border-radius: 8px;
    border: 1px solid #b3e5fc;
    
    h4 {
      margin-bottom: 10px;
      color: #17233d;
    }
    
    p {
      color: #515a6e;
      margin-bottom: 15px;
    }
    
    .access-path {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
      
      i {
        color: #808695;
      }
    }
  }
}
</style>