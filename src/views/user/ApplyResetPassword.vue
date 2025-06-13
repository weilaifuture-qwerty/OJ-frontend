<template>
  <div class="apply-reset-password">
    <Card>
      <template #title>
        <h2>{{ t('Apply_Reset_Password') }}</h2>
      </template>
      <Form ref="formReset" :model="formInput" :rules="formRules" @submit.prevent="handleSubmit">
        <FormItem prop="email">
          <Input v-model="formInput.email" type="email" :placeholder="t('Email')">
            <template #prepend>
              <Icon type="ios-mail-outline"></Icon>
            </template>
          </Input>
        </FormItem>
        <FormItem>
          <Button type="primary" long @click="handleSubmit" :loading="loading">
            {{ t('Send_Reset_Email') }}
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
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import api from '@/api';

const { t } = useI18n();
const formReset = ref(null);
const formInput = ref({
  email: '',
});
const loading = ref(false);
const message = ref('');
const isSuccess = ref(false);

const formRules = {
  email: [
    { required: true, message: t('Email_is_required'), trigger: 'blur' },
    { type: 'email', message: t('Invalid_email_format'), trigger: 'blur' },
  ],
};

const handleSubmit = async () => {
  const valid = await formReset.value.validate();
  if (valid) {
    loading.value = true;
    message.value = '';
    isSuccess.value = false;
    try {
      await api.applyResetPassword({
        email: formInput.value.email,
      });
      message.value = t('Reset_password_email_sent');
      isSuccess.value = true;
      formReset.value.resetFields();
    } catch (error) {
      if (error.response) {
        switch (error.response.status) {
          case 400:
            message.value = t('Invalid_email_address');
            break;
          case 404:
            message.value = t('Email_not_found');
            break;
          default:
            message.value = error.response.data?.message || t('Failed_to_send_reset_email');
        }
      } else if (error.request) {
        message.value = t('Network_error_Please_check_your_connection');
      } else {
        message.value = error.message || t('Failed_to_send_reset_email');
      }
      isSuccess.value = false;
    } finally {
      loading.value = false;
    }
  }
};
</script>

<style scoped>
.apply-reset-password {
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