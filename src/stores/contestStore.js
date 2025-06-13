import { defineStore } from 'pinia';
import moment from 'moment'; // Will need to ensure moment is installed in the new project
import { useUserStore } from './userStore'; // Import userStore
import api from '@/api'; // Import the real API service
import { CONTEST_STATUS, CONTEST_TYPE } from '@/utils/constants'; // Use real constants
// import { CONTEST_STATUS, USER_TYPE, CONTEST_TYPE } from '@/utils/constants'; // Placeholder

// Should come from constants file
// const CONTEST_STATUS = { NOT_START: 0, UNDERWAY: 1, ENDED: -1 };
// const CONTEST_TYPE = { PUBLIC: 'Public', PRIVATE: 'Private' };
// USER_TYPE removed as it's handled by userStore

// Forward declaration for useUserStore or import if circular dependencies are handled
// For now, we assume rootGetters.user and rootGetters.isAuthenticated will be passed or accessed differently

export const useContestStore = defineStore('contest', {
  state: () => ({
    now: moment(),
    access: false,
    rankLimit: 30,
    forceUpdate: false,
    contest: {
      created_by: {},
      contest_type: CONTEST_TYPE.PUBLIC, // Default to public using constant
      // other contest fields will be populated by API
    },
    contestProblems: [],
    itemVisible: {
      menu: true,
      chart: true,
      realName: false,
    },
    timerInterval: null, // Added to manage the interval timer
  }),
  getters: {
    contestLoaded: (state) => !!state.contest.id,
    contestStatus: (state) => {
      if (!state.contest.id) return null;
      const startTime = moment(state.contest.start_time);
      const endTime = moment(state.contest.end_time);
      const now = moment(state.now);
      if (startTime.isAfter(now)) return CONTEST_STATUS.NOT_START;
      if (endTime.isBefore(now)) return CONTEST_STATUS.ENDED;
      return CONTEST_STATUS.UNDERWAY;
    },
    contestRuleType: (state) => state.contest.rule_type || null,
    isContestAdmin() {
      const userStore = useUserStore();
      return userStore.isAuthenticated &&
             (this.contest.created_by.id === (userStore.user && userStore.user.id) || userStore.isSuperAdmin);
    },
    contestMenuDisabled() {
      if (this.isContestAdmin) return false;
      if (this.contest.contest_type === CONTEST_TYPE.PUBLIC) {
        return this.contestStatus === CONTEST_STATUS.NOT_START;
      }
      return !this.access;
    },
    OIContestRealTimePermission() {
      if (this.contestRuleType === 'ACM' || this.contestStatus === CONTEST_STATUS.ENDED) return true;
      return this.contest.real_time_rank === true || this.isContestAdmin;
    },
    problemSubmitDisabled() {
      const userStore = useUserStore();
      if (this.contestStatus === CONTEST_STATUS.ENDED) return true;
      if (this.contestStatus === CONTEST_STATUS.NOT_START && !this.isContestAdmin) return true;
      return !userStore.isAuthenticated;
    },
    passwordFormVisible: (state) => state.contest.contest_type !== CONTEST_TYPE.PUBLIC && !state.access && !(useUserStore().isAdminRole && state.contest.created_by.id === (useUserStore().user && useUserStore().user.id)), // simplified condition
    contestStartTime: (state) => moment(state.contest.start_time),
    contestEndTime: (state) => moment(state.contest.end_time),
    countdown() {
      if (this.contestStatus === CONTEST_STATUS.NOT_START) {
        const duration = moment.duration(this.contestStartTime.diff(this.now, 'seconds'), 'seconds');
        if (duration.asWeeks() >= 1) return `Start At ${this.contestStartTime.format('YYYY-MM-DD HH:mm:ss')}`;
        return `Starts in: ${[Math.floor(duration.asHours()), duration.minutes(), duration.seconds()].map(t => String(t).padStart(2, '0')).join(':')}`;
      }
      if (this.contestStatus === CONTEST_STATUS.UNDERWAY) {
        const duration = moment.duration(this.contestEndTime.diff(this.now, 'seconds'), 'seconds');
        return `Ends in: ${[Math.floor(duration.asHours()), duration.minutes(), duration.seconds()].map(t => String(t).padStart(2, '0')).join(':')}`;
      }
      return 'Ended';
    },
  },
  actions: {
    // Mutations are now actions or direct state changes
    changeContest(newContest) {
      this.contest = newContest;
    },
    changeContestItemVisible(payload) {
      this.itemVisible = { ...this.itemVisible, ...payload };
    },
    changeRankForceUpdate(value) {
      this.forceUpdate = value;
    },
    changeContestProblems(newProblems) {
      this.contestProblems = newProblems;
    },
    changeContestRankLimit(newLimit) {
      this.rankLimit = newLimit;
    },
    setContestAccess(accessStatus) {
      this.access = accessStatus;
    },
    clearContest() {
      this.stopContestTimer(); // Clear timer when contest is cleared
      this.contest = { created_by: {}, contest_type: CONTEST_TYPE.PUBLIC }; // Use constant
      this.contestProblems = [];
      this.access = false;
      this.itemVisible = { menu: true, chart: true, realName: false };
      this.forceUpdate = false;
    },
    updateNow() {
      this.now = moment();
    },
    tickNow() { // For countdown updates, if needed
      this.now = moment(this.now).add(1, 's');
    },

    async fetchContest(contestID) {
      try {
        const fetchedContest = await api.getContest(contestID); // Use real API
        this.contest = fetchedContest;
        // Sync internal now with server time from contest response, if available and reliable
        // Otherwise, using client's moment() might be fine if server times are also UTC
        if (fetchedContest.now) { 
          this.now = moment(fetchedContest.now); 
        } else {
          this.updateNow(); // Fallback to client time if server doesn't provide 'now'
        }
        
        if (fetchedContest.contest_type !== CONTEST_TYPE.PUBLIC && !this.isContestAdmin) {
          await this.fetchContestAccess(contestID); 
        }
        this.startContestTimer();
        return fetchedContest; 
      } catch (error) {
        console.error('Failed to fetch contest:', error.message || error);
        this.clearContest(); // Clear contest data on error
        this.stopContestTimer();
        throw error;
      }
    },
    async fetchContestProblems(contestID) {
      try {
        const problems = await api.getContestProblemList(contestID); // Use real API
        this.contestProblems = problems.sort((a, b) => {
          if (a._id === b._id) return 0;
          return a._id > b._id ? 1 : -1;
        });
        return problems;
      } catch (error) {
        console.error('Failed to fetch contest problems:', error.message || error);
        this.contestProblems = [];
        throw error;
      }
    },
    async fetchContestAccess(contestID) {
      try {
        const accessData = await api.getContestAccess(contestID); // Use real API
        this.access = accessData.access; // Assuming API returns {access: true/false}
        return accessData;
      } catch (error) {
        console.error('Failed to fetch contest access:', error.message || error);
        this.access = false; // Default to no access on error
        throw error;
      }
    },
    async checkContestPassword(contestID, password) {
      try {
        const response = await api.checkContestPassword(contestID, password); // Use real API
        // If password is correct, backend might grant access (e.g. session or flag)
        // Then, refetch contest access or contest details to update state
        await this.fetchContestAccess(contestID); // Re-check access status
        return response; // Original response might contain messages
      } catch (error) {
        console.error('Failed to check contest password:', error.message || error);
        throw error; // Let component handle specific error display
      }
    },
    // Initialize a timer for the countdown if it's active
    startContestTimer() {
      if (this.timerInterval) clearInterval(this.timerInterval);
      if (this.contestStatus === CONTEST_STATUS.ENDED) return; // Don't start if already ended
      this.timerInterval = setInterval(() => {
        if (this.contestStatus === CONTEST_STATUS.ENDED) {
          this.stopContestTimer();
        } else {
          this.tickNow();
        }
      }, 1000);
    },
    stopContestTimer() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
    }
  },
}); 