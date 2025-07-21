<template>
   <header class="top-bar">
    <div class="top-bar-left">
      <a href="/">
        <img src="@/assets/logo.svg" alt="首页" class="home-icon" />
      </a>
    </div>
    <div class="top-bar-right">
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

<style scoped>
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #449a7a;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 0.5em 1em;
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;
}

.top-bar-left .home-icon {
  height: 2em;
  cursor: pointer;
}

.top-bar-right {
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
  background-color: lch(63.77% 58.17 148.07);
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
