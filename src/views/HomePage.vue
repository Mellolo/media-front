<template>
  <div class="home-page">
    <h1>欢迎来到媒体推荐中心</h1>
    
    <!-- 视频推荐部分 -->
    <div class="recommendation-section">
      <div class="section-header">
        <h2>视频推荐</h2>
        <router-link to="/video/list" class="view-all-link">
          查看全部视频
        </router-link>
      </div>
      <div class="recommendation-content">
        <div v-if="videoLoading" class="loading">加载中...</div>
        <div v-else-if="videoError" class="error">加载失败: {{ videoError }}</div>
        <VideoList 
          v-else
          :videos="recommendedVideos" 
          :loading="false"
          :items-per-page="4"
          class="recommend-list"
        />
      </div>
    </div>
    
    <!-- 图集推荐部分 -->
    <div class="recommendation-section">
      <div class="section-header">
        <h2>图集推荐</h2>
        <router-link to="/gallery/list" class="view-all-link">
          查看全部图集
        </router-link>
      </div>
      <div class="recommendation-content">
        <div v-if="galleryLoading" class="loading">加载中...</div>
        <div v-else-if="galleryError" class="error">加载失败: {{ galleryError }}</div>
        <GalleryList 
          v-else
          :galleries="recommendedGalleries"
          :loading="false"
          :items-per-page="4"
          :show-pagination="false"
          class="recommend-list"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/utils/api.js'
import VideoList from '@/components/VideoList.vue'
import GalleryList from '@/components/GalleryList.vue'

// 视频推荐相关状态
const recommendedVideos = ref([])
const videoLoading = ref(false)
const videoError = ref(null)

// 图集推荐相关状态
const recommendedGalleries = ref([])
const galleryLoading = ref(false)
const galleryError = ref(null)

// 获取推荐视频
const fetchRecommendedVideo = async () => {
  videoLoading.value = true
  videoError.value = null
  try {
    const response = await api.get('/video/recommend')
    // 将单个推荐视频放入数组中
    recommendedVideos.value = [response.data.data]
  } catch (error) {
    console.error('获取推荐视频失败:', error)
    videoError.value = error.message || '获取推荐视频失败'
  } finally {
    videoLoading.value = false
  }
}

// 获取推荐图集
const fetchRecommendedGallery = async () => {
  galleryLoading.value = true
  galleryError.value = null
  try {
    const response = await api.get('/gallery/recommend')
    // 将单个推荐图集放入数组中
    recommendedGalleries.value = [response.data.data]
  } catch (error) {
    console.error('获取推荐图集失败:', error)
    galleryError.value = error.message || '获取推荐图集失败'
  } finally {
    galleryLoading.value = false
  }
}

// 组件挂载时获取推荐内容
onMounted(() => {
  fetchRecommendedVideo()
  fetchRecommendedGallery()
})
</script>

<style scoped>
.home-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.home-page h1 {
  text-align: center;
  color: #041004;
  margin-bottom: 30px;
  font-size: 2rem;
}

.recommendation-section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #43d6b4;
}

.section-header h2 {
  color: #006400;
  margin: 0;
  font-size: 1.5rem;
}

.view-all-link {
  background: #43d6b4;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.view-all-link:hover {
  background: #38b8a0;
  transform: translateY(-2px);
}

.recommendation-content {
  min-height: 200px;
}

.loading, .error {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.error {
  color: #ff4757;
}

.recommend-list {
  width: 100%;
}

.recommend-list :deep(.videos-grid),
.recommend-list :deep(.galleries-grid) {
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}

.recommend-list :deep(.pagination) {
  display: none;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .view-all-link {
    align-self: flex-end;
  }
  
  .recommend-list :deep(.videos-grid),
  .recommend-list :deep(.galleries-grid) {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}
</style>