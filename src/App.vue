<script setup>
import HelloWorld from '@/components/HelloWorld.vue'
</script>

<template>
  <!-- 顶部栏 -->
  <TopBar />

  <!-- 原始内容 -->
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import TopBar from '@/components/TopBar.vue';

export default {
  name: 'TopBar',
  components: {
    TopBar
  }
};
</script>