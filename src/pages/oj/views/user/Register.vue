<template>
<div>
    <Form ref="formRegister" :model="formRegister" :rules="ruleRegister">
      <FormItem prop="username">
        <Input type="text" v-model="formRegister.username" :placeholder="$t('m.RegisterUsername')" size="large" @keyup.enter="handleRegister">
          <template #prefix>
            <Icon type="md-person" />
          </template>
        </Input>
      </FormItem>
      <FormItem prop="email">
        <Input v-model="formRegister.email" :placeholder="$t('m.Email_Address')" size="large" @keyup.enter="handleRegister">
          <template #prefix>
            <Icon type="md-mail" />
          </template>
        </Input>
      </FormItem>
      <FormItem prop="password">
        <Input type="password" v-model="formRegister.password" :placeholder="$t('m.RegisterPassword')" size="large" @keyup.enter="handleRegister">
          <template #prefix>
            <Icon type="md-lock" />
          </template>
        </Input>
      </FormItem>
      <FormItem prop="passwordAgain">
        <Input type="password" v-model="formRegister.passwordAgain" :placeholder="$t('m.Password_Again')" size="large" @keyup.enter="handleRegister">
          <template #prefix>
            <Icon type="md-lock" />
          </template>
        </Input>
      </FormItem>
      <FormItem prop="captcha" style="margin-bottom:10px">
        <div class="oj-captcha">
          <div class="oj-captcha-code">
            <Input v-model="formRegister.captcha" :placeholder="$t('m.Captcha')" size="large" @keyup.enter="handleRegister">
              <template #prefix>
                <Icon type="md-bulb" />
              </template>
            </Input>
          </div>
          <div class="oj-captcha-img">
            <Tooltip content="Click to refresh" placement="top">
              <img :src="captchaSrc" @click="getCaptchaSrc"/>
            </Tooltip>
          </div>
        </div>
      </FormItem>
    </Form>
    <div class="footer">
      <Button
        type="primary"
        @click="handleRegister"
        class="btn" long
        :loading="btnRegisterLoading">
        {{$t('m.UserRegister')}}
      </Button>
      <Button
        type="ghost"
        @click="switchMode('login')"
        class="btn" long>
        {{$t('m.Already_Registed')}}
      </Button>
    </div>
  </div>
</template>

<script>
  import { useUserStore } from '@/stores/user'
  import { useWebsiteStore } from '@/stores/website'
  import api from '@oj/api'
  import { Message } from 'view-ui-plus'

  export default {
    name: 'Register',
    setup() {
      const userStore = useUserStore()
      const websiteStore = useWebsiteStore()
      
      return {
        userStore,
        websiteStore
      }
    },
    mounted () {
      this.getCaptchaSrc()
    },
    data () {
      const CheckUsernameNotExist = (rule, value, callback) => {
        api.checkUsernameOrEmail(value, undefined).then(res => {
          if (res.data.data.username === true) {
            callback(new Error(this.$i18n.t('m.The_username_already_exists')))
          } else {
            callback()
          }
        }, _ => callback())
      }
      const CheckEmailNotExist = (rule, value, callback) => {
        api.checkUsernameOrEmail(undefined, value).then(res => {
          if (res.data.data.email === true) {
            callback(new Error(this.$i18n.t('m.The_email_already_exists')))
          } else {
            callback()
          }
        }, _ => callback())
      }
      const CheckPassword = (rule, value, callback) => {
        if (this.formRegister.password !== '') {
          // 对第二个密码框再次验证
          this.$refs.formRegister.validateField('passwordAgain')
        }
        callback()
      }

      const CheckAgainPassword = (rule, value, callback) => {
        if (value !== this.formRegister.password) {
          callback(new Error(this.$i18n.t('m.password_does_not_match')))
        }
        callback()
      }

      return {
        btnRegisterLoading: false,
        captchaSrc: '',
        formRegister: {
          username: '',
          password: '',
          passwordAgain: '',
          email: '',
          captcha: ''
        },
        ruleRegister: {
          username: [
            {required: true, trigger: 'blur'},
            {validator: CheckUsernameNotExist, trigger: 'blur'}
          ],
          email: [
            {required: true, type: 'email', trigger: 'blur'},
            {validator: CheckEmailNotExist, trigger: 'blur'}
          ],
          password: [
            {required: true, trigger: 'blur', min: 6, max: 20},
            {validator: CheckPassword, trigger: 'blur'}
          ],
          passwordAgain: [
            {required: true, validator: CheckAgainPassword, trigger: 'change'}
          ],
          captcha: [
            {required: true, trigger: 'blur', min: 1, max: 10}
          ]
        }
      }
    },
    methods: {
      getCaptchaSrc() {
        api.getCaptcha().then(res => {
          this.captchaSrc = res.data
        })
      },
      switchMode (mode) {
        this.userStore.changeModalStatus({
          mode,
          visible: true
        })
      },
      handleRegister () {
        this.$refs.formRegister.validate(async (valid) => {
          if (!valid) {
            return
          }
          let formData = Object.assign({}, this.formRegister)
          delete formData['passwordAgain']
          this.btnRegisterLoading = true
          try {
            await api.register(formData)
            Message.success(this.$i18n.t('m.Thanks_for_registering'))
            this.switchMode('login')
          } catch (error) {
            this.getCaptchaSrc()
            this.formRegister.captcha = ''
          } finally {
            this.btnRegisterLoading = false
          }
        })
      }
    },
    computed: {
      website() {
        return this.websiteStore.website
      },
      modalStatus() {
        return this.userStore.modalStatus
      }
    }
  }
</script>

<style scoped lang="less">
  .footer {
    overflow: auto;
    margin-top: 20px;
    margin-bottom: -15px;
    text-align: left;
    .btn {
      margin: 0 0 15px 0;
      &:last-child {
        margin: 0;
      }
    }
  }
</style>
