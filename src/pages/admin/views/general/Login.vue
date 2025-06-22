<template>
  <el-form :model="ruleForm2" :rules="rules2" ref="ruleForm2Ref" label-position="left" label-width="0px"
           class="demo-ruleForm login-container">
    <h3 class="title">{{$t('m.Welcome_to_Login')}}</h3>
    <el-form-item prop="account">
      <el-input type="text" v-model="ruleForm2.account" autocomplete="off" :placeholder="$t('m.username')" @keyup.enter="handleLogin"></el-input>
    </el-form-item>
    <el-form-item prop="password">
      <el-input type="password" v-model="ruleForm2.password" autocomplete="off" :placeholder="$t('m.password')" @keyup.enter="handleLogin"></el-input>
    </el-form-item>
    <el-form-item style="width:100%;">
      <el-button type="primary" style="width:100%;" @click="handleLogin" :loading="logining">{{$t('m.GO')}}
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAdminStore } from '@/stores/admin'
  import { ElMessage } from 'element-plus'

  export default {
    name: 'Login',
    setup() {
      const router = useRouter()
      const adminStore = useAdminStore()
      const ruleForm2Ref = ref(null)
      
      return {
        router,
        adminStore,
        ruleForm2Ref
      }
    },
    data () {
      return {
        logining: false,
        ruleForm2: {
          account: '',
          password: ''
        },
        rules2: {
          account: [
            {required: true, trigger: 'blur'}
          ],
          password: [
            {required: true, trigger: 'blur'}
          ]
        },
        checked: true
      }
    },
    methods: {
      handleLogin () {
        this.ruleForm2Ref.validate(async (valid) => {
          if (valid) {
            this.logining = true
            try {
              await this.adminStore.login(this.ruleForm2.account, this.ruleForm2.password)
              this.router.push({name: 'dashboard'})
            } catch (error) {
              // Error message already shown by API
            } finally {
              this.logining = false
            }
          } else {
            this.$error('Please check the error fields')
          }
        })
      }
    }
  }
</script>

<style lang="less" scoped>
  .login-container {
    /*box-shadow: 0 0px 8px 0 rgba(0, 0, 0, 0.06), 0 1px 0px 0 rgba(0, 0, 0, 0.02);*/
    -webkit-border-radius: 5px;
    border-radius: 5px;
    -moz-border-radius: 5px;
    background-clip: padding-box;
    margin: 180px auto;
    width: 350px;
    padding: 35px 35px 15px 35px;
    background: #fff;
    border: 1px solid #eaeaea;
    box-shadow: 0 0 25px #cac6c6;
    .title {
      margin: 0px auto 40px auto;
      text-align: center;
      color: #505458;
    }
    .remember {
      margin: 0px 0px 35px 0px;
    }
  }
</style>
