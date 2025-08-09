import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useProblemStore = defineStore('problem', () => {
  const problemList = ref([])
  const problem = ref(null)
  const loading = ref(false)

  const getProblemList = computed(() => problemList.value)
  const getProblem = computed(() => problem.value)
  const isLoading = computed(() => loading.value)

  function setProblemList(list) {
    problemList.value = list
  }

  function setProblem(p) {
    problem.value = p
  }

  function setLoading(status) {
    loading.value = status
  }

  return {
    problemList,
    problem,
    loading,
    getProblemList,
    getProblem,
    isLoading,
    setProblemList,
    setProblem,
    setLoading
  }
})

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const token = ref(null)
  const loading = ref(false)

  const getUser = computed(() => user.value)
  const getToken = computed(() => token.value)
  const isLoading = computed(() => loading.value)

  function setUser(u) {
    user.value = u
  }

  function setToken(t) {
    token.value = t
  }

  function setLoading(status) {
    loading.value = status
  }

  return {
    user,
    token,
    loading,
    getUser,
    getToken,
    isLoading,
    setUser,
    setToken,
    setLoading
  }
})

export default {
  useProblemStore,
  useUserStore
}
