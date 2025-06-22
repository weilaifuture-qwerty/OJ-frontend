<template>
  <Card :padding="0" dis-hover>
    <ul class="contest-menu">
      <li 
        v-for="item in menuItems" 
        :key="item.name"
        @click="handleClick(item)"
        :class="{ disabled: item.disabled, active: isActive(item) }"
      >
        <Icon :type="item.icon"></Icon>
        {{ item.title }}
      </li>
    </ul>
  </Card>
</template>

<script>
import { Card, Icon } from 'view-ui-plus'

export default {
  name: 'ContestMenu',
  components: {
    Card,
    Icon
  },
  props: {
    contestID: {
      type: String,
      required: true
    },
    contestMenuDisabled: {
      type: Boolean,
      default: false
    },
    OIContestRealTimePermission: {
      type: Boolean,
      default: false
    },
    showAdminHelper: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    menuItems() {
      const items = [
        {
          name: 'contest-details',
          route: { name: 'contest-details', params: { contestID: this.contestID } },
          icon: 'md-home',
          title: this.$t('m.Overview'),
          disabled: false
        },
        {
          name: 'contest-announcement-list',
          route: { name: 'contest-announcement-list', params: { contestID: this.contestID } },
          icon: 'md-chatbubbles',
          title: this.$t('m.Announcements'),
          disabled: this.contestMenuDisabled
        },
        {
          name: 'contest-problem-list',
          route: { name: 'contest-problem-list', params: { contestID: this.contestID } },
          icon: 'md-photos',
          title: this.$t('m.Problems'),
          disabled: this.contestMenuDisabled
        }
      ]

      if (this.OIContestRealTimePermission) {
        items.push({
          name: 'contest-rank',
          route: { name: 'contest-rank', params: { contestID: this.contestID } },
          icon: 'md-stats',
          title: this.$t('m.Rankings'),
          disabled: this.contestMenuDisabled
        })
      }

      if (this.showAdminHelper) {
        items.push({
          name: 'acm-helper',
          route: { name: 'acm-helper', params: { contestID: this.contestID } },
          icon: 'md-paw',
          title: this.$t('m.Admin_Helper'),
          disabled: false
        })
      }

      return items
    }
  },
  methods: {
    handleClick(item) {
      if (!item.disabled && item.route) {
        this.$router.push(item.route)
      }
    },
    isActive(item) {
      return this.$route.name === item.name
    }
  }
}
</script>

<style scoped lang="less">
.contest-menu {
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    border-bottom: 1px dashed #e9eaec;
    color: #495060;
    display: block;
    text-align: left;
    padding: 15px 20px;
    cursor: pointer;
    transition: all 0.2s ease-in-out;

    &:hover:not(.disabled) {
      background: #f8f8f9;
      border-left: 2px solid #5cadff;
      color: #2d8cf0;
      padding-left: 18px;
    }

    &.active {
      background: #f0faff;
      border-left: 2px solid #2d8cf0;
      color: #2d8cf0;
      padding-left: 18px;
    }

    &.disabled {
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
      color: #ccc;
    }

    & > .ivu-icon {
      font-size: 16px;
      margin-right: 8px;
    }

    &:last-child {
      border-bottom: none;
    }
  }
}
</style>