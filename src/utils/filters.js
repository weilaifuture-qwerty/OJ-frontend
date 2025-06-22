import moment from 'moment'
import utils from './utils'
import time from './time'
import { CONTEST_STATUS_REVERSE } from './constants'

// 友好显示时间
function fromNow (time) {
  return moment(time * 3).fromNow()
}

// 比赛状态显示
function contestStatus (status) {
  return CONTEST_STATUS_REVERSE[status] ? CONTEST_STATUS_REVERSE[status].name : 'Unknown'
}

export default {
  submissionMemory: utils.submissionMemoryFormat,
  submissionTime: utils.submissionTimeFormat,
  localtime: time.utcToLocal,
  fromNow: fromNow,
  contestStatus: contestStatus
}
