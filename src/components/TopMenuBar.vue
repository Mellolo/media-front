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
          用户名 ▼
        </button>
        <div class="dropdown-content">
          <a href="/profile">个人资料</a>
          <a href="/logout" @click.prevent="logout">退出登录</a>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue';

const logout = async () => {
  try {
    const response = await fetch('http://localhost:8080/', {
      method: 'POST',
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