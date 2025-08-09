import api from '@/api'
import types from '../types'

const state = {
  problems: [],
  currentProblem: null,
  total: 0,
  loading: false,
  error: null
}

const mutations = {
  [types.SET_PROBLEMS](state, problems) {
    state.problems = problems
  },
  [types.SET_CURRENT_PROBLEM](state, problem) {
    state.currentProblem = problem
  },
  [types.SET_TOTAL](state, total) {
    state.total = total
  },
  [types.SET_LOADING](state, loading) {
    state.loading = loading
  },
  [types.SET_ERROR](state, error) {
    state.error = error
  }
}

const actions = {
  async fetchProblems({ commit }, params) {
    commit(types.SET_LOADING, true)
    try {
      const response = await api.getProblems(params)
      commit(types.SET_PROBLEMS, response.data.data.results)
      commit(types.SET_TOTAL, response.data.data.total)
    } catch (error) {
      commit(types.SET_ERROR, error)
    } finally {
      commit(types.SET_LOADING, false)
    }
  },
  async fetchProblem({ commit }, problemId) {
    commit(types.SET_LOADING, true)
    try {
      const response = await api.getProblem(problemId)
      commit(types.SET_CURRENT_PROBLEM, response.data.data)
    } catch (error) {
      commit(types.SET_ERROR, error)
    } finally {
      commit(types.SET_LOADING, false)
    }
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
} 