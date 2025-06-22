<template>
  <div class="mood-display" v-if="mood || emoji">
    <span v-if="emoji" class="mood-emoji">{{ emoji }}</span>
    <span v-if="mood" class="mood-text">{{ mood }}</span>
  </div>
</template>

<script>
export default {
  name: 'MoodDisplay',
  props: {
    mood: {
      type: String,
      default: ''
    },
    emoji: {
      type: String,
      default: ''
    }
  }
}
</script>

<style lang="less" scoped>
.mood-display {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: #f0f2f5;
  border-radius: 16px;
  font-size: 13px;
  color: #515a6e;
  
  .mood-emoji {
    font-size: 14px;
  }
  
  .mood-text {
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>