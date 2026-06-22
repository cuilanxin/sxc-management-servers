// const moment = require('moment-timezone');
import moment from 'moment-timezone'


export function getCurrentDate() {
  const date = moment().tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss')
  return date
}

const code_message = {
  200: '成功',
  404: 'Resource not found',
  503: 'Database is not ready. Please try again later.'
}
export function apiResponse(params = {}) {
  const {code = 200, message, data, ...other} = params 
  return {
    code,
    message: message || code_message[code],
    success: code === 200 ? true : false,
    data,
    ...other
  }
}

