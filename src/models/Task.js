const mongoose = require('mongoose');
const Counter = require('./Counter');



const taskSchema = new mongoose.Schema({
  id: { // 任务ID  时间戳
    type: String,
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  description: {
    type: String,
    required: false
  },
  category: {
    type: String,
    required: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Task', taskSchema);