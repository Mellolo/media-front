<template>
  <div class="login-container">
    <div class="login-header">
      <h2>用户登录</h2>
    </div>
    <div class="login-form">
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <input 
            type="text" 
            id="username" 
            v-model="loginForm.username" 
            placeholder="用户名" 
            :class="{ 'input-error': usernameError }"
          >
          <div v-if="usernameError" class="error-message">请输入用户名</div>
        </div>
        <div class="form-group">
          <input 
            type="password" 
            id="password" 
            v-model="loginForm.password" 
            placeholder="密码" 
            :class="{ 'input-error': passwordError }"
          >
          <div v-if="passwordError" class="error-message">请输入密码</div>
        </div>
        <div class="form-actions">
          <button type="submit" class="login-button">登录</button>
        </div>
      </form>
      <div class="login-footer">
        <!-- <p>还没有账户？<a href="/register">立即注册</a></p> -->
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

// 错误状态
const usernameError = ref(false);
const passwordError = ref(false);

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
  // 重置错误状态
  usernameError.value = false;
  passwordError.value = false;
  
  // 验证表单
  let isValid = true;
  
  if (!loginForm.value.username.trim()) {
    usernameError.value = true;
    isValid = false;
  }
  
  if (!loginForm.value.password.trim()) {
    passwordError.value = true;
    isValid = false;
  }
  
  // 如果验证失败，不提交表单
  if (!isValid) {
    return;
  }
  
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  width: 95%;
  max-width: 550px;
  padding: 50px;
  backdrop-filter: blur(10px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  /* 移除了transform和transition属性，鼠标悬停时不再移动 */
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
  /* 将标题颜色改为绿色系 */
  background: linear-gradient(135deg, #43d6b4 0%, #38b8a0 100%);
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
  /* 将输入框文字颜色改为黑色 */
  color: #000;
}

.form-group input::placeholder {
  color: #aaa;
  font-size: 16px;
}

.form-group input:focus {
  outline: none;
  border-color: #43d6b4;
  background-color: #fff;
  box-shadow: 0 5px 15px rgba(67, 214, 180, 0.1);
  /* 移除了transform属性，聚焦时不再移动 */
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.login-button {
  /* 将按钮颜色改为绿色系 */
  background: linear-gradient(135deg, #43d6b4 0%, #38b8a0 100%);
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
  box-shadow: 0 5px 15px rgba(67, 214, 180, 0.3);
}

.login-button:hover {
  /* 移除了transform属性，鼠标悬停时不再移动 */
  box-shadow: 0 8px 20px rgba(67, 214, 180, 0.4);
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
  /* 将链接颜色改为绿色系 */
  color: #43d6b4;
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
}

.login-footer a:hover {
  /* 将链接悬停颜色改为深绿色 */
  color: #38b8a0;
  text-decoration: none;
}

.login-footer a::after {
  content: '';
  position: absolute;
  width: 0;
  height: 1px;
  bottom: -2px;
  left: 0;
  background-color: #38b8a0;
  transition: width 0.3s ease;
}

.login-footer a:hover::after {
  width: 100%;
}

/* 错误状态下的输入框样式 */
.form-group input.input-error {
  border-color: #ff4757;
}

/* 错误提示文字样式 */
.error-message {
  color: #ff4757;
  font-size: 14px;
  margin-top: 8px;
  text-align: left;
}
</style>
