<script setup>
import { ref } from 'vue';
import Menubar from 'primevue/menubar';

const items = ref([
  { label: '首页', icon: 'pi pi-fw pi-home', command: () => (window.location.href = '/') },
  { label: '视频', icon: 'pi pi-fw pi-video', command: () => (window.location.href = '/video') },
  { label: '图集', icon: 'pi pi-fw pi-images', command: () => (window.location.href = '/gallery') }
]);

const userMenu = ref([
  { label: '个人资料', icon: 'pi pi-fw pi-user', command: () => (window.location.href = '/profile') },
  { label: '退出登录', icon: 'pi pi-fw pi-sign-out', command: () => (window.location.href = '/logout') }
]);
</script>

<template>
  <header class="top-bar">
    <Menubar :model="items">
      <template #start>
        <img src="@/assets/logo.svg" alt="首页" class="home-icon" />
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
  </header>
</template>