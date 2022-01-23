const { format } = require('date-fns')

const getRandom = (n, m) => {
  return Math.floor(Math.random() * (m - n + 1) + n)
}

const getEnv = name => {
  return process.env[name] || ''
}

const formatDate = (date = Date.now(), f = 'yyyy-MM-dd HH:mm:ss') => {
  return format(date, f)
}

const getPlatform = name => {
  if (!name) return {}
  switch (name) {
    case 'JUEJIN':
      return {
        platform: name,
        platform_zh: '掘金',
        platform_sc: 'juejin'
      }
    case 'SMZDM':
      return {
        platform: name,
        platform_zh: '什么值得买',
        platform_sc: 'smzdm'
      }
  }
}

const getTitleText = name => {
  return `${getPlatform(name).platform_zh}签到 ${formatDate()}`
}

const getErrorText = msg => {
  return `签到异常❌\n${msg}`
}

const sleep = time => {
  return new Promise(resolve => setTimeout(resolve, time))
}

const expiredCookie = '登录状态已过期❌'
const noCookie = '未填写Cookie❌'
const sleepTime = getRandom(5000, 10000)

module.exports = {
  getRandom,
  getEnv,
  formatDate,
  getTitleText,
  getErrorText,
  getPlatform,
  sleep,
  expiredCookie,
  noCookie,
  sleepTime
}
