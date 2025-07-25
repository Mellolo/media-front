<template>
  <div class="video-player-container">
    <div v-if="loading">加载中...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
      <h1>{{ videoData.title }}</h1>
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
        // 设置视频播放链接
        videoSrc.value = `/video/play/${route.params.id}`;
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
}

.video-description {
  color: #000;
  margin-top: 20px;
}
</style>