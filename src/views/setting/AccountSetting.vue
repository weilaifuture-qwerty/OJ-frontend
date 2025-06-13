<template>
  <div class="account-setting">
    <Card>
      <template #title>
        <h2>{{ t('Account_Settings') }}</h2>
      </template>

      <!-- Email Change Section -->
      <div class="section">
        <h3>{{ t('Change_Email') }}</h3>
        <div v-if="!emailVerificationPending">
          <Form ref="formEmail" :model="emailForm" :rules="emailRules" @submit.prevent="handleEmailChange">
            <FormItem prop="newEmail">
              <Input v-model="emailForm.newEmail" type="email" :placeholder="t('New_Email')">
                <template #prepend>
                  <Icon type="ios-mail-outline"></Icon>
                </template>
              </Input>
            </FormItem>
            <FormItem prop="password">
              <Input v-model="emailForm.password" type="password" :placeholder="t('Current_Password')">
                <template #prepend>
                  <Icon type="ios-lock-outline"></Icon>
                </template>
              </Input>
            </FormItem>
            <FormItem>
              <Button type="primary" @click="handleEmailChange" :loading="emailLoading">
                {{ t('Change_Email') }}
              </Button>
            </FormItem>
          </Form>
        </div>
        <div v-else>
          <p>{{ t('Email_verification_pending') }}</p>
          <p>{{ t('New_email') }}: {{ pendingEmail }}</p>
          <Button type="primary" @click="resendVerificationEmail" :loading="resendLoading">
            {{ t('Resend_Verification_Email') }}
          </Button>
        </div>
        <div v-if="emailMessage" :class="{ 'success-message': emailSuccess, 'error-message': !emailSuccess }">
          {{ emailMessage }}
        </div>
      </div>

      <!-- Account Deletion Section -->
      <div class="section danger-zone">
        <h3>{{ t('Danger_Zone') }}</h3>
        <div class="danger-content">
          <div class="danger-text">
            <h4>{{ t('Delete_Account') }}</h4>
            <p>{{ t('Delete_account_warning') }}</p>
          </div>
          <Button type="error" @click="showDeleteConfirm">
            {{ t('Delete_Account') }}
          </Button>
        </div>
      </div>
    </Card>

    <!-- Delete Account Confirmation Modal -->
    <Modal
      v-model="showDeleteModal"
      :title="t('Confirm_Account_Deletion')"
      @on-ok="handleAccountDeletion"
      @on-cancel="showDeleteModal = false"
    >
      <div class="delete-confirmation">
        <p>{{ t('Delete_account_confirmation') }}</p>
        <Form ref="formDelete" :model="deleteForm" :rules="deleteRules">
          <FormItem prop="confirmation">
            <Input
              v-model="deleteForm.confirmation"
              type="text"
              :placeholder="t('Type_DELETE_to_confirm')"
            />
          </FormItem>
          <FormItem prop="password">
            <Input
              v-model="deleteForm.password"
              type="password"
              :placeholder="t('Enter_your_password')"
            />
          </FormItem>
        </Form>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import api from '@/api';

const { t } = useI18n();
const router = useRouter();
const userStore = useUserStore();

// Email Change
const formEmail = ref(null);
const emailForm = ref({
  newEmail: '',
  password: '',
});
const emailLoading = ref(false);
const emailMessage = ref('');
const emailSuccess = ref(false);
const emailVerificationPending = ref(false);
const pendingEmail = ref('');
const resendLoading = ref(false);

const emailRules = {
  newEmail: [
    { required: true, message: t('Email_is_required'), trigger: 'blur' },
    { type: 'email', message: t('Invalid_email_format'), trigger: 'blur' },
  ],
  password: [{ required: true, message: t('Password_is_required'), trigger: 'blur' }],
};

// Account Deletion
const showDeleteModal = ref(false);
const formDelete = ref(null);
const deleteForm = ref({
  confirmation: '',
  password: '',
});
const deleteRules = {
  confirmation: [
    {
      required: true,
      validator: (rule, value, callback) => {
        if (value !== 'DELETE') {
          callback(new Error(t('Please_type_DELETE_to_confirm')));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
  password: [{ required: true, message: t('Password_is_required'), trigger: 'blur' }],
};

const handleEmailChange = async () => {
  const valid = await formEmail.value.validate();
  if (valid) {
    emailLoading.value = true;
    emailMessage.value = '';
    emailSuccess.value = false;
    try {
      await api.changeEmail({
        new_email: emailForm.value.newEmail,
        password: emailForm.value.password,
      });
      emailMessage.value = t('Email_change_requested');
      emailSuccess.value = true;
      emailVerificationPending.value = true;
      pendingEmail.value = emailForm.value.newEmail;
      formEmail.value.resetFields();
    } catch (error) {
      if (error.response) {
        switch (error.response.status) {
          case 400:
            emailMessage.value = t('Invalid_email_or_password');
            break;
          case 409:
            emailMessage.value = t('Email_already_in_use');
            break;
          default:
            emailMessage.value = error.response.data?.message || t('Failed_to_change_email');
        }
      } else if (error.request) {
        emailMessage.value = t('Network_error_Please_check_your_connection');
      } else {
        emailMessage.value = error.message || t('Failed_to_change_email');
      }
      emailSuccess.value = false;
    } finally {
      emailLoading.value = false;
    }
  }
};

const resendVerificationEmail = async () => {
  resendLoading.value = true;
  try {
    await api.resendVerificationEmail();
    emailMessage.value = t('Verification_email_resent');
    emailSuccess.value = true;
  } catch (error) {
    emailMessage.value = error.response?.data?.message || t('Failed_to_resend_verification_email');
    emailSuccess.value = false;
  } finally {
    resendLoading.value = false;
  }
};

const showDeleteConfirm = () => {
  showDeleteModal.value = true;
  deleteForm.value = {
    confirmation: '',
    password: '',
  };
};

const handleAccountDeletion = async () => {
  const valid = await formDelete.value.validate();
  if (valid) {
    try {
      await api.deleteAccount({
        password: deleteForm.value.password,
      });
      await userStore.logout();
      router.push('/');
    } catch (error) {
      if (error.response) {
        switch (error.response.status) {
          case 400:
            emailMessage.value = t('Invalid_password');
            break;
          default:
            emailMessage.value = error.response.data?.message || t('Failed_to_delete_account');
        }
      } else if (error.request) {
        emailMessage.value = t('Network_error_Please_check_your_connection');
      } else {
        emailMessage.value = error.message || t('Failed_to_delete_account');
      }
      showDeleteModal.value = false;
    }
  }
};

onMounted(async () => {
  try {
    const profile = await api.getUserInfo();
    emailVerificationPending.value = profile.email_verification_pending || false;
    pendingEmail.value = profile.pending_email || '';
  } catch (error) {
    console.error('Failed to load email verification status:', error);
  }
});
</script>

<style scoped>
.account-setting {
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

.danger-zone {
  border: 1px solid #ff4d4f;
  border-radius: 4px;
  padding: 20px;
  margin-top: 40px;
}

.danger-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.danger-text h4 {
  color: #ff4d4f;
  margin-bottom: 8px;
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

.delete-confirmation {
  padding: 20px 0;
}
</style> 