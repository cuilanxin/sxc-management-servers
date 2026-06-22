const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    minlength: 3,
    // trim: true
  },
  email: {
    type: String,
    sparse: true,
    // required: [true, 'Email is required'],
    // unique: true,
    // lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 3
  },
  registerAt: {
    type: String,
    default: null
  },
  loginAt: {
    type: String,
    default: null
  },
  updatedAt: {
    type: String,
    default: null
  },
  exitAt: {
    type: String,
    default: null
  },
  isLogout: {     // （注销）
    type: Boolean,
    default: false
  },
  logoutAt: {     // （注销时间）
    type: String,
    default: null
  },
  isOnline: {         // 是否在线
    type: Boolean,
    default: false
  },
  name: {
    type: String,
    default: '未命名'
  },
  gender: {
    type: String,
    default: null
  },
  teamLeader: {
    type: String,
    default: null
  },
  taskNum: {
    type: String,
    default: 0
  },
  taskNum: {
    type: String,
    default: 0
  },
  taskNum: {
    type: String,
    default: 0
  },
}, {
  timestamps: false  // 👈 这行会自动添加 createdAt 和 updatedAt
});

// 加密密码
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  /* next(); */
});

// 验证密码方法
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);