<template>
  <div class="pagination-container">
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  total: {
    type: Number,
    required: true
  },
  page: {
    type: Number,
    default: 1
  },
  limit: {
    type: Number,
    default: 20
  }
})

const emit = defineEmits(['update:page', 'update:limit'])

const currentPage = ref(props.page)
const pageSize = ref(props.limit)

watch(() => props.page, (newVal) => {
  currentPage.value = newVal
})

watch(() => props.limit, (newVal) => {
  pageSize.value = newVal
})

const handleSizeChange = (val) => {
  emit('update:limit', val)
}

const handleCurrentChange = (val) => {
  emit('update:page', val)
}
</script>

<style scoped>
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style> 