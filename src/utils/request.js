// src/utils/request.js
// 请求处理工具，用于管理token并自动添加到请求头

class RequestHandler {
  constructor() {
    // 从localStorage获取token
    this.token = localStorage.getItem('authToken') || null;
  }

  // 设置token
  setToken(token) {
    this.token = token;
    // 将token保存到localStorage
    localStorage.setItem('authToken', token);
  }

  // 清除token
  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  // 获取token
  getToken() {
    return this.token;
  }

  // 通用请求方法
  async request(url, options = {}) {
    // 合并默认选项和传入选项
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      credentials: 'include',
      ...options
    };

    // 如果存在token，则添加到Authorization头部
    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    // 发送请求
    const response = await fetch(url, config);
    
    // 检查响应状态
    if (response.status === 401) {
      // token过期或无效，清除本地存储的token
      this.clearToken();
      // 可以在这里添加重定向到登录页的逻辑
      window.location.href = '/login';
    }

    return response;
  }

  // GET请求
  async get(url, options = {}) {
    return this.request(url, { ...options, method: 'GET' });
  }

  // POST请求
  async post(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // PUT请求
  async put(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // DELETE请求
  async delete(url, options = {}) {
    return this.request(url, { ...options, method: 'DELETE' });
  }
}

// 创建并导出request实例
const request = new RequestHandler();
export default request;