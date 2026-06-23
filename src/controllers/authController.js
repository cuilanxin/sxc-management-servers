const User = require('../models/User');
const Task = require('../models/Task');
const jwt = require('jsonwebtoken');
const { apiResponse, getCurrentDate, TASK_STATUS } = require('../utils')
const mongoose = require('mongoose');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

const getUserTaskInfo = (tasks, username) => {
  const recipientList = tasks.filter(it => it.recipientId === username)
  const createOwnerList = tasks.filter(it => it.createOwnerId === username)
  // const recipientList = await Task.find({ recipientId: username })
  // const createOwnerList = await Task.find({ createOwnerId: username })

  let taskUnfinishedNum = 0 // 任务未完成的
  let taskUnConfirmedNum = 0// 任务未确认的
  let taskConfirmedNum = 0 // 任务已完成的
  recipientList.forEach(item => {
    if (item.taskStatus === TASK_STATUS.UNFINISHED) {
      taskUnfinishedNum += 1
    }
    if (item.taskStatus === TASK_STATUS.UNCONFIRMED) {
      taskUnConfirmedNum += 1
    }
    if (item.taskStatus === TASK_STATUS.COMPLETED) {
      taskConfirmedNum += 1
    }
  })

  const result = {
    taskNum: recipientList.length + createOwnerList.length,
    taskCreateNum: createOwnerList.length,
    taskUnfinishedNum,
    taskUnConfirmedNum,
    taskConfirmedNum,
  }

  return result
}

const exitUser = async (req, res) => {
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

const logoutUser = async (req, res) => {
  const username = req.headers['x-username']
  const currentDate = getCurrentDate()
  try {
    const currentUser = await User.find({username})
    if (!currentUser?.[0])  return res.status(400).json(apiResponse({ code: 400 }));
    if (currentUser?.[0].permission !== 'admin') {
      return res.status(400).json(apiResponse({ code: 400, message:'当前账号没有此权限' }));
    }

    const user = await User.findOneAndUpdate(
      { username: req.body.username },
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
    const { name, registerAt, ...filter } = req.body || {};

    // 构建查询条件
    let query = { ...filter };

    // 模糊搜索：标题或描述包含关键词
    if (name) {
      query.$or = [
        { name: { $regex: name, $options: 'i' } },        // 标题模糊匹配
        // { description: { $regex: taskName, $options: 'i' } }   // 描述模糊匹配
      ];
    }

    // 时间范围过滤
    if (registerAt) {
      query.registerAt = {};

      if (registerAt[0]) {
        query.registerAt.$gte = registerAt[0] + ' 00:00:00';
      }
      if (registerAt[1]) {
        query.registerAt.$lte = registerAt[1] + ' 23:59:59';
      }
    }

    const tasks = await Task.find({})
    // const recipientList = tasks.filter(it => it.recipientId === username)
    // const createOwnerList = tasks.filter(it => it.createOwnerId === username)
    query.permission = { $ne: 'admin' };
    let users = await User.find({ ...query });
    const list = users.map(it => {
      const plainIt = it.toObject();
      return {
        ...plainIt,
        ...getUserTaskInfo(tasks, plainIt.username),
      }
    })
    // const list = await Promise.all(users.map(async (it) => {
    //   const plainIt = it.toObject();
    //   const taskInfo = await getUserTaskInfo(plainIt.username);
    //   return { ...plainIt, ...taskInfo, }
    // }))

    res.json(apiResponse({ users: list }));
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

    if (!user.isLogout) {
      return res.status(404).json(apiResponse({ code: 500, message: '只能删除已注销的账号！' }));
    }

    await Task.findOneAndUpdate(
      { createOwnerId: username },
      {
        createOwnerId: null,
        createOwner: '此人已注销',
        updatedAt: currentDate,
        exitAt: currentDate
      },
      { new: true, runValidators: true }
    )

    await Task.findOneAndUpdate(
      { recipientId: username },
      {
        recipientId: null,
        recipient: '此人已注销',
        updatedAt: currentDate,
        exitAt: currentDate
      },
      { new: true, runValidators: true }
    )
  
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

    if (user.isLogout) {
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