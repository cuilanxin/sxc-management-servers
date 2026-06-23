const express = require('express');
const { 
  logoutUser, 
  register, 
  login, 
  updateUser, 
  deleteUser, 
  getUsers, 
  getUserInfo,
  exitUser 
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');


const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/getUsers', protect, getUsers);
router.post('/exitUser', protect, exitUser);
router.post('/logoutUser', protect, logoutUser);
router.post('/getUserInfo', protect, getUserInfo);

router.post('/updateUser', protect, updateUser);
router.post('/deleteUser', protect, deleteUser);


module.exports = router;
