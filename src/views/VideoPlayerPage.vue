<template>
  <div class="video-player-container">
    <div v-if="loading">加载中...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
      <h1 class="video-title">{{ videoData.title }}</h1>
      <VideoPlayer :src="videoSrc" />
      <div class="video-description">
        <p>{{ videoData.description }}</p>
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
        const response = await api.get(`/video/page/${route.params.id}`);
        videoData.value = response.data.data;
        // 设置视频播放链接，添加API基础URL
        videoSrc.value = `${API_CONFIG.BASE_URL}/video/play/${route.params.id}`;
      } catch (err) {
        console.error('获取视频数据失败:', err);
        error.value = '获取视频数据失败';
      } finally {
        loading.value = false;
      }
    };
    
    onMounted(() => {
      fetchVideoData();
    });
    
    return {
      videoData,
      videoSrc,
      loading,
      error
    };
  }
};
</script>

<style scoped>
.video-player-container {
  color: #000;
  padding: 20px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.video-title {
  width: 100%;
  text-align: center;
  margin-bottom: 20px;
  font-size: 24px;
  color: #333;
}

.video-description {
  color: #000;
  margin-top: 20px;
  width: 100%;
  max-width: 1200px;
  padding: 0 20px;
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .video-player-container {
    padding: 10px;
  }
  
  .video-title {
    font-size: 20px;
  }
}
</style>