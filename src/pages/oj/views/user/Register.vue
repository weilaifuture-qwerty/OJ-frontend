<template>
  <div class="register-container">
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
      @submit.prevent="handleSubmit"
    >
      <el-form-item label="Username" prop="username">
        <el-input v-model="form.username" placeholder="Username" />
      </el-form-item>
      <el-form-item label="Password" prop="password">
        <el-input
          v-model="form.password"
          type="password"
          placeholder="Password"
          show-password
        />
      </el-form-item>
      <el-form-item label="Email" prop="email">
        <el-input v-model="form.email" placeholder="Email" />
      </el-form-item>
      <el-form-item>
        <vue3-recaptcha
          ref="recaptchaRef"
          :sitekey="recaptchaSiteKey"
          @verify="onCaptchaVerified"
          @expire="onCaptchaExpired"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" native-type="submit" :loading="loading">
          Register
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Vue3Recaptcha } from 'vue3-recaptcha2'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const formRef = ref(null)
const recaptchaRef = ref(null)
const loading = ref(false)
const recaptchaSiteKey = 'YOUR_RECAPTCHA_SITE_KEY'

const form = reactive({
  username: '',
  password: '',
  email: '',
  recaptcha: ''
})

const rules = {
  username: [
    { required: true, message: 'Please input username', trigger: 'blur' },
    { min: 3, max: 20, message: 'Length should be 3 to 20', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Please input password', trigger: 'blur' },
    { min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' }
  ],
  email: [
    { required: true, message: 'Please input email', trigger: 'blur' },
    { type: 'email', message: 'Please input valid email', trigger: 'blur' }
  ]
}

const onCaptchaVerified = (response) => {
  form.recaptcha = response
}

const onCaptchaExpired = () => {
  form.recaptcha = ''
  recaptchaRef.value?.reset()
}

const handleSubmit = async () => {
  if (!form.recaptcha) {
    ElMessage.error('Please complete the captcha')
    return
  }

  try {
    loading.value = true
    await formRef.value.validate()
    await userStore.register(form)
    ElMessage.success('Registration successful')
    router.push('/login')
  } catch (error) {
    ElMessage.error(error.message || 'Registration failed')
    recaptchaRef.value?.reset()
    form.recaptcha = ''
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}
</style>
