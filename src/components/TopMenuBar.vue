<template>
  <header class="top-menu-bar">
    <div class="menu-bar-left">
      <a href="/">
        <img src="@/assets/logo.svg" alt="首页" class="home-icon" />
      </a>
    </div>

    <div class="menu-bar-right">
      <div class="user-dropdown">
        <button class="user-button">
          {{ username }} ▼
        </button>
        <div class="dropdown-content">
          <template v-if="isLoggedIn">
            <a href="/actor/create">创建演员</a>
            <a href="/profile">个人资料</a>
            <a @click.prevent="logout">退出登录</a>
          </template>
          <template v-else>
            <a @click.prevent="showLoginModal">登录</a>
          </template>
        </div>
      </div>
    </div>
  </header>

  <!-- 登录模态框 -->
  <div v-if="showModal" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>用户登录</h3>
        <button class="close-button" @click="closeModal">&times;</button>
      </div>
      <div class="modal-body">
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
      </div>
    </div>
  </div>
</template>

<script setup>
import api from '@/utils/api.js';
import { ref, onMounted } from 'vue';

const isLoggedIn = ref(false);
const username = ref('未登录');
const showModal = ref(false);
const loginForm = ref({
  username: '',
  password: ''
});

// 检查登录状态
const checkLoginStatus = async () => {
  try {
    const response = await api.get('/user/login/status');

    if (response.data.data.loggedIn) {
      isLoggedIn.value = true;
      username.value = response.data.data.username || '用户';
    } else {
      isLoggedIn.value = false;
      username.value = '未登录';
    }
  } catch (error) {
    console.error('检查登录状态失败:', error);
    isLoggedIn.value = false;
    username.value = '未登录';
  }
};

// 显示登录模态框
const showLoginModal = () => {
  showModal.value = true;
};

// 关闭登录模态框
const closeModal = () => {
  showModal.value = false;
  // 清空表单
  loginForm.value.username = '';
  loginForm.value.password = '';
};

// 处理登录
const handleLogin = async () => {
  try {
    const response = await api.post('/user/login', loginForm.value);

    // 如果后端返回token，则保存token
    if (response.data.data) {
      localStorage.setItem('authToken', response.data.data);
    }
    
    // 登录成功，关闭模态框并刷新用户状态
    closeModal();
    checkLoginStatus();
  } catch (error) {
    console.error('Login error:', error);
    if (error.response && error.response.data) {
      alert('登录失败，请检查用户名和密码: ' + error.response.data.message);
    } else {
      alert('网络错误，请检查连接');
    }
  }
};

const logout = async () => {
  try {
    await api.get('/auth/user/logout');
    
    // 清除token
    localStorage.removeItem('authToken');
    
    // 更新本地状态
    isLoggedIn.value = false;
    username.value = '未登录';
    
    // 退出成功，跳转到首页
    window.location.href = '/';
  } catch (error) {
    console.error('Logout error:', error);
    alert('退出失败，请重试');
  }
};

// 组件挂载时检查登录状态
onMounted(() => {
  checkLoginStatus();
});
</script>

<style scoped>
.top-menu-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #43d6b4;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 0 20px;
  height: 60px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.menu-bar-left .home-icon {
  height: 40px;
}

.menu-bar-right {
  display: flex;
  align-items: center;
}

.user-dropdown {
  position: relative;
  display: inline-block;
}

.user-button {
  background-color: transparent;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.user-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.dropdown-content {
  display: none;
  position: absolute;
  right: 0;
  background-color: white;
  min-width: 160px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  z-index: 1;
  margin-top: 5px;
}

.user-dropdown:hover .dropdown-content {
  display: block;
}

.dropdown-content a {
  color: #333;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
  cursor: pointer;
}

.dropdown-content a:hover {
  background-color: #f1f1f1;
}

/* 登录模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 10px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
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
}

.login-button:hover {
  background-color: #38b8a0;
}
</style>