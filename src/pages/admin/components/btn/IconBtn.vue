<template>
  <div style="display: inline-block;">
    <el-tooltip class="item" effect="dark" :content="name" placement="top">
      <el-button plain :icon="getIconName(icon)" size="small">
        {{ name }}
      </el-button>
    </el-tooltip>
  </div>
</template>

<script>
  export default {
    name: 'IconBtn',
    props: {
      name: {
        type: String,
        required: true
      },
      icon: {
        type: String,
        required: true
      }
    },
    methods: {
      getIconName(icon) {
        // Map Font Awesome icon names to Element Plus icon names
        const iconMap = {
          'edit': 'Edit',
          'clone': 'CopyDocument',
          'download': 'Download',
          'trash': 'Delete',
          'plus': 'Plus',
          'eye': 'View'
        }
        return iconMap[icon] || 'Edit'
      }
    }
  }
</script>
