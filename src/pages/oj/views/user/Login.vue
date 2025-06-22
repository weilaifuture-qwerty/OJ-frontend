<template>
  <div>
    <Form ref="formLogin" :model="formLogin" :rules="ruleLogin">
      <FormItem prop="username">
        <Input type="text" v-model="formLogin.username" :placeholder="$t('m.LoginUsername')" size="large" @keyup.enter="handleLogin">
          <template #prefix>
            <Icon type="md-person" />
          </template>
        </Input>
      </FormItem>
      <FormItem prop="password">
        <Input type="password" v-model="formLogin.password" :placeholder="$t('m.LoginPassword')" size="large" @keyup.enter="handleLogin">
          <template #prefix>
            <Icon type="md-lock" />
          </template>
        </Input>
      </FormItem>
      <FormItem prop="tfa_code" v-if="tfaRequired">
        <Input v-model="formLogin.tfa_code" :placeholder="$t('m.TFA_Code')">
          <template #prefix>
            <Icon type="md-bulb" />
          </template>
        </Input>
      </FormItem>
    </Form>
    <div class="footer">
      <Button
        type="primary"
        @click="handleLogin"
        class="btn" long
        :loading="btnLoginLoading">
        {{$t('m.UserLogin')}}
      </Button>
      <a v-if="website.allow_register" @click.stop="handleBtnClick('register')">{{$t('m.No_Account')}}</a>
      <a @click.stop="goResetPassword" style="float: right">{{$t('m.Forget_Password')}}</a>
    </div>
  </div>
</template>

<script>
import { useUserStore } from '@/stores/user'
import { useWebsiteStore } from '@/stores/website'
import api from '@oj/api'
import { Message } from 'view-ui-plus'

export default {
  name: 'Login',
  setup() {
    const userStore = useUserStore()
    const websiteStore = useWebsiteStore()
    
    return {
      userStore,
      websiteStore
    }
  },
  data() {
    const CheckRequiredTFA = (rule, value, callback) => {
      if (value !== '') {
        api.tfaRequiredCheck(value).then(res => {
          this.tfaRequired = res.data.data.result
        }).catch(() => {
          // Handle error silently
        })
      }
      callback()
    }

    return {
      formLogin: {
        username: '',
        password: '',
        tfa_code: ''
      },
      ruleLogin: {
        username: [
          { required: true, message: this.$i18n.t('m.LoginUsernameRequired'), trigger: 'blur' },
          { trigger: 'blur', validator: CheckRequiredTFA }
        ],
        password: [
          { required: true, message: this.$i18n.t('m.LoginPasswordRequired'), trigger: 'blur' },
          { min: 6, message: this.$i18n.t('m.LoginPasswordNotLess'), trigger: 'blur' }
        ]
      },
      tfaRequired: false,
      btnLoginLoading: false
    }
  },
  computed: {
    website() {
      return this.websiteStore.website
    }
  },
  methods: {
    handleLogin() {
      this.$refs.formLogin.validate(async (valid) => {
        if (!valid) {
          return
        }
        this.btnLoginLoading = true
        
        const formData = {
          username: this.formLogin.username,
          password: this.formLogin.password
        }
        if (this.tfaRequired) {
          formData.tfa_code = this.formLogin.tfa_code
        }
        
        try {
          const res = await api.login(formData)
          Message.success(this.$i18n.t('m.LoginSuccess'))
          
          // Get user profile
          await this.userStore.getProfile()
          
          // Close modal
          this.userStore.changeModalStatus({ visible: false })
          
          // Check if there's a redirect
          if (this.$route.query.redirect) {
            this.$router.push(this.$route.query.redirect)
          } else {
            // Check session storage for redirect
            let redirect = sessionStorage.getItem('redirect')
            if (redirect) {
              sessionStorage.removeItem('redirect')
              this.$router.push(redirect)
            } else {
              this.$router.push('/')
            }
          }
        } catch (error) {
          if (error.response?.data?.data?.includes('Two Factor Authentication is required')) {
            this.tfaRequired = true
          }
          this.formLogin.password = ''
        } finally {
          this.btnLoginLoading = false
        }
      })
    },
    
    handleBtnClick(mode) {
      this.userStore.changeModalStatus({
        mode: mode,
        visible: true
      })
    },
    
    goResetPassword() {
      this.userStore.changeModalStatus({ visible: false })
      this.$router.push({ name: 'apply-reset-password' })
    }
  }
}
</script>

<style scoped>
.footer {
  overflow: auto;
  margin-top: 20px;
  margin-bottom: -15px;
  text-align: left;
  
  .btn {
    margin: 0 0 15px 0;
  }
  
  a {
    color: #57a3f3;
    cursor: pointer;
    
    &:hover {
      color: #2d8cf0;
    }
  }
}
</style>