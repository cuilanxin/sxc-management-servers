// const moment = require('moment-timezone');
import moment from 'moment-timezone'


export function getCurrentDate() {
  const date = moment().tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss')
  console.log('cuilanxin datea', date)
  return date
}

const code_message = {
  200: '成功',
  404: 'Resource not found',
  503: 'Database is not ready. Please try again later.'
}
export function apiResponse({code = 200, message, data, ...other}) {

  return {
    code,
    message: message || code_message[code],
    success: code === 200 ? true : false,
    data,
    ...other
  }
}

