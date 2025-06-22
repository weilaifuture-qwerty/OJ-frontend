<template>
  <div>
    <Panel shadow>
      <template #title>{{$t('m.Announcements')}}</template>
      <div v-if="!announcements.length" style="text-align: center; padding: 50px;">
        {{$t('m.No_Announcements')}}
      </div>
      <template v-else>
        <ul class="announcements-list">
          <li v-for="announcement in announcements" :key="announcement.id">
            <div class="flex-container">
              <div class="title">
                <h3>{{ announcement.title }}</h3>
              </div>
              <div class="date">
                {{ getTimeFormat(announcement.create_time) }}
              </div>
              <div class="creator">
                {{ $t('m.By') }} {{ announcement.created_by.username }}
              </div>
            </div>
            <div class="content" v-html="announcement.content"></div>
          </li>
        </ul>
      </template>
    </Panel>
  </div>
</template>

<script>
import api from '@oj/api'
import time from '@/utils/time'
import Panel from '@/pages/oj/components/Panel.vue'

export default {
  name: 'ContestAnnouncements',
  components: {
    Panel
  },
  data() {
    return {
      announcements: []
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      api.getContestAnnouncementList(this.$route.params.contestID).then(res => {
        this.announcements = res.data.data
      })
    },
    getTimeFormat(value) {
      return time.utcToLocal(value, 'YYYY-MM-DD HH:mm')
    }
  }
}
</script>

<style scoped lang="less">
.announcements-list {
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    padding: 20px;
    border-bottom: 1px solid #e9eaec;

    &:last-child {
      border-bottom: none;
    }

    .flex-container {
      display: flex;
      align-items: baseline;
      margin-bottom: 10px;

      .title {
        flex: 1;
        
        h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 500;
        }
      }

      .date {
        color: #8c8c8c;
        font-size: 14px;
        margin-right: 20px;
      }

      .creator {
        color: #8c8c8c;
        font-size: 14px;
      }
    }

    .content {
      color: #515a6e;
      line-height: 1.6;
      
      /deep/ p {
        margin: 10px 0;
      }
    }
  }
}
</style>