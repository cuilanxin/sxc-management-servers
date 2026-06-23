// const moment = require('moment-timezone');
import moment from 'moment-timezone'

export const TASK_STATUS = {
  /**
   * 未完成
   */
  UNFINISHED: 'UNFINISHED',
  /**
   * 已完成
   */
  COMPLETED: 'COMPLETED',
  // /**
  //  * 未指派
  //  */
  // UNASSIGNED: 'UNASSIGNED',
  // /**
  //  * 已指派
  //  */
  // ASSIGNED: 'ASSIGNED',
  /**
   * 未确认
   */
  UNCONFIRMED: 'UNCONFIRMED',
  // /**
  //  * 已确认
  //  */
  // CONFIRMED: 'CONFIRMED',
  /**
   * 废弃 abolish
   */
  ABOLISH: 'ABOLISH',
}


export function getCurrentDate() {
  const date = moment().tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss')
  return date
}

const code_message = {
  200: '成功',
  404: 'Resource not found',
  400: '刷新后重试',
  500: '刷新后重试',
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

