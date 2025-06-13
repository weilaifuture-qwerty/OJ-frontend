<template>
  <div class="security-setting">
    <Card>
      <template #title>
        <h2>{{ t('Security_Settings') }}</h2>
      </template>

      <!-- Change Password Section -->
      <div class="section">
        <h3>{{ t('Change_Password') }}</h3>
        <Form ref="formPassword" :model="passwordForm" :rules="passwordRules" @submit.prevent="handlePasswordChange">
          <FormItem prop="oldPassword">
            <Input v-model="passwordForm.oldPassword" type="password" :placeholder="t('Current_Password')">
              <template #prepend>
                <Icon type="ios-lock-outline"></Icon>
              </template>
            </Input>
          </FormItem>
          <FormItem prop="newPassword">
            <Input v-model="passwordForm.newPassword" type="password" :placeholder="t('New_Password')">
              <template #prepend>
                <Icon type="ios-lock-outline"></Icon>
              </template>
            </Input>
          </FormItem>
          <FormItem prop="confirmPassword">
            <Input v-model="passwordForm.confirmPassword" type="password" :placeholder="t('Confirm_New_Password')">
              <template #prepend>
                <Icon type="ios-checkmark-circle-outline"></Icon>
              </template>
            </Input>
          </FormItem>
          <FormItem>
            <Button type="primary" @click="handlePasswordChange" :loading="passwordLoading">
              {{ t('Change_Password') }}
            </Button>
          </FormItem>
        </Form>
        <div v-if="passwordMessage" :class="{ 'success-message': passwordSuccess, 'error-message': !passwordSuccess }">
          {{ passwordMessage }}
        </div>
      </div>

      <!-- Two-Factor Authentication Section -->
      <div class="section">
        <h3>{{ t('Two_Factor_Authentication') }}</h3>
        <div v-if="!tfaEnabled">
          <p>{{ t('2FA_not_enabled') }}</p>
          <Button type="primary" @click="showTfaSetup" :loading="tfaLoading">
            {{ t('Enable_2FA') }}
          </Button>
        </div>
        <div v-else>
          <p>{{ t('2FA_enabled') }}</p>
          <Button type="error" @click="disableTfa" :loading="tfaLoading">
            {{ t('Disable_2FA') }}
          </Button>
        </div>
        <div v-if="tfaMessage" :class="{ 'success-message': tfaSuccess, 'error-message': !tfaSuccess }">
          {{ tfaMessage }}
        </div>
      </div>

      <!-- Active Sessions Section -->
      <div class="section">
        <h3>{{ t('Active_Sessions') }}</h3>
        <Table :columns="sessionColumns" :data="sessions" :loading="sessionsLoading">
          <template #action="{ row }">
            <Button type="error" size="small" @click="deleteSession(row.key)" :loading="row.deleting">
              {{ t('Terminate') }}
            </Button>
          </template>
        </Table>
      </div>
    </Card>

    <!-- 2FA Setup Modal -->
    <Modal v-model="showTfaModal" :title="t('Setup_2FA')" @on-ok="handleTfaSetup">
      <div v-if="tfaSetupStep === 1">
        <p>{{ t('Scan_QR_Code') }}</p>
        <div class="qr-code">
          <img :src="tfaQrCode" alt="2FA QR Code" v-if="tfaQrCode" />
        </div>
        <p>{{ t('Enter_verification_code') }}</p>
        <Input v-model="tfaCode" :placeholder="t('Verification_Code')" />
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import api from '@/api';

const { t } = useI18n();

// Password Change
const formPassword = ref(null);
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});
const passwordLoading = ref(false);
const passwordMessage = ref('');
const passwordSuccess = ref(false);

const validatePassConfirm = (rule, value, callback) => {
  if (value === '') {
    callback(new Error(t('Password_Confirmation_is_required')));
  } else if (value !== passwordForm.value.newPassword) {
    callback(new Error(t('Passwords_do_not_match')));
  } else {
    callback();
  }
};

const passwordRules = {
  oldPassword: [{ required: true, message: t('Current_password_is_required'), trigger: 'blur' }],
  newPassword: [
    { required: true, message: t('New_password_is_required'), trigger: 'blur' },
    { min: 6, message: t('Password_must_be_at_least_6_characters'), trigger: 'blur' },
  ],
  confirmPassword: [{ validator: validatePassConfirm, trigger: 'blur' }],
};

