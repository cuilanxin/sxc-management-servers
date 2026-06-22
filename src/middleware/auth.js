const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
        // 'X-username': username,
        // 'X-id': id,
  const username = req.headers['x-username']
  const id = req.headers['x-id']
  const authorization = req.headers.authorization

  if (authorization && authorization.startsWith('Bearer') && id && username) {
    try {
      token = authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('cuilanxin token', token, decoded)

      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };