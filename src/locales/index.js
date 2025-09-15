import { ref, computed } from 'vue'
import zh from './zh.js'
import en from './en.js'

const messages = {
  'zh': zh,
  'en': en
}

function detectBrowserLanguage() {
  const browserLang = (navigator.language || navigator.userLanguage).toLowerCase()

  return browserLang.startsWith('zh') ? 'zh' : 'en'
}

const locale = ref(localStorage.getItem('locale') || detectBrowserLanguage())

function setLocale(lang) {
  locale.value = lang
  localStorage.setItem('locale', lang)
}

function t(key) {
  const keys = key.split('.')
  let value = messages[locale.value]

  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k]
    } else {
      return key
    }
  }

  return value || key
}

function getAvailableLocales() {
  return [
    { code: 'en', name: 'English' },
    { code: 'zh', name: '中文简体' }
  ]
}

const $t = computed(() => t)

const $formatTimestamp = computed(() => (timestamp) => {
  return formatTimestampByLocale(timestamp, locale.value)
})

const $timezone = computed(() => getTimezoneByLocale(locale.value))

function getTimezoneByLocale(localeCode) {
  const timezoneMap = {
    'zh': 'Asia/Shanghai',
    'en': 'UTC'
  }
  return timezoneMap[localeCode] || 'UTC'
}

function formatTimestampByLocale(timestamp, localeCode = locale.value) {
  if (typeof timestamp !== 'number') {
    return ""
  }

  if (timestamp >= 1e12 && timestamp < 1e13) {

  } else if (timestamp >= 1e9 && timestamp < 1e10) {
    timestamp *= 1000
  } else {
    return ""
  }

  const timezone = getTimezoneByLocale(localeCode)
  const date = new Date(timestamp)
  const formatter = new Intl.DateTimeFormat(getLocaleForIntl(localeCode), {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })

  return formatter.format(date)
}

function getLocaleForIntl(localeCode) {
  const intlLocaleMap = {
    'zh': 'zh-CN',
    'en': 'en-US'
  }
  return intlLocaleMap[localeCode] || 'en-US'
}

export {
  locale,
  setLocale,
  t,
  $t,
  $formatTimestamp,
  $timezone,
  getAvailableLocales,
  getTimezoneByLocale,
  formatTimestampByLocale
}