const app = require('./src/app');
const mongoose = require('mongoose');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

// 连接数据库（Mongoose 7+ 简化版）
const connectDB = async () => {
  try {
    // 不需要 useNewUrlParser 和 useUnifiedTopology
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('   Please make sure MongoDB is running');
    return false;
  }
};

// 启动服务器
const startServer = async () => {
  const dbConnected = await connectDB();
  
  if (!dbConnected) {
    console.error('❌ Failed to connect to database. Server will not start.');
    console.error('   Tips:');
    console.error('   1. Make sure MongoDB is installed');
    console.error('   2. Start MongoDB service');
    console.error('   3. Check your MONGODB_URI in .env file');
    process.exit(1);
  }
  
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
};

startServer();