// src/utils/api.js
import axios from 'axios';
import API_CONFIG from '@/config/api.js';

// 创建axios实例
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 10000,
  withCredentials: true
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem('authToken');
    
    // 如果存在token，则添加到Authorization头部
    if (token) {
      config.headers.Authorization = `${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 如果是401错误（未授权），则清除token并重定向到登录页
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/user/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;