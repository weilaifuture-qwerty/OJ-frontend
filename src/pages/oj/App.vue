<template>
  <div>
    <NavBar></NavBar>
    <div class="content-app">
      <router-view></router-view>
      <div class="footer">
        <p v-html="website.website_footer"></p>
        <p>Powered by <a href="https://github.com/QingdaoU/OnlineJudge">OnlineJudge</a>
          <span v-if="version">&nbsp; Version: {{ version }}</span>
        </p>
      </div>
    </div>
    <!-- <BackTop></BackTop> -->
    <!-- <LayoutDebugger /> -->
    <!-- <StylesheetMonitor /> -->
  </div>
</template>

<script>
  import { useWebsiteStore } from '@/stores/website'
  import { useContestStore } from '@/stores/contest'
  import NavBar from '@oj/components/NavBar.vue'
  // import LayoutDebugger from '@/components/LayoutDebugger.vue'
  // import StylesheetMonitor from '@/components/StylesheetMonitor.vue'
  import api from '@oj/api'

  export default {
    name: 'app',
    components: {
      NavBar
      // LayoutDebugger,
      // StylesheetMonitor
    },
    data () {
      return {
        version: import.meta.env.VERSION
      }
    },
    setup() {
      const websiteStore = useWebsiteStore()
      const contestStore = useContestStore()
      
      return {
        websiteStore,
        contestStore
      }
    },
    created () {
      try {
        document.body.removeChild(document.getElementById('app-loader'))
      } catch (e) {
      }
    },
    async mounted () {
      // Initialize session to get CSRF token
      try {
        // First, get CSRF token
        await api.getCSRFToken()
        
        // Then get website config
        await this.websiteStore.getWebsiteConfig()
      } catch (error) {
        console.error('Failed to initialize:', error)
      }
    },
    computed: {
      website() {
        return this.websiteStore.website
      }
    },
    watch: {
      'website' () {
        this.contestStore.changeDomTitle({ title: this.website.website_name })
      },
      '$route' () {
        this.contestStore.changeDomTitle({ title: this.$route.meta.title || this.website.website_name })
      }
    }
  }
</script>

<style lang="less">

  * {
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
  }

  a {
    text-decoration: none;
    background-color: transparent;
    &:active, &:hover {
      outline-width: 0;
    }
  }


  .content-app {
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    position: relative;
    box-sizing: border-box;
  }

  @media screen and (max-width: 1200px) {
    .content-app {
      margin-top: 60px;
      padding: 0 20px;
    }
  }

  @media screen and (min-width: 1200px) {
    .content-app {
      margin-top: 80px;
      padding: 0 20px;
    }
  }

  .footer {
    margin-top: 20px;
    margin-bottom: 10px;
    text-align: center;
    font-size: small;
  }

  .fadeInUp-enter-active {
    animation: fadeInUp .8s;
  }


</style>
