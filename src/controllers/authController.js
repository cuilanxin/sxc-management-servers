const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { apiResponse, getCurrentDate } = require('../utils')
const mongoose = require('mongoose');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};


const updateUser = async (req, res) => {
  // 密码 是否在线 注销、登录、退出、时间
  try {
    const product = await User.findOneAndUpdate(
      { username: req.params.username, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json(apiResponse({ code: 404 }));
    }

    res.json(product);
  } catch (error) {
    res.status(400).json(apiResponse({ code: 400, message: error.message }));
  }
};


const deleteUser = async (req, res) => {
  try {
    const user = await User.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!user) {
      return res.status(404).json(apiResponse({ code: 404 }));
    }

    res.json({ message: 'user deleted successfully' });
  } catch (error) {
    res.status(500).json(apiResponse({ code: 500, message: error.message }));
  }
};


// 登录
const login = async (req, res, next) => {
  try {
    // 检查数据库连接
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json(apiResponse({
        code: 503,
      }));
    }

    const { username, password, forceLogin } = req.body;

    // 验证请求数据
    if (!username || !password) {
      return res.status(400).json(apiResponse({
        code: 400,
        message: '请输入账号和密码'
      }));
    }


    const user = await User.findOne({ username });
    console.log('cuilanxin user', user, user.isOnline)
    if (!user) {
      return res.status(401).json(apiResponse({
        code: 401,
        message: '账号不存在'
      }));
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json(apiResponse({
        code: 401,
        message: '密码不正确'
      }));
    }

    if (!forceLogin && user.isOnline) {
      return res.status(401).json(apiResponse({
        code: 401,
        message: '账号已登录'
      }));
    }

    const currentDate = getCurrentDate()

    await User.findOneAndUpdate(
      { username },
      {
        // isOnline: true,
        exitAt: forceLogin ? currentDate : user.exitAt,
        loginAt: currentDate,
      },
      { new: true, runValidators: true }
    );

    res.json(apiResponse({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id)
    }));
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
};

// 注册
const register = async (req, res, next) => {
  try {
    // 检查数据库连接
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json(apiResponse({
        code: 503,
      }));
    }

    const { username, password } = req.body;

    // 验证请求数据
    if (!username) {
      return res.status(400).json(apiResponse({
        code: 400,
        message: '请输入账号'
      }));
    }
    if (!password) {
      return res.status(400).json(apiResponse({
        code: 400,
        message: '请输入密码'
      }));
    }

    const userExists = await User.findOne({ $or: [/*{ email },*/ { username }] });
    if (userExists) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: '用户已存在'
      });
    }

    const currentDate = getCurrentDate()

    const user = await User.create({
      username,
      /*email,*/
      password,
      registerAt: currentDate,
      updatedAt: currentDate,
    });

    res.status(200).json(apiResponse({
      _id: user._id,
      username: user.username,
      token: generateToken(user._id)
    }));
  } catch (error) {
    console.error('Register error:', error);
    next(error);
  }
};


module.exports = { register, login, updateUser, deleteUser };