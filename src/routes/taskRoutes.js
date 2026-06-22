const express = require('express');
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // 所有产品路由都需要认证

router.post('/getTasks', protect, getTasks);
router.post('/createTask', protect, createTask);

router.post('/getTaskById', protect, getTaskById);
router.post('/updateTask', protect, updateTask);

router.post('/deleteTask', protect, deleteTask);


module.exports = router;