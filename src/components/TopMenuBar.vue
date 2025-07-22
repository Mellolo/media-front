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
          <a href="/logout">退出登录</a>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
// 这里可以添加交互逻辑（如点击菜单、动态路由等）
</script>

<style scoped>
.top-menu-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 0.5em 1em;
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;
}

.menu-bar-left .home-icon {
  height: 2em;
  cursor: pointer;
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
  background: none;
  border: none;
  font-size: 1em;
  cursor: pointer;
  padding: 0.5em;
}

.dropdown-content {
  display: none;
  position: absolute;
  background-color: #ffffff;
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
  background-color: #f4f4f4;
}

.user-dropdown:hover .dropdown-content {
  display: block;
}
</style>