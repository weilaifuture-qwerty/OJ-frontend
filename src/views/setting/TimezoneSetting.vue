<template>
  <div class="timezone-setting">
    <Card>
      <template #title>
        <h2>{{ t('Timezone_Settings') }}</h2>
      </template>
      <Form ref="formTimezone" :model="formInput" :rules="formRules" @submit.prevent="handleSubmit">
        <FormItem prop="timezone">
          <Select v-model="formInput.timezone" :placeholder="t('Select_Timezone')">
            <Option v-for="tz in timezones" :key="tz.value" :value="tz.value">
              {{ tz.label }}
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
import { time } from '@/utils/time';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(timezone);

const { t } = useI18n();
const formTimezone = ref(null);
const formInput = ref({
  timezone: '',
});
const loading = ref(false);
const message = ref('');
const isSuccess = ref(false);

// Get all available timezones
const timezones = ref([]);

const formRules = {
  timezone: [
    { required: true, message: t('Timezone_is_required'), trigger: 'change' },
  ],
};

const loadTimezones = () => {
  // Get all timezones from dayjs
  const allTimezones = dayjs.tz.names();
  timezones.value = allTimezones.map(tz => ({
    value: tz,
    label: tz
  }));
};

const loadCurrentTimezone = () => {
  // Get current timezone from localStorage or use browser's timezone
  const savedTimezone = localStorage.getItem('user-timezone');
  formInput.value.timezone = savedTimezone || time.getUserTimezone();
};

const handleSubmit = async () => {
  const valid = await formTimezone.value.validate();
  if (valid) {
    loading.value = true;
    message.value = '';
    isSuccess.value = false;
    try {
      // Save timezone to localStorage
      localStorage.setItem('user-timezone', formInput.value.timezone);
      message.value = t('Timezone_updated_successfully');
      isSuccess.value = true;
    } catch (error) {
      message.value = error.message || t('Failed_to_update_timezone');
      isSuccess.value = false;
    } finally {
      loading.value = false;
    }
  }
};

onMounted(() => {
  loadTimezones();
  loadCurrentTimezone();
});
</script>

<style scoped>
.timezone-setting {
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