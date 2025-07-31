<template>
  <div class="actor-profile-container">
    <div class="actor-profile-content">
      <div class="actor-profile-layout">
        <div class="actor-info">
          <div class="actor-profile-header">
            <h1>演员信息</h1>
          </div>

          <div class="info-group">
            <label class="info-label">名称</label>
            <div class="info-value">{{ actor.name || '暂无' }}</div>
          </div>

          <div class="info-group">
            <label class="info-label">描述</label>
            <div class="info-value">{{ actor.description || '暂无描述' }}</div>
          </div>
        </div>
        
        <div class="actor-image-section">
          <div class="image-frame">
            <div class="image-frame-header">
              <span class="image-frame-title">封面</span>
            </div>
            <div class="image-frame-content">
              <div class="image-preview" v-if="actor.id">
                <img :src="`${API_CONFIG.BASE_URL}/actor/cover/${actor.id}`" :alt="actor.name" />
              </div>
              <div v-else class="no-image">暂无封面图</div>
            </div>
          </div>
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
  min-height: calc(80vh - 60px);
  padding: 100px;
  background: white;
  border-radius: 80px;
  width: 100%;
  max-width: 2000px;
  margin: 0 auto;
  margin-top: 60px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-sizing: border-box;
}

.actor-profile-header {
  text-align: left;
  margin-top: 20px;
  margin-bottom: 20px;
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

.actor-profile-layout {
  display: flex;
  gap: 30px;
  width: 100%;
}

.actor-info {
  width: 400px;
  display: flex;
  flex-direction: column;
  gap: 25px;
  flex-shrink: 0;
}

.info-group {
  margin-bottom: 25px;
  width: 100%;
}

.info-label {
  display: block;
  text-align: left;
  color: #000;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 16px;
}

.info-value {
  font-size: 16px;
  color: #333;
  line-height: 1.5;
  white-space: pre-wrap;
  text-align: left;
}

.actor-image-section {
  width: 400px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.image-frame {
  border: 1px solid #e1e1e1;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  background: #fff;
  width: 400px;
}

.image-frame-header {
  background: linear-gradient(135deg, #43d6b4 0%, #38b8a0 100%);
  padding: 12px 20px;
  text-align: center;
}

.image-frame-title {
  color: white;
  font-weight: 600;
  font-size: 16px;
}

.image-frame-content {
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.image-preview img {
  width: 100%;
  height: auto;
  border-radius: 5px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.no-image {
  color: #666;
  font-style: italic;
  padding: 20px;
  text-align: center;
  min-height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

@media (max-width: 768px) {
  .actor-profile-layout {
    flex-direction: column;
  }
  
  .actor-image-section {
    width: 100%;
  }
  
  .image-frame {
    width: 100%;
  }
}
</style>
