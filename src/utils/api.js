// src/utils/api.js
import axios from 'axios';
import API_CONFIG from '@/config/api.js';
import customAlert from '@/utils/customAlert.js';

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
  async (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        // 如果是401错误（未授权），则清除token并重定向到登录页
        localStorage.removeItem('authToken');
      
        // 显示"用户未登录"的alert提示
        await customAlert({message: error.response.data.data.errorMsg});
        
        // 重定向到登录页面
        window.location.href = '/user/login';
      } else if (error.response.status === 404) {
         // 如果是404错误（请求路径不存在），则并重定向到首页
        await customAlert({message: error.response.data.message});
         // 重定向到首页
        window.location.href = '/';
      } else {
        // 如果是其他错误，弹窗提示报错信息
        customAlert({ 
          message: error.response.data.data.errorMsg,
          uuid: error.response.data.data.uuid,
          stack: error.response.data.data.stack
        });
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;