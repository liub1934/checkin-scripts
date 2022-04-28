/**
 * 悸动烧仙草微信小程序积分签到
 * cron: 0 0 * * *
 */

const axios = require('axios')
const {
  getEnv,
  getTitleText,
  getErrorText,
  sleep,
  sleepTime
} = require('./utils/index')
const { getUserAgent } = require('./utils/userAgent')
const { sendNotify } = require('./utils/sendNotify')

const API = 'https://web.hknet-inc.com'
const platform = 'JIDONG'
const platformName = '悸动烧仙草'
const appId = 'wx6c4ecc3afe831696'
const marketingProgramId = '12714'
const userId = getEnv(`${platform}_USER_ID`)
const sessionid = getEnv(`${platform}_SESSIONID`)
const titleText = getTitleText(platformName)

const defaultOptions = {
  headers: {
    Referer: 'https://servicewechat.com/wx6c4ecc3afe831696/127/page-frame.html',
    Host: 'web.hknet-inc.com',
    appType: 'mini',
    Cookie: `xxl_sso_sessionid=${sessionid}`,
    sessionId: `xxl_sso_sessionid=${sessionid}`,
    'User-Agent': getUserAgent(platform),
    'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
  }
}

const request = (options = {}) => {
  options = { ...defaultOptions, ...options }
  return new Promise((resolve, reject) => {
    axios(options)
      .then((res) => {
        const data = res.data || {}
        console.log('Response Data:', data)
        switch (data.code) {
          case 200:
            resolve(data.entry)
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
function getAttendData() {
  return request({
    method: 'post',
    url: `${API}/trade/marketingProgram/getAttendData?appId=${appId}&marketingProgramId=${marketingProgramId}&userId=${userId}`
  })
}

// 签到
function immediatelySign() {
  return request({
    method: 'post',
    url: `${API}/trade/marketingProgram/immediatelySign?appId=${appId}&marketingProgramId=${marketingProgramId}&userId=${userId}&signRemindSwitch=0`
  })
}

;(async () => {
  if (!sessionid) {
    console.log('no sessionid ❌')
    return
  }
  if (!userId) {
    console.log('no userId ❌')
    return
  }
  const msg = []
  try {
    await sleep(sleepTime)
    const { isAttend } = await getAttendData()
    if (isAttend) {
      msg.push('今天已经签到过了❗️')
    } else {
      const {
        contiCheckDays,
        todayGiveCouponCount,
        todayGivePoints,
        vipPoints
      } = immediatelySign()
      msg.push(
        `签到成功：获得${todayGivePoints}个积分，${todayGiveCouponCount}张优惠券，已连续签到${contiCheckDays}天，当前积分${vipPoints} ✔️`
      )
    }
  } catch (error) {
    console.log('❌error❌', error)
  }
  if (msg.length) {
    sendNotify(titleText, msg.join('\n'))
  }
})()
