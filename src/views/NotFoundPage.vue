<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <h1 class="error-code">404</h1>
      <h2 class="error-title">页面未找到</h2>
      <p class="error-message">抱歉，您访问的页面不存在。</p>
      <div class="error-actions">
        <button @click="goHome" class="home-button">返回首页</button>
        <button @click="goBack" class="back-button">返回上一页</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push({ name: 'Home' })
}

const goBack = () => {
  router.go(-1)
}
</script>

<style scoped>
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 60px);
  padding: 20px;
  background: linear-gradient(135deg, #1a1a1a 0%, #000 100%);
  color: #fff;
  margin-top: 60px;
}

.not-found-content {
  text-align: center;
  max-width: 600px;
  padding: 40px;
  background: rgba(30, 30, 30, 0.8);
  border-radius: 15px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
}

.error-code {
  font-size: 72px;
  font-weight: 700;
  margin: 0 0 20px;
  color: #43d6b4;
  text-shadow: 0 0 10px rgba(67, 214, 180, 0.5);
}

.error-title {
  font-size: 36px;
  font-weight: 600;
  margin: 0 0 15px;
  color: #fff;
}

.error-message {
  font-size: 18px;
  line-height: 1.6;
  margin: 0 0 30px;
  color: #ccc;
}

.error-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.home-button,
.back-button {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.home-button {
  background: linear-gradient(135deg, #43d6b4 0%, #38b8a0 100%);
  color: #000;
}

.home-button:hover {
  box-shadow: 0 5px 15px rgba(67, 214, 180, 0.3);
  transform: translateY(-2px);
}

.back-button {
  background: transparent;
  color: #43d6b4;
  border: 2px solid #43d6b4;
}

.back-button:hover {
  background: rgba(67, 214, 180, 0.1);
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .not-found-content {
    padding: 30px 20px;
  }
  
  .error-code {
    font-size: 60px;
  }
  
  .error-title {
    font-size: 28px;
  }
  
  .error-message {
    font-size: 16px;
  }
  
  .error-actions {
    gap: 15px;
  }
  
  .home-button,
  .back-button {
    padding: 10px 20px;
    font-size: 14px;
  }
}
</style>