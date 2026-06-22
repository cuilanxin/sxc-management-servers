const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { apiResponse, getCurrentDate } = require('../utils')
const mongoose = require('mongoose');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};


const exitUser = async(req, res) => {
  const username = req.headers['x-username']
  const currentDate = getCurrentDate()
  try {
    const user = await User.findOneAndUpdate(
      { username: username },
      {
        isOnline: false,
        exitAt: currentDate
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json(apiResponse({ code: 404 }));
    }

    res.json(apiResponse());
  } catch (error) {
    res.status(400).json(apiResponse({ code: 400, message: error.message }));
  }
}

const logoutUser = async(req, res) => {
  const username = req.headers['x-username']
  const currentDate = getCurrentDate()
  try {
    const user = await User.findOneAndUpdate(
      { username: username },
      {
        isLogout: true,
        logoutAt: currentDate,
        isOnline: false,
        exitAt: currentDate
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json(apiResponse({ code: 404 }));
    }

    res.json(apiResponse());
  } catch (error) {
    res.status(400).json(apiResponse({ code: 400, message: error.message }));
  }
}

const updateUser = async (req, res) => {
  const username = req.headers['x-username']
  const currentDate = getCurrentDate()
  // 密码 是否在线 注销、登录、退出、时间
  try {
    const product = await User.findOneAndUpdate(
      { username: username },
      {
        ...req.body,
        updatedAt: currentDate,
        exitAt: currentDate
      },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json(apiResponse({ code: 404 }));
    }

    res.json(apiResponse());
  } catch (error) {
    res.status(400).json(apiResponse({ code: 400, message: error.message }));
  }
};

// 获取所有
const getUsers = async (req, res) => {
  try {
     const { keyword } = req.query;
      const { username, ...filter } = req.body ||  {};
    
    // 构建查询条件
    let query = { ...filter };
    
    // 模糊搜索：标题或描述包含关键词
    if (keyword) {
      query.$or = [
        { username: { $regex: keyword, $options: 'i' } },        // 标题模糊匹配
        // { description: { $regex: taskName, $options: 'i' } }   // 描述模糊匹配
      ];
    }

    const users = await User.find({ ...query });
    // : tasks.filter(item => !item.isDelete)
    res.json(apiResponse({ users }));
  } catch (error) {
    res.status(500).json(apiResponse({ code: 500, message: error.message }));
  }
};


const deleteUser = async (req, res) => {
  try {
    const user = await User.find(
      { username: username },
    );

    if (!user) {
      return res.status(404).json(apiResponse({ code: 404 }));
    }
  
    if(!user.isLogout) {
      return res.status(404).json(apiResponse({ code: 500, message: '只能删除已注销的账号！' }));
    }
  
    await User.findOneAndDelete({
      username: username
    });


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

    
    if (!user) {
      return res.status(500).json(apiResponse({
        code: 500,
        message: '账号不存在'
      }));
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(500).json(apiResponse({
        code: 500,
        message: '密码不正确'
      }));
    }

    if(user.isLogout) {
      return res.status(500).json(apiResponse({
        code: 500,
        message: '账号已注销'
      }));
    }
    // if (!forceLogin && user.isOnline) {
    //   return res.status(401).json(apiResponse({
    //     code: 401,
    //     message: '账号已登录'
    //   }));
    // }

    const currentDate = getCurrentDate()

    await User.findOneAndUpdate(
      { username },
      {
        isOnline: true,
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

    const { username, password, name } = req.body;

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
      name,
      username,
      /*email,*/
      password,
      registerAt: currentDate.split(' ')[0],
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


module.exports = { logoutUser, register, login, updateUser, deleteUser, getUsers, exitUser };