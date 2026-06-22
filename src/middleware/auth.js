const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { apiResponse } = require('../utils')

const protect = async (req, res, next) => {
  let token;
        // 'X-username': username,
  const username = req.headers['x-username']
  const authorization = req.headers.authorization

  if (authorization && authorization.startsWith('Bearer') && username) {
    try {
      token = authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');
      if (req.user.isLogout) {
        return res.status(401).json(apiResponse({ code: 401, message: 'Not authorized, token failed' }));
      } else {
        next();
      }
    } catch (error) {
      res.status(401).json(apiResponse({ code: 401, message: 'Not authorized, token failed' }));
    }
  }

  if (!token) {
    res.status(401).json(apiResponse({ code: 401, message: 'Not authorized, no token' }));
  }
};

module.exports = { protect };