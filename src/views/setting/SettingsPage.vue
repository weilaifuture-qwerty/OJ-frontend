<template>
  <div class="settings-page">
    <Row :gutter="20">
      <Col :span="6">
        <Card>
          <Menu mode="vertical" :active-name="activeSetting" @on-select="handleSelect">
            <MenuItem name="profile">
              <Icon type="ios-person-outline" />
              {{ t('Profile_Settings') }}
            </MenuItem>
            <MenuItem name="account">
              <Icon type="ios-mail-outline" />
              {{ t('Account_Settings') }}
            </MenuItem>
            <MenuItem name="security">
              <Icon type="ios-lock-outline" />
              {{ t('Security_Settings') }}
            </MenuItem>
            <MenuItem name="timezone">
              <Icon type="ios-time-outline" />
              {{ t('Timezone_Settings') }}
            </MenuItem>
          </Menu>
        </Card>
      </Col>
      <Col :span="18">
        <router-view></router-view>
      </Col>
    </Row>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

export default {
  name: 'SettingsPage'
};
</script>

<script setup>
const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const activeSetting = ref('profile');

const handleSelect = (name) => {
  router.push(`/setting/${name}`);
};

onMounted(() => {
  // Set active menu based on current route
  const path = route.path.split('/').pop();
  activeSetting.value = path || 'profile';
});
</script>

<style scoped>
.settings-page {
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
}

.ivu-menu-vertical {
  height: auto;
}
</style> 