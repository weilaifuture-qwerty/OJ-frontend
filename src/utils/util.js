export function buildProblemCodeKey (problemID, contestID = null, language = null) {
  if (language) {
    return `problem_${problemID}_${contestID}_${language}`
  }
  return `problem_${problemID}_${contestID}`
}

export function getLanguages () {
  return Promise.resolve([
    { name: 'C++', content_type: 'text/x-csrc' },
    { name: 'C', content_type: 'text/x-csrc' },
    { name: 'Java', content_type: 'text/x-java' },
    { name: 'Python2', content_type: 'text/x-python' },
    { name: 'Python3', content_type: 'text/x-python' }
  ])
}

export function getTheme () {
  return localStorage.getItem('theme') || 'solarized'
}

export function setTheme (theme) {
  localStorage.setItem('theme', theme)
}

export function getLanguage () {
  return localStorage.getItem('language') || 'C++'
}

export function setLanguage (language) {
  localStorage.setItem('language', language)
}

export function title (title) {
  window.document.title = title ? `${title} - Online Judge` : 'Online Judge'
}

const util = {
  buildProblemCodeKey,
  getLanguages,
  getTheme,
  setTheme,
  getLanguage,
  setLanguage,
  title
}

export default util 