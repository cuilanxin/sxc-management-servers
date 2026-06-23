const Task = require('../models/Task');
const User = require('../models/User')
const { TASK_STATUS } = require('../utils')
const { apiResponse, getCurrentDate } = require('../utils')
const mongoose = require('mongoose');

const getUserInfo = async (username) => {
  const user = await User.find({ username });
  return user?.[0]
}

// 创建产品
const createTask = async (req, res) => {

  const username = req.headers['x-username']
  const currentDate = getCurrentDate()
  try {
    const user = await getUserInfo(username)
    if(!user) {
      return res.status(400).json(apiResponse({ code: 400 }));
    }

    if(user.isLogout) {
      return res.status(400).json(apiResponse({ code: 400, message: '当前账号已注销，请联系管理员' }));
    }

    const recipientInfo = await getUserInfo(req.body.recipientId)

    if(!recipientInfo) {
      return res.status(400).json(apiResponse({ code: 400 }));
    }

    if(recipientInfo.isLogout) {
      return res.status(400).json(apiResponse({ code: 400, message: '当前接收人账号已注销，请联系管理员' }));
    }

    const task = await Task.create({
      ...req.body,
      createdAt: currentDate,
      updatedAt: currentDate,
      id: currentDate.valueOf(),
      createOwner: user.name,
      // taskStatus: 'UNCONFIRMED',
      createOwnerId: username,
    });
    res.status(200).json(apiResponse({ task }));
  } catch (error) {
    res.status(400).json(apiResponse({ code: 400, message: error.message }));
  }
};

// 获取所有产品
const getTasks = async (req, res) => {
  try {
      const { taskName, createdAt, downAt, deadlineAt, ...filter} = req.body ||  {};
    
    // 构建查询条件
    let query = { ...filter };

        // 时间范围过滤
    if (createdAt) {
      query.createdAt = {};
      
      if (createdAt[0]) {
        query.createdAt.$gte = createdAt[0];
      }
      if (createdAt[1]) {
        query.createdAt.$lte = createdAt[1];
      }
    }

    if (deadlineAt) {
      query.createdAt = {};
      
      if (deadlineAt[0]) {
        query.deadlineAt.$gte = deadlineAt[0];
      }
      if (deadlineAt[1]) {
        query.deadlineAt.$lte = deadlineAt[1];
      }
    }

    if (downAt) {
      query.createdAt = {};
      
      if (downAt[0]) {
        query.downAt.$gte = downAt[0];
      }
      if (downAt[1]) {
        query.downAt.$lte = downAt[1];
      }
    }

    // 模糊搜索：标题或描述包含关键词
    if (taskName) {
      query.$or = [
        { taskName: { $regex: taskName, $options: 'i' } },        // 标题模糊匹配
        // { description: { $regex: taskName, $options: 'i' } }   // 描述模糊匹配
      ];
    }

    const tasks = await Task.find({ isDelete: false, ...query });
    // : tasks.filter(item => !item.isDelete)
    res.json(apiResponse({ tasks }));
  } catch (error) {
    res.status(500).json(apiResponse({ code: 500, message: error.message }));
  }
};

// 获取单个产品
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 更新产品
const updateTask = async (req, res) => {
  const currentDate = getCurrentDate()
  const username = req.headers['x-username']

  try {

    const user = await getUserInfo(username)
    if(!user) {
      return res.status(400).json(apiResponse({ code: 400 }));
    }

    if(user.isLogout) {
      return res.status(400).json(apiResponse({ code: 400, message: '当前账号已注销，请联系管理员' }));
    }

    const recipientInfo = await getUserInfo(req.body.recipientId)

    if(!recipientInfo) {
      return res.status(400).json(apiResponse({ code: 400 }));
    }

    if(recipientInfo.isLogout) {
      return res.status(400).json(apiResponse({ code: 400, message: '当前接收人账号已注销，请联系管理员' }));
    }

    const task = await Task.findOneAndUpdate(
      { id: req.body.id },
      { 
        ...req.body, 
        updatedAt: currentDate,
        downAt: req.body.taskStatus === TASK_STATUS.COMPLETED ? currentDate : null
      },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json(apiResponse({ code: 404 }));
    }

    res.json(apiResponse({task}));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 删除产品
const deleteTask = async (req, res) => {
    const currentDate = getCurrentDate()

  try {
    const task = await Task.findOneAndUpdate(
      { id: req.body.id },
      { isDelete: true, updatedAt: currentDate},
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(apiResponse({ id: req.body.id }));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }

  // try {
  //   const task = await Task.findOneAndDelete({
  //     _id: req.params.id,
  //     userId: req.user._id
  //   });

  //   if (!task) {
  //     return res.status(404).json({ message: 'Task not found' });
  //   }

  //   res.json({ message: 'Task deleted successfully' });
  // } catch (error) {
  //   res.status(500).json({ message: error.message });
  // }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask
};

