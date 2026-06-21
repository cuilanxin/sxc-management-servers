const express = require('express');
const { register, login, updateUser, deleteUser } = require('../controllers/authController');
const { protect } = require('../middleware/auth');


const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.post('/updateUser', protect, updateUser);
router.post('/deleteUser', protect, deleteUser);


module.exports = router;
