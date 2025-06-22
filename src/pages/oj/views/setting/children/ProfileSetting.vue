<template>
  <div class="setting-main">
    <div class="section-title">{{$t('m.Avatar_Setting')}}</div>
    <AvatarUpload />

    <div class="section-title">{{$t('m.Profile_Setting')}}</div>
    <Form ref="formProfile" :model="formProfile">
      <Row type="flex" :gutter="30" justify="space-around">
        <Col :span="11">
          <FormItem label="Username">
            <Input v-model="currentUsername" disabled>
              <Button slot="append" @click="showUsernameModal = true" :disabled="!canChangeUsername">
                Change Username
              </Button>
            </Input>
            <Alert v-if="!canChangeUsername" type="warning" show-icon style="margin-top: 10px">
              You can only change your username once every 30 days. 
              <template v-if="daysUntilNextChange > 0">
                Next change available in {{ daysUntilNextChange }} days.
              </template>
            </Alert>
          </FormItem>
          <FormItem label="Real Name">
            <Input v-model="formProfile.real_name"/>
          </FormItem>
          <Form-item label="School">
            <Input v-model="formProfile.school"/>
          </Form-item>
          <Form-item label="Major">
            <Input v-model="formProfile.major"/>
          </Form-item>
          <FormItem label="Language">
            <Select v-model="formProfile.language">
              <Option v-for="lang in languages" :key="lang.value" :value="lang.value">{{lang.label}}</Option>
            </Select>
          </FormItem>
          <Form-item>
            <Button type="primary" @click="updateProfile" :loading="loadingSaveBtn">Save All</Button>
          </Form-item>
        </Col>

        <Col :span="11">
          <Form-item label="Mood">
            <Input v-model="formProfile.mood"/>
          </Form-item>
          <Form-item label="Blog">
            <Input v-model="formProfile.blog"/>
          </Form-item>
          <Form-item label="Github">
            <Input v-model="formProfile.github"/>
          </Form-item>
        </Col>
      </Row>
    </Form>

    <!-- Username Change Modal -->
    <Modal 
      v-model="showUsernameModal"
      title="Change Username"
      :loading="loadingUsernameBtn"
      @on-ok="changeUsername">
      <Alert type="warning" show-icon>
        <template slot="desc">
          <p>• You can only change your username once every 30 days</p>
          <p>• Your old username will become available for others to use</p>
          <p>• All your submissions and data will remain with your account</p>
          <p>• You will need to use your new username to login</p>
        </template>
      </Alert>
      <Form ref="formUsername" :model="formUsername" :rules="usernameRules" style="margin-top: 20px">
        <FormItem label="Current Username">
          <Input v-model="currentUsername" disabled/>
        </FormItem>
        <FormItem label="New Username" prop="new_username">
          <Input v-model="formUsername.new_username" placeholder="Enter new username">
            <Icon slot="prefix" type="person"></Icon>
          </Input>
        </FormItem>
        <FormItem label="Confirm Password" prop="password" :rules="passwordRule">
          <Input v-model="formUsername.password" type="password" placeholder="Enter your password to confirm">
            <Icon slot="prefix" type="locked"></Icon>
          </Input>
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>

<script>
  import api from '@oj/api'
  import utils from '@/utils/utils'
  import { useUserStore } from '@/stores/user'
  import {languages} from '@/i18n'
  import AvatarUpload from '@/pages/oj/components/AvatarUpload.vue'

  export default {
    components: {
      AvatarUpload
    },
    data () {
      const checkUsername = (rule, value, callback) => {
        if (!value) {
          return callback(new Error('Username is required'))
        }
        if (value.length < 3 || value.length > 20) {
          return callback(new Error('Username must be between 3 and 20 characters'))
        }
        if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          return callback(new Error('Username can only contain letters, numbers, and underscores'))
        }
        if (value === this.currentUsername) {
          return callback(new Error('New username must be different from current username'))
        }
        callback()
      }
      
      return {
        loadingSaveBtn: false,
        loadingUsernameBtn: false,
        showUsernameModal: false,
        currentUsername: '',
        canChangeUsername: true,
        daysUntilNextChange: 0,
        languages: languages,
        formProfile: {
          real_name: '',
          mood: '',
          major: '',
          blog: '',
          school: '',
          github: '',
          language: ''
        },
        formUsername: {
          new_username: '',
          password: ''
        },
        usernameRules: {
          new_username: [
            { validator: checkUsername, trigger: 'blur' }
          ]
        },
        passwordRule: [
          { required: true, message: 'Password is required', trigger: 'blur' },
          { min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' }
        ]
      }
    },
    mounted () {
      const userStore = useUserStore()
      let profile = userStore.profile
      Object.keys(this.formProfile).forEach(element => {
        if (profile[element] !== undefined) {
          this.formProfile[element] = profile[element]
        }
      })
      // Set current username
      this.currentUsername = userStore.user?.username || profile.user?.username || ''
      // Check if username can be changed (implement based on backend logic)
      this.checkUsernameChangeEligibility()
    },
    methods: {
      updateProfile () {
        this.loadingSaveBtn = true
        let updateData = utils.filterEmptyValue(Object.assign({}, this.formProfile))
        api.updateProfile(updateData).then(res => {
          this.$success('Success')
          const userStore = useUserStore()
          userStore.updateProfile(res.data.data)
          this.loadingSaveBtn = false
        }, _ => {
          this.loadingSaveBtn = false
        })
      },
      checkUsernameChangeEligibility () {
        // Check if user has changed username recently
        // This would typically come from the backend
        // For now, we'll assume they can change it
        // You may want to add an API endpoint to check this
        api.getUserInfo(this.currentUsername).then(res => {
          const lastUsernameChange = res.data.data.last_username_change
          if (lastUsernameChange) {
            const daysSinceChange = Math.floor((new Date() - new Date(lastUsernameChange)) / (1000 * 60 * 60 * 24))
            if (daysSinceChange < 30) {
              this.canChangeUsername = false
              this.daysUntilNextChange = 30 - daysSinceChange
            }
          }
        }).catch(() => {
          // If API doesn't support this yet, assume user can change
          this.canChangeUsername = true
        })
      },
      changeUsername () {
        this.$refs.formUsername.validate((valid) => {
          if (valid) {
            this.loadingUsernameBtn = true
            api.changeUsername({
              new_username: this.formUsername.new_username,
              password: this.formUsername.password
            }).then(res => {
              this.loadingUsernameBtn = false
              this.$success('Username changed successfully! You will be logged out in 5 seconds...')
              this.showUsernameModal = false
              // Update local username
              this.currentUsername = this.formUsername.new_username
              // Clear form
              this.formUsername = {
                new_username: '',
                password: ''
              }
              // Log out after 5 seconds
              setTimeout(() => {
                const userStore = useUserStore()
                userStore.logout()
                this.$router.push({name: 'login'})
              }, 5000)
            }).catch(err => {
              this.loadingUsernameBtn = false
              this.$error(err.data?.data || 'Failed to change username')
            })
          } else {
            return false
          }
        })
      }
    }
  }
</script>

<style lang="less" scoped>
  // Profile settings styles
  .setting-main {
    .section-title {
      margin-bottom: 20px;
    }
  }
</style>
