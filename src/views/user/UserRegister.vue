<template>
  <div>
    <Form ref="formRegister" :model="formInput" :rules="formRules" @submit.prevent="handleSubmit">
      <FormItem prop="username">
        <Input v-model="formInput.username" type="text" :placeholder="t('Username')">
          <template #prepend>
            <Icon type="ios-person-outline"></Icon>
          </template>
        </Input>
      </FormItem>
      <FormItem prop="email">
        <Input v-model="formInput.email" type="email" :placeholder="t('Email')">
          <template #prepend>
            <Icon type="ios-mail-outline"></Icon>
          </template>
        </Input>
      </FormItem>
      <FormItem prop="password">
        <Input v-model="formInput.password" type="password" :placeholder="t('Password')">
          <template #prepend>
            <Icon type="ios-lock-outline"></Icon>
          </template>
        </Input>
      </FormItem>
      <FormItem prop="passwordConfirm">
        <Input v-model="formInput.passwordConfirm" type="password" :placeholder="t('Password_Confirmation')">
          <template #prepend>
            <Icon type="ios-checkmark-circle-outline"></Icon>
          </template>
        </Input>
      </FormItem>
      <FormItem>
        <Button type="primary" long @click="handleSubmit" :loading="loading">
          {{ t('Register') }}
        </Button>
      </FormItem>
    </Form>
    <div v-if="message" :class="{ 'success-message': isSuccess, 'error-message': !isSuccess }">{{ message }}</div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useUserStore } from '@/stores/userStore';
// import { useAppStore } from '@/stores/appStore'; // Removed as appStore is not used
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const userStore = useUserStore();
// const appStore = useAppStore(); // Removed

const formRegister = ref(null);
const formInput = ref({
  username: '',
  email: '',
  password: '',
  passwordConfirm: '',
});
const loading = ref(false);
const message = ref('');
const isSuccess = ref(false);

const validatePassConfirm = (rule, value, callback) => {
  if (value === '') {
    callback(new Error(t('Password_Confirmation_is_required')));
  } else if (value !== formInput.value.password) {
    callback(new Error(t('Passwords_do_not_match')));
  } else {
    callback();
  }
};

const formRules = computed(() => ({
  username: [{ required: true, message: t('Username_is_required'), trigger: 'blur' }],
  email: [
    { required: true, message: t('Email_is_required'), trigger: 'blur' },
    { type: 'email', message: t('Invalid_email_format'), trigger: 'blur' },
  ],
  password: [{ required: true, message: t('Password_is_required'), trigger: 'blur' }],
  passwordConfirm: [{ validator: validatePassConfirm, trigger: 'blur' }],
}));

const handleSubmit = async () => {
  const valid = await formRegister.value.validate();
  if (valid) {
    loading.value = true;
    message.value = '';
    isSuccess.value = false;
    try {
      const response = await userStore.register({
        username: formInput.value.username,
        email: formInput.value.email,
        password: formInput.value.password,
      });
      message.value = response.message || t('Registration_successful_Please_login');
      isSuccess.value = true;
      formRegister.value.resetFields();
      // If appStore was used: appStore.closeModal(); or appStore.setModalStatus({ mode: 'login', visible: true });
    } catch (error) {
      // Handle specific error cases
      if (error.response) {
        switch (error.response.status) {
          case 400:
            if (error.response.data?.message) {
              message.value = error.response.data.message;
            } else if (error.response.data?.username) {
              message.value = t('Username_already_exists');
            } else if (error.response.data?.email) {
              message.value = t('Email_already_exists');
            } else {
              message.value = t('Invalid_registration_data');
            }
            break;
          case 409:
            message.value = t('Username_or_email_already_exists');
            break;
          default:
            message.value = error.response.data?.message || t('Registration_failed_Please_try_again');
        }
      } else if (error.request) {
        message.value = t('Network_error_Please_check_your_connection');
      } else {
        message.value = error.message || t('Registration_failed_Please_try_again');
      }
      isSuccess.value = false;
    } finally {
      loading.value = false;
    }
  }
};
</script>

<style scoped>
.error-message {
  color: red;
  margin-top: 10px;
}
.success-message {
  color: green;
  margin-top: 10px;
}
</style> 