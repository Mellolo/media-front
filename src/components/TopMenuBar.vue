<script setup>
import { ref } from 'vue';
import Menubar from 'primevue/menubar';
</script>

<template>
  <Menubar :model="[]">
    <template #start>
      <a href="/">
        <img src="@/assets/logo.svg" alt="首页" class="home-icon" />
      </a>
    </template>
    <template #end>
      <div class="user-dropdown">
        <button class="user-button">
          用户名 <i class="pi pi-chevron-down"></i>
        </button>
        <div class="dropdown-content">
          <a href="/profile">个人资料</a>
          <a href="/logout">退出登录</a>
        </div>
      </div>
    </template>
  </Menubar>
</template>

<style scoped>
.home-icon {
  height: 2em;
  cursor: pointer;
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