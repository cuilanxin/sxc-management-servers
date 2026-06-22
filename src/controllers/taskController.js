const Task = require('../models/Task');
const User = require('../models/User')
// import { TASK_STATUS } from '../models/Task'
// const { TASK_STATUS } = require('../models/Task');
const { apiResponse, getCurrentDate } = require('../utils')
const mongoose = require('mongoose');

const getUserInfo = async (username) => {
  const user = await User.find({ username });
  return user
}

// 创建产品
const createTask = async (req, res) => {
  const User = require('../models/User');

  const username = req.headers['x-username']
  const currentDate = getCurrentDate()
  try {
    const user = await getUserInfo(username)
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
     const { keyword } = req.query;
      const {taskName, ...filter} = req.body ||  {};
    
    // 构建查询条件
    let query = { ...filter };


     
    // const query = { userId: req.user._id };  // 如果有用户隔离
    
    // if (keyword && keyword.trim()) {
    //   const trimmedKeyword = keyword.trim();
      
    //   // 同时匹配 ID（精准）和 name（模糊）
    //   query.$or = [
    //     { id: trimmedKeyword },  // 精准匹配 ID（完全相等）
    //     { name: { $regex: trimmedKeyword, $options: 'i' } }  // 模糊匹配 name
    //   ];
    // }

    
    // 模糊搜索：标题或描述包含关键词
    if (keyword) {
      query.$or = [
        { taskName: { $regex: keyword, $options: 'i' } },        // 标题模糊匹配
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

  try {
    const task = await Task.findOneAndUpdate(
      { id: req.body.id },
      { 
        ...req.body, 
        updatedAt: currentDate,
        downAt: req.body.taskStatus === 'COMPLETED' ? currentDate : null
      },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
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

