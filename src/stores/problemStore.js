import { defineStore } from 'pinia';
import api from '@/api';

export const useProblemStore = defineStore('problem', {
  state: () => ({
    problems: [],
    totalProblems: 0,
    problemTags: [],
    problem: null, // For storing a single problem's details
    languages: [], // For storing available programming languages
    isLoading: false,
    error: null,
  }),
  actions: {
    async fetchProblems(offset = 0, limit = 20, searchParams = {}) {
      this.isLoading = true;
      this.error = null;
      try {
        const params = { ...searchParams, offset, limit };
        const response = await api.getProblemList(params);
        this.problems = response.results; // Assuming API returns { results: [], total: X }
        this.totalProblems = response.total;
      } catch (error) {
        this.error = error.message || 'Failed to fetch problems';
        this.problems = [];
        this.totalProblems = 0;
        console.error('Error fetching problems:', error);
      } finally {
        this.isLoading = false;
      }
    },
    async fetchProblemTags() {
      this.isLoading = true;
      this.error = null;
      try {
        this.problemTags = await api.getProblemTagList();
      } catch (error) {
        this.error = error.message || 'Failed to fetch problem tags';
        this.problemTags = [];
        console.error('Error fetching problem tags:', error);
      } finally {
        this.isLoading = false;
      }
    },
    async fetchProblemDetails(problemID) {
      this.isLoading = true;
      this.error = null;
      try {
        this.problem = await api.getProblem(problemID);
      } catch (error) {
        this.error = error.message || 'Failed to fetch problem details';
        this.problem = null;
        console.error(`Error fetching problem ${problemID}:`, error);
      } finally {
        this.isLoading = false;
      }
    },
    // Action to pick one random problem
    async pickOneProblem() {
      this.isLoading = true;
      this.error = null;
      try {
        const problem = await api.pickOneProblem();
        // Assuming the API returns the problem ID or slug, then redirect or store
        // For now, let's just log it and potentially store its ID for navigation
        console.log('Picked problem:', problem);
        return problem; // Or problem.id / problem.problem_id depending on API response
      } catch (error) {
        this.error = error.message || 'Failed to pick a problem';
        console.error('Error picking one problem:', error);
        return null;
      } finally {
        this.isLoading = false;
      }
    },
    async fetchLanguages() {
      this.error = null; // Reset specific error if any
      try {
        const response = await api.getLanguages();
        // Assuming the API returns an array of language objects
        // E.g., [{ name: "C++", value: "cpp", mode: "text/x-c++src" }, ...]
        // Or, if it returns simple names/values, we might need to map them here.
        this.languages = response; 
      } catch (error) {
        this.error = error.message || 'Failed to fetch languages';
        this.languages = [];
        console.error('Error fetching languages:', error);
      }
    }
  },
}); 