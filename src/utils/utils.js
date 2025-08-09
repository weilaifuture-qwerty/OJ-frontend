import { Message } from 'view-ui-plus'
import storage from '@/utils/storage'
import { STORAGE_KEY } from '@/utils/constants'
import api from '@/api'
import { JUDGE_STATUS, PROBLEM_DIFFICULTY } from './constants'
import axios from 'axios'

export function submissionMemoryFormat(memory) {
  if (memory === undefined) return '--'
  // 1048576 = 1024 * 1024
  let t = parseInt(memory) / 1048576
  return String(t.toFixed(0)) + 'MB'
}

export function submissionTimeFormat(time) {
  if (time === undefined) return '--'
  return time + 'ms'
}

export function getACRate(acCount, totalCount) {
  let rate = totalCount === 0 ? 0.00 : (acCount / totalCount * 100).toFixed(2)
  return String(rate) + '%'
}

export function filterEmptyValue(object) {
  let query = {}
  Object.keys(object).forEach(key => {
    if (object[key] || object[key] === 0 || object[key] === false) {
      query[key] = object[key]
    }
  })
  return query
}

export function breakLongWords(value, length = 16) {
  let re
  if (escape(value).indexOf('%u') === -1) {
    // 没有中文
    re = new RegExp('(.{' + length + '})', 'g')
  } else {
    // 中文字符
    re = new RegExp('(.{' + (length / 2 + 1) + '})', 'g')
  }
  return value.replace(re, '$1\n')
}

export function downloadFile(url) {
  return new Promise((resolve, reject) => {
    axios.get(url, {responseType: 'blob'}).then(resp => {
      let headers = resp.headers
      if (headers['content-type'].indexOf('json') !== -1) {
        let fr = new window.FileReader()
        if (resp.data.error) {
          Message.error(resp.data.error)
        } else {
          Message.error('Invalid file format')
        }
        fr.onload = (event) => {
          let data = JSON.parse(event.target.result)
          if (data.error) {
            Message.error(data.data)
          } else {
            Message.error('Invalid file format')
          }
        }
        let b = new window.Blob([resp.data], {type: 'application/json'})
        fr.readAsText(b)
        return
      }
      let link = document.createElement('a')
      link.href = window.URL.createObjectURL(new window.Blob([resp.data], {type: headers['content-type']}))
      link.download = (headers['content-disposition'] || '').split('filename=')[1]
      document.body.appendChild(link)
      link.click()
      link.remove()
      resolve()
    }).catch(() => {})
  })
}

export function getLanguages() {
  return new Promise((resolve, reject) => {
    let languages = storage.get(STORAGE_KEY.languages)
    if (languages) {
      resolve(languages)
    }
    api.getLanguages().then(res => {
      let languages = res.data.data.languages
      storage.set(STORAGE_KEY.languages, languages)
      resolve(languages)
    }, err => {
      reject(err)
    })
  })
}

export function buildProblemCodeKey(problemID, contestID = null) {
  if (contestID) {
    return `problem_${contestID}_${problemID}`
  }
  return `problem_NaN_${problemID}`
}

export function getJudgeStatus(status) {
  return JUDGE_STATUS[status] || {
    name: 'Unknown',
    short: 'UN',
    color: 'gray',
    type: 'info'
  }
}

export function getJudgeStatusColor(status) {
  return getJudgeStatus(status).color
}

export function getJudgeStatusType(status) {
  return getJudgeStatus(status).type
}

export function getJudgeStatusName(status) {
  return getJudgeStatus(status).name
}

export function getJudgeStatusShort(status) {
  return getJudgeStatus(status).short || getJudgeStatus(status).name
}

export function buildQuery(obj) {
  return Object.keys(obj)
    .filter(key => obj[key] !== '' && obj[key] !== null && obj[key] !== undefined)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
    .join('&')
}

export function formatDate(date) {
  if (!date) return '--'
  const d = new Date(date)
  return d.toLocaleString()
}

export function formatDuration(ms) {
  if (!ms) return '--'
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days}d ${hours % 24}h`
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  } else {
    return `${seconds}s`
  }
}

export function getDifficultyColor(difficulty) {
  switch (difficulty) {
    case PROBLEM_DIFFICULTY.EASY:
      return 'success'
    case PROBLEM_DIFFICULTY.MEDIUM:
      return 'warning'
    case PROBLEM_DIFFICULTY.HARD:
      return 'danger'
    default:
      return 'info'
  }
}

const utils = {
  submissionMemoryFormat,
  submissionTimeFormat,
  getACRate,
  filterEmptyValue,
  breakLongWords,
  downloadFile,
  getLanguages,
  buildProblemCodeKey,
  getJudgeStatus,
  getJudgeStatusColor,
  getJudgeStatusType,
  getJudgeStatusName,
  getJudgeStatusShort,
  buildQuery,
  formatDate,
  formatDuration,
  getDifficultyColor
}

export default utils
