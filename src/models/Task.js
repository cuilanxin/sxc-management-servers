// const Counter = require('./Counter');
// import mongoose from 'mongoose'
const mongoose = require('mongoose');
const { TASK_STATUS } = require('../utils')


const taskSchema = new mongoose.Schema({
  id: { // 任务ID  时间戳
    type: String,
    unique: true,
  },
  taskName: { // 
    type: String,
  },
  taskStatus: {// 任务状态
    type: String, // TASK_STATUS
    default: TASK_STATUS.UNCONFIRMED
  },
  createOwner: {
    type: String,
  },
  createOwnerId: {
    type: String,
  },
  recipient: { // 接收人
    type: String,
  },
  recipientId: {
    type: String,
  },
  taskInfo: {
    // 任务介绍
    type: String,
  },
  taskProgress: {
    // 任务进度
    type: String,
  },
  downAt: { // 完成时间
    type: String,
  },
  deadlineAt: { // 截止时间
    type: String,
  },
  createdAt: { // 
    type: String,
  },
  updatedAt: { // 
    type: String,
  },
  isDelete: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: false  // 👈 这行会自动添加 createdAt 和 updatedAt
});

module.exports = mongoose.model('Task', taskSchema);
