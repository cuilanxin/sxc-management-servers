const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const { apiResponse } = require('./utils')

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const productRoutes = require('./routes/productRoutes');

const app = express();

// ========== CORS 配置（修正版） ==========
const allowedOrigins = ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8080'];

// 只需要这一个 CORS 配置就够了
app.use(cors({
  origin: function(origin, callback) {
    // 允许没有 origin 的请求（如 Postman）
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-username' ],
  exposedHeaders: ['Authorization'],
  optionsSuccessStatus: 200
}));

// 不要添加 app.options('*', cors())，因为上面的配置已经处理了 OPTIONS 请求

// ========== 中间件 ==========
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 添加数据库连接检查中间件
const checkDbConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json(apiResponse({ 
      code: 503,
    }));
  }
  next();
};

// 在路由之前使用
app.use('/api/auth', checkDbConnection, authRoutes);
app.use('/api/task', checkDbConnection, taskRoutes);
app.use('/api/products', checkDbConnection, productRoutes);


// 404 处理
app.use((req, res) => {
  res.status(404).json(apiResponse({ 
    code: 404,
    requestedUrl: req.url 
  }));
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  if (err.message.includes('CORS policy')) {
    return res.status(403).json(apiResponse({ 
      code: 403,
      message: 'CORS error: Origin not allowed',
      error: err.message 
    }));
  }
  
  res.status(500).json(apiResponse({
    code: 500,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  }));
});

module.exports = app;