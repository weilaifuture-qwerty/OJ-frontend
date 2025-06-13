<template>
  <Dropdown @on-click="handleLanguageChange">
    <Button type="text">
      {{ currentLanguageName }}
      <Icon type="ios-arrow-down"></Icon>
    </Button>
    <template #list>
      <DropdownMenu>
        <DropdownItem v-for="lang in availableLocales" 
                      :key="lang.code" 
                      :name="lang.code"
                      :selected="lang.code === currentLocale">
          {{ lang.name }}
        </DropdownItem>
      </DropdownMenu>
    </template>
  </Dropdown>
</template>

<script setup>
import { computed } from 'vue';
import { useI18nUtils } from '@/utils/i18n';

const { locale: currentLocale, changeLocale, availableLocales } = useI18nUtils();

const currentLanguageName = computed(() => {
  const lang = availableLocales.find(l => l.code === currentLocale.value);
  return lang ? lang.name : 'English';
});

const handleLanguageChange = (langCode) => {
  changeLocale(langCode);
};
</script>

<style scoped>
.ivu-dropdown {
  margin-left: 10px;
}
</style> 