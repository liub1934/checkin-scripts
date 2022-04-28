/**
 * 娃哈哈Tea微信小程序积分签到
 * cron: 0 0 * * *
 */

const axios = require('axios')
const {
  getEnv,
  getTitleText,
  getErrorText,
  sleep,
  expiredCookie,
  sleepTime
} = require('./utils/index')
const { getUserAgent } = require('./utils/userAgent')
const { sendNotify } = require('./utils/sendNotify')

const API = 'https://webapi.qmai.cn/web/catering'
const platform = 'WAHAHA'
const platformName = '娃哈哈Tea'
const appid = 'wx621508020f94679c'
const activityId = getEnv(`${platform}_ACTIVITY_ID`)
const mobilePhone = getEnv(`${platform}_MOBILE_PHONE`)
const userName = getEnv(`${platform}_USER_NAME`)
const titleText = getTitleText(platformName)
const token = getEnv(`${platform}_TOKEN`)

const defaultOptions = {
  headers: {
    Referer: 'https://servicewechat.com/wx621508020f94679c/65/page-frame.html',
    Host: 'webapi.qmai.cn',
    'User-Agent': getUserAgent(platform),
    'store-id': '49703',
    'Qm-From-Type': 'catering',
    'Qm-From': 'wechat',
    'Qm-User-Token': token
  }
}

const request = (options = {}) => {
  options = { ...defaultOptions, ...options }
  return new Promise((resolve, reject) => {
    axios(options)
      .then((res) => {
        const data = res.data || {}
        switch (data.code) {
          case 0:
            resolve(data.data)
            break
          // 登录过期
          case 9001:
            sendNotify(titleText, expiredCookie)
            reject(data)
            break
          default:
            sendNotify(titleText, getErrorText(data.message))
            reject(data)
            break
        }
      })
      .catch((err) => {
        sendNotify(titleText, getErrorText(err.message))
        reject(err)
      })
  })
}

// 获取签到信息
function getCheckDetail() {
  return request({
    method: 'post',
    url: `${API}/integral/sign/detail`,
    data: { appid }
  })
}

// 获取积分数
function getPoints() {
  return request({
    method: 'post',
    url: `${API}/crm/total-points`,
    data: { appid }
  })
}

// 签到
function signIn() {
  return request({
    method: 'post',
    url: `${API}/integral/sign/signIn`,
    data: {
      appid,
      activityId,
      mobilePhone,
      userName
    }
  })
}

;(async () => {
  if (!token) {
    console.log('no token ❌')
    return
  }
  if (!activityId) {
    console.log('no activityId ❌')
    return
  }
  if (!mobilePhone) {
    console.log('no mobilePhone ❌')
    return
  }
  if (!userName) {
    console.log('no userName ❌')
    return
  }
  const msg = []
  try {
    await sleep(sleepTime)
    const { intraDay } = await getCheckDetail()
    const tip = intraDay === 1 ? '当前已签到过了' : '签到成功'
    if (intraDay !== 1) {
      await sleep(sleepTime)
      await signIn()
    }
    await sleep(sleepTime)
    const { totalDays, continuityTotal } = await getCheckDetail()
    const points = await getPoints()
    msg.push(
      `${tip}：已累计签到${totalDays}天，已连续签到${continuityTotal}天，当前积分${points}✔️`
    )
  } catch (error) {
    console.log('❌error❌', error)
  }
  if (msg.length) {
    sendNotify(titleText, msg.join('\n'))
  }
})()
