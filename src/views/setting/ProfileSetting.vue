<template>
  <div class="profile-setting">
    <Card>
      <template #title>
        <h2>{{ t('Profile_Settings') }}</h2>
      </template>
      <Form ref="formProfile" :model="formInput" :rules="formRules" @submit.prevent="handleSubmit">
        <FormItem prop="real_name">
          <Input v-model="formInput.real_name" type="text" :placeholder="t('Real_Name')">
            <template #prepend>
              <Icon type="ios-person-outline"></Icon>
            </template>
          </Input>
        </FormItem>
        <FormItem prop="mood">
          <Input v-model="formInput.mood" type="textarea" :rows="3" :placeholder="t('Mood')">
            <template #prepend>
              <Icon type="ios-chatbubbles-outline"></Icon>
            </template>
          </Input>
        </FormItem>
        <FormItem prop="language">
          <Select v-model="formInput.language" :placeholder="t('Preferred_Language')">
            <Option v-for="lang in languages" :key="lang.value" :value="lang.value">
              {{ lang.label }}
            </Option>
          </Select>
        </FormItem>
        <FormItem>
          <Button type="primary" long @click="handleSubmit" :loading="loading">
            {{ t('Save_Changes') }}
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
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '@/stores/userStore';
import api from '@/api';

const { t } = useI18n();
const userStore = useUserStore();
const formProfile = ref(null);
const formInput = ref({
  real_name: '',
  mood: '',
  language: '',
});
const loading = ref(false);
const message = ref('');
const isSuccess = ref(false);

// Available languages - you might want to move this to a constants file
const languages = [
  { value: 'en', label: 'English' },
  { value: 'zh-CN', label: '简体中文' },
  // Add more languages as needed
];

const formRules = {
  real_name: [
    { max: 50, message: t('Real_name_cannot_exceed_50_characters'), trigger: 'blur' },
  ],
  mood: [
    { max: 200, message: t('Mood_cannot_exceed_200_characters'), trigger: 'blur' },
  ],
  language: [
    { required: true, message: t('Language_is_required'), trigger: 'change' },
  ],
};

const loadProfile = async () => {
  try {
    const profile = await api.getUserInfo();
    formInput.value = {
      real_name: profile.real_name || '',
      mood: profile.mood || '',
      language: profile.language || 'en',
    };
  } catch (error) {
    console.error('Failed to load profile:', error);
    message.value = t('Failed_to_load_profile');
    isSuccess.value = false;
  }
};

const handleSubmit = async () => {
  const valid = await formProfile.value.validate();
  if (valid) {
    loading.value = true;
    message.value = '';
    isSuccess.value = false;
    try {
      await api.updateProfile(formInput.value);
      message.value = t('Profile_updated_successfully');
      isSuccess.value = true;
      // Refresh user store profile
      await userStore.fetchProfile();
    } catch (error) {
      if (error.response) {
        message.value = error.response.data?.message || t('Failed_to_update_profile');
      } else if (error.request) {
        message.value = t('Network_error_Please_check_your_connection');
      } else {
        message.value = error.message || t('Failed_to_update_profile');
      }
      isSuccess.value = false;
    } finally {
      loading.value = false;
    }
  }
};

onMounted(() => {
  loadProfile();
});
</script>

<style scoped>
.profile-setting {
  max-width: 600px;
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