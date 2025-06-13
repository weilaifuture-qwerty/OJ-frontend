import { defineStore } from 'pinia';
import api from '@/api';

export const useSubmissionStore = defineStore('submission', {
  state: () => ({
    submissions: [],         // For lists of submissions
    totalSubmissions: 0,   // For pagination of lists
    currentSubmission: null, // For a single submission's details & status polling
    isLoadingList: false,
    isLoadingDetails: false,
    error: null,
  }),
  getters: {
    // Example getter: get status text with proper i18n
    // You would need to import `t` from vue-i18n or pass it if used here
    // formattedStatus: (state) => (statusObject) => { 
    //   if (!statusObject) return 'N/A';
    //   // Assuming statusObject has a numeric code and potentially message
    //   // This logic would map codes to i18n keys
    //   return `Status: ${statusObject.result || statusObject.status}`;
    // }
  },
  actions: {
    async fetchSubmissions(offset = 0, limit = 20, params = {}) {
      this.isLoadingList = true;
      this.error = null;
      try {
        const response = await api.getSubmissionList(offset, limit, params);
        // Assuming API returns { results: [], total: X }
        this.submissions = response.results;
        this.totalSubmissions = response.total;
      } catch (err) {
        this.error = err.data?.message || err.message || 'Failed to fetch submissions';
        this.submissions = [];
        this.totalSubmissions = 0;
        console.error('Error fetching submissions:', err);
      } finally {
        this.isLoadingList = false;
      }
    },

    async fetchSubmissionDetails(submissionId) {
      this.isLoadingDetails = true;
      this.error = null;
      try {
        const response = await api.getSubmission(submissionId);
        this.currentSubmission = response; // API directly returns submission object
        return response; // Return for immediate use, e.g., in polling
      } catch (err) {
        this.error = err.data?.message || err.message || 'Failed to fetch submission details';
        // Don't clear currentSubmission if polling and an intermediate error occurs,
        // unless it's a 404 for example.
        if (err.response?.status === 404) {
            this.currentSubmission = null;
        }
        console.error(`Error fetching submission ${submissionId}:`, err);
        throw err; // Re-throw to allow caller to handle it, e.g., stop polling
      } finally {
        this.isLoadingDetails = false;
      }
    },

    clearCurrentSubmission() {
        this.currentSubmission = null;
    }
    // Potentially, an action to submit code could also live here
    // async submitCode(submissionData) { ... }
  },
}); 