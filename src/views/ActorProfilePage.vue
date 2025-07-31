<template>
  <div class="actor-profile-container">
    <div class="actor-profile-header">
      <h1>演员信息</h1>
    </div>
    <div class="actor-profile-content">
      <div class="actor-info">
        <div class="form-group">
          <label class="form-label">演员名称</label>
          <div class="form-value">{{ actor.name }}</div>
        </div>

        <div class="form-group">
          <label class="form-label">描述</label>
          <div class="form-value">{{ actor.description }}</div>
        </div>

        <div class="form-group">
          <label class="form-label">封面图</label>
          <div class="image-preview" v-if="actor.id">
            <img :src="`${API_CONFIG.BASE_URL}/actor/cover/${actor.id}`" :alt="actor.name" />
          </div>
          <div v-else class="no-image">暂无封面图</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/utils/api.js';
import API_CONFIG from '@/config/api.js';

const route = useRoute();
const actor = ref({
  id: '',
  name: '',
  description: '',
});

// 获取演员信息
const fetchActorInfo = async () => {
  try {
    const response = await api.get(`/actor/page/${route.params.id}`);
    actor.value = response.data.data;
  } catch (error) {
    console.error('获取演员信息失败:', error);
    if (error.response && error.response.data) {
      alert('获取演员信息失败: ' + error.response.data.message);
    } else {
      alert('网络错误，请检查连接');
    }
  }
};

// 组件挂载时获取演员信息
onMounted(() => {
  fetchActorInfo();
});
</script>

<style scoped>
.actor-profile-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 60px);
  padding: 50px;
  background: white;
  border-radius: 15px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  margin-top: 60px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-sizing: border-box;
}

.actor-profile-header {
  text-align: center;
  margin-bottom: 40px;
  width: 100%;
}

.actor-profile-header h1 {
  color: #333;
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  background: linear-gradient(135deg, #43d6b4 0%, #38b8a0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.actor-profile-content {
  width: 100%;
}

.actor-info {
  display: flex;
  flex-direction: column;
  gap: 25px;
  width: 100%;
}

.form-group {
  margin-bottom: 25px;
  position: relative;
  width: 100%;
}

.form-label {
  display: block;
  text-align: left;
  color: #000;
  font-weight: 500;
  margin-bottom: 8px;
  font-size: 16px;
}

.form-value {
  width: 100%;
  padding: 15px 20px;
  border: 2px solid #e1e1e1;
  border-radius: 10px;
  font-size: 16px;
  box-sizing: border-box;
  background-color: #f8f9fa;
  color: #000;
  min-height: 56px;
}

.image-preview {
  margin-top: 15px;
}

.image-preview img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 10px;
  object-fit: cover;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.no-image {
  color: #666;
  font-style: italic;
  padding: 15px;
}
</style>