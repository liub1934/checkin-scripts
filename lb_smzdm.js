/**
 * 什么值得买签到
 * cron: 0 0 * * *
 */

const axios = require('axios')
const {
  getEnv,
  getTitleText,
  getErrorText,
  getPlatform,
  sleep,
  expiredCookie,
  noCookie,
  sleepTime
} = require('./utils/index')
const { getUserAgent } = require('./utils/userAgent')
const { sendNotify } = require('./utils/sendNotify')

const API = 'https://zhiyou.smzdm.com/user/checkin/jsonp_checkin'
const { platform } = getPlatform('SMZDM')
const titleText = getTitleText(platform)
const Cookie = getEnv(`${platform}_COOKIE`)

const defaultOptions = {
  headers: {
    Cookie,
    Referer: 'https://www.smzdm.com/',
    Host: 'zhiyou.smzdm.com',
    'User-Agent': getUserAgent(platform)
  }
}

const request = (options = {}) => {
  options = { ...defaultOptions, ...options }
  return new Promise((resolve, reject) => {
    axios(options)
      .then(res => {
        const data = res.data || {}
        switch (data.error_code) {
          case 0:
            resolve(data.data)
            break
          case 99:
            sendNotify(titleText, expiredCookie)
            reject(data)
            break
          default:
            sendNotify(titleText, getErrorText(data.err_msg))
            reject(data)
            break
        }
      })
      .catch(err => {
        sendNotify(titleText, getErrorText(err.message))
        reject(err)
      })
  })
}

// 签到
function checkIn () {
  return request({
    method: 'get',
    url: API
  })
}

;(async () => {
  if (!Cookie) {
    console.log(noCookie)
    return
  }
  const msg = []
  try {
    await sleep(sleepTime)
    const { checkin_num } = await checkIn()
    msg.push(`签到成功：已连续签到${checkin_num}天✔️`)
  } catch (error) {
    console.log('❌error❌', error)
  }
  if (msg.length) {
    if (msg.length) {
      sendNotify(titleText, msg.join('\n'))
    }
  }
})()
