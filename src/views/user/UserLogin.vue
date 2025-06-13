<template>
  <div>
    <Form ref="formLogin" :model="formInput" :rules="formRules" @submit.prevent="handleSubmit">
      <FormItem prop="username">
        <Input v-model="formInput.username" type="text" :placeholder="t('Username')">
          <template #prepend>
            <Icon type="ios-person-outline"></Icon>
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
      <FormItem>
        <Button type="primary" long @click="handleSubmit" :loading="loading">
          {{ t('Login') }}
        </Button>
      </FormItem>
    </Form>
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useAppStore } from '@/stores/appStore';
// import { useRouter } from 'vue-router'; // Removed as router is not used directly here
import { useI18n } from 'vue-i18n';
// Assuming View UI Plus components are globally registered or imported as needed
// For Button, Form, FormItem, Input, Icon

const { t } = useI18n();
const userStore = useUserStore();
const appStore = useAppStore();
// const router = useRouter(); // Removed

const formLogin = ref(null); // Ref for the form instance
const formInput = ref({
  username: '',
  password: '',
});
const loading = ref(false);
const errorMessage = ref('');

const formRules = {
  username: [{ required: true, message: t('Username_is_required'), trigger: 'blur' }],
  password: [{ required: true, message: t('Password_is_required'), trigger: 'blur' }],
};

const handleSubmit = async () => {
  const valid = await formLogin.value.validate();
  if (valid) {
    loading.value = true;
    errorMessage.value = '';
    try {
      await userStore.login({
        username: formInput.value.username,
        password: formInput.value.password
      });
      appStore.closeModal();
      // Optional: Redirect to a specific page after login, e.g., home or user dashboard
      // If redirection is needed, re-add useRouter and router.push('/'); 
    } catch (error) {
      // Handle specific error cases
      if (error.response) {
        switch (error.response.status) {
          case 400:
            errorMessage.value = t('Invalid_username_or_password');
            break;
          case 401:
            errorMessage.value = t('Authentication_failed');
            break;
          case 403:
            errorMessage.value = t('Account_disabled');
            break;
          default:
            errorMessage.value = error.response.data?.message || t('Login_failed_Please_try_again');
        }
      } else if (error.request) {
        errorMessage.value = t('Network_error_Please_check_your_connection');
      } else {
        errorMessage.value = error.message || t('Login_failed_Please_check_your_credentials');
      }
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
/* Add any specific styles for login form */
</style> 