<template>
  <div class="reset-password">
    <Card>
      <template #title>
        <h2>{{ t('Reset_Password') }}</h2>
      </template>
      <Form ref="formReset" :model="formInput" :rules="formRules" @submit.prevent="handleSubmit">
        <FormItem prop="password">
          <Input v-model="formInput.password" type="password" :placeholder="t('New_Password')">
            <template #prepend>
              <Icon type="ios-lock-outline"></Icon>
            </template>
          </Input>
        </FormItem>
        <FormItem prop="passwordConfirm">
          <Input v-model="formInput.passwordConfirm" type="password" :placeholder="t('Confirm_New_Password')">
            <template #prepend>
              <Icon type="ios-checkmark-circle-outline"></Icon>
            </template>
          </Input>
        </FormItem>
        <FormItem>
          <Button type="primary" long @click="handleSubmit" :loading="loading">
            {{ t('Reset_Password') }}
          </Button>
        </FormItem>
      </Form>
      <div v-if="message" :class="{ 'success-message': isSuccess, 'error-message': !isSuccess }">
        {{ message }}
      </div>
    </Card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import api from '@/api';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const formReset = ref(null);
const formInput = ref({
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
  password: [
    { required: true, message: t('Password_is_required'), trigger: 'blur' },
    { min: 6, message: t('Password_must_be_at_least_6_characters'), trigger: 'blur' },
  ],
  passwordConfirm: [{ validator: validatePassConfirm, trigger: 'blur' }],
}));

const handleSubmit = async () => {
  const valid = await formReset.value.validate();
  if (valid) {
    loading.value = true;
    message.value = '';
    isSuccess.value = false;
    try {
      await api.resetPassword({
        token: route.params.token,
        password: formInput.value.password,
      });
      message.value = t('Password_reset_successful');
      isSuccess.value = true;
      formReset.value.resetFields();
      // Redirect to login after successful reset
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      if (error.response) {
        switch (error.response.status) {
          case 400:
            message.value = t('Invalid_or_expired_reset_token');
            break;
          case 401:
            message.value = t('Reset_token_expired');
            break;
          default:
            message.value = error.response.data?.message || t('Failed_to_reset_password');
        }
      } else if (error.request) {
        message.value = t('Network_error_Please_check_your_connection');
      } else {
        message.value = error.message || t('Failed_to_reset_password');
      }
      isSuccess.value = false;
    } finally {
      loading.value = false;
    }
  }
};
</script>

<style scoped>
.reset-password {
  max-width: 400px;
  margin: 40px auto;
  padding: 0 20px;
}

.success-message {
  color: green;
  margin-top: 10px;
  text-align: center;
}

.error-message {
  color: red;
  margin-top: 10px;
  text-align: center;
}
</style> 