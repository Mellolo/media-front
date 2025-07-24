// src/config/api.js
// API基础配置
// 注意：现在推荐使用 '@/utils/api.js' 中的axios实例来发送请求，
// 它会自动处理token的添加和存储

const API_CONFIG = {
  BASE_URL: '/api'  // 使用相对路径，通过代理转发到后端
};

export default API_CONFIG;