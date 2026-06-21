const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  forceLogin: {
    type: Boolean,
    default: null
  },
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
    unique: true,
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
    default: null
  },
  gender: {
    type: String,
    default: null
  },
  teamLeader: {
    type: String,
    default: null
  }
}, {
  timestamps: false  // 👈 这行会自动添加 createdAt 和 updatedAt
});

// 加密密码
userSchema.pre('save', async function (next) {
  console.error('cuilanxin 49 next n',next, typeof next)
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  /* next(); */
});

// 验证密码方法
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);