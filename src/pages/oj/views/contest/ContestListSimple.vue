<template>
  <div class="contest-list">
    <Row type="flex" justify="space-around">
      <Col :span="24">
        <Card shadow>
          <template #title>
            <h2>Contest List</h2>
          </template>
          <div class="contest-content">
            <div v-if="loading">
              <p>Loading contests...</p>
            </div>
            <div v-else-if="contests.length === 0">
              <p>No contests available</p>
            </div>
            <div v-else>
              <Table :columns="columns" :data="contests"></Table>
            </div>
          </div>
        </Card>
      </Col>
    </Row>
  </div>
</template>

<script>
import api from '@oj/api'

export default {
  name: 'ContestList',
  data() {
    return {
      loading: false,
      contests: [],
      columns: [
        {
          title: 'ID',
          key: 'id',
          width: 80
        },
        {
          title: 'Title',
          key: 'title'
        },
        {
          title: 'Rule Type',
          key: 'rule_type',
          width: 120
        },
        {
          title: 'Contest Type',
          key: 'contest_type',
          width: 140
        },
        {
          title: 'Status',
          key: 'status',
          width: 100
        }
      ]
    }
  },
  mounted() {
    this.getContestList()
  },
  methods: {
    async getContestList() {
      this.loading = true
      try {
        const res = await api.getContestList(0, 10)
        this.contests = res.data.data.results
      } catch (error) {
        console.error('Failed to load contests:', error)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.contest-list {
  padding: 20px;
}

.contest-content {
  padding: 20px;
  text-align: center;
}
</style>