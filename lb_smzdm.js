/**
 * 什么值得买签到
 * 0 0 * * *
 */

const axios = require('axios')
const {
  getEnv,
  getTitleText,
  getErrorText,
  getPlatform,
  expiredCookie,
  noCookie
} = require('./utils/index')
const { getUserAgent } = require('./utils/userAgent')
const { sendNotify } = require('./utils/sendNotify')

const API = 'https://zhiyou.smzdm.com/user/checkin/jsonp_checkin'
const PLATFORM = getPlatform('SMZDM').name
const titleText = getTitleText(PLATFORM)
const Cookie = getEnv(`COOKIE_${PLATFORM}`)

const defaultOptions = {
  headers: {
    Cookie,
    Referer: 'https://www.smzdm.com/',
    Host: 'www.smzdm.com',
    'User-Agent': getUserAgent(PLATFORM)
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
    const { checkin_num } = await checkIn()
    msg.push(`签到成功：已连续签到${checkin_num}天✔️`)
  } catch (error) {}
  if (msg.length) {
    if (msg.length) {
      sendNotify(titleText, msg.join('\n'))
    }
  }
})()
