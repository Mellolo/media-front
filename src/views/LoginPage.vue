<template>
    <div class="login-container">
      <div class="login-header">
        <h2>用户登录</h2>
      </div>
      <div class="login-form">
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <input type="text" id="username" v-model="loginForm.username" placeholder="用户名" required>
          </div>
          <div class="form-group">
            <input type="password" id="password" v-model="loginForm.password" placeholder="密码" required>
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

.login-container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  width: 95%;
  max-width: 550px;
  padding: 50px;
  backdrop-filter: blur(10px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transform: translateY(0);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.login-container:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-header h2 {
  color: #333;
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.form-group {
  margin-bottom: 25px;
  position: relative;
}

.form-group input {
  width: 100%;
  padding: 15px 20px;
  border: 2px solid #e1e1e1;
  border-radius: 10px;
  font-size: 16px;
  box-sizing: border-box;
  transition: all 0.3s ease;
  background-color: #f8f9fa;
}

.form-group input::placeholder {
  color: #aaa;
  font-size: 16px;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  background-color: #fff;
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.1);
  transform: translateY(-2px);
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.login-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 16px 30px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 18px;
  font-weight: 600;
  transition: all 0.3s ease;
  width: 100%;
  letter-spacing: 1px;
  text-transform: uppercase;
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

.login-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.login-button:active {
  transform: translateY(-1px);
}

.login-footer {
  text-align: center;
  margin-top: 30px;
}

.login-footer p {
  color: #666;
  font-size: 15px;
}

.login-footer a {
  color: #667eea;
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
}

.login-footer a:hover {
  color: #764ba2;
  text-decoration: none;
}

.login-footer a::after {
  content: '';
  position: absolute;
  width: 0;
  height: 1px;
  bottom: -2px;
  left: 0;
  background-color: #764ba2;
  transition: width 0.3s ease;
}

.login-footer a:hover::after {
  width: 100%;
}
</style>