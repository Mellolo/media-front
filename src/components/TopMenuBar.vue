<template>
  <header class="top-menu-bar">
    <div class="menu-bar-left">
      <a href="/">
        <img src="@/assets/logo.svg" alt="首页" class="home-icon" />
      </a>
    </div>

    <div class="menu-bar-right">
      <div class="user-dropdown">
        <button class="user-button" @click="toggleDropdown">
          {{ username }} ▼
        </button>
        <div class="dropdown-content" :class="{ show: showDropdown }">
          <template v-if="isLoggedIn">
            <a href="/actor/create">创建演员</a>
            <a href="/video/upload">上传视频</a>
            <a href="/profile">个人资料</a>
            <a @click.prevent="logout">退出登录</a>
          </template>
          <template v-else>
            <a href="/user/login">登录</a>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import api from '@/utils/api.js';
import { ref, onMounted, onUnmounted } from 'vue';

const isLoggedIn = ref(false);
const username = ref('未登录');
const showDropdown = ref(false); // 控制下拉菜单显示状态

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

// 切换下拉菜单显示状态
const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

// 隐藏下拉菜单
const hideDropdown = () => {
  showDropdown.value = false;
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

// 处理login事件
const handleLoginEvent = () => {
  checkLoginStatus();
};

// 组件挂载时检查登录状态
onMounted(() => {
  checkLoginStatus();
  // 添加login事件监听器
  window.addEventListener('login', handleLoginEvent);
});

// 组件卸载时移除事件监听器
onUnmounted(() => {
  window.removeEventListener('login', handleLoginEvent);
});

// 点击其他地方隐藏下拉菜单
document.addEventListener('click', (event) => {
  const dropdown = document.querySelector('.user-dropdown');
  if (dropdown && !dropdown.contains(event.target)) {
    hideDropdown();
  }
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

.dropdown-content.show {
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
</style>