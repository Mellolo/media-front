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
import API_CONFIG from '@/config/api.js';
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
    const response = await fetch(`${API_CONFIG.BASE_URL}/user/login/status`, {
      method: 'GET',
      credentials: 'include'
    });

    if (response.ok) {
      const data = await response.json();
      if (data.loggedIn) {
        isLoggedIn.value = true;
        username.value = data.profile.username || '用户';
      } else {
        isLoggedIn.value = false;
        username.value = '未登录';
      }
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
    const response = await fetch(`${API_CONFIG.BASE_URL}/user/login`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify(loginForm.value)
    });

    if (response.ok) {
      // 登录成功，关闭模态框并刷新用户状态
      closeModal();
      checkLoginStatus();
    } else {
      alert('登录失败，请检查用户名和密码');
    }
  } catch (error) {
    console.error('Login error:', error);
    alert('网络错误，请检查连接');
  }
};

const logout = async () => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/userAuth/logout`, {
      method: 'GET',
      credentials: 'include' // 如果需要携带 Cookie
    });

    if (response.ok) {
      // 退出成功，跳转到登录页或首页
      window.location.href = '/';
    } else {
      alert('退出失败，请重试');
    }
  } catch (error) {
    console.error('Logout error:', error);
    alert('网络错误，请检查连接');
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
  padding: 0.5em 1em;
  position: fixed;
  width: 100%;
  left: 0;
  top: 0;
  z-index: 1000;
  box-sizing: border-box;
}

.menu-bar-left {
  min-width: 0;
}

.menu-bar-left .home-icon {
  height: 2em;
  cursor: pointer;
}

.menu-bar-right {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.user-dropdown {
  position: relative;
  display: inline-block;
  white-space: nowrap;
}

.user-button {
  background: none;
  border: none;
  font-size: 1em;
  cursor: pointer;
  padding: 0.5em;
}

.dropdown-content {
  display: none;
  position: absolute;
  background-color: #9cf3ff;
  min-width: 120px;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
  z-index: 1;
  right: 0;
  top: 100%;
  border-radius: 4px;
  overflow: hidden;
}

.dropdown-content a {
  color: #333;
  padding: 0.5em 1em;
  text-decoration: none;
  display: block;
}

.dropdown-content a:hover {
  background-color: #b9cdff;
}

.user-dropdown:hover .dropdown-content {
  display: block;
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  width: 400px;
  max-width: 90%;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  color: #333;
  text-align: left;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
}

.close-button:hover {
  color: #333;
}

.modal-body {
  padding: 1rem;
}

.form-group {
  margin-bottom: 1rem;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  text-align: left;
}

.form-group input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  text-align: left;
}

.form-actions {
  text-align: center;
  margin-top: 1.5rem;
}

.login-button {
  background-color: #43d6b4;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.login-button:hover {
  background-color: #3ab89c;
}
</style>