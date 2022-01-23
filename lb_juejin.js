/**
 * 掘金签到
 * cron: 0 0 * * *
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

const API = 'https://api.juejin.cn/growth_api/v1'
const { platform } = getPlatform('JUEJIN')
const titleText = getTitleText(platform)
const cookie = getEnv(`${platform}_COOKIE`)
const defaultOptions = {
  headers: {
    cookie,
    origin: 'https://juejin.cn',
    referer: 'https://juejin.cn/',
    'user-agent': getUserAgent(platform)
  }
}

const request = (options = {}) => {
  options = { ...defaultOptions, ...options }
  return new Promise((resolve, reject) => {
    axios(options)
      .then(res => {
        const data = res.data || {}
        switch (data.err_no) {
          case 0:
            resolve(data.data)
            break
          case 403:
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
        sendNotify(titleText, getErrorText(data.message))
        reject(err)
      })
  })
}

// 获取是否签过
function getTodayStatus () {
  return request({
    method: 'get',
    url: `${API}/get_today_status`
  })
}

// 签到
function checkIn () {
  return request({
    method: 'post',
    url: `${API}/check_in`
  })
}

// 获取是否有免费抽奖机会
function lotteryConfig () {
  return request({
    method: 'get',
    url: `${API}/lottery_config/get`
  })
}

// 抽奖
function lotteryDraw () {
  return request({
    method: 'post',
    url: `${API}/lottery/draw`
  })
}

// 获取沾喜气列表
function getDipLuckyList () {
  return request({
    method: 'post',
    url: `${API}/lottery_history/global_big`,
    data: { page_no: 1, page_size: 5 }
  })
}

// 沾喜气
function dipLucky (lottery_history_id) {
  return request({
    method: 'post',
    url: `${API}/lottery_lucky/dip_lucky`,
    data: { lottery_history_id }
  })
}

;(async () => {
  if (!cookie) {
    console.log(noCookie)
    return
  }
  const msg = []
  try {
    const statusData = await getTodayStatus()
    if (statusData) {
      msg.push('今天已经签到过了❗️')
    } else {
      const checkInStatus = await checkIn()
      if (checkInStatus) {
        msg.push('签到成功✔️')
      }
    }
    const { free_count } = await lotteryConfig()
    if (free_count) {
      const { lottery_name } = await lotteryDraw()
      msg.push(`恭喜抽中${lottery_name}✔️`)
    } else {
      msg.push('今天已经免费抽奖过了❗️')
    }
    const { lotteries } = await getDipLuckyList()
    const lotteryIndex = getEnv('JUEJIN_LOTTERY_INDEX') || 0
    const historyId = lotteries[lotteryIndex].history_id
    if (historyId) {
      const { has_dip, dip_action, total_value } = await dipLucky(historyId)
      const luckValue = `当前喜气值: ${total_value}/6000`
      if (has_dip) {
        msg.push(`今天已沾过喜气, ${luckValue}❗️`)
      } else if (dip_action === 1) {
        msg.push(`沾喜气成功,${luckValue}✔️`)
      }
    } else {
      msg.push(
        `获取沾喜气historyId异常，请检查指定的JUEJIN_LOTTERY_INDEX参数格式❌`
      )
    }
  } catch (error) {}
  if (msg.length) {
    sendNotify(titleText, msg.join('\n'))
  }
})()
