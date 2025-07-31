<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <h2>用户登录</h2>
      </div>
      <div class="login-form">
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="username">用户名:</label>
            <input type="text" id="username" v-model="loginForm.username" required>
          </div>
          <div class="form-group">
            <label for="password">密码:</label>
            <input type="password" id="password" v-model="loginForm.password" required>
          </div>
          <div class="form-actions">
            <button type="submit" class="login-button">登录</button>
          </div>
        </form>
        <div class="login-footer">
          <p>还没有账户？<a href="/register">立即注册</a></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import api from '@/utils/api.js';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const loginForm = ref({
  username: '',
  password: ''
});

// 检查是否已经登录
const checkLoginStatus = async () => {
  try {
    const response = await api.get('/user/login/status');

    if (response.data.data.loggedIn) {
      // 如果已经登录，重定向到首页
      router.push('/');
    }
  } catch (error) {
    console.error('检查登录状态失败:', error);
  }
};

// 处理登录
const handleLogin = async () => {
  try {
    const response = await api.post('/user/login', loginForm.value);

    // 如果后端返回token，则保存token
    if (response.data.data) {
      localStorage.setItem('authToken', response.data.data);
    }
    
    // 登录成功，发送login事件通知TopMenuBar更新状态
    window.dispatchEvent(new CustomEvent('login'));
    
    // 跳转到首页
    router.push('/');
  } catch (error) {
    console.error('Login error:', error);
    if (error.response && error.response.data) {
      alert('登录失败，请检查用户名和密码: ' + error.response.data.message);
    } else {
      alert('网络错误，请检查连接');
    }
  }
};

// 组件挂载时检查登录状态
onMounted(() => {
  checkLoginStatus();
});
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 60px);
  padding-top: 60px;
  background-color: #f5f5f5;
}

.login-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 400px;
  padding: 30px;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  color: #333;
  margin: 0;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #555;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #43d6b4;
  box-shadow: 0 0 0 2px rgba(67, 214, 180, 0.2);
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.login-button {
  background-color: #43d6b4;
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
  width: 100%;
}

.login-button:hover {
  background-color: #38b8a0;
}

.login-footer {
  text-align: center;
  margin-top: 20px;
}

.login-footer a {
  color: #43d6b4;
  text-decoration: none;
}

.login-footer a:hover {
  text-decoration: underline;
}
</style>