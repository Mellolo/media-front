<template>
  <div class="video-player-page">
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">正在加载视频...</p>
    </div>
    <div v-else-if="error" class="error-container">
      <div class="error-content">
        <p class="error-message">{{ error }}</p>
        <button @click="fetchVideoData" class="retry-button">重新加载</button>
      </div>
    </div>
    <div v-else class="video-content">
      <div class="video-header">
        <h1 class="video-name">{{ videoData.name }}</h1>
      </div>
      <div class="video-player-wrapper">
        <VideoPlayer :src="videoSrc" />
      </div>
      <div class="video-info">
        <div class="video-description">
          <h2 class="section-title">视频描述</h2>
          <p class="description-text">{{ videoData.description || '暂无描述' }}</p>
        </div>
        
        <!-- 演员信息 -->
        <div v-if="videoData.actors && videoData.actors.length > 0" class="video-actors">
          <h2 class="section-title">演员</h2>
          <div class="actors-list">
            <router-link
              v-for="actor in videoData.actors" 
              :key="actor.id" 
              :to="`/actor/profile/${actor.id}`"
              class="actor-tag"
            >
              {{ actor.name }}
            </router-link>
          </div>
        </div>
        
        <!-- 标签信息 -->
        <div v-if="videoData.tags && videoData.tags.length > 0" class="video-tags">
          <h2 class="section-title">标签</h2>
          <div class="tags-list">
            <span 
              v-for="tag in videoData.tags" 
              :key="tag" 
              class="tag-item"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/utils/api.js';
import API_CONFIG from '@/config/api.js';
import VideoPlayer from '@/components/VideoPlayer.vue';

export default {
  name: 'VideoPlayerPage',
  components: {
    VideoPlayer
  },
  setup() {
    const route = useRoute();
    const videoData = ref({});
    const videoSrc = ref('');
    const loading = ref(true);
    const error = ref(null);
    
    const fetchVideoData = async () => {
      try {
        loading.value = true;
        error.value = null;
        const response = await api.get(`/video/page/${route.params.id}`);
        videoData.value = response.data.data;
        // 设置视频播放链接，添加API基础URL
        videoSrc.value = `${API_CONFIG.BASE_URL}/video/play/${route.params.id}`;
      } catch (err) {
        console.error('获取视频数据失败:', err);
        error.value = '获取视频数据失败，请稍后重试';
      } finally {
        loading.value = false;
      }
    };
    
    onMounted(() => {
      fetchVideoData();
    });
    
    return {
      route,
      videoData,
      videoSrc,
      loading,
      error,
      fetchVideoData
    };
  }
};
</script>

<style scoped>
.video-player-page {
  margin-top: 60px;
  width: 1000px;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #000 100%);
  color: #fff;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
  background: #000;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(255, 255, 255, 0.1);
  border-top: 5px solid #43d6b4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

.loading-text {
  color: #ccc;
  font-size: 18px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
  background: #000;
  padding: 20px;
}

.error-content {
  text-align: center;
  max-width: 500px;
}

.error-message {
  color: #ff6b6b;
  font-size: 18px;
  margin-bottom: 20px;
}

.retry-button {
  background: #43d6b4;
  color: #000;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s ease;
  font-weight: 600;
}

.retry-button:hover {
  background: #3ab09e;
}

.video-content {
  width: 100%;
  max-width: 1200px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.video-header {
  width: 100%;
  margin-bottom: 20px;
  text-align: center;
}

.video-name {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  color: #43d6b4;
  line-height: 1.3;
  text-align: center;
}

.video-meta {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
}

.video-id {
  background: rgba(67, 214, 180, 0.1);
  color: #43d6b4;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.video-player-wrapper {
  width: 100%;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  margin-bottom: 30px;
}

.video-info {
  width: 100%;
  background: rgba(30, 30, 30, 0.8);
  border-radius: 8px;
  padding: 25px;
  box-sizing: border-box;
  backdrop-filter: blur(10px);
}

.section-title {
  font-size: 22px;
  font-weight: 600;
  margin: 0 0 15px 0;
  color: #43d6b4;
  border-bottom: 2px solid #43d6b4;
  padding-bottom: 10px;
  text-align: left;
}

.description-text {
  font-size: 16px;
  line-height: 1.7;
  color: #ccc;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  text-align: left;
}

.video-actors,
.video-tags {
  margin-top: 25px;
}

.video-actors:first-child,
.video-tags:first-child {
  margin-top: 0;
}

.actors-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.actor-tag {
  background: rgba(67, 214, 180, 0.1);
  color: #43d6b4;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
}

.actor-tag:hover {
  background: rgba(67, 214, 180, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.tag-item {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .video-player-page {
    padding: 0;
  }
  
  .video-content {
    padding: 15px;
  }
  
  .video-title {
    font-size: 24px;
  }
  
  .section-title {
    font-size: 20px;
  }
  
  .description-text {
    font-size: 15px;
  }
  
  .video-info {
    padding: 20px;
  }
  
  .video-player-wrapper {
    border-radius: 6px;
    margin-bottom: 20px;
  }
  
  .actors-list,
  .tags-list {
    gap: 8px;
  }
  
  .actor-tag,
  .tag-item {
    font-size: 13px;
    padding: 5px 10px;
  }
}

@media (max-width: 480px) {
  .video-name {
    font-size: 20px;
  }
  
  .section-title {
    font-size: 18px;
  }
  
  .description-text {
    font-size: 14px;
  }
  
  .actors-list,
  .tags-list {
    gap: 6px;
  }
  
  .actor-tag,
  .tag-item {
    font-size: 12px;
    padding: 4px 8px;
  }
}
</style>