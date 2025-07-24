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
            <a href="/login">登录</a>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import API_CONFIG from '@/config/api.js';
import { ref, onMounted } from 'vue';

const isLoggedIn = ref(false);
const username = ref('未登录');

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
</style>