// 2FA
const tfaEnabled = ref(false);
const tfaLoading = ref(false);
const tfaMessage = ref('');
const tfaSuccess = ref(false);
const showTfaModal = ref(false);
const tfaSetupStep = ref(1);
const tfaQrCode = ref('');
const tfaCode = ref('');

// Sessions
const sessions = ref([]);
const sessionsLoading = ref(false);
const sessionColumns = [
  { title: t('Device'), key: 'device' },
  { title: t('IP_Address'), key: 'ip' },
  { title: t('Last_Active'), key: 'last_active' },
  { title: t('Action'), slot: 'action' },
];

const loadSessions = async () => {
  sessionsLoading.value = true;
  try {
    const response = await api.getSessions();
    sessions.value = response;
  } catch (error) {
    console.error('Failed to load sessions:', error);
  } finally {
    sessionsLoading.value = false;
  }
};

const deleteSession = async (sessionKey) => {
  try {
    await api.deleteSession(sessionKey);
    await loadSessions();
  } catch (error) {
    console.error('Failed to delete session:', error);
  }
};

const handlePasswordChange = async () => {
  const valid = await formPassword.value.validate();
  if (valid) {
    passwordLoading.value = true;
    passwordMessage.value = '';
    passwordSuccess.value = false;
    try {
      await api.changePassword({
        old_password: passwordForm.value.oldPassword,
        new_password: passwordForm.value.newPassword,
      });
      passwordMessage.value = t('Password_changed_successfully');
      passwordSuccess.value = true;
      formPassword.value.resetFields();
    } catch (error) {
      if (error.response) {
        switch (error.response.status) {
          case 400:
            passwordMessage.value = t('Invalid_current_password');
            break;
          default:
            passwordMessage.value = error.response.data?.message || t('Failed_to_change_password');
        }
      } else if (error.request) {
        passwordMessage.value = t('Network_error_Please_check_your_connection');
      } else {
        passwordMessage.value = error.message || t('Failed_to_change_password');
      }
      passwordSuccess.value = false;
    } finally {
      passwordLoading.value = false;
    }
  }
};

const showTfaSetup = async () => {
  tfaSetupStep.value = 1;
  tfaCode.value = '';
  try {
    const response = await api.twoFactorAuth('get');
    tfaQrCode.value = response.qr_code;
    showTfaModal.value = true;
  } catch (error) {
    tfaMessage.value = t('Failed_to_get_2FA_setup');
    tfaSuccess.value = false;
  }
};

const handleTfaSetup = async () => {
  if (!tfaCode.value) {
    tfaMessage.value = t('Please_enter_verification_code');
    return;
  }
  tfaLoading.value = true;
  try {
    await api.twoFactorAuth('post', { code: tfaCode.value });
    tfaEnabled.value = true;
    tfaMessage.value = t('2FA_enabled_successfully');
    tfaSuccess.value = true;
    showTfaModal.value = false;
  } catch (error) {
    tfaMessage.value = error.response?.data?.message || t('Failed_to_enable_2FA');
    tfaSuccess.value = false;
  } finally {
    tfaLoading.value = false;
  }
};

const disableTfa = async () => {
  tfaLoading.value = true;
  try {
    await api.twoFactorAuth('delete');
    tfaEnabled.value = false;
    tfaMessage.value = t('2FA_disabled_successfully');
    tfaSuccess.value = true;
  } catch (error) {
    tfaMessage.value = error.response?.data?.message || t('Failed_to_disable_2FA');
    tfaSuccess.value = false;
  } finally {
    tfaLoading.value = false;
  }
};

onMounted(async () => {
  await loadSessions();
  // Check 2FA status
  try {
    const response = await api.tfaRequiredCheck();
    tfaEnabled.value = response.enabled;
  } catch (error) {
    console.error('Failed to check 2FA status:', error);
  }
});
</script>

<style scoped>
.security-setting {
  max-width: 800px;
  margin: 40px auto;
  padding: 0 20px;
}

.section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.section:last-child {
  border-bottom: none;
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

.qr-code {
  text-align: center;
  margin: 20px 0;
}

.qr-code img {
  max-width: 200px;
}
</style> 